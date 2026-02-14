import { useState, useEffect } from 'react'
import { AlertCircle, Plus, Loader, Edit2, Calendar, CheckCircle, XCircle } from 'lucide-react'
import apiService from '../../services/api'

export default function PawningPeriods() {
  const userRole = sessionStorage.getItem('userRole')
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' or 'edit'
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [formData, setFormData] = useState({
    period_name: '',
    duration_months: 3,
    is_active: true
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Toggle confirmation
  const [showToggleConfirm, setShowToggleConfirm] = useState(false)
  const [periodToToggle, setPeriodToToggle] = useState(null)
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

  // Fetch periods on mount
  useEffect(() => {
    fetchPeriods()
  }, [])

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

  // Fetch periods from API
  const fetchPeriods = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request('/admin/pawning-periods', {
        method: 'GET'
      })

      if (response.success) {
        // Sort by duration_months
        const sortedPeriods = (response.data || []).sort((a, b) => a.duration_months - b.duration_months)
        setPeriods(sortedPeriods)
      } else {
        setError(response.message || 'Failed to load pawning periods')
      }
    } catch (err) {
      console.error('Error fetching pawning periods:', err)
      setError(err.message || 'An error occurred while loading pawning periods')
    } finally {
      setLoading(false)
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.period_name.trim()) {
      errors.period_name = 'Period name is required'
    }

    if (![3, 6, 12].includes(Number(formData.duration_months))) {
      errors.duration_months = 'Duration must be 3, 6, or 12 months'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open add modal
  const handleAddPeriod = () => {
    setModalType('add')
    setFormData({
      period_name: '',
      duration_months: 3,
      is_active: true
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Open edit modal
  const handleEditPeriod = (period) => {
    setModalType('edit')
    setSelectedPeriod(period)
    setFormData({
      period_name: period.period_name,
      duration_months: period.duration_months,
      is_active: period.is_active === 1 || period.is_active === true
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
        period_name: formData.period_name,
        duration_months: Number(formData.duration_months),
        is_active: formData.is_active ? 1 : 0
      }

      let response

      if (modalType === 'add') {
        response = await apiService.request('/admin/pawning-periods', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      } else {
        response = await apiService.request(`/admin/pawning-periods/${selectedPeriod.period_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      }

      if (response.success) {
        setSuccess(`Pawning period ${modalType === 'add' ? 'created' : 'updated'} successfully`)
        setShowModal(false)
        fetchPeriods()
      } else {
        // Handle 409 duplicate error
        if (response.message && response.message.toLowerCase().includes('already exists')) {
          setError('Pawning period already exists')
        } else {
          setError(response.message || 'Failed to save pawning period')
        }
      }
    } catch (err) {
      console.error('Error saving pawning period:', err)
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setError('Pawning period already exists')
      } else {
        setError(err.message || 'An error occurred while saving the pawning period')
      }
    } finally {
      setSaving(false)
    }
  }

  // Open toggle confirmation
  const handleToggleClick = (period) => {
    setPeriodToToggle(period)
    setShowToggleConfirm(true)
  }

  // Confirm toggle
  const handleConfirmToggle = async () => {
    if (!periodToToggle) return

    try {
      setToggling(true)
      setError(null)

      const newStatus = periodToToggle.is_active === 1 || periodToToggle.is_active === true ? 0 : 1

      const response = await apiService.request(`/admin/pawning-periods/${periodToToggle.period_id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: newStatus })
      })

      if (response.success) {
        setSuccess(`Pawning period ${newStatus === 1 ? 'enabled' : 'disabled'} successfully`)
        setShowToggleConfirm(false)
        setPeriodToToggle(null)
        fetchPeriods()
      } else {
        setError(response.message || 'Failed to update pawning period status')
      }
    } catch (err) {
      console.error('Error toggling pawning period:', err)
      setError(err.message || 'An error occurred while updating the pawning period')
    } finally {
      setToggling(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pawning Periods</h1>
          <p className="text-gray-600 mt-2">Manage selectable ticket periods (months)</p>
        </div>
        <button
          onClick={handleAddPeriod}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Add Period
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
          <p className="text-gray-600">Loading pawning periods...</p>
        </div>
      ) : (
        <>
          {/* Main Card */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-yellow-600">
                Pawning Periods ({periods.length})
              </h2>
            </div>

            {/* Table */}
            {periods.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No pawning periods found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Click "Add Period" to create a new pawning period
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Period Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Duration (Months)
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
                    {periods.map((period) => (
                      <tr
                        key={period.period_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{period.period_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-semibold text-sm">
                            {period.duration_months} months
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              period.is_active === 1 || period.is_active === true
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {period.is_active === 1 || period.is_active === true ? (
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
                              onClick={() => handleEditPeriod(period)}
                              className="flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit period"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleClick(period)}
                              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                period.is_active === 1 || period.is_active === true
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={
                                period.is_active === 1 || period.is_active === true
                                  ? 'Disable period'
                                  : 'Enable period'
                              }
                            >
                              {period.is_active === 1 || period.is_active === true ? 'Disable' : 'Enable'}
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
                {modalType === 'add' ? 'Add New Period' : 'Edit Period'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Period Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period Name *
                </label>
                <input
                  type="text"
                  name="period_name"
                  value={formData.period_name}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 Months"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.period_name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.period_name && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.period_name}</p>
                )}
              </div>

              {/* Duration Months */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (Months) *
                </label>
                <select
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    formErrors.duration_months
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                </select>
                {formErrors.duration_months && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.duration_months}</p>
                )}
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
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
      {showToggleConfirm && periodToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Confirm Action</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to{' '}
                <span className="font-semibold">
                  {periodToToggle.is_active === 1 || periodToToggle.is_active === true ? 'disable' : 'enable'}
                </span>{' '}
                the period <span className="font-semibold">{periodToToggle.period_name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowToggleConfirm(false)
                    setPeriodToToggle(null)
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
