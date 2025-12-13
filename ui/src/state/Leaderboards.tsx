import type { MorStore } from "."
import type { DifficultyTier } from "./types"
import { createAsync } from "@solidjs/router"
import { createSignal } from "solid-js"
import { create_agent } from './leaderboard_agent'

type Ranking = {
    rank: number
    handle: string
    score: number
    created_at: Date
}

type Leaderboard = {
    nb_total: number
    list: Ranking[]
    you: Ranking | undefined
}

export type DifficultyLeaderboard = Record<DifficultyTier, Leaderboard>

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

type State = {
    daily: DifficultyLeaderboard
    weekly: DifficultyLeaderboard
    monthly: DifficultyLeaderboard
    yearly: DifficultyLeaderboard
}

type Actions = {
    set_leaderboard_handle: (handle: string) => void
    send_daily_score: (score: number, difficulty: DifficultyTier) => void
    fetch_period(period: TimePeriod): void
}

export type Leaderboards = [State, Actions]

const Empty_Leaderboard: DifficultyLeaderboard = {
    a: { nb_total: 0, list: [], you: undefined },
    b: { nb_total: 0, list: [], you: undefined },
    c: { nb_total: 0, list: [], you: undefined },
}

export function create_leaderboards(_store: MorStore): Leaderboards {

    const $agent = create_agent()

    const [fetch_daily_leaderboard, set_fetch_daily_leaderboard] = createSignal(void 0, { equals: false })
    const [should_fetch_weekly_leaderboard, set_fetch_weekly_leaderboard] = createSignal(false)
    const [should_fetch_monthly_leaderboard, set_fetch_monthly_leaderboard] = createSignal(false)
    const [should_fetch_yearly_leaderboard, set_fetch_yearly_leaderboard] = createSignal(false)
    
    const daily_leaderboard = createAsync<DifficultyLeaderboard>(() => {
        fetch_daily_leaderboard()

        return $agent.daily_leaderboard()
    }, { initialValue: Empty_Leaderboard })

    //setInterval(() => set_fetch_daily_leaderboard(void 0), 10 * 60 * 1000)

    const weekly_leaderboard = createAsync<DifficultyLeaderboard>(() => {
        if (!should_fetch_weekly_leaderboard()) {
            return new Promise<DifficultyLeaderboard>(() => {})
        }

        return $agent.weekly_leaderboard()
    }, { initialValue: Empty_Leaderboard })

    const monthly_leaderboard = createAsync<DifficultyLeaderboard>(() => {
        if (!should_fetch_monthly_leaderboard()) {
            return new Promise(() => {})
        }

        return $agent.monthly_leaderboard()
    }, { initialValue: Empty_Leaderboard })

    const yearly_leaderboard = createAsync<DifficultyLeaderboard>(() => {
        if (!should_fetch_yearly_leaderboard()) {
            return new Promise(() => {})
        }

        return $agent.yearly_leaderboard()
    }, { initialValue: Empty_Leaderboard })

    let state = {
        get daily() {
            return daily_leaderboard.latest
        },
        get weekly() {
            return weekly_leaderboard.latest
        },
        get monthly() {
            return monthly_leaderboard.latest
        },
        get yearly() {
            return yearly_leaderboard.latest
        }
    }

    let actions = {
        
        async set_leaderboard_handle(handle: string) {
            let res = await $agent.set_leaderboard_handle(handle)

            set_fetch_daily_leaderboard()
            set_fetch_weekly_leaderboard(true)
            set_fetch_monthly_leaderboard(true)
            set_fetch_yearly_leaderboard(true)
            return res
        },

        async send_daily_score(score: number, difficulty: DifficultyTier) {
            let res = await $agent.send_daily_score(score, difficulty)

            set_fetch_daily_leaderboard()
            set_fetch_weekly_leaderboard(true)
            set_fetch_monthly_leaderboard(true)
            set_fetch_yearly_leaderboard(true)

            return res
        },
        fetch_period(period: TimePeriod) {
            if (period === 'daily') {
                set_fetch_daily_leaderboard(void 0)
            } else if (period === 'weekly') {
                set_fetch_weekly_leaderboard(true)
            } else if (period === 'monthly') {
                set_fetch_monthly_leaderboard(true)
            } else if (period === 'yearly') {
                set_fetch_yearly_leaderboard(true)
            }
        },
    }

    return [state, actions]
}