import { createStore } from "solid-js/store"
import type { MorStore } from "."
import type { DailyPuzzleSet } from "./types"
import { createAsync } from "@solidjs/router"
import { PuzzleUtils } from "./PuzzleUtils"

type State = {
    daily_puzzle_set: DailyPuzzleSet | undefined
    today: Date | undefined
}

type Actions = {

}

export type Puzzles = [State, Actions]


export function create_puzzles(_store: MorStore): Puzzles {

    let daily_puzzle_set = createAsync(() => PuzzleUtils.daily_puzzle_set())
    let todays_date = createAsync(() => PuzzleUtils.todays_date())

    let [state] = createStore({
        get daily_puzzle_set() {
            return daily_puzzle_set()
        },
        get today() {
            return todays_date()
        }
    })

    let actions = {

    }

    return [state, actions]
}