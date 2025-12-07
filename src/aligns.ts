import { attacks } from "./chess/attacks"
import { SquareSet } from "./chess/squareSet"
import type { Piece, Square } from "./chess/types"
import { squareFile, squareFromCoords, squareRank } from "./chess/util"

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


    if (squareFile(sqX) === squareFile(sqY)) {
        return sqX < sqY ? 3 : 7
    } else if (squareRank(sqX) === squareRank(sqY)) {
        return sqX < sqY ? 1 : 5
    }

    let dF = squareFile(sqX) - squareFile(sqY)
    let dR = squareRank(sqX) - squareRank(sqY)

    if (Math.abs(dF) === Math.abs(dR)) {
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

    if (dF === 2) {
        if (dR === 1) {
            return 11
        } else if (dR === -1) {
            return 12
        }
    } else if (dF === -2) {
        if (dR === 1) {
            return 13
        } else if (dR === -1) {
            return 14
        }
    } else if (dF === 1) {
        if (dR === 2) {
            return 15
        } else if (dR === -2) {
            return 16
        }
    } else if (dF === -1) {
        if (dR === 2) {
            return 17
        } else if (dR === -2) {
            return 18
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
        case 'P':  return { color: 'white', role: 'pawn' }
        case 'p':  return { color: 'black', role: 'pawn' }
        case 'b':  return { color: 'black', role: 'bishop' }
        case 'n':  return { color: 'black', role: 'knight' }
        case 'r':  return { color: 'black', role: 'rook' }
        case 'q':  return { color: 'black', role: 'queen' }
        case 'k':  return { color: 'black', role: 'king' }
    }
}


export type FEN = string
export function fen_to_board(fen: FEN) {
    fen = fen.split(' ')[0]

    let res: Board = new Map<Pieces, Square>()

    let nb_P = 0,
        nb_p = 0,
        nb_k = 0,
        nb_b = 0,
        nb_r = 0,
        nb_n = 0,
        nb_q = 0
    const parse_piece = (ch: string): Pieces | undefined => {
        switch (ch) {
            case 'P': return ('P' + (++nb_P)) as Pieces
            case 'p': return ('p' + (++nb_p)) as Pieces
            case 'B': case 'b':  return ('b' + (++nb_b)) as Pieces
            case 'N' : case 'n':  return ('n' + (++nb_n)) as Pieces
            case 'R' : case 'r':  return ('r' + (++nb_r)) as Pieces
            case 'Q': case 'q':  return ('q' + (++nb_q)) as Pieces
            case 'K': case 'k': return ('k' + (++nb_k)) as Pieces
        }
    }

    let rank = 7
    for (let line of fen.split('/')) {
        let file = 0
        for (let ch of line) {
            let p1 = parse_piece(ch)
            if (p1 !== undefined) {
                let sq = squareFromCoords(file, rank)
                if (sq !== undefined) {
                    res.set(p1, sq)
                }
                file += 1
            } else {
                file += parseInt(ch)
                continue
            }
        }
        rank -= 1
    }
    return res
}