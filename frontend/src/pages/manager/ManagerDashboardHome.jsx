export default function ManagerDashboardHome() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Smart Gold Manager Portal</p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
          <p className="text-sm font-semibold text-blue-600 mb-2">Active Tickets</p>
          <p className="text-3xl font-bold text-blue-900">145</p>
          <p className="text-xs text-blue-600 mt-2">Branch total</p>
        </div>

        <div className="rounded-lg bg-red-50 border border-red-200 p-6">
          <p className="text-sm font-semibold text-red-600 mb-2">Overdue Tickets</p>
          <p className="text-3xl font-bold text-red-900">12</p>
          <p className="text-xs text-red-600 mt-2">Urgent action needed</p>
        </div>

        <div className="rounded-lg bg-orange-50 border border-orange-200 p-6">
          <p className="text-sm font-semibold text-orange-600 mb-2">Due Today</p>
          <p className="text-3xl font-bold text-orange-900">5</p>
          <p className="text-xs text-orange-600 mt-2">Requires attention</p>
        </div>

        <div className="rounded-lg bg-purple-50 border border-purple-200 p-6">
          <p className="text-sm font-semibold text-purple-600 mb-2">Reverse Pawning</p>
          <p className="text-3xl font-bold text-purple-900">8</p>
          <p className="text-xs text-purple-600 mt-2">Pending requests</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
        <h3 className="font-bold text-yellow-900 mb-2">Welcome, Manager!</h3>
        <p className="text-sm text-yellow-800">
          Use the navigation menu above to access staff functions and manager-only features like Reverse Pawning.
          You have full access to manage branch operations, review requests, and oversee all transactions.
        </p>
      </div>
    </div>
  )
}
