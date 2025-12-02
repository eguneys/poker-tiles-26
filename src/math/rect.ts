import type { Vec2 } from "./vec2"

export type Rect = {
    xy: Vec2,
    wh: Vec2
}

export function box_intersect(a: Rect, b: Rect) {
    let { xy: { x: ax, y: ay } , wh: { x: aw, y: ah } } = a
    let { xy: { x: bx, y: by } , wh: { x: bw, y: bh } } = b

    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}
