import { AnimChannel } from "./anim";
import { cx, drag } from "./canvas"
import type { SceneName } from "./main"
import { box_intersect, type Rect } from "./math/rect";
import { vec2, type Vec2 } from "./math/vec2";
import { colors } from "./pico_colors";

let COLLISIONS = false
//COLLISIONS = true

type Cursor = {
    xy: Vec2
    wh: Vec2
}

let cursor: Cursor

let time: number = 0

let channels: Record<string, AnimChannel> = {
    a: new AnimChannel(0).setSway({
        amplitude: 0.1,
        frequency: 2 - 0.1,
        bias: 0.1
    }),
    b: new AnimChannel(0).setSway({
        amplitude: 0.1,
        frequency: 2 + 0.1,
        bias: -0.1
    }),
    c: new AnimChannel(0).setSway({
        amplitude: 0.1 - 0.05,
        frequency: 2.5,
        bias: 0
    })
}

export function _init() {
    time = 0
    cursor = { xy: vec2(0, 0), wh: { x: 40, y: 40 } }

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

export function _update(delta: number) {

    time += delta / 1000
    cursor.xy = vec2(...drag.is_hovering)

    let conveyor1_hit = cursor_hits_box(conveyor1_box)
    let conveyor2_hit = cursor_hits_box(conveyor2_box)
    let conveyor3_hit = cursor_hits_box(conveyor3_box)

    if (conveyor1_hit || conveyor2_hit || conveyor3_hit) {

        for (let key of Object.keys(channels)) {
            channels[key].setSpring({ stiffness: 300, damping: 6 }, 0)
            channels[key].disableSway()
            channels[key].disableNoise()
        }

    } else {
        for (let key of Object.keys(channels)) {
            channels[key].setSpring({ stiffness: 300, damping: 3 }, 0.1)
            channels[key].enableSway()
            channels[key].enableNoise()
        }


    }

    for (let key of Object.keys(channels)) {
        channels[key].update(delta/ 1000)
    }

}

function cursor_hits_box(box: Rect) {
    return box_intersect(cursor, box)
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
    for (let i = 0; i < cc.length; i++) {
        cx.fillStyle = cc[i]
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

        cx.fill()
    }

    cx.restore()
    

    cx.save()
    cx.translate(1500, 40)


    cx.lineWidth = 8
    cx.strokeStyle = colors.white
    cx.beginPath()

    cx.translate(100, 100)
    cx_box(channels.a.value)
    cx.translate(100, 0)
    cx_box(channels.b.value)
    cx.translate(-100, 100)
    cx_box(channels.c.value)

    cx.translate(0, 200)
    cx_box(channels.a.value)
    cx.translate(100, 0)
    cx_box(channels.b.value)
    cx.translate(-100, 100)
    cx_box(channels.c.value)

    cx.translate(0, 200)
    cx_box(channels.a.value)
    cx.translate(100, 0)
    cx_box(channels.b.value)
    cx.translate(-100, 100)
    cx_box(channels.c.value)




    cx.stroke()
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
        hitbox_rect(conveyor1_box)
        hitbox_rect(conveyor2_box)
        hitbox_rect(conveyor3_box)
        hitbox_rect(cursor)
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