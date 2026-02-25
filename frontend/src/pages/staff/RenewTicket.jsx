import { useState } from 'react'
import { Search } from 'lucide-react'
import api from '../../services/api'

const PAYMENT_METHOD_MAP = { 'Cash': 'CASH', 'Bank Transfer': 'ONLINE', 'Card Payment': 'CARD', 'Mobile Payment': 'ONLINE' }
const RENEWAL_PERIODS = [3, 6, 12]

export default function RenewTicket() {
  const [ticketNumber, setTicketNumber] = useState('')
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [renewalMonths, setRenewalMonths] = useState(6)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSearchTicket = async (e) => {
    e.preventDefault()
    setError('')
    if (!ticketNumber?.trim()) {
      setError('Please enter a receipt number')
      return
    }

    setLoading(true)
    try {
      const res = await api.getTicketByReceipt(ticketNumber.trim())
      if (res.success && res.data) {
        if (!res.data.payment_summary) {
          setError('Ticket is closed or not found')
          setTicket(null)
        } else {
          setTicket(res.data)
        }
      } else {
        setError('Ticket not found')
        setTicket(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket')
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }

  const ps = ticket?.payment_summary
  const outstanding = ps?.outstandingPrincipal ?? 0
  const annualRate = ticket?.annual_interest_rate ?? 0
  const interestAmount = outstanding * (annualRate / 100) * (renewalMonths / 12)
  const interestDisplay = Math.round(interestAmount * 100) / 100

  const getNewDueDate = () => {
    if (!ticket?.due_date) return ''
    const d = new Date(ticket.due_date)
    d.setMonth(d.getMonth() + renewalMonths)
    return d.toISOString().split('T')[0]
  }

  const handleRenew = async (e) => {
    e.preventDefault()
    setError('')
    if (!ticket) return

    setSubmitting(true)
    try {
      const res = await api.processRenewal(ticket.ticket_id, {
        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod] || 'CASH',
        renewalMonths,
        note: notes || null
      })
      if (res.success) {
        alert(`Ticket renewed successfully! New due date: ${res.data.new_due_date}`)
        setTicket(null)
        setTicketNumber('')
      } else {
        setError(res.message || 'Renewal failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to process renewal')
    } finally {
      setSubmitting(false)
    }
  }

  const articles = ticket?.articles ?? []

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Renew Ticket</h1>
        <p className="mt-2 text-gray-600">Pay interest and extend the due date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Receipt Number</label>
            <form onSubmit={handleSearchTicket} className="flex flex-wrap gap-3">
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="e.g. 0001-25000001"
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-70"
              >
                <Search className="h-4 w-4 inline mr-1" />
                {loading ? 'Searching...' : 'Find'}
              </button>
            </form>
            {error && !ticket && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {ticket && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Ticket Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">Article</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">Qty</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">Gross (g)</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">Net (g)</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">Karat</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((row, idx) => (
                      <tr key={row.article_id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                        <td className="px-3 py-2 text-gray-900 font-medium">{row.item_type}</td>
                        <td className="px-3 py-2 text-gray-600">{row.quantity}</td>
                        <td className="px-3 py-2 text-gray-600">{row.gross_weight_grams}</td>
                        <td className="px-3 py-2 text-gray-600">{row.net_weight_grams}</td>
                        <td className="px-3 py-2 text-gray-600">{row.purity_karat}</td>
                        <td className="px-3 py-2 text-gray-600">{row.assessed_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {ticket && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-yellow-600">Renew Summary</h3>
                <span className="text-sm text-gray-600">{ticket.receipt_no}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Receipt Number</span><span className="font-semibold text-gray-900">{ticket.receipt_no}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Customer</span><span className="font-semibold text-gray-900">{ticket.customer?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Outstanding Principal</span><span className="font-semibold text-gray-900">Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Interest Rate</span><span className="font-semibold text-gray-900">{annualRate}% p.a.</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Current Due Date</span><span className="font-semibold text-gray-900">{ticket.due_date}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Renewal Period</span><span className="font-semibold text-gray-900">{renewalMonths} Months</span></div>
                <div className="flex justify-between"><span className="text-gray-600">New Due Date</span><span className="font-semibold text-gray-900">{getNewDueDate()}</span></div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-sm font-semibold text-gray-700">Interest Payable</span>
                <span className="text-lg font-bold text-green-600">Rs. {interestDisplay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <form onSubmit={handleRenew} className="mt-5 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Renewal Period</label>
                  <select
                    value={renewalMonths}
                    onChange={(e) => setRenewalMonths(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    {RENEWAL_PERIODS.map((m) => (
                      <option key={m} value={m}>{m} Months</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Card Payment</option>
                    <option>Mobile Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes"
                    rows="2"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-yellow-500 hover:bg-yellow-600 px-6 py-3 text-black font-semibold transition-colors disabled:opacity-70"
                >
                  {submitting ? 'Processing...' : 'Save & Print'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
