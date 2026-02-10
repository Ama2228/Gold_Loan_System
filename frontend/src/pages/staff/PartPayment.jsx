import { useState } from 'react'
import { Search } from 'lucide-react'

export default function PartPayment() {
  const [ticketNumber, setTicketNumber] = useState('TCK12345')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [error, setError] = useState('')

  // Mock ticket details
  const ticketDetails = {
    ticketNumber: 'TCK12345',
    customerName: 'Mr. TMHN Bandara',
    nic: '20012345678',
    customerType: 'Normal',
    advanceAmount: '₨. 700,000.00',
    issuedDate: '01-Aug-2025',
    period: '6 Months',
    dueDays: '5 Days',
    interestRate: '24%',
    outstandingAmount: '₨. 750,000.00',
    totalPayable: '₨. 760,000.00'
  }

  const handleSearchTicket = (e) => {
    e.preventDefault()
    // In real app, this would fetch ticket details from backend
    setError('')
    if (!ticketNumber) {
      setError('Please enter a ticket number')
      return
    }
    // Simulate finding ticket
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

    if (amount > 760000) {
      setError('Payment amount cannot exceed outstanding amount')
      return
    }

    setShowSummary(true)
  }

  const handleConfirmPayment = () => {
    // In real app, this would submit payment to backend
    alert('Payment processed successfully! Receipt: PP' + Date.now())
    setPaymentAmount('')
    setNotes('')
    setShowSummary(false)
    setTicketNumber('')
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Part Payment</h1>
        <p className="mt-2 text-gray-600">Process partial payments for active pawning tickets</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Section - Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Ticket */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Search Ticket</label>
            <form onSubmit={handleSearchTicket} className="flex flex-wrap gap-3">
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="TCK12345"
                className="flex-1 min-w-xs rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Find Ticket
              </button>
            </form>
          </div>

          {/* Ticket Details */}
          {ticketNumber && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-yellow-600">Ticket Details</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Ticket Number</p>
                  <p className="text-sm font-bold text-gray-900">{ticketDetails.ticketNumber}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Customer Name</p>
                  <p className="text-sm font-bold text-gray-900">{ticketDetails.customerName}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">NIC</p>
                  <p className="text-sm font-bold text-gray-900">{ticketDetails.nic}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Customer Type</p>
                  <p className="text-sm font-bold text-gray-900">{ticketDetails.customerType}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Advance Amount</p>
                  <p className="text-sm font-bold text-yellow-700">{ticketDetails.advanceAmount}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 mb-1">Outstanding Amount</p>
                  <p className="text-sm font-bold text-red-700">{ticketDetails.outstandingAmount}</p>
                </div>
              </div>

              <div className="grid gap-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600"><span className="font-semibold">Issued Date:</span> {ticketDetails.issuedDate}</p>
                <p className="text-xs text-gray-600"><span className="font-semibold">Period:</span> {ticketDetails.period}</p>
                <p className="text-xs text-gray-600"><span className="font-semibold">Interest Rate:</span> {ticketDetails.interestRate}</p>
                <p className="text-xs text-gray-600"><span className="font-semibold">Total Payable:</span> {ticketDetails.totalPayable}</p>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {ticketNumber && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Payment Details</h2>
              
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount (₨)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount to pay"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max amount: 760,000.00</p>
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
                    <option>Cheque</option>
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
                  ></textarea>
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
          )}
        </div>

        {/* Right Section - Summary & Payment Confirmation */}
        <div className="space-y-6">
          {/* Payment Summary */}
          {ticketNumber && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-yellow-600 mb-4">Payment Summary</h2>
              
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Outstanding Amount</span>
                  <span className="font-semibold text-gray-900">₨. 760,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Amount</span>
                  <span className="font-semibold text-yellow-600">{paymentAmount ? '₨. ' + parseFloat(paymentAmount).toFixed(2) : '—'}</span>
                </div>
              </div>

              <div className="py-3 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Remaining Balance</span>
                  <span className="font-bold text-lg text-gray-900">
                    {paymentAmount ? '₨. ' + (760000 - parseFloat(paymentAmount)).toFixed(2) : '—'}
                  </span>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-xs text-gray-600">
                <p><span className="font-semibold">Payment Method:</span> {paymentMethod}</p>
                <p><span className="font-semibold">Status:</span> <span className="text-blue-600 font-semibold">Pending</span></p>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showSummary && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
                
                <div className="space-y-3 mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600"><span className="font-semibold">Ticket:</span> {ticketNumber}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Customer:</span> {ticketDetails.customerName}</p>
                  <p className="text-sm font-bold text-yellow-600"><span className="text-gray-600">Amount: </span>₨. {parseFloat(paymentAmount).toFixed(2)}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Method:</span> {paymentMethod}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 px-4 py-2 text-black font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Payments */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-yellow-600 mb-4">Recent Payments</h2>
            
            <div className="space-y-3 text-sm">
              {[
                { date: '2026-02-08', amount: '₨. 50,000', method: 'Cash', status: 'Completed' },
                { date: '2026-02-05', amount: '₨. 75,000', method: 'Bank Transfer', status: 'Completed' },
                { date: '2026-02-01', amount: '₨. 30,000', method: 'Cheque', status: 'Completed' }
              ].map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900">{payment.amount}</p>
                    <p className="text-xs text-gray-500">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{payment.method}</p>
                    <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded mt-1">
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
