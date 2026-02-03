export function Topbar() {
  return `
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-sm text-slate-400">Welcome back</p>
        <h1 class="text-2xl font-semibold text-slate-100">Smart Gold overview</h1>
      </div>
      <div class="flex flex-1 items-center gap-3 sm:justify-end">
        <div class="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/70 px-3 py-2 text-sm text-slate-300 ring-1 ring-white/10">
          <span class="text-brand-400">⌕</span>
          <span>Search accounts, pawns, customers</span>
        </div>
        <div class="chip">Today · Jan 31, 2026</div>
        <button class="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400">New pawn</button>
      </div>
    </header>
  `
}

