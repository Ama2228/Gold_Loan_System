import { useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

// Dummy receipt list for selection
const dummyReceipts = [
  { id: 'TCK001', receiptNo: '0001-25000001', customerName: 'John Doe', loanAmount: 700000 },
  { id: 'TCK002', receiptNo: '0001-25000023', customerName: 'Jane Smith', loanAmount: 450000 },
  { id: 'TCK003', receiptNo: '0001-25000045', customerName: 'Robert Wilson', loanAmount: 580000 },
  { id: 'TCK004', receiptNo: '0001-25000067', customerName: 'Mary Johnson', loanAmount: 320000 },
  { id: 'TCK005', receiptNo: '0001-25000089', customerName: 'David Brown', loanAmount: 600000 },
  { id: 'TCK006', receiptNo: '0002-25000012', customerName: 'Sarah Davis', loanAmount: 400000 },
  { id: 'TCK007', receiptNo: '0002-25000034', customerName: 'Michael Lee', loanAmount: 750000 },
  { id: 'TCK008', receiptNo: '0002-25000056', customerName: 'Emily Taylor', loanAmount: 525000 }
]

export default function ReversePawning() {
  const userRole = sessionStorage.getItem('userRole')

  // Role guard - only MANAGER can access
  if (userRole !== 'MANAGER') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">Reverse Pawning is a manager-only feature. You do not have permission to access this page.</p>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    receiptNo: '',
    reason: '',
    confirmed: false
  })

  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formErrors, setFormErrors] = useState({})

  const [history, setHistory] = useState([
    {
      id: 'RP001',
      receiptNo: '0001-25000001',
      dateTime: '2026-02-10 14:30',
      reason: 'Customer requested additional funds for emergency',
      status: 'PENDING',
      createdBy: 'Manager'
    },
    {
      id: 'RP002',
      receiptNo: '0001-25000045',
      dateTime: '2026-02-09 10:15',
      reason: 'Reverse pawning for renewal extension',
      status: 'COMPLETED',
      createdBy: 'Manager'
    }
  ])

  // Filter receipts based on search
  const filteredReceipts = dummyReceipts.filter(
    receipt =>
      receipt.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleReceiptSelect = (receipt) => {
    setFormData(prev => ({
      ...prev,
      receiptNo: receipt.receiptNo
    }))
    setShowDropdown(false)
    setSearchQuery('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.receiptNo.trim()) {
      errors.receiptNo = 'Receipt number is required'
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required'
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters'
    }

    if (!formData.confirmed) {
      errors.confirmed = 'You must confirm the reverse pawning'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Add new record to history
    const newRecord = {
      id: `RP${history.length + 3}`,
      receiptNo: formData.receiptNo,
      dateTime: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''),
      reason: formData.reason,
      status: 'PENDING',
      createdBy: 'Manager'
    }

    setHistory(prev => [newRecord, ...prev])

    // Show success message
    setSuccessMessage('Reverse pawning recorded (demo).')

    // Reset form
    setFormData({
      receiptNo: '',
      reason: '',
      confirmed: false
    })

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const toggleStatus = (id) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'PENDING' ? 'COMPLETED' : 'PENDING' }
          : item
      )
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reverse Pawning</h1>
        <p className="text-gray-600 mt-2">Manager-only function</p>
        <div className="mt-3 inline-block">
          <span className="inline-block rounded-lg bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-800">
            Branch 0001 - Colombo Central
          </span>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-yellow-500">
          Create Reverse Pawning Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receipt Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="receiptNo"
                value={formData.receiptNo}
                onChange={(e) => {
                  handleInputChange(e)
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search or select receipt..."
                className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                  formErrors.receiptNo
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-yellow-400'
                }`}
              />

              {/* Dropdown */}
              {showDropdown && filteredReceipts.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
                  {filteredReceipts.map(receipt => (
                    <button
                      key={receipt.id}
                      type="button"
                      onClick={() => handleReceiptSelect(receipt)}
                      className="w-full text-left px-4 py-3 hover:bg-yellow-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">{receipt.receiptNo}</p>
                      <p className="text-xs text-gray-600">{receipt.customerName} - ₨. {receipt.loanAmount.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formErrors.receiptNo && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.receiptNo}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Enter the reason for reverse pawning (minimum 10 characters)..."
              rows="4"
              className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                formErrors.reason
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-200 focus:ring-yellow-400'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.reason.length} / 10 characters minimum</p>
            {formErrors.reason && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.reason}
              </p>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="confirmed"
                checked={formData.confirmed}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400"
              />
              <span className="text-sm font-semibold text-gray-700">
                I confirm this reverse pawning is authorized. <span className="text-red-500">*</span>
              </span>
            </label>
            {formErrors.confirmed && (
              <p className="text-sm text-red-600 mt-1 ml-8 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.confirmed}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-yellow-500 px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-600 transition-colors"
            >
              Submit Reverse Pawning
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ receiptNo: '', reason: '', confirmed: false })
                setFormErrors({})
              }}
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold text-yellow-600">Reverse Pawning History</h2>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receipt No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{record.receiptNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.dateTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.reason}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          record.status === 'PENDING'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.createdBy}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleStatus(record.id)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                          record.status === 'PENDING'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {record.status === 'PENDING' ? 'Mark Completed' : 'Mark Pending'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No reverse pawning requests yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
