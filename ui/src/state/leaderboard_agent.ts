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

        credentials: 'include',
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


const mock_list = () => {
    let res = []

    for (let i = 1; i < 100; i++) {
        res.push({
            rank: i,
            handle: 'hello' + i,
            score: Math.floor(Math.random() * 100)
        })
    }

    return res
}
// @ts-ignore
const mock_daily_leaderboard = { a: { list: mock_list(), you: { rank: 8, score: 8, handle: undefined } }, b: { list: mock_list() } , c: { list: [], you: { rank: 8, score: 8, handle: 'ok'}} }
export function create_agent(): Agent {
    return {
        async daily_leaderboard() {
            //return mock_daily_leaderboard
            //await new Promise(resolve => setTimeout(resolve, 1000))
            return $('/daily')
        },
        async weekly_leaderboard() {
            //return mock_daily_leaderboard
            return $('/weekly')
        },
        async monthly_leaderboard() {
            return $('/monthly')
        },
        async yearly_leaderboard() {
            return $('/yearly')
        },
        async set_leaderboard_handle(handle: string) {
            //return
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