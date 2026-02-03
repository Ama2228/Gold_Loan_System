import { StatCard } from '../components/StatCard.jsx'

const stats = [
  {
    label: 'Active pawns',
    value: '1,284',
    trend: '+4.6%',
    caption: 'Compared to last month'
  },
  {
    label: 'Gold pledged',
    value: '132.8 kg',
    trend: '+1.8%',
    caption: 'Across all branches'
  },
  {
    label: 'Outstanding balance',
    value: 'LKR 84.2M',
    trend: '-2.1%',
    caption: 'Reduced due to early settlements'
  },
  {
    label: 'Renewals due',
    value: '312',
    trend: 'Next 7 days',
    caption: 'Priority customers needing follow-up'
  }
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions Overview</h1>
        <p className="mt-2 text-gray-600">Track all pawning transactions and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Branch Performance and Priorities */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Branch Performance */}
        <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Branch performance</h2>
              <p className="text-sm text-gray-600">Monthly comparison for top branches</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              Live
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { name: 'Colombo Central', value: 'LKR 24.3M', status: 'On track' },
              { name: 'Kandy City', value: 'LKR 18.1M', status: 'Rising' },
              { name: 'Galle Bay', value: 'LKR 12.4M', status: 'At risk' }
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200"
              >
                <div>
                  <p className="font-semibold text-gray-900">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.status}</p>
                </div>
                <p className="font-semibold text-yellow-600">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Priorities */}
        <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's priorities</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            {[
              'Finalize 18 renewals',
              'Review gold valuation updates',
              'Call 12 late payment customers',
              'Approve new branch credit limit'
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
            View full checklist
          </button>
        </div>
      </div>
    </div>
  )
}
