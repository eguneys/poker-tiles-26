type AnimBaseMode = "hold" | "tween" | "spring";

export type TweenConfig = { duration: number; target: number };
export type SpringConfig = { stiffness: number; damping: number };
export type SwayConfig = { amplitude: number; frequency: number; bias: number };
export type NoiseConfig = { amplitude: number; speed: number };

const DefaultTween: TweenConfig = { duration: 0.2, target: 0 };
const DefaultSpring: SpringConfig = { stiffness: 200, damping: 10 };
const DefaultSway: SwayConfig = { amplitude: 0.1, frequency: 1, bias: 0 };
const DefaultNoise: NoiseConfig = { amplitude: 0.05, speed: 0.0001 };

export class AnimChannel {
    value: number = 0;

    // --- Base Mode ---
    private baseMode: AnimBaseMode = "hold";
    private baseValue: number = 0;
    private startValue: number = 0;
    private timeInMode: number = 0;

    private tweenConfig: TweenConfig = { ...DefaultTween };
    private springConfig: SpringConfig = { ...DefaultSpring };
    private springTarget: number = 0;
    private springVelocity: number = 0;

    // --- Sway ---
    private swayConfig: SwayConfig = { ...DefaultSway };
    private swayEnabled: boolean = false;
    private swayOffset: number = 0;
    private swayLerpSpeed: number = 5;

    // --- Noise ---
    private noiseConfig: NoiseConfig = { ...DefaultNoise };
    private noiseEnabled: boolean = false;
    private noiseTime: number = 0;
    private noiseValue: number = 0;

    constructor(initialValue = 0) {
        this.value = initialValue;
        this.baseValue = initialValue;
        this.startValue = initialValue;
    }

    // ---------- Base Modes ----------
    setHold() { this.baseMode = "hold"; this.baseValue = this.value; return this; }

    setTween(config: Partial<TweenConfig>) {
        this.tweenConfig = { ...this.tweenConfig, ...config };
        this.baseMode = "tween";
        this.startValue = this.value;
        this.timeInMode = 0;
        return this;
    }

    setSpring(config: Partial<SpringConfig>, target?: number) {
        if (this.baseMode === 'spring' && this.springTarget === target) {
            return
        }
        this.springConfig = { ...this.springConfig, ...config };
        this.baseMode = "spring";
        this.springTarget = target ?? this.value;
        this.springVelocity = 0;
        return this;
    }

    // ---------- Sway ----------
    setSway(config: Partial<SwayConfig>) {
        this.swayConfig = { ...this.swayConfig, ...config };
        this.swayEnabled = true;
        return this;
    }

    enableSway() { this.swayEnabled = true; return this; }
    disableSway() { this.swayEnabled = false; return this; }

    // ---------- Noise ----------
    setNoise(config: Partial<NoiseConfig>) {
        this.noiseConfig = { ...this.noiseConfig, ...config };
        this.noiseEnabled = true;
        this.noiseTime = 0;
        return this;
    }

    enableNoise() { this.noiseEnabled = true; return this; }
    disableNoise() { this.noiseEnabled = false; return this; }

    // ---------- Update ----------
    update(dt: number) {
        this.timeInMode += dt;

        // --- Base Mode ---
        if (this.baseMode === "hold") {
            this.baseValue = this.baseValue;
        } else if (this.baseMode === "tween") {
            const t = Math.min(this.timeInMode / this.tweenConfig.duration, 1);
            this.baseValue = lerp(this.startValue, this.tweenConfig.target, t);
        } else if (this.baseMode === "spring") {
            const { stiffness, damping } = this.springConfig;
            const acc = -stiffness * (this.baseValue - this.springTarget) - damping * this.springVelocity;
            this.springVelocity += acc * dt;
            this.baseValue += this.springVelocity * dt;
        }

        // --- Sway (smooth enable/disable) ---
        const swayTarget = this.swayEnabled
            ? Math.sin(this.timeInMode * this.swayConfig.frequency) * this.swayConfig.amplitude + this.swayConfig.bias
            : 0;
        this.swayOffset += (swayTarget - this.swayOffset) * Math.min(dt * this.swayLerpSpeed, 1);

        // --- Noise ---
        if (this.noiseEnabled) {
            const { amplitude, speed } = this.noiseConfig;
            this.noiseTime += dt * (speed ?? 1);
            this.noiseValue = (Math.sin(this.noiseTime * 12.9898) * 43758.5453 % 1 - 0.5) * 2 * (amplitude ?? 0);
        } else {
            this.noiseValue = 0;
        }

        // --- Final Value ---
        this.value = this.baseValue + this.swayOffset + this.noiseValue;
    }
}

// ---------- Helper ----------
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
