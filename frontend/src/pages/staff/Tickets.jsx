import { useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'

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

const TicketInquiry = () => (
  <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
    <div className="border-b-2 border-yellow-500 pb-4">
      <h1 className="text-3xl font-bold text-yellow-600">Ticket Inquiry</h1>
      <p className="mt-2 text-gray-600">Search and view ticket information</p>
    </div>

    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Search Ticket or Customer</label>
      <input
        type="text"
        placeholder="Search ticket number or customer name..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
    </div>

    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-yellow-500 bg-yellow-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Ticket #</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Loan Amount</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Created Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Expiry Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 'TCK100', customer: 'Mr. Bandara', amount: '₨. 700,000', created: '2026-01-01', expiry: '2026-07-01', status: 'Active' },
            { id: 'TCK101', customer: 'Ms. Silva', amount: '₨. 450,000', created: '2026-01-05', expiry: '2026-07-05', status: 'Active' },
            { id: 'TCK102', customer: 'Mr. Kumar', amount: '₨. 600,000', created: '2025-12-01', expiry: '2026-06-01', status: 'Renewed' },
            { id: 'TCK103', customer: 'Mr. Jayasuriya', amount: '₨. 500,000', created: '2025-11-01', expiry: '2026-05-01', status: 'Redeemed' }
          ].map(item => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-semibold">{item.id}</td>
              <td className="px-4 py-3 text-gray-600">{item.customer}</td>
              <td className="px-4 py-3 text-yellow-600 font-semibold">{item.amount}</td>
              <td className="px-4 py-3 text-gray-600">{item.created}</td>
              <td className="px-4 py-3 text-gray-600">{item.expiry}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status === 'Active' ? 'bg-green-100 text-green-800' :
                  item.status === 'Renewed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
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
  </div>
)

export { AuctionList, ExpiredList, TicketInquiry }

export default function Tickets() {
  const [tab, setTab] = useState('auction')

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Tabs */}
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

      {/* Tab Content */}
      {tab === 'auction' && <AuctionList />}
      {tab === 'expired' && <ExpiredList />}
      {tab === 'inquiry' && <TicketInquiry />}
    </div>
  )
}


