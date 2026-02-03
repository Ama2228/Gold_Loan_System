import { DashboardLayout } from "../layouts/DashboardLayout.js"
import { StatCard } from "../components/StatCard.js"

const stats = [
  {
    label: "Active pawns",
    value: "1,284",
    trend: "+4.6%",
    caption: "Compared to last month"
  },
  {
    label: "Gold pledged",
    value: "132.8 kg",
    trend: "+1.8%",
    caption: "Across all branches"
  },
  {
    label: "Outstanding balance",
    value: "LKR 84.2M",
    trend: "-2.1%",
    caption: "Reduced due to early settlements"
  },
  {
    label: "Renewals due",
    value: "312",
    trend: "Next 7 days",
    caption: "Priority customers needing follow-up"
  }
]

export function DashboardPage() {
  const statsMarkup = stats.map((item) => StatCard(item)).join("")

  const content = `
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      ${statsMarkup}
    </section>
    <section class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div class="card-surface p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Branch performance</h2>
            <p class="text-sm text-slate-400">Monthly comparison for top branches</p>
          </div>
          <span class="chip">Live</span>
        </div>
        <div class="mt-6 grid gap-4 text-sm">
          ${[
            { name: "Colombo Central", value: "LKR 24.3M", status: "On track" },
            { name: "Kandy City", value: "LKR 18.1M", status: "Rising" },
            { name: "Galle Bay", value: "LKR 12.4M", status: "At risk" }
          ]
            .map(
              (row) => `
                <div class="flex items-center justify-between rounded-xl bg-slate-950/40 px-4 py-3 ring-1 ring-white/5">
                  <div>
                    <p class="font-semibold">${row.name}</p>
                    <p class="text-xs text-slate-400">${row.status}</p>
                  </div>
                  <p class="font-semibold text-brand-200">${row.value}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="card-surface p-6">
        <h2 class="text-lg font-semibold">Today’s priorities</h2>
        <ul class="mt-4 space-y-3 text-sm text-slate-300">
          ${[
            "Finalize 18 renewals",
            "Review gold valuation updates",
            "Call 12 late payment customers",
            "Approve new branch credit limit"
          ]
            .map(
              (item) => `
                <li class="flex items-start gap-3">
                  <span class="mt-1 h-2 w-2 rounded-full bg-brand-400"></span>
                  <span>${item}</span>
                </li>
              `
            )
            .join("")}
        </ul>
        <button class="mt-6 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">View full checklist</button>
      </div>
    </section>
  `

  return DashboardLayout({ content })
}
