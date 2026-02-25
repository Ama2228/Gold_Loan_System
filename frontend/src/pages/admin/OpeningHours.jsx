import { useState, useEffect } from 'react'
import { AlertCircle, Loader, Clock, RefreshCw } from 'lucide-react'
import apiService from '../../services/api'

export default function OpeningHours() {
  const userRole = sessionStorage.getItem('userRole')
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const DAY_LABELS = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday'
  }

  const DEFAULT_HOURS = [
    { day_of_week: 'MON', open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 'TUE', open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 'WED', open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 'THU', open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 'FRI', open_time: '08:00', close_time: '18:00', is_closed: false },
    { day_of_week: 'SAT', open_time: '08:00', close_time: '14:00', is_closed: false },
    { day_of_week: 'SUN', open_time: null, close_time: null, is_closed: true }
  ]

  const [openingHours, setOpeningHours] = useState(DEFAULT_HOURS)

  // Role guard
  if (userRole !== 'ADMIN') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">Opening Hours management is restricted to administrators only.</p>
      </div>
    )
  }

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches()
  }, [])

  // Fetch opening hours when branch is selected
  useEffect(() => {
    if (selectedBranchId) {
      fetchOpeningHours(selectedBranchId)
    }
  }, [selectedBranchId])

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

  // Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await apiService.request('/admin/branches', {
        method: 'GET'
      })

      if (response.success) {
        const activeBranches = (response.data || []).filter(b => b.status === 'ACTIVE')
        setBranches(activeBranches)
        if (activeBranches.length > 0) {
          setSelectedBranchId(activeBranches[0].branch_id)
        }
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

  // Fetch opening hours for selected branch
  const fetchOpeningHours = async (branchId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request(`/admin/branches/${branchId}/opening-hours`, {
        method: 'GET'
      })

      if (response.success && response.data) {
        // Ensure we have all 7 days
        const hoursMap = {}
        response.data.forEach(h => {
          hoursMap[h.day_of_week] = h
        })

        const completeHours = DAYS.map(day => {
          if (hoursMap[day]) {
            return {
              day_of_week: day,
              open_time: hoursMap[day].open_time || null,
              close_time: hoursMap[day].close_time || null,
              is_closed: hoursMap[day].is_closed || false
            }
          } else {
            // Find default for this day
            return DEFAULT_HOURS.find(h => h.day_of_week === day) || {
              day_of_week: day,
              open_time: '08:00',
              close_time: '18:00',
              is_closed: false
            }
          }
        })

        setOpeningHours(completeHours)
      } else {
        setError(response.message || 'Failed to load opening hours')
      }
    } catch (err) {
      console.error('Error fetching opening hours:', err)
      setError(err.message || 'An error occurred while loading opening hours')
    } finally {
      setLoading(false)
    }
  }

  // Validate opening hours
  const validateHours = () => {
    const errors = {}

    openingHours.forEach((h, idx) => {
      if (!h.is_closed) {
        if (!h.open_time || !h.close_time) {
          errors[h.day_of_week] = 'Open and close times are required'
        } else if (h.open_time >= h.close_time) {
          errors[h.day_of_week] = 'Open time must be before close time'
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle time change
  const handleTimeChange = (day, field, value) => {
    setOpeningHours(prev =>
      prev.map(h =>
        h.day_of_week === day
          ? { ...h, [field]: value }
          : h
      )
    )
    // Clear error for this day
    if (validationErrors[day]) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[day]
        return updated
      })
    }
  }

  // Handle closed toggle
  const handleClosedToggle = (day) => {
    setOpeningHours(prev =>
      prev.map(h =>
        h.day_of_week === day
          ? {
              ...h,
              is_closed: !h.is_closed,
              open_time: !h.is_closed ? null : h.open_time,
              close_time: !h.is_closed ? null : h.close_time
            }
          : h
      )
    )
    // Clear error for this day
    if (validationErrors[day]) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[day]
        return updated
      })
    }
  }

  // Save opening hours
  const handleSave = async () => {
    if (!validateHours()) {
      setError('Please fix validation errors before saving')
      return
    }

    if (!selectedBranchId) {
      setError('Please select a branch')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await apiService.request(`/admin/branches/${selectedBranchId}/opening-hours`, {
        method: 'PUT',
        body: JSON.stringify(openingHours)
      })

      if (response.success) {
        setSuccess('Opening hours updated successfully')
        fetchOpeningHours(selectedBranchId) // Refresh data
      } else {
        setError(response.message || 'Failed to update opening hours')
      }
    } catch (err) {
      console.error('Error saving opening hours:', err)
      setError(err.message || 'An error occurred while saving opening hours')
    } finally {
      setSaving(false)
    }
  }

  // Reset to default hours
  const handleResetToDefault = () => {
    setOpeningHours([...DEFAULT_HOURS])
    setValidationErrors({})
    setSuccess('Reset to default hours')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Opening Hours</h1>
        <p className="text-gray-600 mt-2">Set branch working hours (Mon–Sun)</p>
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

      {/* Branch Selector Card */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-bold text-gray-900">Select Branch</h2>
        </div>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          disabled={loading || branches.length === 0}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          {branches.length === 0 && (
            <option value="">No branches available</option>
          )}
          {branches.map((branch) => (
            <option key={branch.branch_id} value={branch.branch_id}>
              {branch.branch_code} - {branch.branch_name}
            </option>
          ))}
        </select>
      </div>

      {/* Opening Hours Editor */}
      {loading ? (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-12 text-center">
          <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading opening hours...</p>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-yellow-600">Weekly Schedule</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 font-semibold text-sm text-gray-700">
                <div className="col-span-3">Day</div>
                <div className="col-span-3">Open Time</div>
                <div className="col-span-3">Close Time</div>
                <div className="col-span-3 text-center">Closed</div>
              </div>

              {/* Rows */}
              {openingHours.map((hour) => (
                <div key={hour.day_of_week}>
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Day */}
                    <div className="col-span-3">
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-2 rounded font-semibold text-sm">
                        {DAY_LABELS[hour.day_of_week]}
                      </span>
                    </div>

                    {/* Open Time */}
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={hour.open_time || ''}
                        onChange={(e) => handleTimeChange(hour.day_of_week, 'open_time', e.target.value)}
                        disabled={hour.is_closed}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          validationErrors[hour.day_of_week]
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Close Time */}
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={hour.close_time || ''}
                        onChange={(e) => handleTimeChange(hour.day_of_week, 'close_time', e.target.value)}
                        disabled={hour.is_closed}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          validationErrors[hour.day_of_week]
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Closed Toggle */}
                    <div className="col-span-3 flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hour.is_closed}
                          onChange={() => handleClosedToggle(hour.day_of_week)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Validation Error */}
                  {validationErrors[hour.day_of_week] && (
                    <p className="text-red-600 text-xs mt-1 ml-3">
                      {validationErrors[hour.day_of_week]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleResetToDefault}
                disabled={saving || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading || !selectedBranchId}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
