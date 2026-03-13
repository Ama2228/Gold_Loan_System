import React from 'react'

const LABEL_STYLES = {
  Loyal: 'bg-green-100 text-green-800 border-green-200',
  Reliable: 'bg-blue-100 text-blue-800 border-blue-200',
  Normal: 'bg-gray-100 text-gray-800 border-gray-200',
  Caution: 'bg-orange-100 text-orange-800 border-orange-200',
  'High Risk': 'bg-red-100 text-red-800 border-red-200'
}

export default function CustomerRatingCard({ score, label, metrics = {}, explanation = [], compact = false }) {
  if (score == null || label == null) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 sm:p-5 border border-dashed border-gray-200">
        <p className="text-sm text-gray-500">Customer rating is not available yet.</p>
      </div>
    )
  }

  const badgeClass =
    LABEL_STYLES[label] || 'bg-gray-100 text-gray-800 border-gray-200'

  const {
    totalTickets,
    activeTickets,
    onTimeRate,
    overdueRatio,
    maxDaysOverdue,
    avgLoanAmount,
    totalLoanAmount
  } = metrics

  const formattedOnTime =
    typeof onTimeRate === 'number' ? `${Math.round(onTimeRate * 100)}%` : '—'
  const formattedOverdue =
    typeof overdueRatio === 'number' ? `${Math.round(overdueRatio * 100)}%` : '—'

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Customer Rating
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              {Math.round(score)}%
            </p>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
            >
              {label}
            </span>
          </div>
        </div>
        {!compact && (
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
            <span>Higher is better</span>
            {maxDaysOverdue != null && (
              <span className="mt-1">
                Max overdue:{' '}
                <span className="font-semibold text-gray-700">
                  {maxDaysOverdue} days
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`mt-4 grid gap-3 text-xs sm:text-sm ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <div>
          <p className="text-gray-500">Tickets</p>
          <p className="mt-1 font-semibold text-gray-900">
            {totalTickets ?? 0}{' '}
            <span className="text-xs text-gray-500">(active {activeTickets ?? 0})</span>
          </p>
        </div>
        <div>
          <p className="text-gray-500">On-time rate</p>
          <p className="mt-1 font-semibold text-gray-900">{formattedOnTime}</p>
        </div>
        <div>
          <p className="text-gray-500">Overdue ratio</p>
          <p className="mt-1 font-semibold text-gray-900">{formattedOverdue}</p>
        </div>
        {!compact && (
          <>
            <div>
              <p className="text-gray-500">Avg. loan</p>
              <p className="mt-1 font-semibold text-gray-900">
                {avgLoanAmount != null
                  ? `Rs. ${Number(avgLoanAmount).toLocaleString()}`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total loaned</p>
              <p className="mt-1 font-semibold text-gray-900">
                {totalLoanAmount != null
                  ? `Rs. ${Number(totalLoanAmount).toLocaleString()}`
                  : '—'}
              </p>
            </div>
          </>
        )}
      </div>

      {explanation?.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Why this rating</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
            {explanation.slice(0, compact ? 2 : 3).map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

