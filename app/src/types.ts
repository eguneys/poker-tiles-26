export type UserDbId = string
export type UserDb = {
    id: UserDbId
    handle: string | null
    created_at: number
}

export type SessionDbId = string
export type SessionsDb = {
    session_id: SessionDbId
    user_id: UserDbId
    created_at: string
    last_seen_at: string
}


export type RateLimitDb = {
    key: string
    count: number
    reset_at: number
}

export type DifficultyTier = 'a' | 'b' | 'c'

export type DailyScoreDbId = number
export type DailyScoreDb = {
    id: DailyScoreDbId,
    user_id: UserDbId,
    date_utc: string,
    difficulty: DifficultyTier,
    score: number
    created_at: number
}


export type Ranking = {
    user_id: UserDbId
    rank: number
    handle: string
    score: number
    created_at: Date
}

export type Leaderboard = {
    nb_total: number
    list: Ranking[]
    you: Ranking | undefined
}

export type DifficultyLeaderboard = Record<DifficultyTier, Leaderboard>