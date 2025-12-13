import { createContext, type JSX, useContext } from "solid-js"
import { createStore } from "solid-js/store"
import { create_leaderboards, type Leaderboards } from "./Leaderboards"
import { create_puzzles, type Puzzles } from "./Puzzles"
import { create_learn, type Learn } from "./Learn"

export type MorStore = {
    learn: Learn
    leaderboards: Leaderboards
    puzzles: Puzzles
}

const MorStoreContext = createContext<MorStore>()

export function useStore() {
    return useContext(MorStoreContext)!
}

export function useLeaderboards() {
    return useStore().leaderboards
}

export function usePuzzles() {
    return useStore().puzzles
}
export function useLearn() {
    return useStore().learn
}

export function MorStoreProvider(props: { children: JSX.Element }) {

    let leaderboards: Leaderboards, puzzles: Puzzles, learn: Learn

    const [store] = createStore<MorStore>({
        get leaderboards() {
            return leaderboards
        },
        get puzzles() {
            return puzzles
        },
        get learn() {
            return learn
        }
    })

    puzzles = create_puzzles(store)
    leaderboards = create_leaderboards(store)
    learn = create_learn(store)


    return (<>
        <MorStoreContext.Provider value={store}>
            {props.children}
        </MorStoreContext.Provider>
    </>)
}
