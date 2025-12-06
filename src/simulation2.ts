import type { SceneName } from "./main"
import { cx, drag } from "./canvas"
import { colors, vibrant } from "./pico_colors"
import { add, mulScalar, sub, vec2, type Vec2 } from "./math/vec2"
import { AnimChannel } from "./anim"
import { hitbox_rect } from "./simulation"
import type { Rect } from "./math/rect"
import type { Square } from "./chess/types"
import { squareFile, squareFromCoords, squareRank } from "./chess/util"
import { board_aligns_data, find_align_direction, type AlignsData, type Board, type Direction, type Pieces } from "./aligns"

let COLLISIONS = false
//COLLISIONS = true


type File = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
type Rank  = File

const grid_box = {
    xy: vec2(300, 60),
    wh: vec2(8 * 120, 8 * 120)
}

let grid_square_boxes = fill_grid_square_boxes(grid_box)

type Cursor = {
    sq?: Square
    xy: Vec2,
    wh: Vec2,
    follow: {
        x: AnimChannel,
        y: AnimChannel
    },
    drag?: {
        decay: Vec2
        piece: PieceOnBoard
    }
}

let cursor: Cursor

let time: number

type PieceOnBoard = {
    pieces: Pieces,
    xy: {
        x: AnimChannel,
        y: AnimChannel
    },
    sq?: Square
    sq_base: Square
}


let target_aligns_data: AlignsData[]

let pieces_on_board: PieceOnBoard[]
let model_aligns: Aligns[]
let model_mis_aligns: Aligns[]

type Aligns = {
    data: AlignsData
    piece: PieceOnBoard
    xy: {
        x: AnimChannel,
        y: AnimChannel
    },
    stick: Direction
}


function load_position(target: Board) {
    const random_square = () => Math.floor(Math.random() * 64)

    pieces_on_board = []

    let squares: Square[] = []

    for (let pieces of target.keys()) {

        let sq2 = random_square()
        while (squares.includes(sq2)) {
            sq2 = random_square()
        }

        squares.push(sq2)
        pieces_on_board.push({
            pieces,
            xy: {
                x: new AnimChannel(500),
                y: new AnimChannel(500)
            },
            sq_base: sq2
        })
    }
    target_aligns_data = board_aligns_data(target)
    model_aligns = target_aligns_data.map(data => {
        return {
            data,
            piece: pieces_on_board.find(_ => _.pieces === data.x)!,
            xy: { x: new AnimChannel(0), y: new AnimChannel(0) },
            stick: 0
        }
    })

    model_mis_aligns = []
}

export function _init() {

    let board = new Map<Pieces, Square>([
        ['r1', 50],
        ['r2', 10],
        ['b2', 10]
    ])
    load_position(board)

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

export function _update(delta: number) {

    update_aligns(delta)

    time += delta / 1000

    cursor.follow.x.followTo(drag.is_hovering[0])
    cursor.follow.y.followTo(drag.is_hovering[1])

    cursor.follow.x.update(delta / 1000)
    cursor.follow.y.update(delta / 1000)

    cursor.xy = vec2(cursor.follow.x.value, cursor.follow.y.value)

    if (cursor.drag) {
        if (drag.has_moved_after_last_down) {
            cursor.drag.piece.xy.x.followTo(cursor.xy.x - cursor.drag.decay.x)
            cursor.drag.piece.xy.y.followTo(cursor.xy.y - cursor.drag.decay.y)
        }
    }

    cursor.sq = pos_to_square(cursor.xy)

    if (drag.is_just_down) {
        const cursor_sq = cursor.sq
        if (cursor_sq !== undefined) {

            let piece = pieces_on_board.find(_ => _.sq === cursor_sq)
                if (piece) {
                    cursor.drag = {
                        decay: sub(cursor.xy, { x: piece.xy.x.value, y: piece.xy.y.value }),
                        piece
                    }
                }

        }
    }

    for (let piece of pieces_on_board) {
        update_piece(piece, delta)
    }

    for (let align of model_aligns) {
        update_align(align, delta)
    }
    for (let align of model_mis_aligns) {
        update_align(align, delta)
    }

    if (drag.is_up) {
        if (cursor.drag) {
            cursor.drag = undefined
        }
    }


}

function update_aligns(delta: number) {

    let board = build_board_from_pieces()

    let current_aligns = board_aligns_data(board)
    let target_aligns = target_aligns_data
    let model = model_aligns

    model.forEach(_ => _.stick = 0)

    for (let cu of current_aligns) {
        let tu = target_aligns.find(_ => _.x === cu.x && _.y === cu.y)
        let mu = model.find(_ => _.data.x === cu.x && _.data.y === cu.y)

        if (!mu) {
            continue
        }

        mu.stick = find_align_direction(cu, board)
    }

    let misaligns_data = current_aligns.filter(cu => !target_aligns_data.find(_ => _.x === cu.x && _.y === cu.y))
    let mis_model = model_mis_aligns

    for (let mcu of misaligns_data) {

        let e = mis_model.find(_ => _.data.x === mcu.x && _.data.y === mcu.y)
        if (!e) {

            mis_model.push({
                data: mcu,
                piece: pieces_on_board.find(_ => _.pieces === mcu.x)!,
                xy: {
                    x: new AnimChannel(0),
                    y: new AnimChannel(0),
                },
                stick: find_align_direction(mcu, board)
            })
        }
    }

    let mu_removes = mis_model.filter(mu =>
        !misaligns_data.find(_ => _.x === mu.data.x && _.y === mu.data.y)
    )


     model_mis_aligns = mis_model.filter(_ => !mu_removes.includes(_))

}

function update_piece(piece: PieceOnBoard, delta: number) {

    piece.sq = pos_to_square(vec2(piece.xy.x.value, piece.xy.y.value))

    let base_xy = square_to_pos(piece.sq_base)

    if (cursor.drag?.piece === piece) {

        if (drag.is_up) {

            if (piece.sq !== undefined) {
                piece.sq_base = piece.sq
            }
        }
    } else {
        piece.xy.x.springTo(base_xy.x, { stiffness: 600, damping: 17})
        piece.xy.y.springTo(base_xy.y, { stiffness: 600, damping: 17})
    }


    piece.xy.x.update(delta / 1000)
    piece.xy.y.update(delta / 1000)
}


function update_align(align: Aligns, delta: number) {

    if (align.stick === 0) {
        let sin = Math.sin(time * 0.5 * Math.PI * 2) * 80
        let cos = Math.cos(time * 0.5 * Math.PI * 2) * 80

        align.xy.x.followTo(cos, { speed: 1 - 0.001 })
        align.xy.y.followTo(sin, { speed: 1 - 0.001 })

    } else {
        let [stick_x, stick_y] = stick_direction[align.stick]
        align.xy.x.springTo(stick_x * 37)
        align.xy.y.springTo(stick_y * 37)
    }

    align.xy.x.update(delta / 1000)
    align.xy.y.update(delta / 1000)
}



export function _render() {

    cx.fillStyle = colors.darkblue
    cx.fillRect(0, 0, 1920, 1080)

    render_grid()

    for (let piece of pieces_on_board) {
        render_piece(piece)
    }
    render_cursor(cursor.xy.x, cursor.xy.y)


    render_debug()
}

function render_debug() {
    if (COLLISIONS) {
        hitbox_rect(grid_box)

        for (let box of grid_square_boxes.flat())
            hitbox_rect(box)

    }
}

function render_piece(piece: PieceOnBoard) {
    let x = piece.xy.x.value
    let y = piece.xy.y.value


    render_role(x, y, piece.pieces)

    for (let align of model_aligns) {
        let x = align.piece.xy.x.value
        let y = align.piece.xy.y.value
        x += align.xy.x.value
        y += align.xy.y.value
        render_aligns(x, y, align.data.y, align.stick)
    }


    for (let align of model_mis_aligns) {
        let x = align.piece.xy.x.value
        let y = align.piece.xy.y.value
        x += align.xy.x.value
        y += align.xy.y.value
        render_mis_aligns(x, y, align.data.y, align.stick)
    }
}


function render_mis_aligns(x: number, y: number, pieces: Pieces, stick: Direction) {
    cx.lineWidth = 4
    cx.strokeStyle = stick === 0 ? colors.red : colors.red
    cx.beginPath()
    cx.roundRect(x - 15, y - 15, 30, 30, 6)
    cx.stroke()
    cx.fill()


    if (pieces[0] === 'r') {
        cx.strokeStyle = vibrant.white
        cx.beginPath()
        cx.moveTo(x - 10, y)
        cx.lineTo(x + 10, y)
        cx.moveTo(x, y - 10)
        cx.lineTo(x, y + 10)
        cx.stroke()
    }

    if (pieces[0] === 'b') {
        cx.strokeStyle = vibrant.yellow
        cx.beginPath()
        cx.moveTo(x - 10, y - 10)
        cx.lineTo(x + 10, y + 10)
        cx.moveTo(x - 10, y + 10)
        cx.lineTo(x + 10, y - 10)
        cx.stroke()
    }
}



function render_aligns(x: number, y: number, pieces: Pieces, stick: Direction) {
    cx.lineWidth = 4
    cx.strokeStyle = stick === 0 ? colors.red : colors.green
    cx.beginPath()
    cx.roundRect(x - 15, y - 15, 30, 30, 6)
    cx.stroke()
    cx.fill()


    if (pieces[0] === 'r') {
        cx.strokeStyle = vibrant.white
        cx.beginPath()
        cx.moveTo(x - 10, y)
        cx.lineTo(x + 10, y)
        cx.moveTo(x, y - 10)
        cx.lineTo(x, y + 10)
        cx.stroke()
    }

    if (pieces[0] === 'b') {
        cx.strokeStyle = vibrant.yellow
        cx.beginPath()
        cx.moveTo(x - 10, y - 10)
        cx.lineTo(x + 10, y + 10)
        cx.moveTo(x - 10, y + 10)
        cx.lineTo(x + 10, y - 10)
        cx.stroke()
    }
}

function render_role(x: number, y: number, pieces: Pieces) {
    if (pieces[0] === 'b') {
        cx.lineWidth = 9
        cx.strokeStyle = vibrant.yellow
        cx.beginPath()
        cx.moveTo(x - 20, y - 20)
        cx.lineTo(x + 20, y + 20)
        cx.moveTo(x - 20, y + 20)
        cx.lineTo(x + 20, y - 20)
        cx.stroke()
    }
    if (pieces[0] === 'r') {
        cx.lineWidth = 9
        cx.strokeStyle = vibrant.white
        cx.beginPath()
        cx.moveTo(x - 25, y)
        cx.lineTo(x + 25, y)
        cx.moveTo(x, y - 25)
        cx.lineTo(x, y + 25)
        cx.stroke()
    }
}

function render_grid() {

    let x, y

    x = 300
    y = 60

    let w = 120
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



let set_next_scene: SceneName | undefined = undefined
export function next_scene() {
    let res =  set_next_scene
    if (res !== undefined){
        set_next_scene = undefined
        return res
    }
}

const stick_direction = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
]


function fill_grid_square_boxes(grid_box: Rect): Rect[][] {
    let boxes: Rect[][] = []
    for (let i = 0; i < 8; i++) {
        let a: Rect[] = []
        for (let j = 0; j < 8; j++) {

            a.push({
                xy: vec2(grid_box.xy.x + i * 120, grid_box.xy.y + j * 120),
                wh: vec2(120, 120)  
            })
        }
        boxes.push(a)
    }
    return boxes
}

function square_to_pos(sq: Square): Vec2 {
    let file = squareFile(sq)
    let rank = squareRank(sq)
    let ab = vec2((file / 8) * grid_box.wh.x, (rank / 8) * grid_box.wh.y)
    return add(add(ab, grid_box.xy), mulScalar(grid_box.wh, 1/ 16))
}

function pos_to_square(xy: Vec2): Square | undefined {

    let ab = sub(xy, grid_box.xy)

    let w = grid_box.wh.x

    let x = Math.floor(ab.x / w * 8)
    let y = Math.floor(ab.y / w * 8)

    if (x < 0 || x > 7 || y < 0 || y > 7) {
        return undefined
    }
    let file: File = x as File
    let rank: Rank = y as Rank

    return squareFromCoords(file, rank)
}

function build_board_from_pieces() {
    let res: Board = new Map<Pieces, Square>()
    for (let pieces of pieces_on_board) {
        if (pieces.sq) {
            res.set(pieces.pieces, pieces.sq)
        }
    }
    return res
}