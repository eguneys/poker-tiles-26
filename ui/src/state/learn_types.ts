import type { JSX } from "solid-js"
import { Paths } from "../icons_paths"

export type ModuleId = string
export type ModulePuzzleId = string

export type ModulePuzzle = {
    id: ModulePuzzleId
    title: string
    description: string
    initial_fen: string
    base_fen: string
}

export type Module = {
    id: ModuleId
    icon: () => JSX.Element
    title: string
    description: string
    puzzles: ModulePuzzle[]
}


export const The_BasicsI: ModulePuzzle[] = [
    { 
        id: 'empty', 
        title: '8x8 Board', 
        description: 'The game is played on an 8x8 board. There are no pieces to arrange yet. Click the board to activate next level.',
        base_fen: '', 
        initial_fen: ''
    },
    { 
        id: 'thekings', 
        title: '2 Kings', 
        description: 'There are 2 kings on the board. The small red icons meanining they are attacking each other. Because a king can move to all adjacent squares it is on. Separate them to get rid of red icons.', 
        base_fen: '6k1/8/8/8/8/8/8/2K5 w - - 0 1', 
        initial_fen: '8/8/8/4k3/3K4/8/8/8 w - - 0 1'
    },
    { 
        id: 'theknight', 
        title: 'Knight attacks in L Shape', 
        description: 'L shape is a Knight because knight attacks in L shape in all directions. The small red icons means it is attacking both of the kings. Separate them to get rid of red icons.', 
        base_fen: '7k/8/8/8/3K4/8/8/6n1 w - - 0 1', 
        initial_fen: '8/6k1/8/5n2/3K4/8/8/8 w - - 0 1'
    },
    { 
        id: 'thebishop', 
        title: 'Bishop attacks Diagonally', 
        description: 'X shape is a Bishop because bishop attacks diagonally. The small red icons on the Bishop shows which pieces the Bishop attacks. Separate all of them so no piece attacks any other piece.', 
        base_fen: '8/6k1/8/8/8/6N1/1K6/3B4 w - - 0 1', 
        initial_fen: '8/6k1/8/4B3/8/6N1/1K6/8 w - - 0 1'
    },
    { 
        id: 'therook', 
        title: 'Rook attacks in Straight directions', 
        description: '+ shape is a Rook because rook attacks in straight directions. The small red icons on the Rook shows which pieces Rook attacks. Separate all of them so no piece attacks any other piece.', 
        base_fen: '5k2/8/1N6/8/8/3B4/7R/K7 w - - 0 1', 
        initial_fen: '3k4/8/8/N2R3B/8/8/3K4/8 w - - 0 1'
    },
    { 
        id: 'thequeen', 
        title: 'Queen attacks like a bishop and a rook', 
        description: '* shape is a Queen because queen attacks like a bishop and a rook. The small red icons on the Queen shows which pieces Queen attacks. Separate all of them so no piece attacks any other piece.', 
        base_fen: '3k4/8/8/R7/6Q1/8/3K4/8 w - - 0 1', 
        initial_fen: '3k4/8/8/3Q4/8/8/R7/3K4 w - - 0 1'
    },
    { 
        id: 'thepawn', 
        title: 'Pawns attack 1 square diagonnaly forward', 
        description: 'Y shape is a Pawn because pawn attacks diagonally forward by 1 square. The small red icons on the Pawn shows it is attacking the Knight. Separate all of them so they don\'t attack each other.', 
        base_fen: '8/8/8/8/2N5/6P1/8/8 w - - 0 1', 
        initial_fen: '8/8/8/8/2N5/3P4/8/8 w - - 0 1'
    },
    { 
        id: 'thepawn2', 
        title: 'Black Pawns attack 1 square diagonnaly backward', 
        description: 'Upside Y shape is a Black Pawn because black pawn attacks diagonally backward by 1 square. The small red icons on the Pawn shows it is attacking the Knight. Separate all of them so they don\'t attack each other.', 
        base_fen: '8/8/8/8/2N5/6p1/8/8 w - - 0 1', 
        initial_fen: '8/8/8/3p4/2N5/8/8/8 w - - 0 1'
    },
]

const The_BasicsII: ModulePuzzle[] = [
    { 
        id: 'empty', 
        title: '8x8 Board', 
        description: 'The game is played on an 8x8 board. There are no pieces to arrange yet. Click the board to activate next level.',
        base_fen: '', 
        initial_fen: ''
    },
]

const King_Puzzles: ModulePuzzle[] = [
    { 
        id: 'empty', 
        title: '8x8 Board', 
        description: 'The game is played on an 8x8 board. There are no pieces to arrange yet. Click the board to activate next level.',
        base_fen: '', 
        initial_fen: ''
    },
]

export const Learn_Modules: Module[] = [
    {
        id: "basicsI",
        icon: Paths.king,
        title: "The Basics I",
        description: "What is Chess? What are all these symbols?",
        puzzles: The_BasicsI
    },
    {
        id: "basicsII",
        icon: Paths.king,
        title: "The Basics II",
        description: "All about the pieces attacking each other.",
        puzzles: The_BasicsII
    },
    {
        id: "rook",
        icon: Paths.rook,
        title: "The Rook",
        description: "Puzzles involving the Rook",
        puzzles: King_Puzzles
    },
    {
        id: "bishop",
        icon: Paths.bishop,
        title: "The Bishop",
        description: "Puzzles involving the Bishop",
        puzzles: King_Puzzles
    },
    {
        id: "knight",
        icon: Paths.knight,
        title: "The Knight",
        description: "Puzzles involving the Knight",
        puzzles: King_Puzzles
    },
    {
        id: "pawn",
        icon: Paths.pawn,
        title: "The Pawns",
        description: "Puzzles involving the Pawns",
        puzzles: King_Puzzles
    },
    {
        id: "queen",
        icon: Paths.queen,
        title: "The Queen",
        description: "Puzzles involving the Queen",
        puzzles: King_Puzzles
    },
    {
        id: "queen2",
        icon: Paths.queen,
        title: "Remix I",
        description: "Special mix of curated puzzles",
        puzzles: King_Puzzles
    },
    {
        id: "queen3",
        icon: Paths.queen,
        title: "Remix II",
        description: "Special mix of curated puzzles more",
        puzzles: King_Puzzles
    },
    {
        id: "queen3",
        icon: Paths.queen,
        title: "Remix III",
        description: "Special mix of curated puzzles even more",
        puzzles: King_Puzzles
    },
]
