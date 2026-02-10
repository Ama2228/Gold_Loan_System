import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, AlertCircle, Clock } from 'lucide-react'

// Helper function to generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Helper function to check if OTP is expired
function isOtpExpired(expiresAt) {
  if (!expiresAt) return true
  return new Date() > new Date(expiresAt)
}

// Format time for countdown
function formatCountdown(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Profile() {
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Profile data
  const [profile, setProfile] = useState({
    fullName: 'Customer Name',
    nic: '199512345678',
    mobile: '+94 77 123 4567',
    branch: 'Colombo Branch',
    address: 'No. 10, Main Street, Rajagiriya, Colombo 07',
    status: 'Active'
  })

  // Mobile change state
  const [newMobileNumber, setNewMobileNumber] = useState('')
  const [mobileOtpStep, setMobileOtpStep] = useState('input') // 'input', 'verify'
  const [mobileOtpCode, setMobileOtpCode] = useState('')
  const [mobileOtpVerified, setMobileOtpVerified] = useState(null)
  const [mobileOtpData, setMobileOtpData] = useState({ code: '', expiresAt: null, resendCount: 0 })
  const [mobileCountdown, setMobileCountdown] = useState(0)
  const [mobileErrors, setMobileErrors] = useState({})
  const [mobileSuccess, setMobileSuccess] = useState('')

  // Password change state
  const [passwordOtpStep, setPasswordOtpStep] = useState('request') // 'request', 'verify'
  const [passwordOtpCode, setPasswordOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordOtpData, setPasswordOtpData] = useState({ code: '', expiresAt: null, resendCount: 0 })
  const [passwordCountdown, setPasswordCountdown] = useState(0)
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Mobile countdown effect
  useEffect(() => {
    if (mobileCountdown > 0) {
      const timer = setTimeout(() => setMobileCountdown(mobileCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [mobileCountdown])

  // Password countdown effect
  useEffect(() => {
    if (passwordCountdown > 0) {
      const timer = setTimeout(() => setPasswordCountdown(passwordCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [passwordCountdown])

  // Validate mobile number (Sri Lanka style)
  const validateMobileNumber = (number) => {
    const cleaned = number.replace(/\D/g, '')
    return cleaned.length >= 9 && cleaned.length <= 10
  }

  // Mobile: Send OTP
  const handleSendMobileOtp = () => {
    const errors = {}
    if (!newMobileNumber.trim()) errors.newMobileNumber = 'Please enter mobile number'
    if (newMobileNumber && !validateMobileNumber(newMobileNumber)) {
      errors.newMobileNumber = 'Invalid mobile number format'
    }
    
    setMobileErrors(errors)
    if (Object.keys(errors).length > 0) return

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
    setMobileOtpData({ code: otp, expiresAt: expiresAt.toISOString(), resendCount: mobileOtpData.resendCount + 1 })
    setMobileCountdown(120)
    setMobileOtpStep('verify')
    setMobileSuccess('')
    setMobileErrors({})
  }

  // Mobile: Verify OTP
  const handleVerifyMobileOtp = () => {
    const errors = {}
    if (!mobileOtpCode) errors.mobileOtpCode = 'Please enter OTP'
    if (mobileOtpCode && mobileOtpCode.length !== 6) {
      errors.mobileOtpCode = 'OTP must be 6 digits'
    }
    if (isOtpExpired(mobileOtpData.expiresAt)) {
      errors.mobileOtpCode = 'OTP expired, please request a new one'
    }

    setMobileErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (mobileOtpCode === mobileOtpData.code) {
      setProfile({ ...profile, mobile: newMobileNumber })
      setMobileOtpVerified(true)
      setMobileSuccess('Mobile number updated successfully.')
      
      // Reset after 2 seconds
      setTimeout(() => {
        setNewMobileNumber('')
        setMobileOtpCode('')
        setMobileOtpStep('input')
        setMobileOtpData({ code: '', expiresAt: null, resendCount: 0 })
        setMobileOtpVerified(null)
        setMobileSuccess('')
      }, 2000)
    } else {
      setMobileErrors({ mobileOtpCode: 'Invalid OTP' })
    }
  }

  // Password: Send OTP
  const handleSendPasswordOtp = () => {
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
    setPasswordOtpData({ code: otp, expiresAt: expiresAt.toISOString(), resendCount: passwordOtpData.resendCount + 1 })
    setPasswordCountdown(120)
    setPasswordOtpStep('verify')
    setPasswordSuccess('')
    setPasswordErrors({})
  }

  // Password: Verify OTP & Update Password
  const handleUpdatePassword = () => {
    const errors = {}
    if (!passwordOtpCode) errors.passwordOtpCode = 'Please enter OTP'
    if (passwordOtpCode && passwordOtpCode.length !== 6) {
      errors.passwordOtpCode = 'OTP must be 6 digits'
    }
    if (isOtpExpired(passwordOtpData.expiresAt)) {
      errors.passwordOtpCode = 'OTP expired, please request a new one'
    }
    if (!newPassword) errors.newPassword = 'Please enter new password'
    if (newPassword && newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (!confirmPassword) errors.confirmPassword = 'Please confirm password'
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (passwordOtpCode === passwordOtpData.code) {
      setPasswordSuccess('Password updated successfully.')
      
      // Reset after 2 seconds
      setTimeout(() => {
        setPasswordOtpCode('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordOtpStep('request')
        setPasswordOtpData({ code: '', expiresAt: null, resendCount: 0 })
        setPasswordSuccess('')
      }, 2000)
    } else {
      setPasswordErrors({ passwordOtpCode: 'Invalid OTP' })
    }
  }

  const canResendMobileOtp = mobileCountdown === 0 && mobileOtpData.resendCount < 3
  const canResendPasswordOtp = passwordCountdown === 0 && passwordOtpData.resendCount < 3
  const isPasswordFormValid = passwordOtpCode && newPassword && confirmPassword && newPassword.length >= 8 && newPassword === confirmPassword && !isOtpExpired(passwordOtpData.expiresAt)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black font-bold text-yellow-400 shadow-md">
                SG
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">Smart Gold</h1>
                <p className="text-xs text-black/70">Customer Dashboard</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-3 text-sm font-semibold text-black">
              <button
                onClick={() => navigate('/customer')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Overview
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/receipts')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                My Receipts
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/part-payments')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Part Payments
              </button>
              <span className="text-black/40">|</span>
              <button
                onClick={() => navigate('/customer/appointments')}
                className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50"
              >
                Appointments
              </button>
              <span className="text-black/40">|</span>
              <button className="rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50 bg-yellow-700/50">
                Profile
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
                >
                  Settings
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">Account Settings</p>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <button
                        onClick={() => navigate('/customer/profile')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-yellow-50 text-sm font-semibold text-gray-700"
                      >
                        Edit Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-yellow-50 text-sm font-semibold text-gray-700">
                        Notification Settings
                      </button>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-sm font-semibold text-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/login')}
                className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-8 mb-8">
            <div className="border-b-2 border-yellow-500 pb-4 mb-2">
              <h2 className="text-3xl font-bold text-yellow-600">My Profile</h2>
              <p className="text-gray-600 mt-2">
                Manage your account information and security settings
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8">
            {/* Left Column: Profile Information */}
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    disabled
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-gray-50"
                  />
                </div>

                {/* NIC */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">NIC (Read-only)</label>
                  <input
                    type="text"
                    value={profile.nic}
                    disabled
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-gray-50"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Current Mobile Number</label>
                  <input
                    type="text"
                    value={profile.mobile}
                    disabled
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-gray-50"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                  <input
                    type="text"
                    value={profile.branch}
                    disabled
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-gray-50"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Address (Read-only)</label>
                  <textarea
                    value={profile.address}
                    disabled
                    rows="3"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-gray-50"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account Status</label>
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded bg-green-100 text-green-700">
                    {profile.status}
                  </span>
                </div>

                {/* Note */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    <strong>Note:</strong> NIC and address cannot be changed. Contact support if you need to update these fields.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              {/* Card 1: Change Mobile Number */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Change Mobile Number</h3>

                {mobileOtpStep === 'input' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newMobileNumber}
                        onChange={(e) => {
                          setNewMobileNumber(e.target.value)
                          setMobileErrors({ ...mobileErrors, newMobileNumber: '' })
                        }}
                        placeholder="07X XXX XXXX"
                        className={`w-full rounded-lg border px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                          mobileErrors.newMobileNumber
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-yellow-500'
                        }`}
                      />
                      {mobileErrors.newMobileNumber && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {mobileErrors.newMobileNumber}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSendMobileOtp}
                      disabled={!newMobileNumber || !validateMobileNumber(newMobileNumber)}
                      className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      Send OTP
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mobileSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-700 font-semibold">{mobileSuccess}</p>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          OTP Code <span className="text-red-500">*</span>
                        </label>
                        {mobileCountdown > 0 && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatCountdown(mobileCountdown)}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={mobileOtpCode}
                        onChange={(e) => {
                          setMobileOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          setMobileErrors({ ...mobileErrors, mobileOtpCode: '' })
                        }}
                        placeholder="000000"
                        maxLength="6"
                        className={`w-full rounded-lg border px-4 py-2 text-sm text-gray-900 tracking-widest focus:outline-none focus:ring-2 ${
                          mobileErrors.mobileOtpCode
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-yellow-500'
                        }`}
                      />
                      {mobileErrors.mobileOtpCode && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {mobileErrors.mobileOtpCode}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyMobileOtp}
                      disabled={!mobileOtpCode || mobileOtpCode.length !== 6}
                      className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      Verify & Update
                    </button>

                    {canResendMobileOtp && (
                      <button
                        onClick={handleSendMobileOtp}
                        className="w-full rounded-lg border-2 border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50"
                      >
                        Resend OTP
                      </button>
                    )}
                    {mobileOtpData.resendCount >= 3 && (
                      <p className="text-xs text-red-600 text-center">Max resend limit reached</p>
                    )}
                  </div>
                )}
              </div>

              {/* Card 2: Change Password */}
              <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>

                {passwordOtpStep === 'request' ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      An OTP will be sent to your registered mobile number for verification.
                    </p>
                    <button
                      onClick={handleSendPasswordOtp}
                      className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600"
                    >
                      Send OTP to Mobile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {passwordSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-700 font-semibold">{passwordSuccess}</p>
                      </div>
                    )}

                    {/* OTP Code */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          OTP Code <span className="text-red-500">*</span>
                        </label>
                        {passwordCountdown > 0 && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatCountdown(passwordCountdown)}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={passwordOtpCode}
                        onChange={(e) => {
                          setPasswordOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          setPasswordErrors({ ...passwordErrors, passwordOtpCode: '' })
                        }}
                        placeholder="000000"
                        maxLength="6"
                        className={`w-full rounded-lg border px-4 py-2 text-sm text-gray-900 tracking-widest focus:outline-none focus:ring-2 ${
                          passwordErrors.passwordOtpCode
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-yellow-500'
                        }`}
                      />
                      {passwordErrors.passwordOtpCode && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {passwordErrors.passwordOtpCode}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value)
                            setPasswordErrors({ ...passwordErrors, newPassword: '' })
                          }}
                          placeholder="At least 8 characters"
                          className={`w-full rounded-lg border px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                            passwordErrors.newPassword
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-200 focus:ring-yellow-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setPasswordErrors({ ...passwordErrors, confirmPassword: '' })
                          }}
                          placeholder="Re-enter your password"
                          className={`w-full rounded-lg border px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                            passwordErrors.confirmPassword
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-200 focus:ring-yellow-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleUpdatePassword}
                      disabled={!isPasswordFormValid}
                      className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      Update Password
                    </button>

                    {canResendPasswordOtp && (
                      <button
                        onClick={handleSendPasswordOtp}
                        className="w-full rounded-lg border-2 border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50"
                      >
                        Resend OTP
                      </button>
                    )}
                    {passwordOtpData.resendCount >= 3 && (
                      <p className="text-xs text-red-600 text-center">Max resend limit reached</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
