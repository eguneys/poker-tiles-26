import type { SceneName } from "./main"
import { batch, drag } from "./webgl/canvas"
import { add, mulScalar, sub, vec2, type Vec2 } from "./math/vec2"
import { AnimChannel } from "./anim"
//import { hitbox_rect } from "./simulation"
import { colors, vibrant } from './colors_in_gl'
import type { Rect } from "./math/rect"
import type { Square } from "./chess/types"
import { squareFile, squareFromCoords, squareRank } from "./chess/util"
import { board_aligns_data, fen_to_board, find_align_direction, type AlignsData, type Board, type Direction, type Pieces } from "./aligns"

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

    load_position(fen_to_board('4k3/4b3/5pp1/3KP2p/1p5P/4B1P1/1P6/8 w - - 1 44'))
    load_position(fen_to_board('4rk2/3q1p2/2pp1Ppp/p1p5/2P2bN1/1P2Q3/P4PPP/4RK2 w - - 2 28'))
    //load_position(fen_to_board('r6K/8/8/8/8/8/8/8 w - - 0 1'))
    //load_position(fen_to_board('8/8/8/3p4/3K4/4P3/8/8 w - - 0 1'))
    //load_position(fen_to_board('8/8/8/8/3K4/5N2/8/8 w - - 0 1'))

    time = 0
    cursor = {
        xy: vec2(0, 0),
        wh: { x: 40, y: 40 },
        follow: {
            x: new AnimChannel().swayTo({ amplitude: -8, frequency: 13, bias: 0 }),
            y: new AnimChannel().swayTo({ amplitude: -8, frequency: 13, bias: 0 }),
        }
    }
}

export function _update(delta: number) {

    update_aligns(delta)

    time += delta / 1000

    cursor.follow.x.followTo(drag.is_hovering[0], { speed: 1 - 1e-8 })
    cursor.follow.y.followTo(drag.is_hovering[1], { speed: 1 - 1e-8 })

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
                    piece.xy.x.springTo(piece.xy.x.value -10, { stiffness: 800, damping: 10 })
                    piece.xy.y.springTo(piece.xy.y.value -15, { stiffness: 800, damping: 10 })
                    cursor.drag = {
                        decay: sub(cursor.xy, { x: piece.xy.x.value - 10, y: piece.xy.y.value - 15 }),
                        piece
                    }
                    cursor.follow.x.swayEnabled = false
                    cursor.follow.y.swayEnabled = false
                }

        }
    }

    if (drag.is_up) {
        cursor.follow.x.swayEnabled = true
        cursor.follow.y.swayEnabled = true
    }

    for (let piece of pieces_on_board) {
        update_piece(piece, delta)
    }

    for (let align of model_aligns) {
        let nb = model_aligns.filter(_ => _.stick === 0).indexOf(align)
        update_align(align, nb, delta)
    }
    for (let align of model_mis_aligns) {
        update_align(align, 0, delta)
    }

    if (drag.is_up) {
        if (cursor.drag) {
            cursor.drag = undefined
        }
    }


}

function update_aligns(_delta: number) {

    let board = build_board_from_pieces()

    let current_aligns = board_aligns_data(board)
    //let target_aligns = target_aligns_data
    let model = model_aligns

    model.forEach(_ => _.stick = 0)

    for (let cu of current_aligns) {
        //let tu = target_aligns.find(_ => _.x === cu.x && _.y === cu.y)
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
        let stick = find_align_direction(mcu, board)

        if (e) {
            e.stick = stick
        }

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


function update_align(align: Aligns, nb: number, delta: number) {

    if (align.stick === 0) {
        let sin = Math.sin(time * 0.5 * Math.PI * 2 + nb * Math.PI * 0.25) * 80
        let cos = Math.cos(time * 0.5 * Math.PI * 2 + nb * Math.PI * 0.25) * 80

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

    batch.beginFrame()

    batch.fillRect(1920/2, 1080/2, 1920, 1080, colors.darkblue)

    render_grid()

    for (let piece of pieces_on_board) {
        render_piece(piece)
    }

    render_cursor(cursor.xy.x, cursor.xy.y)

    render_debug()

    batch.endFrame()
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
    let thick = 1
    let color = stick === 0 ? colors.red : colors.red
    batch.fillRoundRect(x, y, 46, 46, 6, colors.darkblue)
    batch.strokeRoundRect(x, y, 46, 46, 6, thick, color)


    render_mini_role(x, y, pieces)
}



function render_aligns(x: number, y: number, pieces: Pieces, stick: Direction) {
    let thick = 1
    let color =  stick === 0 ? colors.red : colors.green

    batch.fillRoundRect(x, y, 46, 46, 6, colors.darkblue)
    batch.strokeRoundRect(x, y, 46, 46, 6, thick, color)

    render_mini_role(x, y, pieces)
}

const yellow_colors = [vibrant.yellow, vibrant.white, vibrant.blue, vibrant.pink, vibrant.green, vibrant.light, vibrant.black,  vibrant.purple, vibrant.darkblue]

function render_mini_role(x: number, y: number, pieces: Pieces) {

    let color = yellow_colors[parseInt(pieces[1]) - 1]
    let thick = 4

    if (pieces[0] === 'r') {
        batch.strokeLine(x - 10, y, x + 10, y, thick, color)
        batch.strokeLine(x, y - 10, x, y + 10, thick, color)
    }

    if (pieces[0] === 'b') {
        batch.strokeLine(x - 8, y - 8, x + 8, y + 8, thick, color)
        batch.strokeLine(x - 8, y + 8, x + 8, y - 8, thick, color)
    }
    if (pieces[0] === 'P') {
        batch.strokeLine(x - 8, y - 8, x, y, thick, color)
        batch.strokeLine(x + 8, y - 8, x, y, thick, color)
        batch.strokeLine(x, y, x, y + 4, thick, color)
    }
    if (pieces[0] === 'p') {
        batch.strokeLine(x - 8, y + 8, x, y, thick, color)
        batch.strokeLine(x + 8, y + 8, x, y, thick, color)
        batch.strokeLine(x, y, x, y - 4, thick, color)
    }
    if (pieces[0] === 'k') {
        batch.strokeRoundRect(x, y, 20, 20, 4, thick, color)
    }

    if (pieces[0] === 'n') {
        batch.strokeLine(x - 4, y - 8, x - 4, y + 8, thick, color)
        batch.strokeLine(x - 4, y + 8, x + 4, y + 8, thick, color)
    }
    if (pieces[0] === 'q') {
        batch.strokeLine(x - 10, y, x + 10, y, thick, color)
        batch.strokeLine(x, y - 10, x, y + 10, thick, color)
        batch.strokeLine(x - 8, y - 8, x + 8, y + 8, thick, color)
        batch.strokeLine(x - 8, y + 8, x + 8, y - 8, thick, color)
    }

}

function render_role(x: number, y: number, pieces: Pieces) {

    let color = yellow_colors[parseInt(pieces[1]) - 1]
    let thick = 9

    if (pieces[0] === 'b') {
        batch.strokeLine(x - 20, y - 20, x + 20, y + 20, thick, color)
        batch.strokeLine(x - 20, y + 20, x + 20, y - 20, thick, color)
    }
    if (pieces[0] === 'r') {
        batch.strokeLine(x - 25, y, x + 25, y, thick, color)
        batch.strokeLine(x, y - 25, x, y + 25, thick, color)
    }
    if (pieces[0] === 'P') {
        batch.strokeLine(x - 20, y - 20, x, y, thick, color)
        batch.strokeLine(x + 20, y - 20, x, y, thick, color)
        batch.strokeLine(x, y, x, y + 10, thick, color)
    }
    if (pieces[0] === 'p') {
        batch.strokeLine(x - 20, y + 20, x, y, thick, color)
        batch.strokeLine(x + 20, y + 20, x, y, thick, color)
        batch.strokeLine(x, y, x, y - 10, thick, color)
    }
    if (pieces[0] === 'k') {
        batch.strokeRoundRect(x, y, 64, 64, 10, thick, color)
    }
    if (pieces[0] === 'n') {
        batch.strokeLine(x - 10, y - 20, x - 10, y + 20, thick, color)
        batch.strokeLine(x - 10, y + 20, x + 10, y + 20, thick, color)
    }
    if (pieces[0] === 'q') {
        batch.strokeLine(x - 20, y - 20, x + 20, y + 20, thick, color)
        batch.strokeLine(x - 20, y + 20, x + 20, y - 20, thick, color)
        batch.strokeLine(x - 22, y, x + 22, y, thick, color)
        batch.strokeLine(x, y - 22, x, y + 22, thick, color)
    }
}

function render_grid() {

    let x, y

    x = 300
    y = 60

    let w = 120
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 0) {
                batch.strokeRoundRect(x + i * w + w/ 2, y + j * w + w/ 2, w + 16, w + 16, 16, 3, colors.pink)
            } else {
                batch.strokeRoundRect(x + i * w + w / 2, y + j * w + w / 2, w + 32, w + 32, 16, 3, colors.blue)
            }
        }
    }
}


function render_cursor(x: number, y: number) {
    batch.strokeLine(x + 40, y + 3, x, y, 16, colors.black)
    batch.strokeLine(x, y, x + 3, y + 40, 16, colors.black)
}


export function hitbox_rect(box: Rect) {
    let x = box.xy.x
    let y = box.xy.y
    let w = box.wh.x
    let h = box.wh.y

    batch.strokeRect(x + w / 2, y + h / 2, w, h, 7, colors.red)
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
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [0, 0],

    [0, 0],
    [-1, 0.6], // 11
    [-1, -0.6],
    [1, 0.6],
    [1, -0.6],
    [-0.6, 1],
    [-0.6, -1],
    [0.6, 1],
    [0.6, -1]
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
    let rank = 7 - squareRank(sq)
    let ab = vec2((file / 8) * grid_box.wh.x, (rank / 8) * grid_box.wh.y)
    let res = add(add(ab, grid_box.xy), mulScalar(grid_box.wh, 1 / 16))

    return res
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
    let rank: Rank = 7 - y as Rank

    return squareFromCoords(file, rank)
}

function build_board_from_pieces() {
    let res: Board = new Map<Pieces, Square>()
    for (let pieces of pieces_on_board) {
        if (pieces.sq !== undefined) {
            res.set(pieces.pieces, pieces.sq)
        }
    }
    return res
}