import { useState } from 'react'
import { Search, Plus } from 'lucide-react'

export default function RegisterCustomer() {
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
    mobileNumber: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Customer registered:', formData)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">New Customer Registration</h1>
        <p className="mt-2 text-gray-600">Register a new customer in the system</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
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
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="">Select City</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Negombo</option>
                <option>Matara</option>
                <option>Jaffna</option>
                <option>Kurunegala</option>
                <option>Anuradhapura</option>
                <option>Trincomalee</option>
                <option>Batticaloa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="">Select District</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Gampaha</option>
                <option>Matara</option>
                <option>Jaffna</option>
                <option>Kurunegala</option>
                <option>Anuradhapura</option>
                <option>Trincomalee</option>
                <option>Batticaloa</option>
              </select>
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
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-6">
            <button
              type="submit"
              className="min-w-[160px] rounded-lg border-2 border-yellow-500 px-6 py-2 text-yellow-600 font-semibold hover:bg-yellow-50 transition-colors"
            >
              Save
            </button>
            <button
              type="submit"
              className="min-w-[200px] rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors"
            >
              Save &amp; Proceed
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}


