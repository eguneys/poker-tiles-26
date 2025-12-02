import { AnimChannel } from "./anim";
import { cx, drag } from "./canvas"
import type { SceneName } from "./main"
import { box_intersect, box_intersect_ratio, type Rect } from "./math/rect";
import { sub, vec2, type Vec2 } from "./math/vec2";
import { colors } from "./pico_colors";

let COLLISIONS = false
//COLLISIONS = true

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
        }
    }
}

let cursor: Cursor

let time: number = 0

let channels: Record<string, AnimChannel> = {
    a: new AnimChannel().swayTo({
        amplitude: 0.1,
        frequency: 2 - 0.1,
        bias: 0.03
    }),
    b: new AnimChannel().swayTo({
        amplitude: 0.1,
        frequency: 2 + 0.1,
        bias: -0.03
    }),
    c: new AnimChannel().swayTo({
        amplitude: 0.1 - 0.05,
        frequency: 2.5,
        bias: 0
    })
}


let a_color_channel = new AnimChannel(0)


let drag_channels: Record<string, { x: AnimChannel, y: AnimChannel }> = {
    a: {
        x: new AnimChannel(),
        y: new AnimChannel()
    },
    b: {
        x: new AnimChannel(),
        y: new AnimChannel()
    },
    c: {
        x: new AnimChannel(),
        y: new AnimChannel()
    },
}

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
}


const conveyor1_box: Rect = {
    xy: vec2(1550, 100),
    wh: vec2(280, 280)
}
const conveyor2_box: Rect = {
    xy: vec2(1550, 400),
    wh: vec2(280, 280)
}
const conveyor3_box: Rect = {
    xy: vec2(1550, 700),
    wh: vec2(280, 280)
}


const red1_box: Rect = {
    xy: vec2(1200, 110),
    wh: vec2(80, 80)
}

export function _update(delta: number) {

    time += delta / 1000

    cursor.follow.x.followTo(drag.is_hovering[0])
    cursor.follow.y.followTo(drag.is_hovering[1])

    cursor.follow.x.update(delta / 1000)
    cursor.follow.y.update(delta / 1000)

    cursor.xy = vec2(cursor.follow.x.value, cursor.follow.y.value)

    if (cursor.drag === undefined) {
        cursor.follow.x.swayEnabled = true
        cursor.follow.y.swayEnabled = true
    }

    if (cursor.drag) {
        if (drag.has_moved_after_last_down) {
            cursor.drag.channels.x.followTo(cursor.xy.x - cursor.drag.decay.x)
            cursor.drag.channels.y.followTo(cursor.xy.y - cursor.drag.decay.y)
        }
    }


    let conveyor1_hit = cursor_hits_box(conveyor1_box)
    let conveyor2_hit = cursor_hits_box(conveyor2_box)
    let conveyor3_hit = cursor_hits_box(conveyor3_box)

    if (conveyor1_hit || conveyor2_hit || conveyor3_hit) {

        cursor.follow.x.swayEnabled = false
        cursor.follow.y.swayEnabled = false

    } else {

        if (cursor.drag === undefined) {
            
        }


    }

    if (drag.is_just_down) {
        if (conveyor1_hit) {

            channels.a.swayEnabled = false
            channels.b.swayEnabled = false
            channels.c.swayEnabled = false
            channels.a.springTo(0, { stiffness: 800, damping: 4 })
            channels.b.springTo(0, { stiffness: 800, damping: 3 })
            channels.c.springTo(0, { stiffness: 800, damping: 2 })


            drag_channels.a.x.springTo(-15, {stiffness: 400, damping: 8})
            drag_channels.a.y.springTo(-10, {stiffness: 400, damping: 2})
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.a.x.value - 15, y: drag_channels.a.y.value -10 } ),
                channels: drag_channels.a
            }

        }
        if (conveyor2_hit) {

            channels.a.swayEnabled = false
            channels.b.swayEnabled = false
            channels.c.swayEnabled = false
            channels.a.springTo(0, { stiffness: 800, damping: 4 })
            channels.b.springTo(0, { stiffness: 800, damping: 3 })
            channels.c.springTo(0, { stiffness: 800, damping: 2 })



            drag_channels.b.x.springTo(-15, { stiffness: 400, damping: 8 })
            drag_channels.b.y.springTo(-10, { stiffness: 400, damping: 2 })
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.b.x.value - 15, y: drag_channels.b.y.value - 10 } ),
                channels: drag_channels.b
            }
        }
        if (conveyor3_hit) {

            channels.a.swayEnabled = false
            channels.b.swayEnabled = false
            channels.c.swayEnabled = false
            channels.a.springTo(0, { stiffness: 800, damping: 4 })
            channels.b.springTo(0, { stiffness: 800, damping: 3 })
            channels.c.springTo(0, { stiffness: 800, damping: 2 })



            drag_channels.c.x.springTo(-15, { stiffness: 400, damping: 8 })
            drag_channels.c.y.springTo(-10, { stiffness: 400, damping: 2 })
            cursor.drag = { 
                decay: sub(cursor.xy, { x: drag_channels.c.x.value - 15, y: drag_channels.c.y.value - 10} ),
                channels: drag_channels.c
            }
        }
    } else if (drag.is_up) {

        if (cursor.drag) {

            channels.a.swayEnabled = true
            channels.b.swayEnabled = true
            channels.c.swayEnabled = true

            channels.a.hold()
            channels.b.hold()
            channels.c.hold()

            cursor.drag = undefined

            for (let key of Object.keys(drag_channels)) {
                drag_channels[key].x.springTo(0, { stiffness: 120, damping: 10 })
                drag_channels[key].y.springTo(0, { stiffness: 200, damping: 10 })
            }
        }
    }


    let a = a_box()
    if (a_hits_red(a)) {
        a_color_channel.springTo(80)
    } else {
        a_color_channel.springTo(0)
    }


    a_color_channel.update(delta / 1000)
    for (let key of Object.keys(channels)) {
        channels[key].update(delta / 1000)
    }

    for (let key of Object.keys(drag_channels)) {
        drag_channels[key].x.update(delta / 1000)
        drag_channels[key].y.update(delta / 1000)
    }



}

function a_box(): Rect {
    let x = drag_channels.a.x.value
    let y = drag_channels.a.y.value
    return {
        xy: vec2(x + 1600, y + 140),
        wh: vec2(80, 80)
    }
}

function cursor_hits_box(box: Rect) {
    return box_intersect(cursor, box)
}

function a_hits_red(box: Rect) {
    return box_intersect_ratio(red1_box, box) > 0.5
}

export function _render() {

    cx.fillStyle = colors.darkblue;
    cx.fillRect(0, 0, 1920, 1080)


    let w = 143
    let g = 10
    cx.save()
    cx.translate(200, 90)

    cx.fillStyle = colors.blue;
    cx.beginPath()
    for (let j = 0; j < 6; j++)
    for (let i = 0; i < 6; i++) {
        if ((i + j) % 2 === 1) {
            continue
        }       
        cx.roundRect(0 + i * (w + g), j * (w + g), w, w, 8)
    }
    cx.fill()

    cx.fillStyle = colors.pink;
    cx.beginPath()
    for (let j = 0; j < 6; j++)
    for (let i = 0; i < 6; i++) {
        if ((i + j) % 2 === 0) {
            continue
        }
        cx.roundRect(0 + i * (w + g), j * (w + g), w, w, 8)
    }
    cx.fill()



    cx.restore()


    cx.save()
    cx.translate(1100, 10)
    let cc = [
        colors.red,
        colors.green, 
        colors.yellow, 
        colors.sand,
    ]

    cx.lineWidth = 8
    for (let i = 0; i < cc.length; i++) {
        cx.strokeStyle = cc[i]
        cx.beginPath()
        cx.roundRect(100, 100 + i * 100, 80, 80, 10)


        cx.roundRect(200, 100 + i * 100, 80, 80, 10)


        if (i === 0) {
            cx.roundRect(100, 580, 80, 80, 10)
            cx.roundRect(100, 680, 80, 80, 10)
        } else if (i === 1) {
            cx.roundRect(200, 580, 80, 80, 10)
            cx.roundRect(200, 680, 80, 80, 10)
        } else if (i === 2) {
            cx.roundRect(100, 780, 80, 80, 10)
            cx.roundRect(100, 880, 80, 80, 10)
        } else if (i === 3) {
            cx.roundRect(200, 780, 80, 80, 10)
            cx.roundRect(200, 880, 80, 80, 10)
        }

        cx.stroke()
    }

    for (let i = 0; i < cc.length; i++) {
        cx.fillStyle = cc[i]
        cx.beginPath()
        cx.moveTo(100 + 40, 100 + i * 100 + 40)
        cx.arc(100 + 40, 100 + i * 100 + 40, 16, 0, Math.PI * 2)

        cx.moveTo(200 + 40, 100 + i * 100 + 40)
        cx.arc(200 + 40, 100 + i * 100 + 40, 16, 0, Math.PI * 2)

        cx.fill()

    }

    cx.restore()
    

    cx.save()
    cx.translate(1500, 40)


    cx.lineWidth = 8
    cx.strokeStyle = colors.white
    cx.beginPath()

    cx.translate(100, 100)

    cx.save()

    cx.translate(drag_channels.a.x.value, drag_channels.a.y.value)

    cx_box(channels.a.value)
    cx.translate(100, 0)
    cx_box(channels.b.value)
    cx.translate(-100, 100)
    cx_box(channels.c.value)

    cx.restore()

    cx.save()

    cx.translate(drag_channels.b.x.value, drag_channels.b.y.value)

    cx.translate(0, 300)
    cx_box(channels.a.value)
    cx.translate(100, 0)
    cx_box(channels.b.value)
    cx.translate(-100, 100)
    cx_box(channels.c.value)

    cx.restore()



    cx.save()

    cx.translate(drag_channels.c.x.value, drag_channels.c.y.value)

    cx.translate(0, 600)
    cx_box(channels.a.value)
    cx.translate(100, 0)
    cx_box(channels.b.value)
    cx.translate(-100, 100)
    cx_box(channels.c.value)

    cx.restore()

    cx.stroke()
    cx.restore()


    cx.save()
    let a = a_box()
    cx.translate(a.xy.x, a.xy.y)
    cx.beginPath()
    cx_box(channels.a.value)
    cx.fill()
    cx.clip()
    cx.fillStyle = colors.red
    cx.beginPath()
    cx.arc(30, 30, Math.max(0, a_color_channel.value), 0, Math.PI * 2)
    cx.fill()
    cx.restore()


    cx.save()
    cx.translate(cursor.xy.x, cursor.xy.y)

    cx.lineWidth = 20
    cx.strokeStyle = colors.black
    cx.beginPath()
    cx.moveTo(40, 3)
    cx.lineTo(0, 0)
    cx.lineTo(3, 40)
    cx.stroke()

    cx.restore()


    if (COLLISIONS) {
        hitbox_rect(a_box())
        hitbox_rect(conveyor1_box)
        hitbox_rect(conveyor2_box)
        hitbox_rect(conveyor3_box)
        hitbox_rect(cursor)
        hitbox_rect(red1_box)
    }
}


function cx_box(theta: number) {
    cx.save()
    cx.translate(40, 40)
    cx.rotate(theta)
    cx.translate(-40, -40)
    cx.roundRect(0, 0, 80, 80, 10)
    cx.restore()
}

function hitbox_rect(box: Rect) {

    cx.lineWidth = 16
    let x = box.xy.x
    let y = box.xy.y
    let w = box.wh.x
    let h = box.wh.y

    cx.strokeStyle = 'red'
    cx.strokeRect(x, y, w, h)

}

let set_next_scene: SceneName | undefined = undefined
export function next_scene() {
    let res =  set_next_scene
    if (res !== undefined){
        set_next_scene = undefined
        return res
    }
}