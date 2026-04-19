import { useEffect, useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'

const formatDateOnly = (value) => (value ? String(value).slice(0, 10) : '-')

const AuctionList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    let cancelled = false
    async function fetchAuctionData() {
      setLoading(true)
      setError('')
      try {
        const res = await api.getAuctionReport({ status: 'ALL', overdueDays: 0 })
        const data = Array.isArray(res?.data?.data) ? res.data.data : []
        if (!cancelled) setRows(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load auction list')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAuctionData()
    return () => { cancelled = true }
  }, [])

  const filteredRows = rows.filter((row) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return String(row.receiptNo || '').toLowerCase().includes(q)
      || String(row.customerName || '').toLowerCase().includes(q)
      || String(row.branch || '').toLowerCase().includes(q)
  })

  const statusClass = (status) => {
    if (status === 'SOLD') return 'bg-green-100 text-green-800'
    if (status === 'SCHEDULED') return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Auction List</h1>
        <p className="mt-2 text-gray-600">Manage items scheduled for auction</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Search Ticket</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipt number or customer..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-yellow-500 bg-yellow-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Branch</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Loan Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Due Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Auction Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">Loading auction list...</td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No auction records found</td>
              </tr>
            ) : filteredRows.map((item) => (
              <tr key={item.receiptNo} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-semibold">{item.receiptNo}</td>
                <td className="px-4 py-3 text-gray-600">{item.customerName}</td>
                <td className="px-4 py-3 text-gray-600">{item.branch || '-'}</td>
                <td className="px-4 py-3 text-yellow-600 font-semibold">Rs. {Number(item.loanAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-gray-600">{formatDateOnly(item.dueDate)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.auctionStatus)}`}>
                    {item.auctionStatus || 'PENDING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ExpiredList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    let cancelled = false
    async function fetchExpiredData() {
      setLoading(true)
      setError('')
      try {
        const res = await api.getAuctionReport({ status: 'ALL', overdueDays: 1 })
        const data = Array.isArray(res?.data?.data) ? res.data.data : []
        if (!cancelled) setRows(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load expired tickets')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchExpiredData()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Expired Tickets List</h1>
        <p className="mt-2 text-gray-600">View and manage expired pawning tickets</p>
      </div>

      <div className="bg-red-50 p-5 rounded-lg border border-red-200 shadow-sm flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <p className="text-sm text-red-800"><strong>Alert:</strong> These tickets have exceeded their renewal period</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Original Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Expiry Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Days Expired</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">Loading expired tickets...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No expired tickets found</td>
                </tr>
              ) : rows.map((item) => (
                <tr key={`${item.receiptNo}-expired`} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-semibold">{item.receiptNo}</td>
                  <td className="px-4 py-3 text-gray-600">{item.customerName}</td>
                  <td className="px-4 py-3 text-yellow-600 font-semibold">Rs. {Number(item.loanAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateOnly(item.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                      {Number(item.daysOverdue || 0)} days
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
}

const TicketInquiry = () => {
  const [receiptNo, setReceiptNo] = useState('')
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDateOnly = (value) => (value ? String(value).slice(0, 10) : '-')
  const statusBadge = (status) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800'
    if (status === 'RENEWED') return 'bg-blue-100 text-blue-800'
    if (status === 'CLOSED' || status === 'REDEEMED') return 'bg-gray-100 text-gray-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setTicket(null)

    if (!receiptNo.trim()) {
      setError('Please enter a receipt number')
      return
    }

    setLoading(true)
    try {
      const res = await api.getTicketByReceipt(receiptNo.trim())
      if (res.success && res.data) {
        setTicket(res.data)
      } else {
        setError('Ticket not found')
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Ticket Inquiry</h1>
        <p className="mt-2 text-gray-600">Search and view ticket information</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Receipt Number</label>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            type="text"
            value={receiptNo}
            onChange={(e) => setReceiptNo(e.target.value)}
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
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {ticket && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Receipt No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Loan Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Issued Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-semibold">{ticket.receipt_no}</td>
                    <td className="px-4 py-3 text-gray-600">{ticket.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-yellow-600 font-semibold">Rs. {Number(ticket.loan_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateOnly(ticket.issue_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateOnly(ticket.due_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(ticket.status)}`}>
                        {ticket.status || '-'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-yellow-600 mb-4">Ticket Details</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-600">Receipt Number</p><p className="font-semibold text-gray-900">{ticket.receipt_no || '-'}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-600">Customer NIC</p><p className="font-semibold text-gray-900">{ticket.customer?.nic || '-'}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-600">Interest Rate</p><p className="font-semibold text-gray-900">{ticket.annual_interest_rate ?? '-'}% p.a.</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-600">Outstanding Principal</p><p className="font-semibold text-gray-900">Rs. {Number(ticket.payment_summary?.outstandingPrincipal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-600">Accrued Interest</p><p className="font-semibold text-gray-900">Rs. {Number(ticket.payment_summary?.accruedInterest || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-gray-600">Total Payable</p><p className="font-semibold text-gray-900">Rs. {Number(ticket.payment_summary?.totalPayable || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { AuctionList, ExpiredList, TicketInquiry }

export default function Tickets() {
  const location = useLocation()
  const isInquiryRoute = location.pathname.includes('/tickets/inquiry')

  const getTabFromPath = (path) => {
    if (path.includes('/tickets/inquiry')) return 'inquiry'
    if (path.includes('/tickets/expired')) return 'expired'
    return 'auction'
  }

  const [tab, setTab] = useState(() => getTabFromPath(location.pathname))

  useEffect(() => {
    setTab(getTabFromPath(location.pathname))
  }, [location.pathname])

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {!isInquiryRoute && (
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('auction')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              tab === 'auction'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Auction List
          </button>
          <button
            onClick={() => setTab('expired')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              tab === 'expired'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Expired List
          </button>
          <button
            onClick={() => setTab('inquiry')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              tab === 'inquiry'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Ticket Inquiry
          </button>
        </div>
      )}

      {/* Tab Content */}
      {isInquiryRoute ? (
        <TicketInquiry />
      ) : (
        <>
          {tab === 'auction' && <AuctionList />}
          {tab === 'expired' && <ExpiredList />}
          {tab === 'inquiry' && <TicketInquiry />}
        </>
      )}
    </div>
  )
}


