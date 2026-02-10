import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'

export default function PartPayments() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [cardType, setCardType] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Dummy data for active receipts
  const activeReceipts = [
    {
      receiptNo: '0001-25000001',
      loanAmount: 700000,
      annualInterestRate: 15,
      issueDate: '2025-08-05',
      dueDate: '2026-02-05',
      status: 'Active'
    },
    {
      receiptNo: '0003-25000023',
      loanAmount: 550000,
      annualInterestRate: 15,
      issueDate: '2025-09-10',
      dueDate: '2026-03-10',
      status: 'Active'
    },
    {
      receiptNo: '0004-25000034',
      loanAmount: 320000,
      annualInterestRate: 15,
      issueDate: '2025-10-15',
      dueDate: '2026-04-15',
      status: 'Active'
    }
  ]

  // Filter by search query
  const filteredReceipts = activeReceipts.filter(r =>
    r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected receipt
  const selectedReceipt = activeReceipts.find(r => r.receiptNo === selectedReceiptId)

  // Calculate interest for selected receipt
  const calculateInterest = (receipt) => {
    if (!receipt) return { interest: 0, days: 0 }
    
    const issueDate = new Date(receipt.issueDate)
    const today = new Date('2026-02-10') // Current date
    const daysDiff = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24))
    const interest = receipt.loanAmount * (receipt.annualInterestRate / 100) * (daysDiff / 365)
    
    return { interest: Math.round(interest * 100) / 100, days: daysDiff }
  }

  const interestData = calculateInterest(selectedReceipt)

  // Validation
  const paymentAmountNum = parseFloat(paymentAmount) || 0
  const isAmountValid = paymentAmountNum >= 500
  const isCardValid = cardType && cardNumber.length >= 12 && cardName && cardExpiry.length >= 5 && cardCVV.length >= 3

  const canProceed = selectedReceipt && isAmountValid && isCardValid

  const handleProceedPayment = () => {
    if (canProceed) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        // Reset form
        setPaymentAmount('')
        setCardType('')
        setCardNumber('')
        setCardName('')
        setCardExpiry('')
        setCardCVV('')
      }, 3000)
    }
  }

  // Auto-select first receipt on load
  useEffect(() => {
    if (activeReceipts.length > 0 && !selectedReceiptId) {
      setSelectedReceiptId(activeReceipts[0].receiptNo)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black font-bold text-yellow-400 shadow-md">
                SG
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">Smart Gold</h1>
                <p className="text-xs text-black/70">Customer Dashboard</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-3 text-sm font-semibold text-black">
              <button
                onClick={() => navigate('/customer')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Overview
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/receipts')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                My Receipts
              </button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50 bg-yellow-700/50">
                Part Payments
              </button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">
                Appointments
              </button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50">
                Notifications
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
                >
                  Profile
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">Profile Details</p>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Customer Name"
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Customer ID
                        </label>
                        <input
                          type="text"
                          defaultValue="CUS001"
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/login')}
                className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Payment recorded (demo)</span>
        </div>
      )}

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8 mb-8">
            <div className="border-b-2 border-yellow-500 pb-4 mb-2">
              <h2 className="text-3xl font-bold text-yellow-600">Online Part Payment</h2>
              <p className="text-gray-600 mt-2">
                Make a partial payment towards your active pawning receipt
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            {/* Left Column: Select Receipt */}
            <div className="space-y-4">
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Receipt</h3>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by receipt no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Receipts List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredReceipts.length > 0 ? (
                    filteredReceipts.map((receipt) => (
                      <button
                        key={receipt.receiptNo}
                        onClick={() => setSelectedReceiptId(receipt.receiptNo)}
                        className={`w-full text-left rounded-lg p-4 border-2 transition-all ${
                          selectedReceiptId === receipt.receiptNo
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-gray-900">{receipt.receiptNo}</p>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                            {receipt.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Loan Amount</p>
                            <p className="font-semibold text-gray-900">Rs. {receipt.loanAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-semibold text-gray-900">{receipt.dueDate}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
                      No receipts found matching your search
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              {selectedReceipt ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>

                  {/* A) Selected Receipt Details */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-bold text-gray-700 mb-3">Receipt Information</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Receipt No</p>
                        <p className="font-semibold text-gray-900">{selectedReceipt.receiptNo}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Loan Amount</p>
                        <p className="font-semibold text-yellow-600">Rs. {selectedReceipt.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Annual Interest Rate</p>
                        <p className="font-semibold text-gray-900">{selectedReceipt.annualInterestRate}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Due Date</p>
                        <p className="font-semibold text-gray-900">{selectedReceipt.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                          {selectedReceipt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* B) Auto Interest Calculation */}
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <p className="text-sm font-bold text-yellow-700 mb-2">Interest as of Today</p>
                    <p className="text-2xl font-bold text-yellow-700">Rs. {interestData.interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <p className="text-xs text-yellow-600 mt-1">Days from Issue: {interestData.days}</p>
                  </div>

                  {/* C) Payment Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Payment Amount (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount (min Rs. 500)"
                      className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                        paymentAmount && !isAmountValid
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-200 focus:ring-yellow-500'
                      }`}
                    />
                    {paymentAmount && !isAmountValid && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>Minimum payment is Rs. 500</span>
                      </div>
                    )}
                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setPaymentAmount((prev) => (parseFloat(prev) || 0) + 500)}
                        className="px-3 py-1 text-xs font-semibold border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50"
                      >
                        +500
                      </button>
                      <button
                        onClick={() => setPaymentAmount((prev) => (parseFloat(prev) || 0) + 1000)}
                        className="px-3 py-1 text-xs font-semibold border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50"
                      >
                        +1000
                      </button>
                      <button
                        onClick={() => setPaymentAmount((prev) => (parseFloat(prev) || 0) + 5000)}
                        className="px-3 py-1 text-xs font-semibold border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50"
                      >
                        +5000
                      </button>
                    </div>
                  </div>

                  {/* D) Payment Method */}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <p className="text-sm font-bold text-gray-900">Card Details</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select card type</option>
                        <option value="debit">Debit Card</option>
                        <option value="credit">Credit Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="1234 5678 9012 3456"
                        maxLength="16"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name on Card <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expiry (MM/YY) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '')
                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                            setCardExpiry(val)
                          }}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength="4"
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* E) Payment Summary */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-bold text-gray-900 mb-3">Payment Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Due:</span>
                        <span className="font-semibold text-gray-900">
                          Rs. {interestData.interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Part Payment Amount:</span>
                        <span className="font-semibold text-gray-900">
                          Rs. {paymentAmountNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total Paying Now:</span>
                        <span className="font-bold text-yellow-600 text-lg">
                          Rs. {paymentAmountNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3 italic">
                      This payment will reduce the outstanding balance.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => navigate('/customer')}
                      className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={handleProceedPayment}
                      disabled={!canProceed}
                      className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                        canProceed
                          ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Proceed Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-center text-gray-600">
                    <span className="text-4xl mb-2 block">💳</span>
                    Select a receipt to continue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
