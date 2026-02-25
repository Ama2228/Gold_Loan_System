import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, UserCheck, Ticket, AlertCircle, Gavel } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const userRole = sessionStorage.getItem('userRole')

  // Role guard - only ADMIN can access
  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">Admin Dashboard is restricted to administrators only. You do not have permission to access this page.</p>
      </div>
    )
  }

  // Dummy stats data
  const stats = {
    totalBranches: 12,
    totalStaff: 48,
    totalCustomers: 3240,
    activeTickets: 1456,
    overdueTickets: 87,
    auctionCandidates: 23
  }

  // Dummy branch activity data
  const branchActivity = [
    { branchCode: '0001', branchName: 'Colombo Central', newTickets: 15, payments: 28, overdue: 8 },
    { branchCode: '0002', branchName: 'Kandy Branch', newTickets: 12, payments: 22, overdue: 5 },
    { branchCode: '0003', branchName: 'Galle Branch', newTickets: 8, payments: 18, overdue: 3 },
    { branchCode: '0004', branchName: 'Negombo Branch', newTickets: 10, payments: 15, overdue: 6 },
    { branchCode: '0005', branchName: 'Matara Branch', newTickets: 6, payments: 12, overdue: 2 }
  ]

  // Dummy overdue list
  const overdueList = [
    { receiptNo: '0001-25000001', branch: 'Colombo Central', dueDate: '2026-01-05', daysOverdue: 37 },
    { receiptNo: '0002-25000023', branch: 'Kandy Branch', dueDate: '2026-01-12', daysOverdue: 30 },
    { receiptNo: '0003-25000045', branch: 'Galle Branch', dueDate: '2026-01-20', daysOverdue: 22 },
    { receiptNo: '0001-25000067', branch: 'Colombo Central', dueDate: '2026-01-28', daysOverdue: 14 },
    { receiptNo: '0004-25000089', branch: 'Negombo Branch', dueDate: '2026-02-03', daysOverdue: 8 }
  ]

  // System alerts
  const alerts = {
    reversePawning: 8,
    smsFailed: 12,
    branchClosed: 1
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Head Office Control Panel</p>
        <div className="mt-3 inline-block">
          <span className="inline-block rounded-lg bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-800">
            Head Office (0001)
          </span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {/* Total Branches */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Branches</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBranches}</p>
          <p className="text-xs text-gray-500 mt-2">Total branches</p>
        </div>

        {/* Total Staff */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Staff</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
          <p className="text-xs text-gray-500 mt-2">Active staff</p>
        </div>

        {/* Total Customers */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Customers</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">Registered</p>
        </div>

        {/* Active Tickets */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Active Tickets</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
              <Ticket className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeTickets}</p>
          <p className="text-xs text-gray-500 mt-2">System-wide</p>
        </div>

        {/* Overdue Tickets */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Overdue</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.overdueTickets}</p>
          <p className="text-xs text-gray-500 mt-2">Need attention</p>
        </div>

        {/* Auction Candidates */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Auction</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Gavel className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.auctionCandidates}</p>
          <p className="text-xs text-gray-500 mt-2">Ready for auction</p>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 60% */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Branch Activity */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">Recent Branch Activity</h2>
              <p className="text-xs text-gray-600 mt-1">Today's summary</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Branch Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Branch Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">New Tickets</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Payments</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branchActivity.map((branch) => (
                    <tr key={branch.branchCode} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{branch.branchCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{branch.branchName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                          {branch.newTickets}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                          {branch.payments}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                          {branch.overdue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overdue Summary */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">Overdue Summary (Top 5)</h2>
            </div>
            <div className="p-6 space-y-3">
              {overdueList.map((item, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4 hover:border-yellow-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{item.receiptNo}</p>
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                      {item.daysOverdue}d overdue
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Branch: {item.branch}</span>
                    <span>•</span>
                    <span>Due: {item.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 40% */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => navigate('/admin/branches')}
                className="w-full rounded-lg bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
              >
                → Add New Branch
              </button>
              <button
                onClick={() => navigate('/admin/staff')}
                className="w-full rounded-lg bg-green-50 px-4 py-3 text-left text-sm font-semibold text-green-800 hover:bg-green-100 transition-colors"
              >
                → Add Staff Member
              </button>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full rounded-lg bg-purple-50 px-4 py-3 text-left text-sm font-semibold text-purple-800 hover:bg-purple-100 transition-colors"
              >
                → Update Interest Rates
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full rounded-lg bg-yellow-50 px-4 py-3 text-left text-sm font-semibold text-yellow-800 hover:bg-yellow-100 transition-colors"
              >
                → View Reports
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">System Alerts</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full rounded-lg border border-orange-200 bg-orange-50 p-4 text-left hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-orange-900">Pending Reverse Pawning</p>
                  <span className="inline-block rounded-full bg-orange-200 px-3 py-1 text-xs font-bold text-orange-900">
                    {alerts.reversePawning}
                  </span>
                </div>
                <p className="text-xs text-orange-700">Manager requests awaiting review</p>
              </button>

              <button className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-left hover:border-red-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-red-900">SMS Failed Logs</p>
                  <span className="inline-block rounded-full bg-red-200 px-3 py-1 text-xs font-bold text-red-900">
                    {alerts.smsFailed}
                  </span>
                </div>
                <p className="text-xs text-red-700">Failed message deliveries</p>
              </button>

              <button className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-left hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900">Branch Closed Today</p>
                  <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-900">
                    {alerts.branchClosed}
                  </span>
                </div>
                <p className="text-xs text-gray-700">Branches marked closed for holiday</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
