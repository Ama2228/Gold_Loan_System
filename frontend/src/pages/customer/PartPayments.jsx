import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import CustomerHeader from '../../components/CustomerHeader'

const formatDateOnly = (value) => (value ? String(value).slice(0, 10) : '')

export default function PartPayments() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [receipts, setReceipts] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [receiptDetail, setReceiptDetail] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [cardType, setCardType] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchReceipts() {
      setLoading(true)
      setError('')
      try {
        const res = await api.getCustomerReceipts()
        if (res.success && res.data && Array.isArray(res.data)) {
          if (!cancelled) {
            setReceipts(res.data)
            const receiptNo = location.state?.receiptNo
            if (receiptNo) {
              const match = res.data.find(r => String(r.receipt_no) === String(receiptNo))
              if (match) setSelectedReceipt(match)
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load receipts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReceipts()
    return () => { cancelled = true }
  }, [location.state?.receiptNo])

  useEffect(() => {
    if (!selectedReceipt?.receipt_no) {
      setReceiptDetail(null)
      return
    }
    let cancelled = false
    async function fetchDetail() {
      setLoadingDetail(true)
      setError('')
      try {
        const res = await api.getCustomerReceiptDetail(selectedReceipt.receipt_no)
        if (res.success && res.data && !cancelled) {
          setReceiptDetail(res.data)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load receipt details')
      } finally {
        if (!cancelled) setLoadingDetail(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [selectedReceipt?.receipt_no])

  const filteredReceipts = receipts.filter(r =>
    (r.receipt_no || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ps = receiptDetail?.payment_summary
  const outstanding = ps?.outstandingPrincipal ?? 0
  const accruedInterest = ps?.accruedInterest ?? 0

  const paymentAmountNum = parseFloat(paymentAmount) || 0
  const isAmountValid = paymentAmountNum >= 500 && paymentAmountNum <= outstanding
  const isCardValid = cardType && cardNumber.length >= 12 && cardName && cardExpiry.length >= 5 && cardCVV.length >= 3
  const canProceed = selectedReceipt && receiptDetail?.receipt?.ticket_id && isAmountValid && isCardValid && !submitting

  const handleProceedPayment = async () => {
    if (!canProceed) return
    setSubmitting(true)
    setError('')
    try {
      const ticketId = receiptDetail.receipt.ticket_id
      const res = await api.customerPartPayment(ticketId, {
        amount: paymentAmountNum,
        paymentMethod: 'ONLINE',
        note: null
      })
      if (res.success) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setPaymentAmount('')
          setCardType('')
          setCardNumber('')
          setCardName('')
          setCardExpiry('')
          setCardCVV('')
          setReceiptDetail(null)
          setSelectedReceipt(null)
        }, 3000)
      } else {
        setError(res.message || 'Payment failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (filteredReceipts.length > 0 && !selectedReceipt) {
      setSelectedReceipt(filteredReceipts[0])
    }
  }, [filteredReceipts, selectedReceipt])

  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerHeader />

      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Payment recorded successfully</span>
        </div>
      )}

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8 mb-8">
            <div className="border-b-2 border-yellow-500 pb-4 mb-2">
              <h2 className="text-3xl font-bold text-yellow-600">Online Part Payment</h2>
              <p className="text-gray-600 mt-2">Make a partial payment towards your active pawning receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            <div className="space-y-4">
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Receipt</h3>
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
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-gray-600 py-4">Loading receipts...</p>
                  ) : filteredReceipts.length > 0 ? (
                    filteredReceipts.map((r) => (
                      <button
                        key={r.ticket_id}
                        onClick={() => setSelectedReceipt(r)}
                        className={`w-full text-left rounded-lg p-4 border-2 transition-all ${
                          selectedReceipt?.ticket_id === r.ticket_id
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-gray-900">{r.receipt_no}</p>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">{r.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Loan Amount</p>
                            <p className="font-semibold text-gray-900">Rs. {Number(r.loan_amount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-semibold text-gray-900">{formatDateOnly(r.due_date)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">No active receipts found</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              {selectedReceipt ? (
                loadingDetail ? (
                  <p className="text-center text-gray-600 py-12">Loading receipt details...</p>
                ) : receiptDetail ? (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-bold text-gray-700 mb-3">Receipt Information</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Receipt No</p>
                          <p className="font-semibold text-gray-900">{selectedReceipt.receipt_no}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Loan Amount</p>
                          <p className="font-semibold text-yellow-600">Rs. {Number(selectedReceipt.loan_amount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Outstanding</p>
                          <p className="font-semibold text-red-600">Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Interest to Date</p>
                          <p className="font-semibold text-gray-900">Rs. {accruedInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-semibold text-gray-900">{formatDateOnly(selectedReceipt.due_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">{selectedReceipt.status}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Payment Amount (Rs.) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`Enter amount (min Rs. 500, max Rs. ${outstanding.toLocaleString('en-US', { minimumFractionDigits: 0 })})`}
                        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                          paymentAmount && !isAmountValid ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-yellow-500'
                        }`}
                      />
                      {paymentAmount && !isAmountValid && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Amount must be between Rs. 500 and Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setPaymentAmount(String(Math.min(500 + (parseFloat(paymentAmount) || 0), outstanding)))} className="px-3 py-1 text-xs font-semibold border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50">+500</button>
                        <button type="button" onClick={() => setPaymentAmount(String(Math.min(1000 + (parseFloat(paymentAmount) || 0), outstanding)))} className="px-3 py-1 text-xs font-semibold border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50">+1000</button>
                        <button type="button" onClick={() => setPaymentAmount(String(Math.min(5000 + (parseFloat(paymentAmount) || 0), outstanding)))} className="px-3 py-1 text-xs font-semibold border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50">+5000</button>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <p className="text-sm font-bold text-gray-900">Card Details</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Type <span className="text-red-500">*</span></label>
                        <select value={cardType} onChange={(e) => setCardType(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                          <option value="">Select card type</option>
                          <option value="debit">Debit Card</option>
                          <option value="credit">Credit Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number <span className="text-red-500">*</span></label>
                        <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="1234 5678 9012 3456" maxLength={16} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name on Card <span className="text-red-500">*</span></label>
                        <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry (MM/YY) <span className="text-red-500">*</span></label>
                          <input type="text" value={cardExpiry} onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4); setCardExpiry(val) }} placeholder="MM/YY" maxLength={5} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV <span className="text-red-500">*</span></label>
                          <input type="text" value={cardCVV} onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" maxLength={4} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-bold text-gray-900 mb-3">Payment Summary</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Outstanding:</span><span className="font-semibold text-gray-900">Rs. {outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Part Payment:</span><span className="font-semibold text-gray-900">Rs. {paymentAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                        <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-gray-900">Total Paying:</span>
                          <span className="font-bold text-yellow-600 text-lg">Rs. {paymentAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3 pt-4">
                      <button onClick={() => navigate('/customer')} className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">Back to Dashboard</button>
                      <button
                        onClick={handleProceedPayment}
                        disabled={!canProceed}
                        className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${canProceed ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        {submitting ? 'Processing...' : 'Proceed Payment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-12">Could not load receipt details</p>
                )
              ) : (
                <div className="flex justify-center items-center h-96">
                  <p className="text-center text-gray-600">Select a receipt to continue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
