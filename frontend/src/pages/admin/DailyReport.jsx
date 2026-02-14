import { AlertCircle } from 'lucide-react'

export default function DailyReport() {
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
        <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
        <p className="mt-2 text-sm text-gray-600">View daily transaction and business metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder Content */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Daily Report</h3>
          <p className="text-blue-700">This page will display daily reports including transactions, payments, and branch statistics.</p>
        </div>
      </div>
    </div>
  )
}
