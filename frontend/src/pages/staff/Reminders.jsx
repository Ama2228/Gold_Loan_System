import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'

export default function Reminders() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({ sentSuccessfully: 0, delivered: 0, failed: 0 })
  const [reminders, setReminders] = useState([])

  const loadReminders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getReminderStatus(200)
      if (res.success && res.data) {
        setSummary(res.data.summary || { sentSuccessfully: 0, delivered: 0, failed: 0 })
        setReminders(Array.isArray(res.data.reminders) ? res.data.reminders : [])
      } else {
        setError('Failed to load reminder data')
      }
    } catch (err) {
      setError(err.message || 'Failed to load reminder data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const handleSendNow = async (receiptNo = null) => {
    setSending(true)
    setError('')
    try {
      await api.sendReminderMessages(receiptNo)
      await loadReminders()
    } catch (err) {
      setError(err.message || 'Failed to send reminders')
    } finally {
      setSending(false)
    }
  }

  const displayStatus = (status) => {
    if (status === 'SENT') return 'Sent'
    if (status === 'FAILED') return 'Failed'
    return 'Scheduled'
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Reminder Status</h1>
        <p className="mt-2 text-gray-600">Track customer notification reminders</p>
        <div className="mt-4">
          <button
            onClick={() => handleSendNow()}
            disabled={sending}
            className="rounded-lg bg-yellow-500 px-5 py-2 text-sm font-semibold text-black hover:bg-yellow-600 disabled:opacity-70"
          >
            {sending ? 'Sending...' : 'Send Due Reminders Now'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
          <p className="text-sm font-semibold text-green-700 mb-2">Sent Successfully</p>
          <p className="text-3xl font-bold text-green-900">{summary.sentSuccessfully}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
          <p className="text-sm font-semibold text-blue-700 mb-2">Delivered</p>
          <p className="text-3xl font-bold text-blue-900">{summary.delivered}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200 shadow-sm">
          <p className="text-sm font-semibold text-red-700 mb-2">Failed</p>
          <p className="text-3xl font-bold text-red-900">{summary.failed}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Reminders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-yellow-500">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">NIC</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Mobile Number</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Message</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Sent Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">Loading reminders...</td>
              </tr>
            ) : reminders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">No reminder logs found</td>
              </tr>
            ) : reminders.map(reminder => (
              <tr key={reminder.id} className="border-b border-gray-200 hover:bg-white">
                <td className="px-4 py-3 text-gray-900 font-medium">{reminder.customer}</td>
                <td className="px-4 py-3 text-gray-600">{reminder.nic || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{reminder.mobileNumber || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{reminder.message}</td>
                <td className="px-4 py-3 text-gray-600">{reminder.sentDate}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    reminder.status === 'SENT' ? 'bg-green-100 text-green-800' :
                    reminder.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reminder.status === 'SENT' || reminder.status === 'SCHEDULED' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {displayStatus(reminder.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSendNow(reminder.receiptNo)}
                    disabled={sending}
                    className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm disabled:opacity-60"
                  >
                    Resend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}


