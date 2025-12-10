import { createContext, type JSX, useContext } from "solid-js"
import { createStore } from "solid-js/store"
import { create_leaderboards, type Leaderboards } from "./Leaderboards"
import { create_puzzles, type Puzzles } from "./Puzzles"

export type MorStore = {
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

export function MorStoreProvider(props: { children: JSX.Element }) {

    let leaderboards: Leaderboards, puzzles: Puzzles

    const [store] = createStore<MorStore>({
        get leaderboards() {
            return leaderboards
        },
        get puzzles() {
            return puzzles
        }
    })

    puzzles = create_puzzles(store)
    leaderboards = create_leaderboards(store)


    return (<>
        <MorStoreContext.Provider value={store}>
            {props.children}
        </MorStoreContext.Provider>
    </>)
}
