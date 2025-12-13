import { createEffect, onCleanup, onMount } from 'solid-js'
import { type GameAPI, main as GameMain } from './thegame/main'
import type { FEN } from './thegame/aligns'
import type { SimulApi } from './thegame/simulation2'

/**
 * A clean, loop-free integration between Solid and an imperative engine.
 *
 * - Solid props.fen/target/steps can change (e.g., selecting a new puzzle).
 * - Engine can change fen/steps through its own UI.
 * - A SyncController mediates the two sources safely.
 */

export const TheGameBoard = (props: {
  fen?: FEN,
  target?: FEN,
  nb_steps?: number,
  set_update_fen: (_: FEN) => void,
  set_update_steps: (_: number) => void,
  set_update_solved: () => void
}) => {

  let el!: HTMLDivElement
  let gameApi: GameAPI | null = null
  let simulApi: SimulApi | null = null
  let cleanupEarly = false

  /**
   * Sync controller:
   * Tracks the latest values that the ENGINE is known to hold.
   * Prevents Solid→Engine→Solid loops by distinguishing update origins.
   */
  const sync = {
    fen: undefined as FEN | undefined,
    target: undefined as FEN | undefined,
    steps: undefined as number | undefined,

    /**
     * Called whenever Solid props change.
     * This returns TRUE if engine must load a new position,
     * or FALSE if props reflect what the engine already has.
     */
    shouldEngineLoad(f: FEN, t: FEN, s: number) {
      return !(this.fen === f && this.target === t && this.steps === s)
    },

    /**
     * Mark that the engine now “owns” these values.
     * Used after calling engine.load_position and after engine emits updates.
     */
    setEngineState(f: FEN, t: FEN, s: number) {
      this.fen = f
      this.target = t
      this.steps = s
    }
  }

  onMount(async () => {
    const api = await GameMain(el)

    if (cleanupEarly) {
      api.cleanup()
      return
    }

    gameApi = api

    const sApi = await api.request_api()
    simulApi = sApi

    // Engine → Solid event bridges
    simulApi.set_update_fen((fen: FEN) => {
      // Engine-originated update
      sync.fen = fen
      queueMicrotask(() => {
          props.set_update_fen(fen)
      })
    })

    simulApi.set_update_steps((steps: number) => {
      sync.steps = steps
        queueMicrotask(() => {
            props.set_update_steps(steps)
        })
    })

    simulApi.set_update_solved(() => {
        queueMicrotask(() => {
            props.set_update_solved()
        })
    })

    // Initial load if props are ready at mount
    const f = props.fen
    const t = props.target
    const s = props.nb_steps ?? 0

    if (f && t) {
      sync.setEngineState(f, t, s)
      simulApi.load_position(f, t, s)
    }
  })

  /**
   * React to Solid-driven FEN/target/step changes.
   * Only loads engine if they differ from known engine state.
   */
  createEffect(() => {
    const f = props.fen
    const t = props.target
    const s = props.nb_steps ?? 0

    if (!simulApi) return

    if (!f || !t) return

    if (!sync.shouldEngineLoad(f, t, s)) {
      // Solid is just reflecting what engine already knows → ignore
      return
    }

    // Solid is giving a new position → engine must load it
    sync.setEngineState(f, t, s)
    simulApi.load_position(f, t, s)
  })

  onCleanup(() => {
    if (!gameApi) {
      cleanupEarly = true
      return
    }
    gameApi.cleanup()
  })

  return <div ref={el} class="game-wrap"></div>
}
