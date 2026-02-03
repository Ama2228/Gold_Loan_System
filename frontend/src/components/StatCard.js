export function StatCard({ label, value, trend, caption }) {
  return `
    <div class="card-surface p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-400">${label}</p>
        <span class="chip">${trend}</span>
      </div>
      <h3 class="mt-3 text-2xl font-semibold text-slate-100">${value}</h3>
      <p class="mt-2 text-xs text-slate-400">${caption}</p>
    </div>
  `
}

