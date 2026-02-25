import { useState, useEffect } from 'react'
import { AlertCircle, Plus, Loader, Edit2, Trash2, Search, Briefcase } from 'lucide-react'
import apiService from '../../services/api'

export default function Occupations() {
  const userRole = sessionStorage.getItem('userRole')
  const [occupations, setOccupations] = useState([])
  const [filteredOccupations, setFilteredOccupations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' or 'edit'
  const [selectedOccupation, setSelectedOccupation] = useState(null)
  const [formData, setFormData] = useState({ occupation_name: '' })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [occupationToDelete, setOccupationToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  // Fetch occupations on mount
  useEffect(() => {
    fetchOccupations()
  }, [])

  // Filter occupations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOccupations(occupations)
    } else {
      const filtered = occupations.filter(occ =>
        occ.occupation_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredOccupations(filtered)
    }
  }, [searchQuery, occupations])

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

  // Fetch occupations from API
  const fetchOccupations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request('/admin/occupations', {
        method: 'GET'
      })

      if (response.success) {
        setOccupations(response.data || [])
      } else {
        setError(response.message || 'Failed to load occupations')
      }
    } catch (err) {
      console.error('Error fetching occupations:', err)
      setError(err.message || 'An error occurred while loading occupations')
    } finally {
      setLoading(false)
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.occupation_name.trim()) {
      errors.occupation_name = 'Occupation name is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open add modal
  const handleAddOccupation = () => {
    setModalType('add')
    setFormData({ occupation_name: '' })
    setFormErrors({})
    setShowModal(true)
  }

  // Open edit modal
  const handleEditOccupation = (occupation) => {
    setModalType('edit')
    setSelectedOccupation(occupation)
    setFormData({ occupation_name: occupation.occupation_name })
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

      let response

      if (modalType === 'add') {
        response = await apiService.request('/admin/occupations', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
      } else {
        response = await apiService.request(`/admin/occupations/${selectedOccupation.occupation_id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
      }

      if (response.success) {
        setSuccess(`Occupation ${modalType === 'add' ? 'created' : 'updated'} successfully`)
        setShowModal(false)
        fetchOccupations()
      } else {
        // Handle 409 duplicate error
        if (response.message && response.message.toLowerCase().includes('already exists')) {
          setError('Occupation already exists')
        } else {
          setError(response.message || 'Failed to save occupation')
        }
      }
    } catch (err) {
      console.error('Error saving occupation:', err)
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setError('Occupation already exists')
      } else {
        setError(err.message || 'An error occurred while saving the occupation')
      }
    } finally {
      setSaving(false)
    }
  }

  // Open delete confirmation
  const handleDeleteClick = (occupation) => {
    setOccupationToDelete(occupation)
    setShowDeleteConfirm(true)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!occupationToDelete) return

    try {
      setDeleting(true)
      setError(null)

      const response = await apiService.request(`/admin/occupations/${occupationToDelete.occupation_id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        setSuccess('Occupation deleted successfully')
        setShowDeleteConfirm(false)
        setOccupationToDelete(null)
        fetchOccupations()
      } else {
        setError(response.message || 'Failed to delete occupation')
      }
    } catch (err) {
      console.error('Error deleting occupation:', err)
      setError(err.message || 'An error occurred while deleting the occupation')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Occupations</h1>
          <p className="text-gray-600 mt-2">Manage occupation list for customer profiles</p>
        </div>
        <button
          onClick={handleAddOccupation}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add Occupation
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
          <p className="text-gray-600">Loading occupations...</p>
        </div>
      ) : (
        <>
          {/* Main Card */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">
                Occupations ({occupations.length})
              </h2>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search occupations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Table */}
            {filteredOccupations.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {searchQuery ? 'No occupations found matching your search' : 'No occupations found'}
                </p>
                {!searchQuery && (
                  <p className="text-gray-500 text-sm mt-2">
                    Click "Add Occupation" to create a new occupation
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Occupation Name
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOccupations.map((occupation) => (
                      <tr
                        key={occupation.occupation_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{occupation.occupation_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditOccupation(occupation)}
                              className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit occupation"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(occupation)}
                              className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete occupation"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {modalType === 'add' ? 'Add New Occupation' : 'Edit Occupation'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Occupation Name *
                </label>
                <input
                  type="text"
                  name="occupation_name"
                  value={formData.occupation_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.occupation_name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.occupation_name && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.occupation_name}</p>
                )}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && occupationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Confirm Delete</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Delete <span className="font-semibold">{occupationToDelete.occupation_name}</span>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This may affect customer registration dropdown.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setOccupationToDelete(null)
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
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
