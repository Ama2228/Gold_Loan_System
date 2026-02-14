import { useState, useEffect } from 'react'
import { AlertCircle, Loader, Settings, Save, DollarSign, FileText, Calendar } from 'lucide-react'
import apiService from '../../services/api'

export default function SystemSettings() {
  const userRole = sessionStorage.getItem('userRole')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [saving, setSaving] = useState(null) // Track which setting is being saved

  // Form state
  const [formData, setFormData] = useState({
    ANNUAL_INTEREST_RATE: '',
    MIN_LOAN_AMOUNT: '',
    MAX_ARTICLES_PER_TICKET: '',
    APPOINTMENT_SLOT_CAPACITY: '',
    APPOINTMENT_SLOT_START: '',
    APPOINTMENT_SLOT_END: '',
    APPOINTMENT_SLOT_MINUTES: ''
  })

  const [formErrors, setFormErrors] = useState({})

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

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
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

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request('/admin/settings', {
        method: 'GET'
      })

      if (response.success) {
        // Convert array to key-value map
        const settingsMap = {}
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(setting => {
            settingsMap[setting.setting_key] = setting.setting_value
          })
        }

        setSettings(settingsMap)

        // Populate form data
        setFormData({
          ANNUAL_INTEREST_RATE: settingsMap.ANNUAL_INTEREST_RATE || '',
          MIN_LOAN_AMOUNT: settingsMap.MIN_LOAN_AMOUNT || '',
          MAX_ARTICLES_PER_TICKET: settingsMap.MAX_ARTICLES_PER_TICKET || '',
          APPOINTMENT_SLOT_CAPACITY: settingsMap.APPOINTMENT_SLOT_CAPACITY || '',
          APPOINTMENT_SLOT_START: settingsMap.APPOINTMENT_SLOT_START || '',
          APPOINTMENT_SLOT_END: settingsMap.APPOINTMENT_SLOT_END || '',
          APPOINTMENT_SLOT_MINUTES: settingsMap.APPOINTMENT_SLOT_MINUTES || ''
        })
      } else {
        setError(response.message || 'Failed to load settings')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err.message || 'An error occurred while loading settings')
    } finally {
      setLoading(false)
    }
  }

  // Validate a specific setting
  const validateSetting = (key, value) => {
    switch (key) {
      case 'ANNUAL_INTEREST_RATE':
        const rate = parseFloat(value)
        if (isNaN(rate) || rate <= 0 || rate > 100) {
          return 'Interest rate must be between 0 and 100'
        }
        break

      case 'MIN_LOAN_AMOUNT':
        const minLoan = parseFloat(value)
        if (isNaN(minLoan) || minLoan < 5000) {
          return 'Minimum loan amount must be at least Rs. 5,000'
        }
        break

      case 'MAX_ARTICLES_PER_TICKET':
        const maxArticles = parseInt(value, 10)
        if (isNaN(maxArticles) || maxArticles < 1 || maxArticles > 5) {
          return 'Max articles must be between 1 and 5'
        }
        break

      case 'APPOINTMENT_SLOT_CAPACITY':
        const capacity = parseInt(value, 10)
        if (isNaN(capacity) || capacity < 1 || capacity > 5) {
          return 'Slot capacity must be between 1 and 5'
        }
        break

      case 'APPOINTMENT_SLOT_MINUTES':
        const minutes = parseInt(value, 10)
        if (minutes !== 30) {
          return 'Slot duration must be 30 minutes'
        }
        break

      case 'APPOINTMENT_SLOT_START':
      case 'APPOINTMENT_SLOT_END':
        if (!value || !/^\d{2}:\d{2}$/.test(value)) {
          return 'Time must be in HH:MM format'
        }
        // Check start < end if both are present
        if (key === 'APPOINTMENT_SLOT_START' && formData.APPOINTMENT_SLOT_END) {
          if (value >= formData.APPOINTMENT_SLOT_END) {
            return 'Start time must be before end time'
          }
        }
        if (key === 'APPOINTMENT_SLOT_END' && formData.APPOINTMENT_SLOT_START) {
          if (value <= formData.APPOINTMENT_SLOT_START) {
            return 'End time must be after start time'
          }
        }
        break

      default:
        break
    }
    return null
  }

  // Handle input change
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Clear error for this field
    if (formErrors[key]) {
      setFormErrors(prev => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
    }
  }

  // Save a specific setting
  const handleSaveSetting = async (key) => {
    const value = formData[key]

    // Validate
    const validationError = validateSetting(key, value)
    if (validationError) {
      setFormErrors(prev => ({ ...prev, [key]: validationError }))
      return
    }

    try {
      setSaving(key)
      setError(null)

      const response = await apiService.request(`/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      })

      if (response.success) {
        setSuccess(`${key.replace(/_/g, ' ')} updated successfully`)
        setSettings(prev => ({ ...prev, [key]: value }))
      } else {
        setError(response.message || `Failed to update ${key}`)
      }
    } catch (err) {
      console.error(`Error updating ${key}:`, err)
      setError(err.message || `An error occurred while updating ${key}`)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure global system parameters</p>
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
          <p className="text-gray-600">Loading settings...</p>
        </div>
      ) : (
        <>
          {/* Loan & Interest Section */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-yellow-600">Loan & Interest</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Annual Interest Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Interest Rate (%)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ANNUAL_INTEREST_RATE}
                    onChange={(e) => handleInputChange('ANNUAL_INTEREST_RATE', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.ANNUAL_INTEREST_RATE
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('ANNUAL_INTEREST_RATE')}
                    disabled={saving === 'ANNUAL_INTEREST_RATE'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'ANNUAL_INTEREST_RATE' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.ANNUAL_INTEREST_RATE && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.ANNUAL_INTEREST_RATE}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Annual interest rate applied to all pawn tickets (0-100%)
                </p>
              </div>

              {/* Minimum Loan Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Loan Amount (Rs.)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="1"
                    value={formData.MIN_LOAN_AMOUNT}
                    onChange={(e) => handleInputChange('MIN_LOAN_AMOUNT', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.MIN_LOAN_AMOUNT
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('MIN_LOAN_AMOUNT')}
                    disabled={saving === 'MIN_LOAN_AMOUNT'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'MIN_LOAN_AMOUNT' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.MIN_LOAN_AMOUNT && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.MIN_LOAN_AMOUNT}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum loan amount allowed per ticket (must be ≥ Rs. 5,000)
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Rules Section */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-yellow-600">Ticket Rules</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Max Articles Per Ticket */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Articles Per Ticket
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.MAX_ARTICLES_PER_TICKET}
                    onChange={(e) => handleInputChange('MAX_ARTICLES_PER_TICKET', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.MAX_ARTICLES_PER_TICKET
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('MAX_ARTICLES_PER_TICKET')}
                    disabled={saving === 'MAX_ARTICLES_PER_TICKET'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'MAX_ARTICLES_PER_TICKET' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.MAX_ARTICLES_PER_TICKET && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.MAX_ARTICLES_PER_TICKET}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of articles allowed per ticket (1-5)
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Rules Section */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-yellow-600">Appointment Rules</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Slot Capacity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot Capacity
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.APPOINTMENT_SLOT_CAPACITY}
                    onChange={(e) => handleInputChange('APPOINTMENT_SLOT_CAPACITY', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.APPOINTMENT_SLOT_CAPACITY
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('APPOINTMENT_SLOT_CAPACITY')}
                    disabled={saving === 'APPOINTMENT_SLOT_CAPACITY'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'APPOINTMENT_SLOT_CAPACITY' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.APPOINTMENT_SLOT_CAPACITY && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.APPOINTMENT_SLOT_CAPACITY}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Default number of appointments per time slot (1-5)
                </p>
              </div>

              {/* Slot Start Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot Start Time
                </label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={formData.APPOINTMENT_SLOT_START}
                    onChange={(e) => handleInputChange('APPOINTMENT_SLOT_START', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.APPOINTMENT_SLOT_START
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('APPOINTMENT_SLOT_START')}
                    disabled={saving === 'APPOINTMENT_SLOT_START'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'APPOINTMENT_SLOT_START' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.APPOINTMENT_SLOT_START && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.APPOINTMENT_SLOT_START}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Daily appointment slots start time (e.g., 09:00)
                </p>
              </div>

              {/* Slot End Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot End Time
                </label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={formData.APPOINTMENT_SLOT_END}
                    onChange={(e) => handleInputChange('APPOINTMENT_SLOT_END', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.APPOINTMENT_SLOT_END
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('APPOINTMENT_SLOT_END')}
                    disabled={saving === 'APPOINTMENT_SLOT_END'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'APPOINTMENT_SLOT_END' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.APPOINTMENT_SLOT_END && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.APPOINTMENT_SLOT_END}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Daily appointment slots end time (e.g., 14:00)
                </p>
              </div>

              {/* Slot Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot Duration (minutes)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={formData.APPOINTMENT_SLOT_MINUTES}
                    onChange={(e) => handleInputChange('APPOINTMENT_SLOT_MINUTES', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      formErrors.APPOINTMENT_SLOT_MINUTES
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => handleSaveSetting('APPOINTMENT_SLOT_MINUTES')}
                    disabled={saving === 'APPOINTMENT_SLOT_MINUTES'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'APPOINTMENT_SLOT_MINUTES' ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                </div>
                {formErrors.APPOINTMENT_SLOT_MINUTES && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.APPOINTMENT_SLOT_MINUTES}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Duration of each appointment slot (fixed at 30 minutes)
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">System Configuration</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Changes to system settings take effect immediately and apply to all new tickets and appointments.
                  Existing tickets and appointments are not affected.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
