export function StatCard({ label, value, trend, caption }) {
  const isPositive = trend.startsWith('+')
  const isNegative = trend.startsWith('-')

  return (
    <div className="rounded-xl bg-gray-50 p-6 ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? 'bg-green-100 text-green-800'
              : isNegative
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {trend}
        </span>
      </div>
      <h3 className="mt-3 text-2xl font-bold text-gray-900">{value}</h3>
      <p className="mt-2 text-xs text-gray-500">{caption}</p>
    </div>
  )
}

