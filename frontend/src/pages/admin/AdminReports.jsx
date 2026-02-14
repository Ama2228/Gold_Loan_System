import { AlertCircle } from 'lucide-react'

export default function AdminReports() {
  const userRole = sessionStorage.getItem('userRole')

  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">Reports are restricted to administrators only.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Reports</h1>
        <p className="text-gray-600 mt-2">View system reports and analytics</p>
      </div>

      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-8 text-center">
        <p className="text-yellow-900 font-semibold">Reports feature coming soon...</p>
        <p className="text-sm text-yellow-700 mt-2">Daily, monthly, and auction reports will be available here</p>
      </div>
    </div>
  )
}
