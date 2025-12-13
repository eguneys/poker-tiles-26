import { A } from "@solidjs/router";

export default () => {
  return (
    <div class="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="text-center mb-12">
        <div class="inline-block p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-6 shadow-xl">
           <div class="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold font-serif shadow-inner">
                <img class="w-11 h-11 rounded-xl" alt="logo" src="/logo_big.png"></img>
            </div>
        </div>
        <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">About Mor Chess 3</h1>
        <p class="text-lg text-slate-400">Rebuild Chess Positions with Daily Puzzles.</p>
      </div>

      <div class="prose prose-invert prose-slate max-w-none">
        <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-indigo-500 rounded-full"></span>
                The Project
            </h2>
            <p class="text-slate-400 leading-relaxed mb-6">
                Mor Chess 3 is a minimalist puzzle game where you rearrange shuffled pieces back to their correct squares by analyzing who attacks whom. Sharpens your tactical vision with daily puzzles.
                Let's you compete with the community on time based challenges on public Leaderboards.
            </p>
            <p class="text-slate-400 leading-relaxed">
                Built with WebGL with the help of ChatGPT and Google AI Studio.
            </p>
            <p class="text-slate-400 leading-relaxed">
                Originally developed for JS13k Game Jam you can play at <A class="link external" target="_blank" href="https://js13kgames.com/2025/games/mor-chess#play"> here</A>
            </p>
            <p class="text-slate-400 leading-relaxed">
              The Mor Chess 3 project is open source, and its source code is available on <A href="https://github.com/eguneys/morchess3" target="_blank" class="link external">GitHub</A>.
            </p>
            <p class="text-slate-400 leading-relaxed">
              This project is a labor of love and runs without ads or premium features. If you enjoy the puzzles and want to help cover the server costs for the leaderboard, you can <A class="link" href="https://buymeacoffee.com/eguneys">support the developer here</A>.
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
             <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <h3 class="font-semibold text-white mb-2">Daily Puzzles</h3>
                <p class="text-sm text-slate-500">New puzzles every 24 hours to keep your mind sharp.</p>
             </div>
             <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <h3 class="font-semibold text-white mb-2">Leaderboards</h3>
                <p class="text-sm text-slate-500">Compete for best time against your friends with public leaderboards.</p>
             </div>
             <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <h3 class="font-semibold text-white mb-2">Learning Modules</h3>
                <p class="text-sm text-slate-500">Complete a special set of puzzles with increasing difficulty to help you get started.</p>
             </div>
        </div>
      </div>

      <div class="text-center mt-12 border-t border-slate-800 pt-8">
        <A href="/"
            class="group inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-all hover:ring-2 hover:ring-indigo-500/50 hover:ring-offset-2 hover:ring-offset-slate-950"
        >
            <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Puzzles
        </A>
         <p class="text-slate-600 text-sm mt-6">
            Version 1.0 &bull; Created by twitch.tv/gsoutz
        </p>
      </div>
    </div>
  );
};
