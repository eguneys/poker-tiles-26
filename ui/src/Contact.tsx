import { A } from "@solidjs/router";
import { createMemo, createSignal } from "solid-js";

export default () => {
  return (
    <div class="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="prose prose-invert prose-slate max-w-none">
        <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-indigo-500 rounded-full"></span>
                Contact Us
            </h2>
            <p class="text-slate-400 leading-relaxed mb-6">
                You can contact us at <Spoiler placeholder="click to reveal email" text="iplaythefrench@gmail.com"/>
            </p>
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
        </div>
      </div>
    </div>
  );
};


function Spoiler(props: { placeholder: string, text: string }) {

    let [hide, set_hide] = createSignal(true)
    const hidden_text = createMemo(() => hide() ? props.placeholder : props.text)

    return (<>
        <span onClick={() => set_hide(false)} class='spoiler' classList={{ hide: hide() }}>{hidden_text()}</span>
    </>)
}