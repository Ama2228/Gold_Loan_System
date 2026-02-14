import { useState, useEffect } from 'react'
import { AlertCircle, Plus, Loader, Edit2, Search, Users, CheckCircle, XCircle } from 'lucide-react'
import apiService from '../../services/api'

export default function StaffManagement() {
  const userRole = sessionStorage.getItem('userRole')
  const [staff, setStaff] = useState([])
  const [filteredStaff, setFilteredStaff] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' or 'edit'
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    nic: '',
    staff_username: '',
    password: '',
    role: 'STAFF',
    branch_id: '',
    status: 'ACTIVE'
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Toggle confirmation
  const [showToggleConfirm, setShowToggleConfirm] = useState(false)
  const [staffToToggle, setStaffToToggle] = useState(null)
  const [toggling, setToggling] = useState(false)

  // Role guard
  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">This page is restricted to administrators only.</p>
      </div>
    )
  }

  // Fetch staff and branches on mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchStaff(), fetchBranches()])
    }
    fetchData()
  }, [])

  // Filter staff based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStaff(staff)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = staff.filter(s =>
        s.full_name.toLowerCase().includes(query) ||
        s.nic.toLowerCase().includes(query) ||
        s.staff_username.toLowerCase().includes(query)
      )
      setFilteredStaff(filtered)
    }
  }, [searchQuery, staff])

  // Auto-dismiss success/error messages
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

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      const response = await apiService.request('/admin/staff', {
        method: 'GET'
      })

      if (response.success) {
        setStaff(response.data || [])
      } else {
        setError(response.message || 'Failed to load staff')
      }
    } catch (err) {
      console.error('Error fetching staff:', err)
      setError(err.message || 'An error occurred while loading staff')
    }
  }

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      const response = await apiService.request('/admin/branches', {
        method: 'GET'
      })

      if (response.success) {
        const activeBranches = (response.data || []).filter(b => b.status === 'ACTIVE')
        setBranches(activeBranches)
      }
    } catch (err) {
      console.error('Error fetching branches:', err)
    } finally {
      setLoading(false)
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required'
    }

    if (!formData.nic.trim()) {
      errors.nic = 'NIC is required'
    }

    if (!formData.staff_username.trim()) {
      errors.staff_username = 'Username is required'
    }

    if (modalType === 'add') {
      if (!formData.password.trim()) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      }
    }

    if (!['STAFF', 'MANAGER'].includes(formData.role)) {
      errors.role = 'Role must be STAFF or MANAGER'
    }

    if (!formData.branch_id) {
      errors.branch_id = 'Branch is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open add modal
  const handleAddStaff = () => {
    setModalType('add')
    setFormData({
      full_name: '',
      nic: '',
      staff_username: '',
      password: '',
      role: 'STAFF',
      branch_id: '',
      status: 'ACTIVE'
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Open edit modal
  const handleEditStaff = (staffMember) => {
    setModalType('edit')
    setSelectedStaff(staffMember)
    setFormData({
      full_name: staffMember.full_name,
      nic: staffMember.nic,
      staff_username: staffMember.staff_username,
      password: '',
      role: staffMember.role,
      branch_id: staffMember.branch_id,
      status: staffMember.status
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  // Submit form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Prepare payload
      const payload = {
        full_name: formData.full_name,
        nic: formData.nic,
        staff_username: formData.staff_username,
        role: formData.role,
        branch_id: formData.branch_id,
        status: formData.status
      }

      // Add password only for new staff
      if (modalType === 'add') {
        payload.password = formData.password
      }

      let response

      if (modalType === 'add') {
        response = await apiService.request('/admin/staff', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      } else {
        response = await apiService.request(`/admin/staff/${selectedStaff.staff_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      }

      if (response.success) {
        setSuccess(`Staff ${modalType === 'add' ? 'created' : 'updated'} successfully`)
        setShowModal(false)
        fetchStaff()
      } else {
        setError(response.message || 'Failed to save staff')
      }
    } catch (err) {
      console.error('Error saving staff:', err)
      setError(err.message || 'An error occurred while saving staff')
    } finally {
      setSaving(false)
    }
  }

  // Open toggle confirmation
  const handleToggleClick = (staffMember) => {
    setStaffToToggle(staffMember)
    setShowToggleConfirm(true)
  }

  // Confirm toggle
  const handleConfirmToggle = async () => {
    if (!staffToToggle) return

    try {
      setToggling(true)
      setError(null)

      const newStatus = staffToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

      const response = await apiService.request(`/admin/staff/${staffToToggle.staff_id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })

      if (response.success) {
        setSuccess(`Staff member ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`)
        setShowToggleConfirm(false)
        setStaffToToggle(null)
        fetchStaff()
      } else {
        setError(response.message || 'Failed to update staff status')
      }
    } catch (err) {
      console.error('Error toggling staff status:', err)
      setError(err.message || 'An error occurred while updating staff')
      setShowToggleConfirm(false)
      setStaffToToggle(null)
    } finally {
      setToggling(false)
    }
  }

  // Get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.branch_id === branchId)
    return branch ? `${branch.branch_code} - ${branch.branch_name}` : '-'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">Create and manage staff accounts</p>
        </div>
        <button
          onClick={handleAddStaff}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add Staff
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
          <p className="text-gray-600">Loading staff and branch data...</p>
        </div>
      ) : (
        <>
          {/* Main Card */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">
                Staff Members ({staff.length})
              </h2>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, NIC or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Table */}
            {filteredStaff.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {searchQuery ? 'No staff found matching your search' : 'No staff found'}
                </p>
                {!searchQuery && (
                  <p className="text-gray-500 text-sm mt-2">
                    Click "Add Staff" to create a new staff account
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Staff Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        NIC
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staffMember) => (
                      <tr
                        key={staffMember.staff_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{staffMember.full_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{staffMember.nic}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded font-mono text-sm">
                            {staffMember.staff_username}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              staffMember.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {staffMember.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{getBranchName(staffMember.branch_id)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              staffMember.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {staffMember.status === 'ACTIVE' ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditStaff(staffMember)}
                              className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit staff"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleClick(staffMember)}
                              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                staffMember.status === 'ACTIVE'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={
                                staffMember.status === 'ACTIVE'
                                  ? 'Deactivate staff'
                                  : 'Activate staff'
                              }
                            >
                              {staffMember.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 sticky top-0">
              <h2 className="text-lg font-bold text-gray-900">
                {modalType === 'add' ? 'Add New Staff' : 'Edit Staff'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Silva"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.full_name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {formErrors.full_name && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.full_name}</p>
                  )}
                </div>

                {/* NIC */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIC *
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    disabled={modalType === 'edit'}
                    placeholder="e.g., 200263000105"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.nic
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    } ${modalType === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                  {formErrors.nic && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.nic}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="staff_username"
                    value={formData.staff_username}
                    onChange={handleInputChange}
                    disabled={modalType === 'edit'}
                    placeholder="e.g., jsilva"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.staff_username
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    } ${modalType === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                  {formErrors.staff_username && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.staff_username}</p>
                  )}
                </div>

                {/* Password (only for add) */}
                {modalType === 'add' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        formErrors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formErrors.password && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>
                    )}
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.role
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="STAFF">Staff (Pawning Assistant)</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch *
                  </label>
                  <select
                    name="branch_id"
                    value={formData.branch_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.branch_id
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a branch</option>
                    {branches.map(b => (
                      <option key={b.branch_id} value={b.branch_id}>
                        {b.branch_code} - {b.branch_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.branch_id && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.branch_id}</p>
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
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Confirmation Dialog */}
      {showToggleConfirm && staffToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Confirm Action</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to{' '}
                <span className="font-semibold">
                  {staffToToggle.status === 'ACTIVE' ? 'deactivate' : 'activate'}
                </span>{' '}
                <span className="font-semibold">{staffToToggle.full_name}</span>?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4 text-sm text-gray-600">
                <p>Username: <span className="font-semibold">{staffToToggle.staff_username}</span></p>
                <p>Role: <span className="font-semibold">{staffToToggle.role}</span></p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowToggleConfirm(false)
                    setStaffToToggle(null)
                  }}
                  disabled={toggling}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  disabled={toggling}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {toggling ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
