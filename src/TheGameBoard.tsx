import { createEffect, onCleanup, onMount } from 'solid-js'
import { type GameAPI, main as GameMain } from './thegame/main'
import type { FEN } from './thegame/aligns'
import type { SimulApi } from './thegame/simulation2'

export const TheGameBoard = (props: { fen?: FEN, shuffle: () => void, reveal: () => void }) => {

    let $el!: HTMLDivElement

    let cleanup_early = false
    let game_api: GameAPI
    let simul_api: SimulApi

    let load_fen_on_init: FEN | undefined


    createEffect(() => {
        props.reveal()

        if (simul_api) {
            simul_api.reveal_solution()
        }
    })

    createEffect(() => {
        props.shuffle()

        if (simul_api) {
            simul_api.shuffle_board()
        }
    })

    createEffect(() => {
        let fen = props.fen
        if (!fen) {
            return
        }

        if (simul_api) {
            simul_api.load_position(fen)
        } else {
            load_fen_on_init = fen
        }
    })

    onMount(() => {
        GameMain($el).then((api: GameAPI) => {
            if (cleanup_early) {
                api.cleanup()
                return
            }
            game_api = api
            game_api.request_api().then((api: SimulApi) => {
                simul_api = api
                if (load_fen_on_init) {
                    simul_api.load_position(load_fen_on_init)
                    load_fen_on_init = undefined
                }
            })

        })
    })

    onCleanup(() => {
        if (!game_api) {
            cleanup_early = true
            return
        }
        game_api.cleanup()
    })

    return (<> <div ref={$el} class='game-wrap'></div> </>)
}

