import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function RegisterCustomer() {
  const [occupations, setOccupations] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    initialsName: '',
    fullName: '',
    nic: '',
    dob: '',
    occupation: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    mobileNumber: '',
    email: ''
  })

  useEffect(() => {
    fetchMetadata()
  }, [])

  const fetchMetadata = async () => {
    try {
      setLoading(true)
      const [occupationsRes, citiesRes] = await Promise.all([
        api.get('/staff/customers/meta/occupations'),
        api.get('/staff/customers/meta/cities')
      ])
      
      if (occupationsRes.success && occupationsRes.data) {
        setOccupations(occupationsRes.data)
      }
      
      if (citiesRes.success && citiesRes.data) {
        setCities(citiesRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
      alert('Failed to load form data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // If city is changed, auto-update district
    if (name === 'city') {
      const selectedCity = cities.find(c => c.city_id === parseInt(value))
      setFormData(prev => ({
        ...prev,
        city: value,
        district: selectedCity ? selectedCity.district_name : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required'
    } else if (!/^\d{12}$/.test(formData.nic.trim())) {
      newErrors.nic = 'NIC must be exactly 12 digits (only numbers)'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }

    if (!formData.occupation) {
      newErrors.occupation = 'Occupation is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')
    setServerError('')

    const isValid = validateForm()
    if (!isValid) {
      return
    }

    try {
      setIsSubmitting(true)

      const currentUser = api.getCurrentUser()
      const branchId = currentUser?.branchId

      if (!branchId) {
        setServerError('Unable to determine staff branch. Please log in again.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        full_name: formData.fullName.trim(),
        nic: formData.nic.trim(),
        password: 'Customer@123',
        phone: formData.mobileNumber.trim(),
        branch_id: branchId,
        occupation_id: parseInt(formData.occupation, 10),
        city_id: parseInt(formData.city, 10),
        address_line1: formData.addressLine1.trim(),
        address_line2: formData.addressLine2.trim() || null,
        email: formData.email.trim() || null
      }

      const response = await api.post('/staff/customers', payload)

      if (response.success) {
        setSuccessMessage(`Customer ${response.data.full_name || payload.full_name} registered successfully`)
        setFormData({
          title: '',
          initialsName: '',
          fullName: '',
          nic: '',
          dob: '',
          occupation: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          district: '',
          mobileNumber: '',
          email: ''
        })
        setErrors({})
      }
    } catch (error) {
      const message = error.message || 'Failed to register customer. Please try again.'
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">New Customer Registration</h1>
        <p className="mt-2 text-gray-600">Register a new customer in the system</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        {loading && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-center">
            Loading form data...
          </div>
        )}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}
        <div className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Mr/Mrs/Miss)</label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="">Select Title</option>
                <option>Mr</option>
                <option>Mrs</option>
                <option>Miss</option>
                <option>Ms</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Initials Name</label>
              <input
                type="text"
                name="initialsName"
                value={formData.initialsName}
                onChange={handleChange}
                placeholder="Thenakoon Mudiyanselage"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Hasindu Nimantha Bandara"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">National ID Number</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="200012345678"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              {errors.nic && (
                <p className="mt-1 text-sm text-red-600">{errors.nic}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-gray-100"
              >
                <option value="">Select Occupation</option>
                {occupations.map((occupation) => (
                  <option key={occupation.occupation_id} value={occupation.occupation_id}>
                    {occupation.occupation_name}
                  </option>
                ))}
              </select>
              {errors.occupation && (
                <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="e.g. No. 10, Main Street"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="e.g. Rajagiriya"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-gray-100"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.city_id} value={city.city_id}>
                    {city.city_name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                readOnly
                placeholder="Auto-populated from city"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="077 123 4567"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="min-w-[160px] rounded-lg border-2 border-yellow-500 px-6 py-2 text-yellow-600 font-semibold hover:bg-yellow-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="min-w-[200px] rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save & Proceed'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}


