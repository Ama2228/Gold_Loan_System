import { useState } from 'react'
import { Search } from 'lucide-react'
import api from '../../services/api'

const PAYMENT_METHOD_MAP = {
  'Cash': 'CASH',
  'Bank Transfer': 'ONLINE',
  'Card Payment': 'CARD',
  'Mobile Payment': 'ONLINE'
}

export default function PartPayment() {
  const [ticketNumber, setTicketNumber] = useState('')
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [showSummary, setShowSummary] = useState(false)
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
          setPaymentAmount('')
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

  const handleProcessPayment = (e) => {
    e.preventDefault()
    setError('')

    if (!paymentAmount) {
      setError('Please enter payment amount')
      return
    }

    const amount = parseFloat(paymentAmount)
    if (amount <= 0) {
      setError('Payment amount must be greater than 0')
      return
    }

    const outstanding = ticket?.payment_summary?.outstandingPrincipal ?? 0
    if (amount > outstanding) {
      setError(`Payment amount cannot exceed outstanding balance (Rs. ${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })})`)
      return
    }

    setShowSummary(true)
  }

  const handleConfirmPayment = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.processPartPayment(ticket.ticket_id, {
        amount: parseFloat(paymentAmount),
        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod] || 'CASH',
        note: notes || null
      })
      if (res.success) {
        alert(`Payment recorded successfully! Receipt: PP${res.data.payment_id}`)
        setPaymentAmount('')
        setNotes('')
        setShowSummary(false)
        setTicketNumber('')
        setTicket(null)
      } else {
        setError(res.message || 'Payment failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment')
    } finally {
      setSubmitting(false)
    }
  }

  const ps = ticket?.payment_summary
  const outstanding = ps?.outstandingPrincipal ?? 0
  const recentPayments = ps?.recentPayments ?? []

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Part Payment</h1>
        <p className="mt-2 text-gray-600">Process partial payments for active pawning tickets</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Ticket</label>
            <form onSubmit={handleSearchTicket} className="flex flex-wrap gap-3">
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="e.g. 0001-25000001"
                className="flex-1 min-w-xs rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                <Search className="h-4 w-4" />
                {loading ? 'Searching...' : 'Find Ticket'}
              </button>
            </form>
            {error && !ticket && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {ticket && (
            <>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-yellow-600">Ticket Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Receipt Number</p>
                    <p className="text-sm font-bold text-gray-900">{ticket.receipt_no}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Customer Name</p>
                    <p className="text-sm font-bold text-gray-900">{ticket.customer?.name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600 mb-1">NIC</p>
                    <p className="text-sm font-bold text-gray-900">{ticket.customer?.nic}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Loan Amount</p>
                    <p className="text-sm font-bold text-yellow-700">Rs. {ticket.loan_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs font-semibold text-red-700 mb-1">Outstanding Amount</p>
                    <p className="text-sm font-bold text-red-700">Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="grid gap-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600"><span className="font-semibold">Issued Date:</span> {ticket.issue_date}</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Due Date:</span> {ticket.due_date}</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Interest Rate:</span> {ticket.annual_interest_rate}% p.a.</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Status:</span> {ticket.status}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-yellow-600 mb-4">Payment Details</h2>
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount (Rs.)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount to pay"
                      step="0.01"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max: Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
                      placeholder="Add any notes about this payment"
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-colors"
                  >
                    Process Payment
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          {ticket && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Payment Summary</h2>
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Outstanding Amount</span>
                  <span className="font-semibold text-gray-900">Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Amount</span>
                  <span className="font-semibold text-yellow-600">{paymentAmount ? 'Rs. ' + parseFloat(paymentAmount).toFixed(2) : '—'}</span>
                </div>
              </div>
              <div className="py-3 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Remaining Balance</span>
                  <span className="font-bold text-lg text-gray-900">
                    {paymentAmount ? 'Rs. ' + (outstanding - parseFloat(paymentAmount)).toFixed(2) : '—'}
                  </span>
                </div>
              </div>
              <div className="pt-3 space-y-2 text-xs text-gray-600">
                <p><span className="font-semibold">Payment Method:</span> {paymentMethod}</p>
                <p><span className="font-semibold">Status:</span> <span className="text-blue-600 font-semibold">Pending</span></p>
              </div>
            </div>
          )}

          {showSummary && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
                <div className="space-y-3 mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600"><span className="font-semibold">Ticket:</span> {ticket?.receipt_no}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Customer:</span> {ticket?.customer?.name}</p>
                  <p className="text-sm font-bold text-yellow-600"><span className="text-gray-600">Amount: </span>Rs. {parseFloat(paymentAmount).toFixed(2)}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Method:</span> {paymentMethod}</p>
                </div>
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSummary(false)}
                    disabled={submitting}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-70"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 px-4 py-2 text-black font-semibold transition-colors disabled:opacity-70"
                  >
                    {submitting ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {ticket && recentPayments.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Recent Payments</h2>
              <div className="space-y-3 text-sm">
                {recentPayments.map((payment) => (
                  <div key={payment.payment_id} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900">Rs. {payment.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{payment.payment_method}</p>
                      <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded mt-1">
                        {payment.payment_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
