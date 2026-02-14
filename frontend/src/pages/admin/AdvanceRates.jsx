import { AlertCircle } from 'lucide-react'

export default function AdvanceRates() {
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
        <h1 className="text-3xl font-bold text-gray-900">Karat Advance Rates</h1>
        <p className="mt-2 text-sm text-gray-600">Manage gold advance rates by karat (18K, 20K, 22K)</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder Content */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Karat Advance Rates Management</h3>
          <p className="text-yellow-700">This page will allow you to manage and update gold advance rates for different karats.</p>
        </div>
      </div>
    </div>
  )
}
