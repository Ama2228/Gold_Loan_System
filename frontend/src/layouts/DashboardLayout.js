import { Sidebar } from "../components/Sidebar.js"
import { Topbar } from "../components/Topbar.js"

export function DashboardLayout({ content }) {
  return `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <div class="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        ${Sidebar()}
        <main class="flex flex-col gap-8 px-6 py-8 lg:px-10">
          ${Topbar()}
          ${content}
        </main>
      </div>
    </div>
  `
}
