import { Router } from "express";
import { db } from "./db_init.ts";

import crypto from 'crypto'
import { rateLimit, RateLimitError } from "./rate_limit.ts";
import { getCache, invalidateCache, setCache } from "./cache.ts";
import type { DifficultyLeaderboard, DifficultyTier, Ranking, UserDbId } from "./types.ts";
import { getMonthsUTC, getTodaysUTC, getWeeksUTC, getYearsUTC } from "./dates.ts";
import { getDefaultHighWaterMark } from "stream";
import { DEV } from "./config.ts";


export const gen_id8 = () => Math.random().toString(16).slice(2, 10)

declare global {
  namespace Express {
    interface Request {
      user_id?: UserDbId;
    }
  }
}

class LockedDayError extends Error {}
class InvalidHashError extends Error {}



export const router = Router()

router.use(async (req, res, next) => {

  let ip = req.ip
  if (ip) {
      await rateLimit(ip, 'ip_fast', 5, 1)
      await rateLimit(ip, 'ip_hour', 60, 3600)
  }

  let sessionId = req.cookies.morchess_session
  let userId: string | undefined

  if (sessionId) {
    const row = await db.prepare<string, { user_id: string }>(
      `SELECT user_id FROM sessions WHERE session_id = ?`,
    ).get(sessionId)

    if (row) {
      userId = row.user_id
      await db.prepare(
        `UPDATE sessions
         SET last_seen_at = datetime('now')
         WHERE session_id = ?`,
      ).run(sessionId)

    } else {
      // Stale or invalid cookie
      res.clearCookie('morchess_session')
      sessionId = undefined
    }
  }

  // Create new session if needed
  if (!sessionId) {
    sessionId = gen_id8()
    userId = gen_id8()

    await db.prepare(
      `INSERT INTO users (id, created_at)
       VALUES (?, datetime('now'))`,
    ).run(userId)

    await db.prepare(
      `INSERT INTO sessions
       (session_id, user_id, created_at, last_seen_at)
       VALUES (?, ?, datetime('now'), datetime('now'))`,
    ).run([sessionId, userId])

    res.cookie('morchess_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !DEV,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
  }

  // Invariant satisfied
  req.user_id = userId!
  next()
})

router.post('/handle', async (req, res) => {

    await rateLimit(req.user_id!, 'handle_fast', 3, 10)
    await rateLimit(req.user_id!, 'handle_hour', 3, 3600)

    const { handle } = req.body

    if (!handle || handle.length < 3 || handle.length > 8) {
        return res.status(400).json({ error: 'Invalid handle' })
    }

    try {
        await db.prepare(
            `UPDATE users SET handle = ?, created_at = ? WHERE users.id = ?`
        ).run(
            handle,
            Date.now(),
            req.user_id,
        )
        res.json({ ok: true })
    } catch (e) {
        res.status(500).json({ error: 'Failed to set handle' })
    }
})


router.post('/score', async (req, res) => {


    await rateLimit(req.user_id!, 'score_fast', 1, 10)
    await rateLimit(req.user_id!, 'score_hour', 3, 3600)

    const { score, difficulty, hash } = req.body
    const today = getTodaysUTC()


    if (!verifyHash(score, difficulty, hash)) {
        return res.status(400).json({ error: 'Invalid submission' })
    }

    if (!['a', 'b', 'c'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty' })
    }

    if (!Number.isInteger(score) || score < 0 || score > 10_000) {
        return res.status(400).json({ error: 'Invalid score' })
    }

    const user = await db.prepare<{}, { id: string}>(`SELECT id FROM users ORDER BY id DESC LIMIT 1`).get({})
    if (!user) {
        return res.status(400).json({ error: 'Handle not set' })
    }


    try {


        const row = await db.prepare<[string, string, string], { score: number }>(`
            SELECT score FROM daily_scores
            WHERE user_id = ? AND date_utc = ? AND difficulty = ?
        `).get(user.id, today, difficulty)

        if (row) {
            return res.json({ ok: true, score: row.score })
        }

        await db.prepare(
            `INSERT INTO daily_scores 
             (user_id, date_utc, difficulty, score, created_at)
             VALUES (?, ?, ?, ?, ?)`,
        ).run(
            user.id,
            today,
            difficulty,
            score,
            Date.now()
        )

        const thisWeek = getWeeksUTC()

        invalidateCache(`daily:${today}`)
        invalidateCache(`weekly:${thisWeek}`)


        res.json({ ok: true })
    } catch {
        res.status(409).json({ error: 'Already submitted' })
    }
})


router.get('/daily', async (req, res) => {

    await rateLimit(req.user_id!, 'handle_fast', 5, 10)
    await rateLimit(req.user_id!, 'handle_hour', 60, 3600)

    const date = getTodaysUTC()

    const cacheKey = `daily:${date}`

    const cached = getCache<Ranking[]>(cacheKey)

    if (cached) {
        return res.send(cached)
    }

    const leaderboard = await computeDailyLeaderboard(date, req.user_id!)

    setCache(cacheKey, leaderboard, 60_000)

    res.send(leaderboard)
})

router.get('/weekly', async (req, res) => {
    const date = getWeeksUTC()

    const cacheKey = `weekly:${date}`

    const cached = getCache<Ranking[]>(cacheKey)

    if (cached) {
        return res.send(cached)
    }

    const leaderboard = await computeWeeklyLeaderboard(date, req.user_id!)

    setCache(cacheKey, leaderboard, 3 * 60_000)

    res.send(leaderboard)
})

router.get('/monthly', async (req, res) => {
    const date = getMonthsUTC()

    const cacheKey = `monthly:${date}`

    const cached = getCache<Ranking[]>(cacheKey)

    if (cached) {
        return res.send(cached)
    }

    const leaderboard = await computeWeeklyLeaderboard(date, req.user_id!)

    setCache(cacheKey, leaderboard, 10 * 60_000)

    res.send(leaderboard)
})


router.get('/yearly', async (req, res) => {
    const date = getYearsUTC()

    const cacheKey = `yearly:${date}`

    const cached = getCache<Ranking[]>(cacheKey)

    if (cached) {
        return res.send(cached)
    }

    const leaderboard = await computeWeeklyLeaderboard(date, req.user_id!)

    setCache(cacheKey, leaderboard, 30 * 60_000)

    res.send(leaderboard)
})

const rows2leaderboard = (rows: LeaderboardRow[], tier: DifficultyTier, user_id: UserDbId) => {

    rows = rows.filter(_ => _.difficulty === tier)

    let list: Ranking[] = rows.map((row, i) => ({
        rank: i + 1,
        handle: row.handle,
        score: row.score,
        created_at: row.created_at
    })).filter(_ => _.handle !== null)

    let i_you = rows.findIndex(_ => _.user_id === user_id)
    let you = i_you !== -1 ? {
        rank: i_you + 1,
        handle: rows[i_you].handle,
        score: rows[i_you].score,
        created_at: rows[i_you].created_at
    } : undefined

    return {
        list,
        you
    }
}

type LeaderboardRow = { user_id: UserDbId, handle: string, score: number, created_at: number, difficulty: string }

async function computeDailyLeaderboard(since: string, user_id: UserDbId) {
    const rows = await db.prepare<string, LeaderboardRow>(`
        SELECT u.id as user_id, u.handle, d.score, d.created_at, d.difficulty
        FROM daily_scores d
        JOIN users u ON u.id = d.user_id
        WHERE d.created_at >= ?
        ORDER BY d.score ASC
        LIMIT 100
    `).all(since)

    return {
        a: rows2leaderboard(rows, 'a', user_id),
        b: rows2leaderboard(rows, 'b', user_id),
        c: rows2leaderboard(rows, 'c', user_id),
    }
}

async function computeWeeklyLeaderboard(since: string, user_id: UserDbId) {
    const rows = await db.prepare<string, LeaderboardRow>(`
        SELECT u.id as user_id, u.handle, d.difficulty,
        AVG(d.score) as score,
        MIN(d.created_at) as created_at
        FROM daily_scores d
        JOIN users u ON u.id = d.user_id
        WHERE d.created_at >= ?
        GROUP BY u.id
        ORDER BY score ASC
        LIMIT 100;
    `).all(since)

    console.log(rows, since)
    return {
        a: rows2leaderboard(rows, 'a', user_id),
        b: rows2leaderboard(rows, 'b', user_id),
        c: rows2leaderboard(rows, 'c', user_id),
    }
}

function verifyHash(score: number, difficulty: string, hash: string) {
    const secret = 's3cr3t-s@lt'
    const data = `${secret}:${difficulty}:${score}`
    const expected = crypto
        .createHash('sha256')
        .update(data)
        .digest('hex')

    return hash === expected
}
