import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import api from '../../services/api'
import CustomerHeader from '../../components/CustomerHeader'

export default function MyReceipts() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReceiptNo, setSelectedReceiptNo] = useState(location.state?.selectedReceiptNo ?? null)
  const [receipts, setReceipts] = useState([])
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.getCustomerReceipts()
        setReceipts(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load receipts')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedReceiptNo) {
      setSelectedDetail(null)
      return
    }
    setDetailLoading(true)
    api.getCustomerReceiptDetail(selectedReceiptNo)
      .then(res => {
        if (res.success && res.data) setSelectedDetail(res.data)
        else setSelectedDetail(null)
      })
      .catch(() => setSelectedDetail(null))
      .finally(() => setDetailLoading(false))
  }, [selectedReceiptNo])

  const filteredReceipts = receipts.filter(r =>
    String(r.receipt_no || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentInterestForToday = Number(
    selectedDetail?.current_interest_for_today ??
    selectedDetail?.payment_summary?.accruedInterest ??
    0
  )

  const interestAsOfDate = selectedDetail?.interest_as_of_date
    ? String(selectedDetail.interest_as_of_date).slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerHeader />

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8 mb-8">
            <div className="border-b-2 border-yellow-500 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-yellow-600">My Receipts</h2>
              <p className="text-gray-600 mt-2">
                View and manage your active pawning receipts
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            {/* Left Column: Active Receipts List */}
            <div className="space-y-4">
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Receipts</h3>

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
                  {loading ? (
                    <p className="text-sm text-gray-600 text-center py-4">Loading receipts...</p>
                  ) : error ? (
                    <p className="text-sm text-red-600 text-center py-4">{error}</p>
                  ) : filteredReceipts.length > 0 ? (
                    filteredReceipts.map((receipt) => (
                      <button
                        key={receipt.ticket_id || receipt.receipt_no}
                        onClick={() => setSelectedReceiptNo(receipt.receipt_no)}
                        className={`w-full text-left rounded-lg p-4 border-2 transition-all ${
                          selectedReceiptNo === receipt.receipt_no
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-gray-900">{receipt.receipt_no}</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            receipt.status === 'ACTIVE' || receipt.status === 'RENEWED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {receipt.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-semibold text-gray-900">Rs. {Number(receipt.loan_amount).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-semibold text-gray-900">{String(receipt.due_date).slice(0, 10)}</p>
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

            {/* Right Column: Receipt Details */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center h-96">
                  <p className="text-gray-600">Loading receipt details...</p>
                </div>
              ) : selectedDetail?.receipt ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Receipt Details</h3>
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Receipt No</p>
                          <p className="text-lg font-bold text-gray-900">{selectedDetail.receipt.receipt_no}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Branch Code</p>
                          <p className="text-lg font-bold text-gray-900">{selectedDetail.receipt.branch_code || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Loan Amount</p>
                          <p className="text-lg font-bold text-yellow-600">Rs. {Number(selectedDetail.receipt.loan_amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Interest Rate</p>
                          <p className="text-lg font-bold text-gray-900">{selectedDetail.receipt.annual_interest_rate || 0}% p.a.</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Issue Date</p>
                          <p className="text-lg font-bold text-gray-900">{String(selectedDetail.receipt.issue_date).slice(0, 10)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Due Date</p>
                          <p className="text-lg font-bold text-gray-900">{String(selectedDetail.receipt.due_date).slice(0, 10)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Current Interest for Today</p>
                          <p className="text-lg font-bold text-yellow-600">
                            Rs. {currentInterestForToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">As of {interestAsOfDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gold Articles Table */}
                  <div>
                    <h4 className="text-md font-bold text-gray-900 mb-3">Gold Articles</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-yellow-500">
                            <th className="text-left py-2 px-3 font-bold text-gray-900">Item Type</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-900">Net Weight (g)</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-900">Value (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedDetail.goldArticles || []).map((article, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-3 text-gray-900">{article.article_description || article.item_type}</td>
                              <td className="py-3 px-3 text-right text-gray-900">{article.weight_grams || article.net_weight_grams}</td>
                              <td className="py-3 px-3 text-right font-semibold text-gray-900">
                                {(article.assessed_value ?? article.appraised_value ?? 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Payments Table */}
                  <div>
                    <h4 className="text-md font-bold text-gray-900 mb-3">Recent Payments</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-yellow-500">
                            <th className="text-left py-2 px-3 font-bold text-gray-900">Date</th>
                            <th className="text-left py-2 px-3 font-bold text-gray-900">Type</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-900">Amount (Rs.)</th>
                            <th className="text-left py-2 px-3 font-bold text-gray-900">Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedDetail.payments || []).map((payment, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-3 text-gray-900">{String(payment.payment_date).slice(0, 10)}</td>
                              <td className="py-3 px-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                  payment.payment_type === 'PART'
                                    ? 'bg-blue-100 text-blue-700'
                                    : payment.payment_type === 'INTEREST'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {payment.payment_type}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-gray-900">
                                {Number(payment.payment_amount).toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-gray-600">{payment.payment_method}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-center text-gray-600">
                    <span className="text-4xl mb-2 block">📋</span>
                    Select a receipt to view details
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
