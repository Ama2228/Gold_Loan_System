import { useState, useEffect } from 'react'
import { Edit2, AlertCircle, Plus, Loader } from 'lucide-react'
import apiService from '../../services/api'

export default function BranchManagement() {
  const userRole = sessionStorage.getItem('userRole')
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' or 'edit'
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    branch_code: '',
    branch_name: '',
    address_line1: '',
    city: '',
    phone: '',
    status: 'ACTIVE'
  })

  const [formErrors, setFormErrors] = useState({})

  // Role guard
  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">Branch Management is restricted to administrators only.</p>
      </div>
    )
  }

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches()
  }, [])

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request('/admin/branches', {
        method: 'GET'
      })

      if (response.success) {
        setBranches(response.data || [])
      } else {
        setError(response.message || 'Failed to load branches')
      }
    } catch (err) {
      console.error('Error fetching branches:', err)
      setError(err.message || 'An error occurred while loading branches')
    } finally {
      setLoading(false)
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.branch_code.trim()) {
      errors.branch_code = 'Branch code is required'
    } else if (!/^\d{4}$/.test(formData.branch_code)) {
      errors.branch_code = 'Branch code must be exactly 4 digits'
    }

    if (!formData.branch_name.trim()) {
      errors.branch_name = 'Branch name is required'
    }

    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'Address line 1 is required'
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    }

    // Check for duplicate branch code when adding new branch
    if (modalType === 'add' && branches.some(b => b.branch_code === formData.branch_code)) {
      errors.branch_code = 'This branch code already exists'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open add branch modal
  const handleAddBranch = () => {
    setModalType('add')
    setFormData({
      branch_code: '',
      branch_name: '',
      address_line1: '',
      city: '',
      phone: '',
      status: 'ACTIVE'
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Open edit branch modal
  const handleEditBranch = (branch) => {
    setModalType('edit')
    setSelectedBranch(branch)
    setFormData({
      branch_code: branch.branch_code,
      branch_name: branch.branch_name,
      address_line1: branch.address_line1 || '',
      city: branch.city || '',
      phone: branch.phone || '',
      status: branch.status
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      let response

      if (modalType === 'add') {
        response = await apiService.request('/admin/branches', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
      } else {
        response = await apiService.request(`/admin/branches/${selectedBranch.branch_id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
      }

      if (response.success) {
        setSuccess(`Branch ${modalType === 'add' ? 'created' : 'updated'} successfully`)
        setShowModal(false)
        fetchBranches()
      } else {
        setError(response.message || 'Failed to save branch')
      }
    } catch (err) {
      console.error('Error saving branch:', err)
      setError(err.message || 'An error occurred while saving the branch')
    }
  }

  // Toggle branch status
  const handleToggleStatus = (branch) => {
    setConfirmAction({
      type: 'toggle',
      branch,
      newStatus: branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    })
    setShowConfirmDialog(true)
  }

  // Confirm action
  const confirmActionHandler = async () => {
    if (!confirmAction) return

    try {
      const response = await apiService.request(`/admin/branches/${confirmAction.branch.branch_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: confirmAction.newStatus
        })
      })

      if (response.success) {
        setSuccess(`Branch ${confirmAction.newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`)
        setShowConfirmDialog(false)
        setConfirmAction(null)
        fetchBranches()
      } else {
        setError(response.message || 'Failed to update branch status')
      }
    } catch (err) {
      console.error('Error updating branch status:', err)
      setError(err.message || 'An error occurred while updating the branch')
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600 mt-2">Manage branch codes and branch details</p>
        </div>
        <button
          onClick={handleAddBranch}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add Branch
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <div className="text-green-600 mt-0.5">✓</div>
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-12 text-center">
          <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading branches...</p>
        </div>
      ) : (
        <>
          {/* Branches Table */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">
                Branches ({branches.length})
              </h2>
            </div>

            {branches.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  className="h-12 w-12 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 5 7 13"></polyline>
                </svg>
                <p className="text-gray-600 font-medium">No branches found</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Branch" to create a new branch</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Branch Code
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Branch Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr
                        key={branch.branch_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-mono font-semibold text-sm">
                            {branch.branch_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{branch.branch_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{branch.address_line1}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{branch.city}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{branch.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              branch.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {branch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditBranch(branch)}
                              className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit branch"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(branch)}
                              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                branch.status === 'ACTIVE'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={
                                branch.status === 'ACTIVE'
                                  ? 'Deactivate branch'
                                  : 'Activate branch'
                              }
                            >
                              {branch.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {modalType === 'add' ? 'Add New Branch' : 'Edit Branch'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Branch Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch Code *
                </label>
                <input
                  type="text"
                  name="branch_code"
                  value={formData.branch_code}
                  onChange={handleInputChange}
                  disabled={modalType === 'edit'}
                  placeholder="e.g., 0001"
                  maxLength="4"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.branch_code
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  } ${modalType === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                {formErrors.branch_code && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.branch_code}</p>
                )}
              </div>

              {/* Branch Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Colombo Central"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.branch_name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.branch_name && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.branch_name}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.address_line1
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.address_line1 && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.address_line1}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Colombo"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.city
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.city && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.city}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., 0112345678"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.phone
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Confirm Action</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to{' '}
                <span className="font-semibold">
                  {confirmAction.newStatus === 'ACTIVE' ? 'activate' : 'deactivate'}
                </span>{' '}
                branch <span className="font-semibold">{confirmAction.branch.branch_code}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setConfirmAction(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActionHandler}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
