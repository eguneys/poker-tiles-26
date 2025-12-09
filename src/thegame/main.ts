import { Loop } from "./loop"
import * as simulate from './simulation2'
import { drag, init_canvas } from './webgl/canvas'


type Scene = {
    _init(): void
    _update(delta: number): void
    _render(): void
    _after_render?: () => void
    _destroy?: () => void
    next_scene(): SceneName | undefined
}

const default_scene = {
    _init() {},
    _update(_delta: number) {},
    _render() {},
    next_scene() { return undefined }
}

let current_scene: Scene
let next_scene: Scene

function switch_to_scene(scene: Scene) {
    next_scene._destroy?.()
    next_scene = scene
}

let Scenes: Record<string, Scene> = {
    'simulate': simulate
} as const

export type SceneName = keyof typeof Scenes;


function _init() {

    current_scene = default_scene
    next_scene = current_scene

    switch_to_scene(simulate)
}

function _update(delta: number) {

    if (next_scene !== current_scene) {
        current_scene = next_scene
        current_scene._init()
    }

    current_scene._update(delta)

    let next = current_scene.next_scene()

    if (next !== undefined) {
        switch_to_scene(Scenes[next])
    }

    drag.update(delta)
}


function _render() {
    current_scene._render()
}



function _after_render() {
    current_scene._after_render?.()
}

export async function main(el: HTMLElement) {

    let canvas = init_canvas()
    canvas.classList.add('interactive')
    el.appendChild(canvas)

    _init()

    Loop(_update, _render, _after_render)
}