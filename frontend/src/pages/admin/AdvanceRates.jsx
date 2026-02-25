import { useState, useEffect } from 'react'
import { AlertCircle, Loader, RefreshCw, DollarSign } from 'lucide-react'
import apiService from '../../services/api'

export default function AdvanceRates() {
  const userRole = sessionStorage.getItem('userRole')
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedKarat, setSelectedKarat] = useState(null)
  const [newAdvanceValue, setNewAdvanceValue] = useState('')
  const [valueError, setValueError] = useState('')
  const [updating, setUpdating] = useState(false)

  const KARATS = [18, 20, 22]

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

  // Fetch rates on mount
  useEffect(() => {
    fetchRates()
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

  // Fetch rates from API
  const fetchRates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.request('/admin/karat-advance-rates', {
        method: 'GET'
      })

      if (response.success) {
        // Map rates by karat for easy lookup
        const ratesMap = {}
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(rate => {
            ratesMap[rate.karat] = rate
          })
        }

        // Build complete list with all karats (18, 20, 22)
        const completeRates = KARATS.map(karat => {
          if (ratesMap[karat]) {
            return ratesMap[karat]
          } else {
            // Karat not found in response, show placeholder
            return {
              karat,
              advance_value_per_gram: null,
              effective_from: null
            }
          }
        })

        setRates(completeRates)
      } else {
        setError(response.message || 'Failed to load advance rates')
      }
    } catch (err) {
      console.error('Error fetching advance rates:', err)
      setError(err.message || 'An error occurred while loading advance rates')
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    return `Rs. ${Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Open update modal
  const handleUpdateClick = (rateData) => {
    setSelectedKarat(rateData.karat)
    setNewAdvanceValue(rateData.advance_value_per_gram ? rateData.advance_value_per_gram.toString() : '')
    setValueError('')
    setShowUpdateModal(true)
  }

  // Validate advance value
  const validateValue = () => {
    const value = parseFloat(newAdvanceValue)
    if (isNaN(value)) {
      setValueError('Advance value must be a valid number')
      return false
    }
    if (value <= 0) {
      setValueError('Advance value must be greater than 0')
      return false
    }
    setValueError('')
    return true
  }

  // Save updated rate
  const handleSaveUpdate = async () => {
    if (!validateValue()) {
      return
    }

    if (!KARATS.includes(selectedKarat)) {
      setError('Invalid karat value. Must be 18, 20, or 22')
      return
    }

    try {
      setUpdating(true)
      setError(null)

      const value = parseFloat(newAdvanceValue)

      const response = await apiService.request(`/admin/karat-advance-rates/${selectedKarat}`, {
        method: 'PUT',
        body: JSON.stringify({ advance_value_per_gram: value })
      })

      if (response.success) {
        setSuccess('Rate updated successfully')
        setShowUpdateModal(false)
        fetchRates()
      } else {
        setError(response.message || 'Failed to update rate')
      }
    } catch (err) {
      console.error('Error updating rate:', err)
      setError(err.message || 'An error occurred while updating the rate')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Karat Advance Rates</h1>
        <p className="text-gray-600 mt-2">Update advance value per gram for each karat</p>
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
          <p className="text-gray-600">Loading advance rates...</p>
        </div>
      ) : (
        <>
          {/* Main Card */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-yellow-600">
                Current Advance Rates
              </h2>
              <button
                onClick={fetchRates}
                className="flex items-center gap-2 rounded px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                title="Refresh rates"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Karat
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Current Advance Value (per gram)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Effective From
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr
                      key={rate.karat}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-yellow-600" />
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-bold text-sm">
                            {rate.karat}K
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(rate.advance_value_per_gram)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(rate.effective_from)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleUpdateClick(rate)}
                            className="flex items-center gap-1 rounded px-4 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-black transition-colors shadow-sm"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Note:</span> Updated rates are used for home page display and pawn ticket calculations.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedKarat && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Update Advance Rate</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Karat Display (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Karat
                </label>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-bold text-sm">
                    {selectedKarat}K Gold
                  </span>
                </div>
              </div>

              {/* New Advance Value Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Advance Value (Rs. per gram) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAdvanceValue}
                  onChange={(e) => {
                    setNewAdvanceValue(e.target.value)
                    setValueError('')
                  }}
                  placeholder="e.g., 12500.00"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    valueError
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {valueError && (
                  <p className="text-red-600 text-xs mt-1">{valueError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This rate will be used for advance calculations
                </p>
              </div>

              {/* Current Value Display */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Current Rate</p>
                <p className="font-semibold text-blue-900">
                  {formatCurrency(rates.find(r => r.karat === selectedKarat)?.advance_value_per_gram)}
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUpdate}
                  disabled={updating}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
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
