import { createEffect, createMemo, createSelector, createSignal, type JSX, lazy, Show  } from 'solid-js'
import { A, Route, Router, useLocation, useNavigate } from '@solidjs/router'
import { TheGameBoard } from './TheGameBoard';

const Legal = lazy(() => import("./Legal"));
const About = lazy(() => import("./About"));
const Contact = lazy(() => import("./Contact"));

export default function App() {
    return (<>
    
    <Router root={Layout}>
        <Route path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/legal" component={Legal}/>
        <Route path="/contact" component={Contact}/>
    </Router>
    </>)
}


function Layout(props: { children?: JSX.Element }) {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false)

    return (<>
        <div class="min-h-screen flex flex-col">
            <Navbar isMobileMenuOpen={isMobileMenuOpen()} setIsMobileMenuOpen={setIsMobileMenuOpen}/>
            <main class="grow max-w-6xl mx-auto w-full px-4 py-8 lg:py-12"  onClick={() => isMobileMenuOpen() && setIsMobileMenuOpen(false)}>
                {props.children}
            </main>
        </div>
    </>)
}


const Home = () => {
    return (<>
        <div class="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Board */}
            <div class="lg:col-span-7 xl:col-span-8 flex justify-center">
                <div
                id="the-game-board"
                 class="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700">
                    <TheGameBoard/>
                </div>
            </div>

            {/* Right Column: Info & Controls */}
            <div class="lg:col-span-5 xl:col-span-4 space-y-6">

                {/* Puzzle Info Card */}
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                        <span class="px-2 py-1 bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 rounded">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <span class={`px-2 py-1 text-xs font-bold rounded ${'bg-green-500/20 text-green-400'}`}>
                            {'Easy'}
                        </span>
                    </div>

                    <h1 class="text-2xl font-bold text-white mb-2">{'puzzle.title'}</h1>
                    <p class="text-slate-400 mb-6 leading-relaxed">
                        {'puzzle.description'}
                    </p>

                    <div class="flex items-center gap-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800 mb-6">
                        <div class={`w-3 h-3 rounded-full ${'bg-slate-600 border border-slate-400'}`}></div>
                        <span class="font-semibold text-slate-200">
                            {"White to Move"}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
                        >
                            Reset Board
                        </button>
                        <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 opacity-50 cursor-not-allowed">
                            Hint
                        </button>
                    </div>
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
                        <A href="https://github.com/eguneys/poker-tiles-26" target="_blank" class="link">GitHub</A>
                    </div>
                    <br /> 
                    Designed with 💜.
                </div>
            </div>
        </div>
    </>)
}

export type Navigation = 'home' | 'about' | 'legal'

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

    const home_color = createMemo(() => active_color('home'))
    const about_color = createMemo(() =>active_color('about'))
    const legal_color = createMemo(() =>active_color('legal'))

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
                    <A href="/" class={`${active_link('home')} hover:text-indigo-400 transition-colors`}>Daily Puzzle</A>
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
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${home_color()}`}
                        >
                            Daily Puzzle
                        </button>
                        <button
                            onClick={() => navigateAndClose('/about')}
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${about_color()}`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => navigateAndClose('legal')}
                            class={`text-left px-4 py-3 rounded-lg text-sm font-medium ${legal_color()}`}
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
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Your Streak</h3>
            <div class="flex items-end gap-2">
                <span class="text-4xl font-bold text-white">12</span>
                <span class="text-sm text-slate-500 mb-1">days</span>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div class="bg-indigo-500 h-full w-3/4 rounded-full"></div>
            </div>
        </div>
    </>)
}


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