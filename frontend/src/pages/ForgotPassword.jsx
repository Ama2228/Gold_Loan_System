import { useState } from 'react'
import { Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import api from '../services/api'

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export default function ForgotPassword() {
  const [step, setStep] = useState('nic') // nic, verify, reset, success
  const [nic, setNic] = useState('')
  const [registeredPhone, setRegisteredPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock customer data - in real app, this would come from backend
  const mockCustomers = {
    '199978901234': { name: 'Mr. TMHN Bandara', phone: '0712345678' },
    '200012345678': { name: 'Ms. Lakshmi Silva', phone: '0776543210' },
    '200015555555': { name: 'Mr. Ravi Kumar', phone: '0777777777' }
  }

  const handleNicSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!nic) {
      setError('Please enter your NIC number')
      return
    }

    // NIC validation (12 digits)
    const nicRegex = /^[0-9]{12}$/
    if (!nicRegex.test(nic.replace(/\s/g, ''))) {
      setError('Please enter a valid 12-digit NIC number')
      return
    }

    // Check if NIC exists in system
    if (!mockCustomers[nic]) {
      setError('NIC number not found in our system')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const generatedOtp = generateOtp()
      api.logOtp('FORGOT_PASSWORD', generatedOtp, mockCustomers[nic].phone)
      setSentOtp(generatedOtp)
      // Set registered phone number
      setRegisteredPhone(mockCustomers[nic].phone)
      setStep('verify')
    }, 1000)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (otp === sentOtp) {
        setStep('reset')
      } else {
        setError('Invalid OTP')
      }
    }, 1000)
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword) {
      setError('Please enter a new password')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/BOC%20logo.jpg"
            alt="BOC logo"
            className="h-12 w-12 rounded-lg bg-black object-cover shadow-md mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Smart Gold</h1>
          <p className="text-sm text-gray-600 mt-1">Password Recovery</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 space-y-6">
        {/* Step 1: NIC Entry */}
          {step === 'nic' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Enter your NIC number and we'll send a verification code to your registered mobile number.
                </p>
              </div>

              <form onSubmit={handleNicSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIC Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={nic}
                      onChange={(e) => setNic(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="199978901234"
                      maxLength="12"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter your 12-digit National Identity Card number</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Searching...' : 'Send Verification Code'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-800">
                  For demo: Use NIC <strong>199978901234</strong>
                </p>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'verify' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
                <p className="text-sm text-gray-600 mt-2">
                  We've sent a 6-digit code to <strong>{registeredPhone}</strong> (registered mobile)
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-center text-2xl font-semibold tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to your email</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('nic')}
                  className="w-full text-yellow-600 hover:text-yellow-700 font-semibold py-2"
                >
                  Back to NIC Entry
                </button>
              </form>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-800">
                  Didn't receive the code? Check your spam folder or request a new code.
                </p>
              </div>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Enter a new password for your account. Make it strong and secure.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    At least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="w-full text-yellow-600 hover:text-yellow-700 font-semibold py-2"
                >
                  Back
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>
              </div>

              <a
                href="/login"
                className="block w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-colors text-center"
              >
                Go to Login
              </a>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password? <a href="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">Sign In</a>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help? <a href="#" className="text-yellow-600 hover:text-yellow-700 font-semibold">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  )
}
