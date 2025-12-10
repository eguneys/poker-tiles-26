import { getDailyPick } from "./daily_random"
import type { DailyPuzzleSet } from "./types"

const fens_db = () => fetch('/fens_tenk.txt').then(_ => _.text()).then(_ => _.split('\n'))

export class PuzzleUtils {

    static daily_puzzle_set = async (): Promise<DailyPuzzleSet> => {
        let fens = await fens_db()
        let a = getDailyPick(fens, "a")
        let b = getDailyPick(fens, "b")
        let c = getDailyPick(fens, "c")

        return {
            a: {fen: a},
            b: {fen: b},
            c: {fen: c},
        }
    }

    static todays_date = async (): Promise<Date> => {
        return new Date()
    }
}