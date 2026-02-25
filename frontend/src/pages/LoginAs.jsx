import { useNavigate, Link } from 'react-router-dom'
import { Users, Shield, LogOut } from 'lucide-react'
import apiService from '../services/api'

export default function LoginAs() {
  const navigate = useNavigate()
  const userRole = sessionStorage.getItem('userRole')
  const userNic = sessionStorage.getItem('userNIC')

  const handleStaffLogin = () => {
    // If user is a MANAGER, route to manager dashboard
    if (userRole === 'MANAGER') {
      navigate('/manager/dashboard')
    } else {
      // Redirect to staff dashboard
      navigate('/staff/transactions/new')
    }
  }

  const handleCustomerLogin = () => {
    // Redirect to customer dashboard
    navigate('/customer')
  }

  const handleLogout = () => {
    // Clear session and tokens, go back to login
    apiService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 font-black text-gray-900 shadow-2xl text-2xl">
              SG
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-white">Smart</span>
            <span className="text-yellow-400"> Gold</span>
          </h1>
          <p className="mt-2 text-gray-300">Select Your Portal</p>
          <p className="mt-1 text-sm text-gray-400">Choose how you'd like to proceed</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Staff Portal Card */}
          <button
            onClick={handleStaffLogin}
            className="group rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 shadow-2xl transition-all hover:shadow-2xl hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 group-hover:bg-blue-400/30 transition-colors">
                <Shield className="h-8 w-8 text-blue-200" />
              </div>
              <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                Staff
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Staff Portal</h2>
            <p className="text-blue-100 text-sm mb-4">
              Access the staff dashboard to manage pawning transactions, customers, and branch operations.
            </p>
            <div className="flex items-center gap-2 text-blue-200 text-sm font-semibold group-hover:gap-3 transition-all">
              <span>Continue</span>
              <span>→</span>
            </div>
          </button>

          {/* Customer Portal Card */}
          <button
            onClick={handleCustomerLogin}
            className="group rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-8 shadow-2xl transition-all hover:shadow-2xl hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-400/20 group-hover:bg-yellow-300/30 transition-colors">
                <Users className="h-8 w-8 text-yellow-100" />
              </div>
              <span className="inline-block rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-yellow-100">
                Customer
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Portal</h2>
            <p className="text-gray-800 text-sm mb-4">
              Access your loan account, view transaction history, and manage your gold pledges.
            </p>
            <div className="flex items-center gap-2 text-gray-800 text-sm font-semibold group-hover:gap-3 transition-all">
              <span>Continue</span>
              <span>→</span>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 border border-white/20 mb-6">
          <p className="text-white text-center">
            <strong>Note:</strong> This portal allows staff members to switch between different roles. 
            Ensure you're accessing the correct portal for your intended operations.
          </p>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-600 px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Logged in as: <span className="text-yellow-300 font-semibold">{userNic}</span> ({userRole})</p>
        </div>
      </div>
    </div>
  )
}


