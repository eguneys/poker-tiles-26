import { get_daily_id, getDailyPick } from "./daily_random"
import type { DailyPuzzleSet, FEN } from "./types"
import { emptyPosition } from "../thegame/aligns"
import { Chess } from "../thegame/chess/chess"
import { makeFen, parseFen } from "../thegame/chess/fen"
import type { Square } from "../thegame/chess/types"

const fens_db = () => fetch('/fens_tenk.txt').then(_ => _.text()).then(_ => _.split('\n'))

export class PuzzleUtils {

    static daily_puzzle_set = async (): Promise<DailyPuzzleSet> => {
        let fens = await fens_db()
        let a = getDailyPick(fens, "a")
        let b = getDailyPick(fens, "b")
        let c = getDailyPick(fens, "c")

        a = fen_remove_all_pawns(a)
        b = fen_remove_some_pawns(b)

        let nb_daily_id3 = get_daily_id() * 3

        return {
            a: { id: nb_daily_id3, fen: a},
            b: { id: nb_daily_id3 + 1, fen: b},
            c: { id: nb_daily_id3 + 2, fen: c},
        }
    }

    static todays_date = async (): Promise<Date> => {
        return new Date()
    }
}


function fen_remove_all_pawns(fen: FEN) {

    let pos = Chess.fromSetupUnchecked(parseFen(fen).unwrap())

    for (let sq of pos.board.pawn) {
        pos.board.take(sq)
    }

    return makeFen(pos.toSetup())
}

function fen_remove_some_pawns(fen: FEN) {
    let pos = Chess.fromSetupUnchecked(parseFen(fen).unwrap())

    let nb = pos.board.pawn.size()

    for (let sq of pos.board.pawn) {
        if (nb -- < 4) {
            break
        }
        pos.board.take(sq)
    }

    return makeFen(pos.toSetup())
}

export function shuffle_fen(fen: FEN) {

    let pos = Chess.fromSetupUnchecked(parseFen(fen).unwrap())

    let pos2 = emptyPosition()

    let squares: Square[] = []
    const random_square = () => Math.floor(Math.random() * 64)

    for (let sq of pos.board.occupied) {
        let piece = pos.board.get(sq)!

        let sq2 = random_square()
        while (squares.includes(sq2)) {
            sq2 = random_square()
        }

        squares.push(sq2)

        pos2.board.set(sq2, piece)
    }


    return makeFen(pos2.toSetup())
}