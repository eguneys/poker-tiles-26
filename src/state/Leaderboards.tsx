import { createStore } from "solid-js/store"
import type { MorStore } from "."

type State = {

}

type Actions = {

}

export type Leaderboards = [State, Actions]


export function create_leaderboards(_store: MorStore): Leaderboards {

    let state = createStore({

    })

    let actions = {

    }

    return [state, actions]
}