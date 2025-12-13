import type { DifficultyLeaderboard } from "./Leaderboards"
import type { DifficultyTier } from "./types"

type Agent = {
    daily_leaderboard: () => Promise<DifficultyLeaderboard>
    weekly_leaderboard: () => Promise<DifficultyLeaderboard>
    monthly_leaderboard: () => Promise<DifficultyLeaderboard>
    yearly_leaderboard: () => Promise<DifficultyLeaderboard>
    set_leaderboard_handle: (handle: string) => Promise<void>
    send_daily_score: (score: number, difficulty: DifficultyTier) => Promise<void>


}

export const API_ENDPOINT = import.meta.env.DEV ? 'http://localhost:3300' : `https://api.morchess.com:3300`
const $ = async (path: string, opts?: RequestInit) => {

    const controller = new AbortController()

    setTimeout(() => controller.abort(), 10_000)

    const res = await fetch(API_ENDPOINT + path, { 
        ...opts,

        signal: controller.signal
    })
    
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`API ${res.status}: ${text}`)
    }

    return res.json()
}

async function $post(path: string, body: any = {}) {
    const res = await $(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    return res
}


export function create_agent(): Agent {
    return {
        async daily_leaderboard() {
            return $('/daily')
        },
        async weekly_leaderboard() {
            return $('/weekly')
        },
        async monthly_leaderboard() {
            return $('/monthly')
        },
        async yearly_leaderboard() {
            return $('/yearly')
        },
        async set_leaderboard_handle(handle: string) {
            return $post('/handle', { handle })
        },
        async send_daily_score(score: number, difficulty: DifficultyTier) {
            const hash = await generateHash(score, difficulty)
            return $post('/score', { hash, score, difficulty })
        }
    }
}

// Obfuscated-ish hash generator using a simplified SHA-256 via SubtleCrypto
async function generateHash(score: number, difficulty: string) {
    const encoder = new TextEncoder();
    const secret = 's3cr3t-s@lt';
    const data = `${secret}:${difficulty}:${score}`;
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}