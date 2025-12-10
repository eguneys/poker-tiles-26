
export type FEN = string

export type Puzzle = {
    fen: FEN
}

export type DifficultyTier = 'a' | 'b' | 'c'

export type DailyPuzzleSet = Record<DifficultyTier, Puzzle>


export type PuzzleStats = {
    nb_steps: number
}