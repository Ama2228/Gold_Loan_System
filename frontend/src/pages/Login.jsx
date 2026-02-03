import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User } from 'lucide-react'

// Hardcoded staff credentials for testing
const STAFF_CREDENTIALS = {
  nic: '199978901234',
  password: 'Staff@123'
}

export default function Login() {
  const navigate = useNavigate()
  const [nic, setNic] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!nic || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    // Simulate login delay
    setTimeout(() => {
      // Validate against hardcoded credentials
      if (nic === STAFF_CREDENTIALS.nic && password === STAFF_CREDENTIALS.password) {
        // Redirect to role selection portal
        navigate('/login-as')
      } else {
        setError('Invalid NIC or password. For testing, use NIC: 199978901234, Password: Staff@123')
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 font-black text-gray-900 shadow-2xl text-2xl">
              SG
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-white">Smart</span>
            <span className="text-yellow-400"> Gold</span>
          </h1>
          <p className="mt-2 text-gray-300">Staff Login</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIC Field */}
            <div>
              <label htmlFor="nic" className="block text-sm font-semibold text-gray-900 mb-2">
                NIC Number
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="nic"
                  type="text"
                  placeholder="e.g., 199978901234"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Your National Identity Card number</p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="#" className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-black transition-all hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">Or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              New staff member?{' '}
              <Link to="/register" className="font-semibold text-yellow-600 hover:text-yellow-700">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg bg-yellow-500/10 p-4 border border-yellow-500/20 backdrop-blur">
          <p className="text-sm text-yellow-50">
            <strong>Test Credentials:</strong><br />
            NIC: 199978901234<br />
            Password: Staff@123
          </p>
        </div>
      </div>
    </div>
  )
}



