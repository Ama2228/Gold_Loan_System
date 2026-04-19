import { useState, useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../services/api'

export default function ReversePawning() {
  const userRole = sessionStorage.getItem('userRole')
  const isManager = userRole === 'MANAGER'

  const [formData, setFormData] = useState({
    receiptNo: '',
    reason: '',
    confirmed: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [branchName, setBranchName] = useState('')
  const [reviewingId, setReviewingId] = useState(null)
  const dropdownRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await api.getManagerReversePawningList()
      if (res.success && res.data) {
        setHistory(res.data.list || [])
        setBranchName(res.data.branchName || '')
      }
    } catch (err) {
      console.error('Failed to load reverse pawning list:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (!isManager) {
      return
    }

    loadHistory()
  }, [isManager])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.searchStaffPawnTickets(searchQuery, true)
        const tickets = res?.data?.tickets || []
        setSearchResults(tickets)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isManager) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700">Reverse Pawning is a manager-only feature. You do not have permission to access this page.</p>
      </div>
    )
  }

  const handleReceiptSelect = (ticket) => {
    setFormData(prev => ({ ...prev, receiptNo: ticket.receipt_no || ticket.receiptNo }))
    setShowDropdown(false)
    setSearchQuery('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.receiptNo.trim()) errors.receiptNo = 'Receipt number is required'
    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required'
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters'
    }
    if (!formData.confirmed) errors.confirmed = 'You must confirm the reverse pawning'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm() || submitting) return

    setSubmitting(true)
    setFormErrors({})
    try {
      await api.createManagerReversePawning({
        receiptNo: formData.receiptNo.trim(),
        reason: formData.reason.trim()
      })
      setSuccessMessage('Reverse pawning recorded successfully.')
      setFormData({ receiptNo: '', reason: '', confirmed: false })
      await loadHistory()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to create reverse pawning' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReview = async (record, decision) => {
    if (!record?.id || reviewingId) return

    setReviewingId(record.id)
    setFormErrors({})

    try {
      if (decision === 'APPROVED') {
        await api.approveManagerReversePawning(record.id)
      } else {
        await api.rejectManagerReversePawning(record.id)
      }

      setSuccessMessage(`Reverse pawning ${decision.toLowerCase()} successfully.`)
      await loadHistory()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to review reverse pawning' })
    } finally {
      setReviewingId(null)
    }
  }

  const formatDateTime = (dt) => {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reverse Pawning</h1>
        <p className="text-gray-600 mt-2">Manager-only function</p>
        {branchName && (
          <div className="mt-3 inline-block">
            <span className="inline-block rounded-lg bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-800">
              {branchName}
            </span>
          </div>
        )}
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
          Create Reverse Pawning Record
        </h2>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
          Only tickets issued <strong>today</strong> can be reversed. Reversing archives the pawn ticket—the customer will have no active pawnings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Number */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receipt Number <span className="text-red-500">*</span>
            </label>
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
              placeholder="Search by receipt, customer name, or NIC (min 2 chars)..."
              className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                formErrors.receiptNo ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-yellow-400'
              }`}
            />
            {showDropdown && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
                {searching ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((ticket) => (
                    <button
                      key={ticket.ticket_id}
                      type="button"
                      onClick={() => handleReceiptSelect(ticket)}
                      className="w-full text-left px-4 py-3 hover:bg-yellow-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">{ticket.receipt_no}</p>
                      <p className="text-xs text-gray-600">
                        {ticket.customer_name} - ₨. {(ticket.loan_amount || 0).toLocaleString()}
                      </p>
                    </button>
                  ))
                ) : (
                  searchQuery.length >= 2 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">No matching active tickets found</div>
                  )
                )}
              </div>
            )}
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
                formErrors.reason ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-yellow-400'
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

          {formErrors.submit && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {formErrors.submit}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-yellow-500 px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Reverse Pawning'}
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

        {historyLoading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Receipt No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{record.receiptNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(record.dateTime)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.reason}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-bold ${
                            record.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {record.status}
                        </span>
                        {record.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReview(record, 'APPROVED')}
                              disabled={reviewingId === record.id}
                              className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(record, 'REJECTED')}
                              disabled={reviewingId === record.id}
                              className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No reverse pawning records yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
