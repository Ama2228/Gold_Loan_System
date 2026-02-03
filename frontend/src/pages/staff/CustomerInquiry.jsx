import { useState } from 'react'
import { Search } from 'lucide-react'

export default function CustomerInquiry() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const customers = [
    {
      id: 1,
      nic: '20012345678',
      name: 'Mr. TMHN Bandara',
      type: 'Normal',
      phone: '077 123 4567',
      activeTickets: 3,
      totalLoans: '₨. 700,000.00'
    },
    {
      id: 2,
      nic: '20019876543',
      name: 'Ms. Lakshmi Silva',
      type: 'VIP',
      phone: '076 987 6543',
      activeTickets: 1,
      totalLoans: '₨. 450,000.00'
    },
    {
      id: 3,
      nic: '20015555555',
      name: 'Mr. Ravi Kumar',
      type: 'Regular',
      phone: '077 555 5555',
      activeTickets: 2,
      totalLoans: '₨. 600,000.00'
    }
  ]

  const customerDetail = selectedCustomer || {
    nic: '20012345678',
    name: 'Mr. TMHN Bandara',
    type: 'Normal',
    address: 'No. 25, Lake Road',
    city: 'Kandy',
    phone1: '077 123 4567',
    phone2: '076 987 6543',
    email: 'tmhn@example.com',
    registeredDate: '2023-01-15',
    activeTickets: 3,
    totalLoans: '₨. 700,000.00',
    lastTransaction: '2026-01-25'
  }

  const recentTransactions = [
    { id: 1, type: 'Renewal', amount: '₨. 700,000', date: '2026-01-25', status: 'Completed' },
    { id: 2, type: 'Part Payment', amount: '₨. 100,000', date: '2026-01-20', status: 'Completed' },
    { id: 3, type: 'New Ticket', amount: '₨. 600,000', date: '2026-01-10', status: 'Completed' }
  ]

  const filteredCustomers = customers.filter(c =>
    c.nic.includes(searchTerm) || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Customer Inquiry</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left - Search & List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search NIC or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white hover:bg-yellow-50 text-gray-900'
                  }`}
                >
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-xs opacity-75">{customer.nic}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Customer Details */}
        <div className="lg:col-span-2 space-y-6">
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
                <p className="text-sm font-semibold text-gray-600">Phone 1</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.phone1}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Phone 2</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.phone2}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Registered Date</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.registeredDate}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Address</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.address}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">City</p>
                <p className="text-lg font-semibold text-gray-900">{customerDetail.city}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3 bg-white p-4 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{customerDetail.activeTickets}</p>
                <p className="text-sm text-gray-600">Active Tickets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{customerDetail.totalLoans}</p>
                <p className="text-sm text-gray-600">Total Loans</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-600">{customerDetail.lastTransaction}</p>
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
                  {recentTransactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-200 hover:bg-white">
                      <td className="px-4 py-3 text-gray-900 font-medium">{transaction.type}</td>
                      <td className="px-4 py-3 text-yellow-600 font-semibold">{transaction.amount}</td>
                      <td className="px-4 py-3 text-gray-600">{transaction.date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


