import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Mail, Phone, FileText } from 'lucide-react'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nic: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLookupLoading, setIsLookupLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLookup = async () => {
    setError('')
    setSuccess(false)

    if (!formData.nic) {
      setError('Please enter your NIC to continue')
      return
    }

    setIsLookupLoading(true)
    try {
      const res = await api.registerLookup(formData.nic)
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          fullName: res.data.fullName,
          email: res.data.email,
          phone: res.data.phone
        }))
      }
    } catch (err) {
      setError(err.message || 'Customer not found. Please contact the branch to register your details.')
      setFormData(prev => ({
        ...prev,
        fullName: '',
        email: '',
        phone: ''
      }))
    } finally {
      setIsLookupLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.nic || !formData.password || !formData.confirmPassword) {
      setError('Please enter your NIC and create a password')
      return
    }

    if (!formData.fullName) {
      setError('Please lookup your NIC to load your customer details')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await api.register(formData.nic, formData.password)
      setSuccess(true)
      setFormData({ nic: '', fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
          <p className="mt-2 text-gray-300">Customer Registration</p>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
              Registration successful! You can now login with your NIC and password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIC Lookup */}
            <div>
              <label htmlFor="nic" className="block text-sm font-semibold text-gray-900 mb-2">
                NIC Number
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="nic"
                  type="text"
                  name="nic"
                  placeholder="e.g., 123456789V"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
              <button
                type="button"
                onClick={handleLookup}
                disabled={isLookupLoading}
                className="mt-3 w-full rounded-lg border-2 border-yellow-500 px-4 py-2 text-yellow-600 font-semibold hover:bg-yellow-50 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isLookupLoading ? 'Searching...' : 'Find Customer'}
              </button>
            </div>

            {/* Auto-filled Details */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400"
                  placeholder="Customer name will appear here"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400"
                  placeholder="Customer email will appear here"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400"
                  placeholder="Customer phone will appear here"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-yellow-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-black transition-all hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">Or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-yellow-600 hover:text-yellow-700">
                Login here
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

        {/* Terms */}
        <div className="mt-8 rounded-lg bg-gray-800/50 p-4 border border-gray-700">
          <p className="text-xs text-gray-400">
            By registering, you agree to our{' '}
            <a href="#" className="text-yellow-400 hover:text-yellow-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-yellow-400 hover:text-yellow-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}


