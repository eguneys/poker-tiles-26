import { createMemo, createSelector, createSignal, ErrorBoundary, For, type JSX, lazy, Match, Show, Suspense, Switch  } from 'solid-js'
import { A, Route, Router, useLocation, useNavigate } from '@solidjs/router'
import { TheGameBoard } from './TheGameBoard';
import { type DifficultyTier, type PuzzleStats } from './state/types';
import { MorStoreProvider, useLeaderboards, usePuzzles } from './state';
import type { TimePeriod } from './state/Leaderboards';

const Legal = lazy(() => import("./Legal"));
const About = lazy(() => import("./About"));
const Contact = lazy(() => import("./Contact"));
const Learn = lazy(() => import("./Learn"));

export default function App() {
    return (<>
    
    <Router root={Layout}>
        <Route path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/legal" component={Legal}/>
        <Route path="/contact" component={Contact}/>
        <Route path="/learn" component={Learn}/>
    </Router>
    </>)
}


function Layout(props: { children?: JSX.Element }) {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false)

    return (<>
        <div class="min-h-screen flex flex-col">
            <Navbar isMobileMenuOpen={isMobileMenuOpen()} setIsMobileMenuOpen={setIsMobileMenuOpen}/>
            <main class="grow max-w-6xl mx-auto w-full px-4 py-8 lg:py-12"  onClick={() => isMobileMenuOpen() && setIsMobileMenuOpen(false)}>
                <MorStoreProvider>
                    {props.children}
                </MorStoreProvider>
            </main>
        </div>
    </>)
}


const Home = () => {

    const [puzzles, { set_shuffle, set_reveal, set_daily_steps, set_daily_tier, set_daily_fen, set_solved }] = usePuzzles()

    const daily_selected_tier = createMemo(() => puzzles.daily_selected_tier)
    const puzzle_set = createMemo(() => puzzles.saved_daily_puzzle_set)
    const puzzle = createMemo(() => puzzle_set()?.[puzzles.daily_selected_tier])
    const stats = createMemo(() => puzzles.stats)

    return (<>
        <div class="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Board */}
            <div class="lg:col-span-7 xl:col-span-8 flex justify-center">
                <div
                id="the-game-board"
                 class="relative w-full max-w-150 aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700">
                    <ErrorBoundary fallback={""}>
                        <Suspense>
                            <TheGameBoard fen={puzzle()?.fen} target={puzzle()?.base_fen} nb_steps={stats()?.nb_steps} set_update_steps={set_daily_steps} set_update_fen={set_daily_fen} set_update_solved={set_solved} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>



            {/* Right Column: Info & Controls */}
            <div class="lg:col-span-5 xl:col-span-4 space-y-6">

            {/* Difficulty Selector */}
            <div class="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {tiers.map((level) => (
                    <button
                        onClick={() => set_daily_tier(level as DifficultyTier)}
                        class={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${daily_selected_tier() === level
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {difficulty_texts[level]}
                    </button>
                ))}
            </div>



                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <ErrorBoundary fallback={FailedPuzzleInfoCard}>
                        <Suspense>
                            <PuzzleInfoCard stats={stats()} selected_tier={daily_selected_tier()} puzzle_id={puzzle()?.id??0} />
                            <ActionButtons on_shuffle={set_shuffle} on_reveal={set_reveal}/>
                        </Suspense>
                    </ErrorBoundary>
                </div>

                <StatsExtra />
                <div class="text-xs text-center text-slate-600 mt-8">
                    © 2026 Mor Chess 3. All rights reserved.
                    <br/>
                    <div class="flex justify-center gap-x-2">
                        <A href="legal#privacy" class="link">Privacy Policy</A>
                        •
                        <A href="legal#terms" class="link">Terms of Service</A>
                        •
                        <A href="contact" class="link">Contact Us</A>
                        •
                        <A href="https://buymeacoffee.com/eguneys" class="link">Support Us</A>
                        •
                        <A href="https://github.com/eguneys/morchess3" target="_blank" class="link">GitHub</A>
                    </div>
                    <br /> 
                    Designed with 💜.
                </div>
            </div>
        </div>
    </>)
}

const ActionButtons = (props: { on_reveal: () => void, on_shuffle: () => void }) => {
    return (<>
        <div class="grid grid-cols-2 gap-3">
            <button
            onClick={() => props.on_shuffle()}
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
            >
                Shuffle Board
            </button>
            <button 
            onClick={() => props.on_reveal()}
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 opacity-50">
                Reveal Solution
            </button>
        </div>
    </>)
}

const FailedPuzzleInfoCard = () => {
    return (<>
        <div class="flex items-center justify-between">
            <span class='text-red-500'>Failed Loading Daily Puzzle.</span>
            <button
            onClick={() => location.reload()}
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
            >
                Refresh Page
            </button>
        </div>
    </>)
}

const tiers: DifficultyTier[] = ['a', 'b', 'c']
const difficulty_texts = { a: 'Easy', b: 'Medium', c: 'Hard' }
const difficulty_colors = { a: 'bg-green-500/20 text-green-400', b: 'bg-yellow-500/20 text-yellow-400', c: 'bg-red-500/20 text-red-400' }

const PuzzleInfoCard = (props: { stats?: PuzzleStats, selected_tier: DifficultyTier, puzzle_id: number }) => {

    const selected_tier = createMemo(() => props.selected_tier)


    const difficulty_text = createMemo(() => difficulty_texts[selected_tier()])
    const difficulty_color = createMemo(() => difficulty_colors[selected_tier()])

    const [puzzles] = usePuzzles()


    const todays_date = createMemo(() => puzzles.today)
    //const date_locale_string = createMemo(() => todays_date()?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
    const date_utc_string = createMemo(() => {
        const d = todays_date();
        if (!d) return "";

        // Format using UTC components
        const utcFormatted = d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            timeZone: "UTC"
        });
        new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

        return `${utcFormatted} (UTC)`;
    });


    return (<>
            <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-1 bg-slate-800 text-xs font-bold uppercase tracking-wider text-indigo-400 rounded border border-slate-700">
                Daily Challenge • {date_utc_string()}
                 </span>
            <span class={`px-2 py-1 text-xs font-bold rounded ${difficulty_color()}`}>
                    {difficulty_text()}
                </span>
            </div>

            <h1 class="text-2xl font-bold text-white mb-2">Puzzle #{props.puzzle_id}</h1>
            <p class="text-slate-400 mb-6 leading-relaxed">
                Reconstruct the original configuration consistent with pieces' attack relationships.
            </p>

            <div class="flex items-center gap-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800 mb-6">
            <Switch fallback={<>
                <span class="font-semibold text-slate-400">
                    Distance Traveled:
                </span>
                <span class="font-bold text-xl text-slate-200">{props.stats?.nb_steps}</span>
            </>
            }>
                <Match when={props.stats?.nb_revealed}>{nb_revealed =>
                    <>
                        <span class="font-semibold text-slate-500">
                            Revealed Solution After:
                        </span>
                        <span class="font-bold text-xl text-slate-200">{nb_revealed()}</span>
                    </>
                }</Match>
                <Match when={props.stats?.nb_solved}>{nb_solved =>
                    <>
                        <span class="font-semibold text-slate-400">
                            Solved Solution After:
                        </span>
                        <span class="font-bold text-xl text-slate-200">{nb_solved()}</span>
                    </>
                }</Match>



            </Switch>
            </div>

        </>)
}

export type Navigation = 'home' | 'about' | 'legal' | 'learn'

const Navbar = (props: { isMobileMenuOpen: boolean, setIsMobileMenuOpen: (v: boolean) => void }) => {

    const dev = () => import.meta.env.DEV ? '.dev' : ''

    const navigate = useNavigate()

    const location = useLocation();

    const pathname = createMemo(() => {
        let res = location.pathname.split('/')[1]
        if (res === '') {
            return 'home'
        }
        return res
    });

    const isActive = createSelector(() => pathname())

    const active_color = (path: Navigation) => isActive(path) ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400'

    const active_link = (path: Navigation) => isActive(path) ? 'text-white' : ''

    const navigateAndClose = (path: string) => {
        navigate(path)
        props.setIsMobileMenuOpen(false)
    }

    return (<>
        <nav class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
            <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white font-bold font-serif">
                        <img class="w-9 h-9 rounded" alt="logo" src="/logo_big.png"></img>
                    </div>
                    <A href="/" class="text-xl font-bold tracking-tight text-white">Mor Chess 3 {dev()}</A>
                </div>
                <div class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                    <A href="/" class={`${active_link('home')} hover:text-indigo-400 transition-colors`}>Puzzles</A>
                    <A href="/learn" class={`${active_link('learn')} hover:text-indigo-400 transition-colors`}>Learn</A>
                    <A href="/about" class={`${active_link('about')} hover:text-indigo-400 transition-colors`}>About</A>
                </div>
                {/* Mobile Menu Button */}
                <button
                    class="md:hidden text-slate-300 hover:text-white p-2"
                    onClick={() => props.setIsMobileMenuOpen(!props.isMobileMenuOpen)}
                >
                    {props.isMobileMenuOpen ? (
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    ) : (
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    )}
                </button>
            </div>
                    {/* Mobile Menu Dropdown */}
            <Show when={props.isMobileMenuOpen}>
                <div class="md:hidden absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    <div class="flex flex-col p-4 space-y-2">
                        <button
                            onClick={() => navigateAndClose('/')}
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${active_color('home')}`}
                        >
                            Puzzles
                        </button>
                        <button
                            onClick={() => navigateAndClose('/learn')}
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${active_color('learn')}`}
                        >
                            Learn
                        </button>
                        <button
                            onClick={() => navigateAndClose('/about')}
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${active_color('about')}`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => navigateAndClose('legal')}
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${active_color('legal')}`}
                        >
                            Legal
                        </button>
                    </div>
                </div>
            </Show>

        </nav>
    </>)
}

const StatsExtra = () => {


    return (<>
        <ErrorBoundary fallback={<FailedLeaderboard />}>
            <Suspense fallback={<LoadingLeaderboard />}>
                <Leaderboard />
            </Suspense>
        </ErrorBoundary>
    </>)
}


const LoadingLeaderboard = () => {
    return (<>

            <div class="bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-sm overflow-hidden">
                {/* Header Section */}
                <div class="p-6 pb-0 flex flex-col gap-4 bg-slate-900 z-10 shadow-sm">
                    <div class="flex items-center justify-between mb-1">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Leaderboard
                        </h3>
                    </div>

                    {/* Level 1 Tabs: Time Period */}
                    <div class="flex bg-slate-950 p-1 rounded-lg">
                        {Time_Periods.map(p => (
                            <button
                                class={`capitalize flex-1 py-1.5 text-xs font-medium rounded transition-all ${'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Level 2 Tabs: Difficulty */}
                    <div class="flex border-b border-slate-800 pb-0 gap-1">
                        {Difficulty_Tiers.map(d => (
                            <button
                                class={`flex-1 text-xs font-semibold uppercase tracking-wider pb-2 transition-colors relative ${'text-slate-600 hover:text-slate-400'}`}
                            >
                                {difficulty_texts[d]}
                            </button>
                        ))}
                    </div>

                    {/* Header Row for columns */}
                    <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800 mt-2 px-4">
                        <span class="w-6 text-center">#</span>
                        <span class="flex-1 px-3">Player</span>
                        <span>Distance Traveled</span>
                    </div>
                </div>

                {/* Scrollable List */}
                <div class="flex items-center justify-center overflow-y-auto h-64 space-y-0.5">
                    <div class="flex items-center justify-between">
                        <span class='text-slate-500'>Loading Leaderboards...</span>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm py-2 px-4">
                    <div class="text-center font-bold text-indigo-400 text-xs">
                        Loading Leaderboards...
                    </div>
                </div>
        </div>
    </>)
}

const FailedLeaderboard = () => {
    return (<>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <span class='text-slate-600'>Leaderboards Not Available.</span>
                <button
                    onClick={() => location.reload()}
                    class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    </>)
}





const Time_Periods: TimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly']

const Difficulty_Tiers: DifficultyTier[] = ['a', 'b', 'c']

// --- Leaderboard Component ---

const Leaderboard = () => {
    const [period, set_period] = createSignal<TimePeriod>('daily')
    const [difficulty, set_difficulty] = createSignal<DifficultyTier>('b')

    const [board, { fetch_period, set_leaderboard_handle }] = useLeaderboards()

    const list = createMemo(() => board[period()][difficulty()].list)
    const user = createMemo(() => board[period()][difficulty()].you)

    const set_period_with_refetch = (period: TimePeriod) => {
        
        fetch_period(period)
        set_period(period)
    }

    const should_prompt_handle = () => { 
        let u = user() 
        if (u === undefined) {
            return false
        }
        return u.handle === null
    }
    const [inputHandle, setInputHandle] = createSignal('')
    const onSetHandle = set_leaderboard_handle

    return (
        <>

            <div class="bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-sm overflow-hidden">
                {/* Header Section */}
                <div class="p-6 pb-0 flex flex-col gap-4 bg-slate-900 z-10 shadow-sm">
                    <div class="flex items-center justify-between mb-1">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Leaderboard
                        </h3>
                    </div>

                    {/* Level 1 Tabs: Time Period */}
                    <div class="flex bg-slate-950 p-1 rounded-lg">
                        {Time_Periods.map(p => (
                            <button
                                onClick={() => set_period_with_refetch(p)}
                                class={`capitalize flex-1 py-1.5 text-xs font-medium rounded transition-all ${period() === p ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Level 2 Tabs: Difficulty */}
                    <div class="flex border-b border-slate-800 pb-0 gap-1">
                        {Difficulty_Tiers.map(d => (
                            <button
                                onClick={() => set_difficulty(d)}
                                class={`flex-1 text-xs font-semibold uppercase tracking-wider pb-2 transition-colors relative ${difficulty() === d ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                {difficulty_texts[d]}
                                {difficulty() === d && <span class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
                            </button>
                        ))}
                    </div>

                    {/* Header Row for columns */}
                    <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800 mt-2 px-4">
                        <span class="w-6 text-center">#</span>
                        <span class="flex-1 px-3">Player</span>
                        <span>Distance Traveled</span>
                    </div>
                </div>

                {/* Scrollable List */}
                <div class="overflow-y-auto h-64 space-y-0.5">
                    <For each={list()}>{entry =>
                        <div class="flex items-center justify-between text-sm py-2 px-4 hover:bg-slate-800/50 transition-colors">
                            <div class={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                entry.rank === 2 ? 'bg-slate-300/20 text-slate-300' :
                                    entry.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                                        'text-slate-500'
                                }`}>
                                {entry.rank}
                            </div>
                            <span class={`flex-1 px-3 font-medium truncate ${entry.rank <= 3 ? 'text-slate-200' : 'text-slate-400'}`}>
                                {entry.handle}
                            </span>
                            <span class="text-slate-500 font-mono text-xs">{entry.score.toLocaleString()}</span>
                        </div>
                    }</For>
                </div>

                {/* User Stats Footer - Sticky/Distinct */}
                <div class="bg-indigo-900/20 border-t border-indigo-500/30 z-20">
                    <Show when={user()} fallback={
                        <div class="flex items-center justify-between text-sm py-2 px-4">
                            <div class="text-center font-bold text-indigo-400 text-xs">
                                Solve a puzzle to enter these rankings.
                            </div>
                        </div>
                    }>{user =>
                        <Show when={should_prompt_handle()} fallback={
                            <div class="flex items-center justify-between text-sm py-2 px-4">
                                <div class="w-6 text-center font-bold text-indigo-400 text-xs">
                                    {user().rank}
                                </div>
                                <span class="flex-1 px-3 font-bold text-indigo-100 truncate">
                                    {user().handle}
                                </span>
                                <span class="text-indigo-300 font-mono text-xs font-bold">{user().score.toLocaleString()}</span>
                            </div>
                        }>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (inputHandle().trim().length >= 3) onSetHandle(inputHandle().trim());
                                }}
                                class="flex items-center p-2 gap-2"
                            >
                                {/* Tooltip Container */}
                                <div class="group relative flex items-center justify-center cursor-help">
                                    <div class="w-5 h-5 rounded-full border border-indigo-400/50 text-indigo-400 flex items-center justify-center text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
                                        ?
                                    </div>

                                    {/* Tooltip Body */}
                                    <div class="absolute bottom-full left-0 mb-3 w-48 bg-slate-900 border border-slate-700 text-slate-300 text-xs p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 transform translate-y-1 group-hover:translate-y-0">
                                        <p class="leading-relaxed">
                                            Enter a handle* to track your daily progress and compete on the global leaderboard.
                                            <br />
                                            <small>* Between 3-8 characters.</small>
                                        </p>
                                        {/* Arrow */}
                                        <div class="absolute -bottom-1 left-1.5 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={inputHandle()}
                                    onKeyUp={(e) => setInputHandle((e.target as HTMLInputElement).value)}
                                    placeholder="Enter handle to join..."
                                    minlength={3}
                                    maxlength={8}
                                    class="flex-1 bg-slate-900/50 border border-indigo-500/30 rounded px-3 py-1 text-sm text-indigo-100 placeholder-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={inputHandle().trim().length < 3}
                                    class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-colors"
                                >
                                    Join
                                </button>
                            </form>
                        </Show>


                        }</Show>
                </div>
            </div>
        </>
    );
};




export const __PuzzleFailed = () => {
    return (<>
        <div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div class="bg-red-500/90 text-white px-6 py-2 rounded-full shadow-lg animate-bounce font-bold">
                Incorrect Move
            </div>
        </div>
    </>)
}


export const __PuzzleSolved = () => {
    return (<>
        <div class="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
            <div class="bg-slate-900 border border-emerald-500/50 p-6 rounded-xl shadow-2xl text-center">
                <h2 class="text-3xl font-bold text-emerald-400 mb-2">Solved!</h2>
                <p class="text-slate-300 mb-4">You found the winning line.</p>
                <button
                    class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    Next Puzzle
                </button>
            </div>
        </div>

    </>)
}