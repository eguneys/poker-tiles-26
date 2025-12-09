// Grid Types
type CellState = boolean; // true = on/colored, false = off
type GridState = CellState[][]; // 8x8 grid
type Pattern = GridState;
export type AnimationStep = { grid: GridState; delay: number };

let _100ms = 120

// Pattern definitions
class GridPatterns {
    // Create empty 8x8 grid
    static createEmptyGrid(): GridState {
        return Array(8).fill(null).map(() => Array(8).fill(false));
    }

    // Checkerboard pattern
    static checkerboard2(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = (row + col) % 2 === 1
            }
        }
        return grid;
    }



    // Checkerboard pattern
    static checkerboard(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = (row + col) % 2 === 0
            }
        }
        return grid;
    }

    // Full grid pattern
    static fullGrid(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = true;
            }
        }
        return grid;
    }

    // Border pattern
    static border(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = row === 0 || row === 7 || col === 0 || col === 7;
            }
        }
        return grid;
    }

    // Diagonal pattern
    static diagonal(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = row === col || row === 7 - col;
            }
        }
        return grid;
    }

    // Cross pattern
    static cross(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = row === 3 || row === 4 || col === 3 || col === 4;
            }
        }
        return grid;
    }

    // Dot pattern
    static dots(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = (row % 2 === 0 && col % 2 === 0);
            }
        }
        return grid;
    }

    // Custom pattern from string representation
    static fromString(patternString: string): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        const rows = patternString.trim().split('\n');
        
        for (let row = 0; row < 8 && row < rows.length; row++) {
            const cells = rows[row].split('');
            for (let col = 0; col < 8 && col < cells.length; col++) {
                grid[row][col] = cells[col] === '1' || cells[col] === 'X';
            }
        }
        return grid;
    }

    // Random pattern
    static random(): Pattern {
        const grid = GridPatterns.createEmptyGrid();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                grid[row][col] = Math.random() > 0.5;
            }
        }
        return grid;
    }
}

// Animation patterns
class GridAnimations {

    static patternTransition(patternA: Pattern, patternB: Pattern, steps: number = 10): AnimationStep[] {
        const animation: AnimationStep[] = [];
        const rows = patternA.length;
        const cols = patternA[0].length;

        for (let step = 0; step <= steps; step++) {
            const t = step / steps;

            const grid = GridPatterns.createEmptyGrid();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const a = patternA[r][c] ? 1 : 0;
                    const b = patternB[r][c] ? 1 : 0;

                    // Simple linear blend with threshold
                    const blend = a * (1 - t) + b * t;

                    grid[r][c] = blend > 0.5;
                }
            }

            animation.push({ grid, delay: _100ms });
        }

        return animation;
    }


    // Row-by-row animation
    static rowSweep(pattern: Pattern, direction: 'top' | 'bottom' = 'top'): AnimationStep[] {
        const animation: AnimationStep[] = [];
        
        for (let i = 0; i < 8; i++) {
            const grid = GridPatterns.createEmptyGrid();
            const currentRow = direction === 'top' ? i : 7 - i;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    grid[row][col] = pattern[row][col] && 
                        ((direction === 'top' && row <= currentRow) || 
                         (direction === 'bottom' && row >= currentRow));
                }
            }
            
            animation.push({
                grid,
                delay: _100ms
            });
        }
        
        return animation;
    }

    // Column-by-column animation
    static columnSweep(pattern: Pattern, direction: 'left' | 'right' = 'left'): AnimationStep[] {
        const animation: AnimationStep[] = [];
        
        for (let i = 0; i < 8; i++) {
            const grid = GridPatterns.createEmptyGrid();
            const currentCol = direction === 'left' ? i : 7 - i;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    grid[row][col] = pattern[row][col] && 
                        ((direction === 'left' && col <= currentCol) || 
                         (direction === 'right' && col >= currentCol));
                }
            }
            
            animation.push({
                grid,
                delay: _100ms
            });
        }
        
        return animation;
    }

    // Random blink animation
    static randomBlink(pattern: Pattern, steps: number = 20): AnimationStep[] {
        const animation: AnimationStep[] = [];
        
        for (let step = 0; step < steps; step++) {
            const grid = GridPatterns.createEmptyGrid();
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    // Randomly show cells of the pattern
                    grid[row][col] = pattern[row][col] && Math.random() > 0.3;
                }
            }
            
            animation.push({
                grid,
                delay: _100ms
            });
        }
        
        return animation;
    }

    static pulse(pattern: Pattern, cycles: number = 3): AnimationStep[] {
        const animation: AnimationStep[] = [];
        const rows = pattern.length;
        const cols = pattern[0].length;
        const stepsPerCycle = 10;

        for (let cycle = 0; cycle < cycles; cycle++) {
            for (let step = 0; step < stepsPerCycle; step++) {
                const progress = step / (stepsPerCycle - 1);
                const intensity = Math.sin(progress * Math.PI); // 0 → 1 → 0

                const grid = GridPatterns.createEmptyGrid();
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        grid[r][c] = pattern[r][c] && intensity > 0.5;
                    }
                }

                animation.push({ grid, delay: _100ms });
            }
        }

        return animation;
    }


    static wave(pattern: Pattern, direction: 'horizontal' | 'vertical' = 'horizontal'): AnimationStep[] {
        const animation: AnimationStep[] = [];
        const rows = pattern.length;
        const cols = pattern[0].length;
        const steps = 16;

        for (let step = 0; step < steps; step++) {
            const grid = GridPatterns.createEmptyGrid();

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = direction === 'horizontal' ? r : c;

                    // Smooth sinusoidal wave (0..1)
                    const intensity = (Math.sin((x + step * 0.5) * Math.PI / 4) + 1) * 0.5;

                    grid[r][c] = pattern[r][c] && intensity > 0.5;
                }
            }

            animation.push({ grid, delay: _100ms });
        }

        return animation;
    }

}


export const Patterns = {
    'empty': GridPatterns.createEmptyGrid,
    'checkerboard': GridPatterns.checkerboard,
    'checkerboard2': GridPatterns.checkerboard2,
    'full': GridPatterns.fullGrid,
    'border': GridPatterns.border,
    'diagonal': GridPatterns.diagonal,
    'cross': GridPatterns.cross,
    'dots': GridPatterns.dots,
    'random': GridPatterns.random
};

export const Animations = {
    'rowsweep': (p: Pattern) => GridAnimations.rowSweep(p, 'top'),
    'rowsweep-reverse': (p: Pattern) => GridAnimations.rowSweep(p, 'bottom'),
    'colsweep': (p: Pattern) => GridAnimations.columnSweep(p, 'left'),
    'colsweep-reverse': (p: Pattern) => GridAnimations.columnSweep(p, 'right'),
    'blink': (p: Pattern) => GridAnimations.randomBlink(p, 20),
    'pulse': (p: Pattern) => GridAnimations.pulse(p, 3),
    'wave-horizontal': (p: Pattern) => GridAnimations.wave(p, 'horizontal'),
    'wave-vertical': (p: Pattern) => GridAnimations.wave(p, 'vertical'),
};

export const AnimationToFull = (p: Pattern) => GridAnimations.patternTransition(p, Patterns.full(), 8)
export const AnimationToEmpty = (p: Pattern) => GridAnimations.patternTransition(p, Patterns.empty(), 8)
export const AnimationCheckerboard = () => GridAnimations.patternTransition(Patterns.checkerboard(), Patterns.checkerboard2(), 8)


export const AnimationsRandom = () => {
    let keys = Object.keys(Animations)

    let key = keys[Math.floor(Math.random() * keys.length)] as keyof typeof Animations

    let animation = Animations[key]


    let patterns = Object.keys(Patterns)

    let key2 = patterns[Math.floor(Math.random() * patterns.length)] as keyof typeof Patterns

    let pattern = Patterns[key2]()

    return animation(pattern)
}