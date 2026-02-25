import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import api from '../../services/api'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debouncedValue
}

export default function CustomerInquiry() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [inquiryData, setInquiryData] = useState(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(searchTerm.trim(), 300)

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([])
      return
    }
    setLoadingSearch(true)
    setError(null)
    api.searchStaffCustomers(debouncedSearch)
      .then(res => setSearchResults(res.data || []))
      .catch(err => {
        setError(err.message || 'Search failed')
        setSearchResults([])
      })
      .finally(() => setLoadingSearch(false))
  }, [debouncedSearch])

  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer)
    setInquiryData(null)
    setError(null)
    setLoadingDetail(true)
    api.getStaffCustomerInquiry(customer.customer_id)
      .then(res => setInquiryData(res.data))
      .catch(err => {
        setError(err.message || 'Failed to load customer details')
        setInquiryData(null)
      })
      .finally(() => setLoadingDetail(false))
  }, [])

  const c = inquiryData?.customer
  const customerDetail = c ? {
    nic: c.nic,
    name: c.full_name,
    type: c.status || 'Active',
    address: c.address_line1,
    addressLine2: c.address_line2,
    city: c.city_name,
    phone1: c.phone,
    phone2: null,
    email: c.email,
    registeredDate: c.registered_date,
    occupation: c.occupation_name,
    branch: c.registered_branch
  } : null

  const activeTicketsCount = inquiryData?.activeTicketsCount ?? 0
  const totalLoans = inquiryData?.totalLoans ?? 0
  const lastTransactionDate = inquiryData?.lastTransactionDate
  const recentTransactions = inquiryData?.recentTransactions ?? []
  const activeTickets = inquiryData?.activeTickets ?? []

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Customer Inquiry</h1>
        <p className="mt-2 text-gray-600">Search and view customer information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Search & List */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by NIC or name (min 2 chars)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loadingSearch && searchTerm.length >= 2 && (
                <p className="text-sm text-gray-500 py-2">Searching...</p>
              )}
              {!loadingSearch && searchTerm.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-gray-500 py-2">No customers found</p>
              )}
              {searchResults.map(customer => (
                <button
                  key={customer.customer_id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCustomer?.customer_id === customer.customer_id
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white hover:bg-yellow-50 text-gray-900'
                  }`}
                >
                  <p className="font-semibold">{customer.full_name}</p>
                  <p className="text-xs opacity-75">{customer.nic}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
          )}
          {loadingDetail && selectedCustomer && (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600">Loading customer details...</div>
          )}
          {!loadingDetail && !customerDetail && selectedCustomer && (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600">No details available</div>
          )}
          {!loadingDetail && !selectedCustomer && (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              Search for a customer and select one to view details
            </div>
          )}
          {!loadingDetail && customerDetail && (
          <>
          {/* Customer Info Card */}
          <div className="bg-gradient-to-r from-yellow-50 to-blue-50 p-8 rounded-lg border-l-4 border-yellow-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{customerDetail.name}</h2>
            
            <div className="grid gap-6 sm:grid-cols-2 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-600">NIC</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.nic}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Customer Type</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.type}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Phone</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.phone1 || '-'}</p>
              </div>
              {customerDetail.phone2 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Phone 2</p>
                  <p className="text-lg font-semibold text-gray-900">{customerDetail.phone2}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Registered Date</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.registeredDate}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Address</p>
                <p className="text-lg font-semibold text-gray-900">
                  {[customerDetail.address, customerDetail.addressLine2].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">City</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.city || '-'}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3 bg-white p-4 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{activeTicketsCount}</p>
                <p className="text-sm text-gray-600">Active Tickets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">Rs. {Number(totalLoans).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-600">Total Loans</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-600">
                  {lastTransactionDate ? String(lastTransactionDate).slice(0, 10) : '—'}
                </p>
                <p className="text-sm text-gray-600">Last Transaction</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-yellow-500">
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No transactions yet</td></tr>
                  ) : (
                    recentTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b border-gray-200 hover:bg-white">
                        <td className="px-4 py-3 text-gray-900 font-medium">{transaction.type}</td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">Rs. {Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-gray-600">{String(transaction.date).slice(0, 10)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Tickets */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Tickets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-yellow-500">
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Receipt No</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Loan Amount</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Issue Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Due Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTickets.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No active tickets</td></tr>
                  ) : (
                    activeTickets.map(ticket => (
                      <tr key={ticket.ticketId} className="border-b border-gray-200 hover:bg-white">
                        <td className="px-4 py-3 text-gray-900 font-medium">{ticket.receiptNo}</td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">Rs. {Number(ticket.loanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-gray-600">{String(ticket.issueDate).slice(0, 10)}</td>
                        <td className="px-4 py-3 text-gray-600">{String(ticket.dueDate).slice(0, 10)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            ticket.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800'
                              : ticket.status === 'RENEWED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}


