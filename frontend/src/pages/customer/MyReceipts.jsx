import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LogOut } from 'lucide-react'

export default function MyReceipts() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Dummy data for active receipts
  const receipts = [
    {
      id: '0001-25000001',
      branchCode: 'COL-001',
      loanAmount: 700000,
      interestRate: 15,
      issueDate: '2025-08-05',
      dueDate: '2026-02-05',
      status: 'Active',
      articles: [
        { type: 'Gold Chain', karat: 22, weight: 45.5, value: 450000 },
        { type: 'Gold Ring', karat: 18, weight: 8.2, value: 250000 }
      ],
      payments: [
        { date: '2026-02-08', type: 'Part', amount: 15000, method: 'Cash' },
        { date: '2026-01-15', type: 'Part', amount: 10000, method: 'Card' }
      ]
    },
    {
      id: '0002-25000012',
      branchCode: 'KDY-002',
      loanAmount: 450000,
      interestRate: 15,
      issueDate: '2025-07-26',
      dueDate: '2026-01-26',
      status: 'Overdue',
      articles: [
        { type: 'Gold Bangle', karat: 22, weight: 32.0, value: 320000 },
        { type: 'Gold Earrings', karat: 18, weight: 5.0, value: 130000 }
      ],
      payments: [
        { date: '2025-12-20', type: 'Part', amount: 5000, method: 'Cash' }
      ]
    },
    {
      id: '0003-25000023',
      branchCode: 'COL-001',
      loanAmount: 550000,
      interestRate: 15,
      issueDate: '2025-09-10',
      dueDate: '2026-03-10',
      status: 'Active',
      articles: [
        { type: 'Gold Necklace', karat: 22, weight: 55.0, value: 550000 }
      ],
      payments: [
        { date: '2026-02-05', type: 'Interest', amount: 6875, method: 'Bank Transfer' },
        { date: '2026-01-05', type: 'Interest', amount: 6875, method: 'Bank Transfer' }
      ]
    }
  ]

  // Filter active receipts
  const activeReceipts = receipts.filter(r => r.status === 'Active')

  // Filter by search query
  const filteredReceipts = activeReceipts.filter(r =>
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected receipt details
  const selectedReceipt = receipts.find(r => r.id === selectedReceiptId)

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
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50 bg-yellow-700/50">
                My Receipts
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
                  {filteredReceipts.length > 0 ? (
                    filteredReceipts.map((receipt) => (
                      <button
                        key={receipt.id}
                        onClick={() => setSelectedReceiptId(receipt.id)}
                        className={`w-full text-left rounded-lg p-4 border-2 transition-all ${
                          selectedReceiptId === receipt.id
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-gray-900">{receipt.id}</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            receipt.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {receipt.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Amount</p>
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

            {/* Right Column: Receipt Details */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              {selectedReceipt ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Receipt Details</h3>
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Receipt No</p>
                          <p className="text-lg font-bold text-gray-900">{selectedReceipt.id}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Branch Code</p>
                          <p className="text-lg font-bold text-gray-900">{selectedReceipt.branchCode}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Loan Amount</p>
                          <p className="text-lg font-bold text-yellow-600">Rs. {selectedReceipt.loanAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Interest Rate</p>
                          <p className="text-lg font-bold text-gray-900">{selectedReceipt.interestRate}% p.a.</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Issue Date</p>
                          <p className="text-lg font-bold text-gray-900">{selectedReceipt.issueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Due Date</p>
                          <p className="text-lg font-bold text-gray-900">{selectedReceipt.dueDate}</p>
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
                            <th className="text-left py-2 px-3 font-bold text-gray-900">Karat</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-900">Net Weight (g)</th>
                            <th className="text-right py-2 px-3 font-bold text-gray-900">Value (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReceipt.articles.map((article, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-3 text-gray-900">{article.type}</td>
                              <td className="py-3 px-3 text-gray-900">{article.karat}</td>
                              <td className="py-3 px-3 text-right text-gray-900">{article.weight}</td>
                              <td className="py-3 px-3 text-right font-semibold text-gray-900">
                                {article.value.toLocaleString()}
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
                          {selectedReceipt.payments.map((payment, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-3 text-gray-900">{payment.date}</td>
                              <td className="py-3 px-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                  payment.type === 'Part'
                                    ? 'bg-blue-100 text-blue-700'
                                    : payment.type === 'Interest'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {payment.type}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-gray-900">
                                {payment.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-gray-600">{payment.method}</td>
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
