import { navItems } from "../data/nav.js"

export function Sidebar() {
  return `
    <aside class="flex flex-col gap-6 border-r border-white/10 bg-slate-950/60 px-6 py-8">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-slate-950 font-black">SG</div>
        <div>
          <p class="text-sm font-semibold text-slate-200">Smart Gold</p>
          <p class="text-xs text-slate-400">Dashboard</p>
        </div>
      </div>
      <nav class="flex flex-col gap-2">
        ${navItems
          .map(
            (item, index) => `
              <a class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                index === 0
                  ? "bg-brand-500/15 text-brand-200"
                  : "text-slate-300 hover:bg-white/5"
              }" href="${item.href}">
                <span class="h-2 w-2 rounded-full ${index === 0 ? "bg-brand-400" : "bg-slate-600"}"></span>
                ${item.label}
              </a>
            `
          )
          .join("")}
      </nav>
      <div class="mt-auto rounded-2xl bg-slate-900/60 p-4 text-xs text-slate-300 ring-1 ring-white/10">
        <p class="font-semibold text-slate-200">Gold rate alert</p>
        <p class="mt-1">24K is up 1.2% today. Review pawn renewals.</p>
      </div>
    </aside>
  `
}

