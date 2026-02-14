import { AlertCircle } from 'lucide-react'

export default function MonthlyReport() {
  const userRole = sessionStorage.getItem('userRole')

  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">This page is restricted to administrators only.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monthly Report</h1>
        <p className="mt-2 text-sm text-gray-600">View monthly business performance and financial summary</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder Content */}
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-lg border border-orange-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">Monthly Report</h3>
          <p className="text-orange-700">This page will display monthly reports including revenue, expenses, and performance metrics.</p>
        </div>
      </div>
    </div>
  )
}
