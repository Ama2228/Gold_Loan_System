import { useEffect, useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'

const AuctionList = () => (
  <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
    <div className="border-b-2 border-yellow-500 pb-4">
      <h1 className="text-3xl font-bold text-yellow-600">Auction List</h1>
      <p className="mt-2 text-gray-600">Manage items scheduled for auction</p>
    </div>

    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Search Ticket</label>
      <input
        type="text"
        placeholder="Search ticket number..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-yellow-500 bg-yellow-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Ticket #</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Auction Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 'TCK001', customer: 'Mr. Bandara', amount: '₨. 700,000', date: '2026-02-15', status: 'Pending' },
            { id: 'TCK002', customer: 'Ms. Silva', amount: '₨. 450,000', date: '2026-02-10', status: 'Approved' },
            { id: 'TCK003', customer: 'Mr. Kumar', amount: '₨. 600,000', date: '2026-02-05', status: 'Sold' }
          ].map(item => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-semibold">{item.id}</td>
              <td className="px-4 py-3 text-gray-600">{item.customer}</td>
              <td className="px-4 py-3 text-yellow-600 font-semibold">{item.amount}</td>
              <td className="px-4 py-3 text-gray-600">{item.date}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status === 'Sold' ? 'bg-green-100 text-green-800' :
                  item.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button className="text-yellow-600 hover:text-yellow-700 font-semibold">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const ExpiredList = () => (
  <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
    <div className="border-b-2 border-yellow-500 pb-4">
      <h1 className="text-3xl font-bold text-yellow-600">Expired Tickets List</h1>
      <p className="mt-2 text-gray-600">View and manage expired pawning tickets</p>
    </div>

    <div className="bg-red-50 p-5 rounded-lg border border-red-200 shadow-sm flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <p className="text-sm text-red-800"><strong>Alert:</strong> These tickets have exceeded their renewal period</p>
    </div>

    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-yellow-500 bg-yellow-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Ticket #</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Original Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Expiry Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Days Expired</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'TCK010', customer: 'Mr. Jayasuriya', amount: '₨. 500,000', date: '2026-01-20', daysExpired: 11 },
              { id: 'TCK011', customer: 'Ms. Perera', amount: '₨. 400,000', date: '2026-01-15', daysExpired: 16 },
              { id: 'TCK012', customer: 'Mr. Dissanayake', amount: '₨. 550,000', date: '2026-01-10', daysExpired: 21 }
            ].map(item => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-semibold">{item.id}</td>
                <td className="px-4 py-3 text-gray-600">{item.customer}</td>
                <td className="px-4 py-3 text-yellow-600 font-semibold">{item.amount}</td>
                <td className="px-4 py-3 text-gray-600">{item.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                    {item.daysExpired} days
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button className="text-yellow-600 hover:text-yellow-700 font-semibold">Renew</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  </div>
)

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


