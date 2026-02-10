import { useState } from 'react'
import { BarChart3, TrendingUp, Download } from 'lucide-react'

const MonthlyReports = () => (
  <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
    <div className="border-b-2 border-yellow-500 pb-4">
      <h1 className="text-3xl font-bold text-yellow-600">Monthly Reports</h1>
      <p className="mt-2 text-gray-600">View monthly transaction reports and statistics</p>
    </div>

    {/* Month Selection */}
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
        <select className="rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500">
          <option>January 2026</option>
          <option>December 2025</option>
          <option>November 2025</option>
        </select>
      </div>
      <button className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors">
        <Download className="h-4 w-4" />
        Download Report
      </button>
    </div>

    {/* Summary Stats */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
        <p className="text-sm font-semibold text-blue-700 mb-2">Total Transactions</p>
        <p className="text-3xl font-bold text-blue-900">245</p>
        <p className="text-xs text-blue-700 mt-2">↑ 12% from last month</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <p className="text-sm font-semibold text-green-700 mb-2">Total Amount Loaned</p>
        <p className="text-3xl font-bold text-green-900">₨ 4.5M</p>
        <p className="text-xs text-green-700 mt-2">↑ 8% from last month</p>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
        <p className="text-sm font-semibold text-purple-700 mb-2">Total Renewals</p>
        <p className="text-3xl font-bold text-purple-900">89</p>
        <p className="text-xs text-purple-700 mt-2">↓ 5% from last month</p>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 shadow-sm">
        <p className="text-sm font-semibold text-orange-700 mb-2">Interest Collected</p>
        <p className="text-3xl font-bold text-orange-900">₨ 450K</p>
        <p className="text-xs text-orange-700 mt-2">↑ 15% from last month</p>
      </div>
    </div>

    {/* Detailed Table */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-yellow-500">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Branch</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">New Loans</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Renewals</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Interest</th>
          </tr>
        </thead>
        <tbody>
          {[
            { date: '2026-01-31', branch: 'Colombo', newLoans: 25, renewals: 12, amount: '₨ 450,000', interest: '₨ 45,000' },
            { date: '2026-01-30', branch: 'Kandy', newLoans: 18, renewals: 8, amount: '₨ 380,000', interest: '₨ 38,000' },
            { date: '2026-01-29', branch: 'Galle', newLoans: 15, renewals: 6, amount: '₨ 320,000', interest: '₨ 32,000' },
            { date: '2026-01-28', branch: 'Colombo', newLoans: 22, renewals: 10, amount: '₨ 420,000', interest: '₨ 42,000' },
            { date: '2026-01-27', branch: 'Kandy', newLoans: 20, renewals: 9, amount: '₨ 400,000', interest: '₨ 40,000' }
          ].map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-white">
              <td className="px-4 py-3 text-gray-900 font-medium">{item.date}</td>
              <td className="px-4 py-3 text-gray-600">{item.branch}</td>
              <td className="px-4 py-3 text-gray-600">{item.newLoans}</td>
              <td className="px-4 py-3 text-gray-600">{item.renewals}</td>
              <td className="px-4 py-3 text-yellow-600 font-semibold">{item.amount}</td>
              <td className="px-4 py-3 text-green-600 font-semibold">{item.interest}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  </div>
)

const DailyReports = () => (
  <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
    <div className="border-b-2 border-yellow-500 pb-4">
      <h1 className="text-3xl font-bold text-yellow-600">Daily Reports</h1>
      <p className="mt-2 text-gray-600">View daily transaction reports and activity</p>
    </div>

    {/* Date Selection */}
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          defaultValue="2026-01-31"
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>
      <button className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors">
        <Download className="h-4 w-4" />
        Download Report
      </button>
    </div>

    {/* Daily Summary */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
        <p className="text-sm font-semibold text-blue-700 mb-2">Today's Transactions</p>
        <p className="text-3xl font-bold text-blue-900">18</p>
        <p className="text-xs text-blue-700 mt-2">Till now</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <p className="text-sm font-semibold text-green-700 mb-2">Total Amount</p>
        <p className="text-3xl font-bold text-green-900">₨ 1.8M</p>
        <p className="text-xs text-green-700 mt-2">Across all branches</p>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
        <p className="text-sm font-semibold text-purple-700 mb-2">Interest Collected</p>
        <p className="text-3xl font-bold text-purple-900">₨ 180K</p>
        <p className="text-xs text-purple-700 mt-2">Service charges</p>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 shadow-sm">
        <p className="text-sm font-semibold text-orange-700 mb-2">Branch Performance</p>
        <p className="text-3xl font-bold text-orange-900">5/5</p>
        <p className="text-xs text-orange-700 mt-2">All branches active</p>
      </div>
    </div>

    {/* Daily Transactions */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-yellow-500">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Time</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Staff</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { time: '09:15 AM', type: 'New Pawn', customer: 'Mr. Bandara', amount: '₨ 200,000', staff: 'Hasindu N.', status: 'Completed' },
            { time: '10:30 AM', type: 'Renewal', customer: 'Ms. Silva', amount: '₨ 180,000', staff: 'Kamal K.', status: 'Completed' },
            { time: '11:45 AM', type: 'Part Payment', customer: 'Mr. Kumar', amount: '₨ 100,000', staff: 'Hasindu N.', status: 'Completed' },
            { time: '1:20 PM', type: 'Redemption', customer: 'Mr. Jayasuriya', amount: '₨ 450,000', staff: 'Ruwan D.', status: 'Completed' },
            { time: '2:50 PM', type: 'New Pawn', customer: 'Ms. Perera', amount: '₨ 280,000', staff: 'Kamal K.', status: 'Completed' }
          ].map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-white">
              <td className="px-4 py-3 text-gray-900 font-medium">{item.time}</td>
              <td className="px-4 py-3 text-gray-600">{item.type}</td>
              <td className="px-4 py-3 text-gray-600">{item.customer}</td>
              <td className="px-4 py-3 text-yellow-600 font-semibold">{item.amount}</td>
              <td className="px-4 py-3 text-gray-600">{item.staff}</td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  </div>
)

export default function Reports() {
  const [tab, setTab] = useState('monthly')

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('monthly')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            tab === 'monthly'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly Reports
        </button>
        <button
          onClick={() => setTab('daily')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            tab === 'daily'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Daily Reports
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'monthly' && <MonthlyReports />}
      {tab === 'daily' && <DailyReports />}
    </div>
  )
}


