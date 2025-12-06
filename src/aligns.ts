import { attacks } from "./chess/attacks"
import { SquareSet } from "./chess/squareSet"
import type { Piece, Square } from "./chess/types"
import { squareFile, squareRank } from "./chess/util"

export type Role = 'P' | 'p' | 'b' | 'k' | 'n' | 'r' | 'q'
export type Count = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type Pieces = `${Role}${Count}`


export type Board = Map<Pieces, Square>



export type AlignsData = {
    x: Pieces,
    y: Pieces
}

export type Direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18

export function find_align_direction(cu: AlignsData, board: Board): Direction {

    let {x, y} = cu

    let sqX = board.get(x)!
    let sqY = board.get(y)!


    if (x[0] === 'r') {
        if (squareFile(sqX) === squareFile(sqY)) {
            return sqX < sqY ? 3 : 7
        } else {
            return sqX < sqY ? 1 : 5
        }
    }
    if (x[0] === 'b') {
        let dF = squareFile(sqX) - squareFile(sqY)
        let dR = squareRank(sqX) - squareRank(sqY)

        if (dF < 0) {
            if (dR < 0) {
                return 2
            } else {
                return 8
            }
        } else {
            if (dR < 0) {
                return 4
            } else {
                return 6
            }
        }
    }

    return 0

}

export function board_aligns_data(board: Board): AlignsData[] {
    let occupied = board_occupied(board)
    let res: AlignsData[] = []
    for (let [x, sq] of board.entries()) {
        let aa = attacks(parse_pieces(x)!, sq, occupied)

        aa = aa.intersect(occupied)


        for (let a of aa) {
            let [y,] = [...board.entries()].find(_ => _[1] === a)!

            res.push({
                x,
                y
            })
        }
    }
    return res
}

export function board_occupied(board: Board) {
    let res = SquareSet.empty()

    for (let sq of board.values()) {
        res = res.set(sq, true)
    }
    return res
}

function parse_pieces(pieces: Pieces): Piece | undefined {
    switch (pieces[0]) {
        case 'P':  return { color: 'black', role: 'pawn' }
        case 'p':  return { color: 'white', role: 'pawn' }
        case 'b':  return { color: 'white', role: 'bishop' }
        case 'n':  return { color: 'white', role: 'knight' }
        case 'r':  return { color: 'white', role: 'rook' }
        case 'q':  return { color: 'white', role: 'queen' }
        case 'k':  return { color: 'white', role: 'king' }
    }
}