import { createStore } from "solid-js/store"
import type { MorStore } from "."
import type { FEN, PuzzleStats } from "./types"
import { Learn_Modules, type Module, type ModuleId, type ModulePuzzle, type ModulePuzzleId } from "./learn_types"
import { makePersisted } from "@solid-primitives/storage"
import { batch, createMemo, createSignal } from "solid-js"

type PuzzleInProgress = {
    id: ModulePuzzleId
    module_id: ModuleId
    is_active: boolean
    fen: FEN
    stats: PuzzleStats
}

type Store = {
    puzzles_in_progress: PuzzleInProgress[]
}

type ModuleProgressions = {
    id: ModuleId
    nb_solved: number
}

type State = {
    can_next: boolean
    can_reset: boolean
    is_complete: boolean
    active_module: Module | undefined
    modules: Module[]
    puzzle: PuzzleInProgress | undefined
    module_puzzle: ModulePuzzle | undefined
    module_progressions: ModuleProgressions[]
}

type Actions = {
    set_active_module_id: (_: ModuleId | null) => void
    on_next: () => void
    on_reset: () => void
    set_solved: () => void
    set_fen: (fen: FEN) => void
    set_steps: (nb_steps: number) => void
}

export type Learn = [State, Actions]


export function create_learn(_store: MorStore): Learn {

    const [active_module_id, set_active_module_id] = createSignal<ModuleId | null>(null)
    let [pstore, set_pstore] = makePersisted(createStore<Store>({
        puzzles_in_progress: []
    }), { name: '.morchess.learn-store.v1' })

    const get_module_puzzle_with_id = (id: ModulePuzzleId) => {
        let module = active_module()

        if (!module) {
            return undefined
        }

        return module.puzzles.find(_ => _.id === id)
    }

    const make_puzzle_in_progress = (puzzle: ModulePuzzle, module_id: ModuleId): PuzzleInProgress => ({
        id: puzzle.id,
        module_id: module_id,
        fen: puzzle.initial_fen,
        stats: {
            nb_steps: 0
        },
        is_active: true,
    })

    const active_module = createMemo(() => Learn_Modules.find(_ => _.id === active_module_id()))

    const active_puzzle = createMemo(() => {

        let module = active_module()
        if (!module) {
            return undefined
        }

        let res = pstore.puzzles_in_progress.find(_ => _.module_id === module.id && _.is_active)

        if (!res) {
            return make_puzzle_in_progress(module.puzzles[0], module.id)
        }
        return res
    })

    const next_puzzle = createMemo(() => {
        let module = active_module()
        if (!module) {
            return undefined
        }


        let puzzle = active_puzzle()
        if (!puzzle) {
            return undefined
        }

        let next_puzzle_idx = module.puzzles.findIndex(_ => _.id === puzzle.id) + 1

        return module.puzzles[next_puzzle_idx]
    })

    const module_progressions = createMemo(() => {
        return Learn_Modules.map(_ => ({
            id: _.id,
            nb_solved: pstore.puzzles_in_progress.filter(p => p.module_id === _.id && p.stats.nb_solved !== undefined).length
        }))
    })

    let state = {
        get module_progressions() {
            return module_progressions()
        },
        get module_puzzle() {
            let puzzle = active_puzzle()
            if (!puzzle) {
                return undefined
            }
            return get_module_puzzle_with_id(puzzle.id)
        },
        get puzzle() {
            return active_puzzle()
        },
        get modules() {
            return Learn_Modules
        },
        get active_module() {
            return active_module()
        },
        get can_next() {
            let puzzle = active_puzzle()

            if (!puzzle) {
                return false
            }
            if (puzzle.stats.nb_solved === undefined) {
                return false
            }

            return next_puzzle()?.id !== undefined
        },
        get is_complete() {

            let module = active_module()

            if (!module) {
                return false
            }

            let puzzle = active_puzzle()
            if (!puzzle) {
                return false
            }

            let last_puzzle = module.puzzles[module.puzzles.length - 1].id === puzzle.id

            if (last_puzzle && puzzle.stats.nb_solved !== undefined) {
                return true
            }
            return false
        },
        get can_reset() {
            let puzzle = active_puzzle()

            if (!puzzle) {
                return false
            }

            let module_puzzle = get_module_puzzle_with_id(puzzle.id)

            if (!module_puzzle) {
                return false
            }

            return puzzle.fen !== module_puzzle.initial_fen
        }
    }

    const make_sure_create_puzzle_in_puzzles_in_progress = (puzzle: ModulePuzzle, module_id: ModuleId) => {

        let exists = pstore.puzzles_in_progress.find(_ => _.id === puzzle.id)
        if (!exists) {
            set_pstore('puzzles_in_progress', pstore.puzzles_in_progress.length, make_puzzle_in_progress(puzzle, module_id))
        }
    }

    let actions = {
        on_next() {

            if (!state.can_next) {
                return
            }

            let module = active_module()
            if (!module) {
                return
            }
            let puzzle = active_puzzle()
            if (!puzzle) {
                return
            }

            let next = next_puzzle()
            if (!next) {
                return
            }

            batch(() => {
                set_pstore('puzzles_in_progress', _ => _.id === puzzle.id, 'is_active', false)

                make_sure_create_puzzle_in_puzzles_in_progress(next, module.id)

                set_pstore('puzzles_in_progress', _ => _.id === next.id, 'is_active', true)
            })
        },
        on_reset() {

            if (!state.can_reset) {
                return
            }



            let module = active_module()
            if (!module) {
                return
            }
            let puzzle = active_puzzle()
            if (!puzzle) {
                return
            }

            let module_puzzle = get_module_puzzle_with_id(puzzle.id)

            if (!module_puzzle) {
                return
            }

            make_sure_create_puzzle_in_puzzles_in_progress(module_puzzle, module.id)

            set_pstore('puzzles_in_progress', _ => _.id === puzzle.id, 'fen', module_puzzle.initial_fen)
        },
        set_solved() {
            let module = active_module()
            if (!module) {
                return
            }

            let puzzle = active_puzzle()
            if (!puzzle) {
                return
            }

            let module_puzzle = get_module_puzzle_with_id(puzzle.id)

            if (!module_puzzle) {
                return
            }

            make_sure_create_puzzle_in_puzzles_in_progress(module_puzzle, module.id)
            set_pstore('puzzles_in_progress', _ => _.id === puzzle.id, 'stats', 'nb_solved', 0)
        },
        set_fen(fen: FEN) {
            let module = active_module()
            if (!module) {
                return
            }

            let puzzle = active_puzzle()
            if (!puzzle) {
                return
            }

            let module_puzzle = get_module_puzzle_with_id(puzzle.id)

            if (!module_puzzle) {
                return
            }


            make_sure_create_puzzle_in_puzzles_in_progress(module_puzzle, module.id)
            set_pstore('puzzles_in_progress', _ => _.id === puzzle.id, 'fen', fen)

        },
        set_steps() {

        },
        set_active_module_id(id: ModuleId | null) {
            set_active_module_id(id)
        }
    }

    return [state, actions]
}