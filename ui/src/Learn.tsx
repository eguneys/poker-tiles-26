import { createMemo, Show } from "solid-js";
import { TheGameBoard } from "./TheGameBoard";
import { useLearn } from "./state";
import type { Module, ModuleId } from "./state/learn_types";




export default function Learn() {

    let [learn, { set_active_module_id }] = useLearn()

    const active_module = createMemo(() => learn.active_module)


    return (<>
        <Show when={active_module()} fallback={<><Dashboard set_module={set_active_module_id} /></>}>{module =>
            <Level on_back={() => set_active_module_id(null)} module={module()} />
        }</Show>
    </>)

}

function Dashboard(props: { set_module: (_: ModuleId) => void }) {

    let [learn] = useLearn()

    const all_modules = createMemo(() => learn.modules)

    const module_nb_puzzles = (id: ModuleId) => all_modules().find(_ => _.id === id)?.puzzles.length ?? 0
    const module_nb_solved = (id: ModuleId) => learn.module_progressions.find(_ => _.id === id)?.nb_solved ?? 0
    const module_nb_solved_percent = (id: ModuleId) => {
        let res = Math.floor(module_nb_solved(id) / module_nb_puzzles(id) * 100)
        return res < 10 ? 'w-5' : res < 25 ? 'w-20' : res < 40 ? 'w-30' : res < 70 ? 'w-50' : res < 90 ? 'w-80' : 'w-100'
    }
    const module_nb_solved_percent_group_w2 = (id: ModuleId) => {
        let res = Math.floor(module_nb_solved(id) / module_nb_puzzles(id) * 100)
        return res < 10 ? 'group-hover:w-7' : res < 25 ? 'group-hover:w-22' : res < 40 ? 'group-hover:w-32' : res < 70 ? 'group-hover:w-52' : res < 90 ? 'group-hover:w-82' : 'group-hover:w-100'
    }



    const module_is_completed = (id: ModuleId) => module_nb_solved(id) === module_nb_puzzles(id)
    
    // Dashboard View
    return (
        <div class="max-w-6xl mx-auto w-full px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-white mb-4">Mor Chess 3 Learning Modules</h1>
                <p class="text-slate-400 max-w-2xl mx-auto">Learn Mor Chess 3 through our curated progression system.</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {all_modules().map((module) => (
                    <button
                        onClick={() => props.set_module(module.id)}
                        class={`group flex flex-col text-left bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all duration-300 relative overflow-hidden cursor-pointer ` +
                            (module_is_completed(module.id) ? 'hover:border-emerald-500/50 opacity-75 hover:opacity-100' : 'hover:border-indigo-500/50 hover:bg-slate-800/80')
                        }
                    >


                        {/* Completed Badge */}
                        <Show when={module_is_completed(module.id)}>
                            <div class="absolute top-0 left-0 bg-emerald-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-br-lg shadow-lg z-10">
                                COMPLETED
                            </div>
                        </Show>



                        <div class={`absolute top-0 right-0 p-4 opacity-10  ${module_is_completed(module.id) ? 'group-hover:opacity-20 text-emerald-500' : 'group-hover:opacity-20 transition-opacity'}`}>
                            <svg class={`w-24 h-24 ${module_is_completed(module.id) ? 'text-emerald-500' :'text-indigo-500'}`} fill="none" viewBox="0 0 50 50" stroke="currentColor">
                                {module.icon()}
                            </svg>
                        </div>

                        <div class={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${module_is_completed(module.id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 50 50" stroke="currentColor">
                                {module.icon()}
                            </svg>
                        </div>

                        <h3 class={`text-xl font-bold mb-2 ${module_is_completed(module.id) ? 'text-emerald-50' : 'text-white'}`}>{module.title}</h3>
                        <p class="text-sm text-slate-400 mb-6 line-clamp-2">{module.description}</p>

                        <div class="mt-auto w-full">
                            <div class="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                <span>Progress</span>
                                <span> {module_nb_solved(module.id)} / {module.puzzles.length}</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div class={`${module_nb_solved_percent(module.id)} h-full rounded-full transition-all duration-700 ${module_is_completed(module.id) ? 'w-full bg-emerald-500' : `bg-indigo-500 ${module_nb_solved_percent_group_w2(module.id)}`}`}></div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

}

function Level(props: { module: Module, on_back: () => void }) {

    let [learn,{ on_next, on_reset, set_solved, set_fen, set_steps }] = useLearn()

    const disabled_next = createMemo(() => learn.can_next ? 'cursor-pointer': 'cursor-not-allowed opacity-50')
    const disabled_reset = createMemo(() => learn.can_reset ? 'cursor-pointer': 'cursor-not-allowed opacity-50')

    const puzzle_fen = createMemo(() => learn.puzzle!.fen)
    let stats = createMemo(() => learn.puzzle!.stats)

    let puzzle = createMemo(() => learn.module_puzzle!)

    const puzzle_level_no = createMemo(() => props.module.puzzles.indexOf(puzzle()) + 1)

    return (
        <div class="max-w-6xl mx-auto w-full px-4 py-6 lg:py-8 animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div class="mb-6 flex items-center justify-between">
                <button
                    onClick={() => props.on_back()}
                    class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Modules
                </button>
                <div class="text-center">
                    <h2 class="text-lg font-bold text-white">{props.module.title}</h2>
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Level {puzzle_level_no()} / {props.module.puzzles.length}</p>
                </div>
                <div class="w-24"></div> {/* Spacer for center alignment */}
            </div>

            <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div class="lg:col-span-7 xl:col-span-8 flex justify-center">
                    <div
                        id="the-game-board"
                        class="relative w-full max-w-140 aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700">
                        <TheGameBoard fen={puzzle_fen()} target={puzzle().base_fen} nb_steps={stats().nb_steps} set_update_steps={set_steps} set_update_fen={set_fen} set_update_solved={set_solved} />
                    </div>
                </div>



                <div class="lg:col-span-5 xl:col-span-4 space-y-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 50 50" stroke="currentColor">
                                    {props.module.icon()}
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-white">{puzzle().title}</h1>
                                <span class="text-xs text-slate-500 font-mono">ID: {puzzle().id}</span>
                            </div>
                        </div>

                        <p class="text-slate-400 mb-6 leading-relaxed border-l-2 border-indigo-500 pl-4">
                            {puzzle().description}
                        </p>

                        <div class="flex items-center gap-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800 mb-6">
                            <Show when={stats().nb_solved !== undefined} fallback={
                                <span class="font-semibold text-slate-400"></span>
                            }>
                                <Show when={learn.is_complete} fallback={
                                    <span class="font-semibold text-emerald-400">You Passed Level!</span>
                                }>
                                    <span class="font-semibold text-emerald-500">You Completed the Module!</span>
                                </Show>
                            </Show>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <button
                                onClick={on_reset}
                                class={`px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 ${disabled_reset()}`}
                            >
                                Reset Level
                            </button>
                            <Show when={learn.is_complete} fallback={
                                <button
                                    onClick={on_next}
                                    class={`px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 ${disabled_next()}`}>
                                    Next Level
                                </button>
                            }>


                                <button
                                    onClick={props.on_back}
                                    class={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700`}>
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                        Back to Modules
                                </button>
                            </Show>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}