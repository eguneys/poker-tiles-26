import { AnimChannel } from "./anim";
import { cx, drag } from "./canvas"
import type { SceneName } from "./main"
import { box_intersect, box_intersect_ratio, type Rect } from "./math/rect";
import { add, sub, vec2, type Vec2 } from "./math/vec2";
import { colors } from "./pico_colors";
import { Palette, Utils, type Color as PaletteColor, type Shape } from "./tetro";

let COLLISIONS = false
//COLLISIONS = true

const grid_box = {
    xy: vec2(150, 150),
    wh: vec2(8 * 110, 8 * 110)
}

const grid_color_boxes = fill_grid_boxes()

const slotA_box = { 
    xy: vec2(1500, 100),
    wh: vec2(300, 300),
}
const slotB_box = { 
    xy: vec2(1500, 100 + 300 * 1),
    wh: vec2(300, 300),
}
const slotC_box = { 
    xy: vec2(1500, 100 + 300 * 2),
    wh: vec2(300, 300),
}


const palletteA_box = {
    xy: vec2(1200, 140),
    wh: vec2(200, 400)
}
const palletteB_box = {
    xy: vec2(1200, 140 + 450),
    wh: vec2(200, 400)
}


const palletteA_color_boxes = fill_color_boxes(palletteA_box)
const palletteB_color_boxes = fill_color_boxes(palletteB_box)

let shape_boxes: Record<Slot, Rect[]>

type Color = string

type Cursor = {
    xy: Vec2,
    wh: Vec2,
    follow: {
        x: AnimChannel,
        y: AnimChannel
    },
    drag?: {
        decay: Vec2
        channels: {
            x: AnimChannel,
            y: AnimChannel
        },
        shape: Shape,
        released: boolean,
        slot: Slot
    }
}

let cursor: Cursor

let time: number = 0

type Slot = 'a' | 'b' | 'c'
const Slots: Slot[] = ['a', 'b', 'c']

let sway_channels = [
    new AnimChannel().swayTo({
        amplitude: 0.1,
        frequency: 2 - 0.1,
        bias: 0.03
    }),
    new AnimChannel().swayTo({
        amplitude: 0.1,
        frequency: 2 + 0.1,
        bias: -0.03
    }),
    new AnimChannel().swayTo({
        amplitude: 0.1 - 0.05,
        frequency: 2.5,
        bias: 0
    })
]

let drag_channels: Record<Slot, { x: AnimChannel, y: AnimChannel }> = {
    a: {
        x: new AnimChannel(),
        y: new AnimChannel()
    },
    b: {
        x: new AnimChannel(),
        y: new AnimChannel(300 * 1)
    },
    c: {
        x: new AnimChannel(),
        y: new AnimChannel(300 * 2)
    },
}

type DoubleBuffer<A> = {
    buffer: [A, A],
    i: 0 | 1
}

type ColorAnimChannel = {
    color: PaletteColor,
    channel: AnimChannel
}

const double_buffer_anim_channels = (): DoubleBuffer<ColorAnimChannel> => ({
    buffer: [
        { color: 'empty', channel: new AnimChannel() },
        { color: 'empty', channel: new AnimChannel() }
    ],
    i: 0
})

let color_channels_double_buffer: Record<Slot, DoubleBuffer<ColorAnimChannel>[]> = {
    a: [
        double_buffer_anim_channels(),
        double_buffer_anim_channels(),
        double_buffer_anim_channels(),
    ],
    b: [
        double_buffer_anim_channels(),
        double_buffer_anim_channels(),
        double_buffer_anim_channels(),
    ], 
    c: [
        double_buffer_anim_channels(),
        double_buffer_anim_channels(),
        double_buffer_anim_channels(),
    ]
}

type Shapes = Record<Slot, Shape>

let shapes: Shapes

let locks: Record<Slot, boolean>

let palette_a: Palette
let palette_b: Palette

let show_no_drop_overlay_alpha = new AnimChannel()

let grid_cell_alphas: AnimChannel[][] = fill_grid64_anim_channels()
let grid_cell_colors: PaletteColor[][] = fill_grid64_colors()
let grid_cell_locked_colors: PaletteColor[][] = fill_grid64_colors()

export function _init() {
    time = 0
    cursor = { 
        xy: vec2(0, 0), 
        wh: { x: 40, y: 40 },
        follow: { 
            x: new AnimChannel().swayTo({ amplitude: -8, frequency: 13, bias: 0 }),
            y: new AnimChannel().swayTo({ amplitude: -8, frequency: 13, bias: 0 }),
        }
    }

    cx.lineCap = 'round'
    cx.lineJoin = 'round'


    shapes = {
        a: Utils.random_shape(),
        b: Utils.random_shape(),
        c: Utils.random_shape()
    }

    locks = {
        a: false,
        b: false,
        c: false
    }

    palette_a = new Palette(2, 4, [
        ['red', 'red'],
        ['green', 'green'],
        ['yellow', 'yellow'],
        ['white', 'white'],
    ])


    palette_b = new Palette(2, 4, [
        ['red', 'green'],
        ['red', 'green'],
        ['yellow', 'white'],
        ['yellow', 'white'],
    ])
}

export function _update(delta: number) {

    shape_boxes = {
        a: fill_shape_boxes(slotA_box, shapes.a, drag_channels.a.x.value, drag_channels.a.y.value),
        b: fill_shape_boxes(slotB_box, shapes.b, drag_channels.b.x.value, drag_channels.b.y.value - 300 * 1),
        c: fill_shape_boxes(slotC_box, shapes.c, drag_channels.c.x.value, drag_channels.c.y.value - 300 * 2)
    }


    time += delta / 1000

    cursor.follow.x.followTo(drag.is_hovering[0])
    cursor.follow.y.followTo(drag.is_hovering[1])

    cursor.follow.x.update(delta / 1000)
    cursor.follow.y.update(delta / 1000)

    cursor.xy = vec2(cursor.follow.x.value, cursor.follow.y.value)

    if (cursor.drag === undefined || cursor.drag.released) {
        cursor.follow.x.swayEnabled = true
        cursor.follow.y.swayEnabled = true
    }

    if (cursor.drag && !cursor.drag.released) {
        if (drag.has_moved_after_last_down) {
            cursor.drag.channels.x.followTo(cursor.xy.x - cursor.drag.decay.x)
            cursor.drag.channels.y.followTo(cursor.xy.y - cursor.drag.decay.y)
        }
    }

    let slotA_hit = cursor_hits_box(slotA_box)
    let slotB_hit = cursor_hits_box(slotB_box)
    let slotC_hit = cursor_hits_box(slotC_box)

    if (slotA_hit || slotB_hit || slotC_hit) {

        cursor.follow.x.swayEnabled = false
        cursor.follow.y.swayEnabled = false


        sway_channels[0].swayEnabled = false
        sway_channels[1].swayEnabled = false
        sway_channels[2].swayEnabled = false

        sway_channels[0].springTo(0, { stiffness: 800, damping: 4 })
        sway_channels[1].springTo(0, { stiffness: 800, damping: 3 })
        sway_channels[2].springTo(0, { stiffness: 800, damping: 2 })
    } else {

        if (cursor.drag === undefined || cursor.drag.released) {
            sway_channels[0].swayEnabled = true
            sway_channels[1].swayEnabled = true
            sway_channels[2].swayEnabled = true

            sway_channels[0].hold()
            sway_channels[1].hold()
            sway_channels[2].hold()
        }
    }

    if (drag.is_just_down) {
        if (slotA_hit) {

            drag_channels.a.x.springTo(-15, {stiffness: 400, damping: 8})
            drag_channels.a.y.springTo(-10, {stiffness: 400, damping: 2})
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.a.x.value - 15, y: drag_channels.a.y.value -10 } ),
                channels: drag_channels.a,
                shape: shapes.a,
                released: false,
                slot: 'a'
            }

        }
        if (slotB_hit) {

            drag_channels.b.x.springTo(-15, { stiffness: 400, damping: 8 })
            drag_channels.b.y.springTo(-10 + 300 * 1, { stiffness: 400, damping: 2 })
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.b.x.value - 15, y: drag_channels.b.y.value - 10 } ),
                channels: drag_channels.b,
                shape: shapes.b,
                released: false,
                slot: 'b'
            }
        }
        if (slotC_hit) {

            drag_channels.c.x.springTo(-15, { stiffness: 400, damping: 8 })
            drag_channels.c.y.springTo(-10 + 300 * 2, { stiffness: 400, damping: 2 })
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.c.x.value - 15, y: drag_channels.c.y.value - 10 } ),
                channels: drag_channels.c,
                shape: shapes.c,
                released: false,
                slot: 'c'
            }
        }


    } else if (drag.is_up) {

        if (cursor.drag) {

            sway_channels[0].swayEnabled = true
            sway_channels[1].swayEnabled = true
            sway_channels[2].swayEnabled = true

            sway_channels[0].hold()
            sway_channels[1].hold()
            sway_channels[2].hold()


            drag_channels.a.x.springTo(0, { stiffness: 120, damping: 10 })
            drag_channels.a.y.springTo(0, { stiffness: 200, damping: 10 })

            drag_channels.b.x.springTo(0, { stiffness: 120, damping: 10 })
            drag_channels.b.y.springTo(300 * 1, { stiffness: 200, damping: 10 })

            drag_channels.c.x.springTo(0, { stiffness: 120, damping: 10 })
            drag_channels.c.y.springTo(300 * 2, { stiffness: 200, damping: 10 })

            let has_filled = shapes[cursor.drag.slot].some(_ => _.some(_ => _ !== null && _ !== 'empty'))

            locks[cursor.drag.slot] = has_filled
        }
    }

    for (let slot of Slots) {

        if (locks[slot]) {
            continue
        }

        let i_cell = -1
        for (let i = 0; i < 2; i++) {
            shapes: for (let j = 0; j < 2; j++) {
                if (shapes[slot][i][j] === null) {
                    continue
                }

                let box = shape_boxes[slot][++i_cell]

                let is_on_a_color = false
                let i_pslot = -1
                for (let pi = 0; pi < 2; pi++) {
                    for (let pj = 0; pj < 4; pj++) {

                        let pbox = palletteA_color_boxes[++i_pslot]
                        let p_color = palette_a.cells[pj][pi]

                        if (box_intersect_ratio(box, pbox) > 0.4) {
                            if (shapes[slot][i][j] === p_color) {
                                is_on_a_color = true
                                continue
                            }

                            shapes[slot][i][j] = p_color

                            let color_channels_front = color_channels_double_buffer[slot][i_cell].buffer[color_channels_double_buffer[slot][i_cell].i]
                            let color_channels_back = color_channels_double_buffer[slot][i_cell].buffer[(color_channels_double_buffer[slot][i_cell].i + 1) % 2]

                            color_channels_back.channel.springTo(0, { stiffness: 600, damping: 60 })
                            color_channels_front.channel.springTo(100, { stiffness: 300, damping: 30 })

                            color_channels_front.color = p_color

                            color_channels_double_buffer[slot][i_cell].i = color_channels_double_buffer[slot][i_cell].i === 0 ? 1 : 0
                            continue shapes
                        }


                        pbox = palletteB_color_boxes[i_pslot]
                        p_color = palette_b.cells[pj][pi]

                        if (box_intersect_ratio(box, pbox) > 0.3) {
                            if (shapes[slot][i][j] === p_color) {
                                is_on_a_color = true
                                continue
                            }

                            shapes[slot][i][j] = p_color

                            let color_channels_front = color_channels_double_buffer[slot][i_cell].buffer[color_channels_double_buffer[slot][i_cell].i]
                            let color_channels_back = color_channels_double_buffer[slot][i_cell].buffer[(color_channels_double_buffer[slot][i_cell].i + 1) % 2]

                            color_channels_back.channel.springTo(0)
                            color_channels_front.channel.springTo(100)

                            color_channels_front.color = p_color

                            color_channels_double_buffer[slot][i_cell].i = color_channels_double_buffer[slot][i_cell].i === 0 ? 1 : 0
                            continue shapes
                        }

                    }
                }

                if (box_intersect_ratio(box, palletteA_box) > 0.8 || box_intersect_ratio(box, palletteB_box) > 0.8) {
                    continue
                }

                if (is_on_a_color) {
                    continue
                }

                if (shapes[slot][i][j] === 'empty') {
                    continue
                }

                shapes[slot][i][j] = 'empty'

                let color_channels_front = color_channels_double_buffer[slot][i_cell].buffer[color_channels_double_buffer[slot][i_cell].i]
                let color_channels_back = color_channels_double_buffer[slot][i_cell].buffer[(color_channels_double_buffer[slot][i_cell].i + 1) % 2]

                color_channels_back.channel.springTo(0)
                color_channels_front.channel.springTo(100)

                color_channels_front.color = 'empty'

                color_channels_double_buffer[slot][i_cell].i = color_channels_double_buffer[slot][i_cell].i === 0 ? 1 : 0
            }
        }
    }



    for (let i = 0; i < 3; i++)
        sway_channels[i].update(delta / 1000)
    for (let key of Slots) {
        drag_channels[key].x.update(delta / 1000)
        drag_channels[key].y.update(delta / 1000)
        for (let i = 0; i < 3; i++) {
            color_channels_double_buffer[key][i].buffer[0].channel.update(delta / 1000)
            color_channels_double_buffer[key][i].buffer[1].channel.update(delta / 1000)
        }
    }

    update_grid(delta)


    if (drag.is_up) {
        if (cursor.drag) {
            cursor.drag.released = true
        }
    }

}


function update_grid(delta: number) {

    if (cursor.drag && !cursor.drag.released) {

        let a_hit = shape_boxes[cursor.drag.slot].some(box => box_intersect(grid_box, box))

        if (!locks[cursor.drag.slot]) {
            if (a_hit) {
                show_no_drop_overlay_alpha.springTo(0.7, { stiffness: 1000, damping: 80})
            } else {
                show_no_drop_overlay_alpha.springTo(0)
            }
        }

        if (a_hit) {
            if (locks[cursor.drag.slot]) {

                let matched_ij
                grid: for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        if (box_intersect_ratio(shape_boxes[cursor.drag.slot][0], grid_color_boxes[i][j]) > 0.3) {
                            let shape_ij = Utils.grid_ij(cursor.drag.shape, i, j)
                            if (shape_ij === null) {
                                break grid
                            }
                            matched_ij = shape_ij
                            
                            break grid
                        }
                    }
                }

                let i_cell = 0
                if (matched_ij) {
                    for (let [i, j] of matched_ij) {
                        let shape_color = shape_i_cell(cursor.drag.shape, i_cell++)
                        let grid_color = grid_cell_locked_colors[i][j]

                        let can_place = true

                        if (shape_color === 'empty' && grid_color === null) {
                            can_place = false
                        }
                        if (shape_color !== 'empty' && grid_color !== null) {
                            can_place = false
                        }
                        if (shape_color === grid_color) {
                            can_place = true
                        }

                        if (!can_place) {
                            matched_ij = undefined
                            break
                        }
                    }
                }

                i_cell = 0
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        if (matched_ij && matched_ij.find(_ => _[0] === i && _[1] === j)) {
                            grid_cell_colors[i][j] = shape_i_cell(cursor.drag.shape, i_cell++)
                            grid_cell_alphas[i][j].springTo(1)
                        } else {
                            grid_cell_colors[i][j] = grid_cell_locked_colors[i][j]
                            grid_cell_alphas[i][j].springTo(0)
                        }
                    }
                }
            }


            if (drag.is_up) {

                let has_placed_on_grid = false
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        if (grid_cell_colors[i][j] !== grid_cell_locked_colors[i][j]) {
                            let grid_color = grid_cell_colors[i][j]
                            grid_cell_locked_colors[i][j] = grid_color === 'empty' ? null : grid_color
                            grid_cell_colors[i][j] = null
                            has_placed_on_grid = true
                        }
                    }
                }

                if (has_placed_on_grid) {
                    locks[cursor.drag.slot] = false

                    shapes[cursor.drag.slot] = Utils.random_shape()
                    // TODO remove cursor drag completely
                    cursor.drag.shape = shapes[cursor.drag.slot]

                    color_channels_double_buffer[cursor.drag.slot] = [
                        double_buffer_anim_channels(),
                        double_buffer_anim_channels(),
                        double_buffer_anim_channels(),
                    ]



                }
            }
        }
    }

    if (drag.is_up) {
        show_no_drop_overlay_alpha.springTo(0)
    }
    
    show_no_drop_overlay_alpha.update(delta / 1000)

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            grid_cell_alphas[i][j].update(delta / 1000)
        }
    }
}

function shape_i_cell(shape: Shape, i_cell: number): PaletteColor {
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (shape[i][j] === null) {
                continue
            }
            if (i_cell-- === 0) {
                return shape[i][j]
            }
        }
    }
    return null
}

function cursor_hits_box(box: Rect) {
    return box_intersect(cursor, box)
}

function pallette_color_to_pico(color: PaletteColor): Color {
    switch (color) {
        case 'red':
            return colors.red
        case 'green':
            return colors.green
        case 'yellow':
            return colors.yellow
        case 'white':
            return colors.sand
        case 'empty':
            return colors.darkblue
    }
    return colors.darkred
}

export function _render() {
    cx.fillStyle = colors.darkblue
    cx.fillRect(0, 0, 1920, 1080)



    let x, y, gap


    x = 1200
    y = 140

    gap = 450

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
            pallette_color(x + i * 100, y + j * 100, pallette_color_to_pico(palette_a.cells[j][i]))

            pallette_color(x + i * 100, gap + y + j * 100, pallette_color_to_pico(palette_b.cells[j][i]))
        }
    }




    x = 1560
    y = 180

    gap = 300

    if (cursor.drag?.shape === shapes.a) {
        cx.globalAlpha = 0.2
        cx.setLineDash([10])
    }
    shape(x + 0, y + 0, shapes.a, 'a')
    cx.globalAlpha = 1
    cx.setLineDash([])
    if (cursor.drag?.shape === shapes.b) {
        cx.globalAlpha = 0.2
        cx.setLineDash([10])
    }
    shape(x + 0, y + gap * 1, shapes.b, 'b')
    cx.globalAlpha = 1
    cx.setLineDash([])
    if (cursor.drag?.shape === shapes.c) {
        cx.globalAlpha = 0.2
        cx.setLineDash([10])
    }
    shape(x + 0, y + gap * 2, shapes.c, 'c')
    cx.globalAlpha = 1
    cx.setLineDash([])

    render_guides()

    render_grid()

    if (cursor.drag) {
        shape(x + cursor.drag.channels.x.value, y + cursor.drag.channels.y.value, cursor.drag.shape, cursor.drag.slot)
    }

    render_cursor(cursor.xy.x, cursor.xy.y)


    render_debug()
}

function render_grid() {

    let x, y

    x = 150
    y = 150

    let w = 110
    cx.lineWidth = 4
    cx.strokeStyle = colors.pink
    cx.beginPath()
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 0) {
                continue
            }

            cx.roundRect(x + i * w + 8, y + j * w + 8, w - 16, w - 16, 16)
        }
    }
    cx.stroke()

    cx.strokeStyle = colors.blue
    cx.beginPath()
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) {
                continue
            }

            cx.roundRect(x + i * w, y + j * w, w, w, 16)
        }
    }
    cx.stroke()

    {
        cx.strokeStyle = colors.darkblue
        cx.beginPath()
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 0) {
                    continue
                }

                cx.roundRect(x + i * w + 8 + 4, y + j * w + 8 + 4, w - 16 - 8, w - 16 -8, 16)
            }
        }
        cx.stroke()

        cx.strokeStyle = colors.darkblue
        cx.beginPath()
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 1) {
                    continue
                }

                cx.roundRect(x + i * w + 4, y + j * w + 4, w - 8, w - 8, 16)
            }
        }
        cx.stroke()


    }

    for (let i =0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {

            cx.save()
            cx.beginPath()
            if ((i + j) % 2 === 1) {
                cx.roundRect(x + i * w + 8 + 2 + 4, y + j * w + 8 + 2 + 4, w - 16 - 4 - 8, w - 16 - 4 - 8, 16)
            } else {
                cx.roundRect(x + i * w + 2 + 4, y + j * w + 2 + 4, w - 4 -8, w - 4 - 8, 16)
            }
            cx.clip()

            cx.fillStyle = pallette_color_to_pico(grid_cell_locked_colors[i][j])
            cx.beginPath()
            cx.roundRect(x + i * w, y + j * w, w, w, 16)
            cx.fill()

            if (grid_cell_colors[i][j] !== null) {
                cx.globalAlpha = Math.max(0, grid_cell_alphas[i][j].value)
                cx.fillStyle = pallette_color_to_pico(grid_cell_colors[i][j])
                cx.beginPath()
                cx.roundRect(x + i * w, y + j * w, w, w, 16)
                cx.fill()
                cx.globalAlpha = 1
            }
            cx.restore()
        }
    }


    if (show_no_drop_overlay_alpha.value > 0) {
        cx.globalAlpha = show_no_drop_overlay_alpha.value
        cx.fillStyle = colors.gray
        cx.beginPath()
        cx.roundRect(x - 8, y - 8, 8 * w + 16, 8 * w + 16, 16)
        cx.fill()
        cx.globalAlpha = 1
    }

}

function render_guides() {
    cx.strokeStyle = colors.sand
    cx.lineWidth = 7

    cx.beginPath()
    cx.moveTo(1650, 50)
    cx.lineTo(1650, 80)

    let gap = 25
    cx.moveTo(1270, 30)
    cx.lineTo(1270, 80)
    cx.moveTo(1270 + gap, 40)
    cx.lineTo(1270 + gap, 80)

    cx.moveTo(550, 30)
    cx.lineTo(550, 80)
    cx.moveTo(550 + gap, 40)
    cx.lineTo(550 + gap, 80)
    cx.moveTo(550 + gap + gap, 50)
    cx.lineTo(550 + gap + gap, 80)

    cx.stroke()

    cx.strokeStyle = colors.purple
    cx.lineWidth = 2
    cx.beginPath()
    cx.moveTo(0, 100)
    cx.lineTo(1920, 100)


    cx.moveTo(1470, 450)
    cx.lineTo(1470, 650)

    cx.moveTo(1110, 450)
    cx.lineTo(1110, 650)

    cx.stroke()
}

function pallette_color(x: number, y: number, color: Color) {

    cx.fillStyle = color
    cx.beginPath()
    cx.moveTo(x + 40, y + 40)
    cx.arc(x + 40, y + 40, 16, 0, Math.PI * 2)
    cx.fill()


    cx.lineWidth = 8
    cx.strokeStyle = color

    cx.beginPath()
    cx.roundRect(x, y, 80, 80, 10)
    cx.stroke()
}

function render_cursor(x: number, y: number) {
    cx.lineWidth = 20
    cx.strokeStyle = colors.black
    cx.beginPath()
    cx.moveTo(x + 40, y + 3)
    cx.lineTo(x + 0, y + 0)
    cx.lineTo(x + 3, y + 40)
    cx.stroke()
}


function render_debug() {

    if (COLLISIONS) {
        hitbox_rect(slotA_box)
        hitbox_rect(slotB_box)
        hitbox_rect(slotC_box)
        hitbox_rect(cursor)
        //hitbox_rect(palletteA_box)
        //hitbox_rect(palletteB_box)

        palletteA_color_boxes.forEach(box => hitbox_rect(box))
        palletteB_color_boxes.forEach(box => hitbox_rect(box))


        shape_boxes.a.forEach(box => hitbox_rect(box))
        shape_boxes.b.forEach(box => hitbox_rect(box))
        shape_boxes.c.forEach(box => hitbox_rect(box))

        hitbox_rect(grid_box)

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                hitbox_rect(grid_color_boxes[i][j])
            }
        }
    }
}

function shape(x: number, y: number, shape: Shape, slot: Slot) {
    let no_sway = locks[slot] ? 0 : 1
    let i_cell = 0
    cx.lineWidth = 8
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (shape[i][j] === null) {
                continue
            }
            cx.strokeStyle = (locks[slot] && shape[i][j] !== 'empty') ? pallette_color_to_pico(shape[i][j]) : colors.white
            cx.beginPath()
            cx_box(x + i * 100, y + j * 100, no_sway * sway_channels[i_cell++].value)
            cx.stroke()
        }
    }


    i_cell = 0
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (shape[i][j] === null) {
                continue
            }
            cx.save()
            cx.fillStyle = colors.darkblue
            cx.beginPath()
            cx_box(x + i * 100, y + j * 100, no_sway * sway_channels[i_cell].value)
            cx.fill()
            cx.clip()
            cx.beginPath()
            let color_channel_back = color_channels_double_buffer[slot][i_cell].buffer[0]
            let color_channel_front = color_channels_double_buffer[slot][i_cell].buffer[1]
            cx.fillStyle = pallette_color_to_pico(color_channel_back.color)
            cx.arc(x + i * 100 + 10, y + j * 100 + 10, Math.max(0, color_channel_back.channel.value), 0, Math.PI * 2)
            cx.fill()
            cx.beginPath()
            cx.fillStyle = pallette_color_to_pico(color_channel_front.color)
            cx.arc(x + i * 100 + 70, y + j * 100 + 70, Math.max(0, color_channel_front.channel.value), 0, Math.PI * 2)
            cx.fill()
            cx.restore()
            i_cell++
        }
    }
}


function cx_box(x: number, y: number, theta: number) {
    // Calculate rotation center at (40, 40) relative to (x, y)
    const centerX = x + 40;
    const centerY = y + 40;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // Direct matrix: translate to center, rotate, translate back, then to position
    cx.setTransform(
        cos, sin,
        -sin, cos,
        centerX - 40 * cos + 40 * sin,  // Combined translation
        centerY - 40 * sin - 40 * cos
    );

    cx.roundRect(0, 0, 80, 80, 10);
    cx.resetTransform();
}


function hitbox_rect(box: Rect) {

    cx.setLineDash([10])
    cx.lineWidth = 7
    let x = box.xy.x
    let y = box.xy.y
    let w = box.wh.x
    let h = box.wh.y

    cx.strokeStyle = 'red'
    cx.strokeRect(x, y, w, h)

    cx.setLineDash([])
}


function fill_color_boxes(box: Rect) {
    let res: Rect[] = []
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
            res.push({
                xy: add(box.xy, vec2(i * 100, j * 100)),
                wh: vec2(80, 80)
            })
        }
    }
    return res
}

function fill_shape_boxes(box: Rect, shape: Shape, ox: number, oy: number) {
    let res: Rect[] = []
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (shape[i][j] === null) {
                continue
            }
            let off_x = 60
            let off_y = 80
            res.push({
                xy: add(box.xy, vec2(ox + off_x + i * 100, oy + off_y + j * 100)),
                wh: vec2(80, 80)
            })
        }
    }
    return res
}

function fill_grid_boxes() {
    let res: Rect[][] = []
    for (let i = 0; i < 8; i++) {
        let a = []
        for (let j = 0; j < 8; j++) {
            a.push({
                xy: add(grid_box.xy, vec2(i * 110, j * 110)),
                wh: vec2(110, 110)
            })
        }
        res.push(a)
    }
    return res
}

function fill_grid64_anim_channels() {
    let res = []
    for (let i = 0; i < 8; i++) {
        let a = []
        for (let j = 0; j < 8; j++) {
            a.push(new AnimChannel())
        }
        res.push(a)
    }
    return res
}

function fill_grid64_colors() {
    let res = []
    for (let i = 0; i < 8; i++) {
        let a = []
        for (let j = 0; j < 8; j++) {
            a.push(null)
        }
        res.push(a)
    }
    return res
}

let set_next_scene: SceneName | undefined = undefined
export function next_scene() {
    let res =  set_next_scene
    if (res !== undefined){
        set_next_scene = undefined
        return res
    }
}