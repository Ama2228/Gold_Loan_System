import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Reminders() {
  const reminders = [
    { id: 1, customer: 'Mr. Bandara', message: 'Loan renewal due', sentDate: '2026-01-28', status: 'Sent', method: 'SMS' },
    { id: 2, customer: 'Ms. Silva', message: 'Payment reminder', sentDate: '2026-01-27', status: 'Sent', method: 'Email' },
    { id: 3, customer: 'Mr. Kumar', message: 'Auction notification', sentDate: '2026-01-26', status: 'Sent', method: 'SMS' },
    { id: 4, customer: 'Mr. Jayasuriya', message: 'Urgent - Renewal due', sentDate: '2026-01-25', status: 'Delivered', method: 'SMS' },
    { id: 5, customer: 'Ms. Perera', message: 'Payment overdue notice', sentDate: '2026-01-24', status: 'Failed', method: 'Email' }
  ]

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Reminder Status</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
          <p className="text-sm font-semibold text-green-600 mb-2">Sent Successfully</p>
          <p className="text-3xl font-bold text-green-800">8</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-blue-600 mb-2">Delivered</p>
          <p className="text-3xl font-bold text-blue-800">12</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-l-4 border-red-500">
          <p className="text-sm font-semibold text-red-600 mb-2">Failed</p>
          <p className="text-3xl font-bold text-red-800">2</p>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="overflow-x-auto bg-gray-50 p-6 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-yellow-500">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Message</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Method</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Sent Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map(reminder => (
              <tr key={reminder.id} className="border-b border-gray-200 hover:bg-white">
                <td className="px-4 py-3 text-gray-900 font-medium">{reminder.customer}</td>
                <td className="px-4 py-3 text-gray-600">{reminder.message}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    reminder.method === 'SMS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {reminder.method}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{reminder.sentDate}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    reminder.status === 'Sent' ? 'bg-green-100 text-green-800' :
                    reminder.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reminder.status === 'Sent' || reminder.status === 'Delivered' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {reminder.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm">Resend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


