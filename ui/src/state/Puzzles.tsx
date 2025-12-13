import type { MorStore } from "."
import type { DifficultyTier, FEN, Puzzle, PuzzleStats } from "./types"
import { createAsync } from "@solidjs/router"
import { PuzzleUtils, shuffle_fen } from "./PuzzleUtils"
import { createStore } from "solid-js/store"
import { makePersisted } from "@solid-primitives/storage"

type SavedPuzzleInProgress = {
    id: number,
    base_fen: FEN,
    fen: FEN,
    stats: PuzzleStats
}

type SavedDailyPuzzleSetInProgress = Record<DifficultyTier, SavedPuzzleInProgress>

type SavedState = {
    saved_daily_puzzle_set: SavedDailyPuzzleSetInProgress | undefined
    daily_selected_tier: DifficultyTier
}

type State = SavedState & {
    today: Date | undefined
    stats: PuzzleStats | undefined
}

type Actions = {
    set_daily_tier(tier: DifficultyTier): void
    set_daily_steps(nb_steps: number): void
    set_daily_fen(fen: FEN): void
    set_shuffle(): void
    set_reveal(): void
    set_solved(): void
}

export type Puzzles = [State, Actions]


export function create_puzzles(_store: MorStore): Puzzles {

    let daily_puzzle_set = createAsync(() => PuzzleUtils.daily_puzzle_set())
    let todays_date = createAsync(() => PuzzleUtils.todays_date())

    let [pstore, set_pstore] = makePersisted(createStore<SavedState>({
        daily_selected_tier: 'b',
        saved_daily_puzzle_set: undefined,
    }), { name: '.morchess.puzzles-store.v1'})

    function get_saved_daily_puzzle_set() {
        let res = pstore.saved_daily_puzzle_set
        let set = daily_puzzle_set()

        if (!set) {
            return undefined
        }

        if (!res || res.a.base_fen !== set.a.fen) {

            const save_daily_puzzle_set = (set: Puzzle) => {
                return {
                    id: set.id,
                    base_fen: set.fen,
                    fen: shuffle_fen(set.fen),
                    stats: {
                        nb_steps: 0
                    }
                }
            }

            let res2 = {
                a: save_daily_puzzle_set(set.a),
                b: save_daily_puzzle_set(set.b),
                c: save_daily_puzzle_set(set.c),
            }
            set_pstore('saved_daily_puzzle_set', res2)
            return res2
        }

        return res
    }

    let state = {
        get daily_selected_tier() {
            return pstore.daily_selected_tier
        },
        get saved_daily_puzzle_set() {
            return get_saved_daily_puzzle_set()
        },
        get stats() {
            return pstore.saved_daily_puzzle_set?.[pstore.daily_selected_tier].stats
        },
        get today() {
            return todays_date()
        }
    }

    let actions = {
        set_daily_tier(tier: DifficultyTier) {
            set_pstore('daily_selected_tier', tier)
        },
        set_daily_steps(nb_steps: number) {
            let selected_tier = pstore.daily_selected_tier
            if (!selected_tier) {
                return
            }
            set_pstore('saved_daily_puzzle_set', selected_tier, 'stats', 'nb_steps', nb_steps)
        },
        set_daily_fen(fen: FEN) {
            let selected_tier = pstore.daily_selected_tier
            if (!selected_tier) {
                return
            }
            set_pstore('saved_daily_puzzle_set', selected_tier, 'fen', fen)
        },
        set_shuffle() {
            let selected_tier = pstore.daily_selected_tier
            if (!selected_tier) {
                return
            }
            let fen = pstore.saved_daily_puzzle_set![selected_tier].fen
            set_pstore('saved_daily_puzzle_set', selected_tier, 'fen', shuffle_fen(fen))
        },
        set_reveal() {
            let selected_tier = pstore.daily_selected_tier
            if (!selected_tier) {
                return
            }

            let nb_steps = pstore.saved_daily_puzzle_set![selected_tier].stats.nb_steps
            set_pstore('saved_daily_puzzle_set', selected_tier, 'fen', pstore.saved_daily_puzzle_set![selected_tier].base_fen)

            if (pstore.saved_daily_puzzle_set![selected_tier].stats.nb_solved) {
            } else {
                set_pstore('saved_daily_puzzle_set', selected_tier, 'stats', 'nb_revealed', nb_steps)
            }
        },
        set_solved() {
            let selected_tier = pstore.daily_selected_tier
            if (!selected_tier) {
                return
            }

            let nb_steps = pstore.saved_daily_puzzle_set![selected_tier].stats.nb_steps
            set_pstore('saved_daily_puzzle_set', selected_tier, 'stats', 'nb_solved', nb_steps)
        },
    }

    return [state, actions]
}