import { AlertCircle } from 'lucide-react'

export default function AuctionReport() {
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
        <h1 className="text-3xl font-bold text-gray-900">Auction List</h1>
        <p className="mt-2 text-sm text-gray-600">View items eligible for auction and auction status</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder Content */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Auction List</h3>
          <p className="text-red-700">This page will display items eligible for auction and manage auction schedules.</p>
        </div>
      </div>
    </div>
  )
}
