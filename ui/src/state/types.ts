
export type FEN = string

export type Puzzle = {
    id: number
    fen: FEN
}

export type DifficultyTier = 'a' | 'b' | 'c'

export type DailyPuzzleSet = Record<DifficultyTier, Puzzle>


export type PuzzleStats = {
    nb_steps: number
    nb_revealed?: number
    nb_solved?: number
}