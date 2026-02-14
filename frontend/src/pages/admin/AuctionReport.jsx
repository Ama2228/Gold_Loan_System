import { useState, useEffect } from 'react'
import { AlertCircle, Loader, Gavel, Download, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import apiService from '../../services/api'

export default function AuctionReport() {
  const userRole = sessionStorage.getItem('userRole')
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Filter state
  const [filters, setFilters] = useState({
    branch: 'ALL',
    status: 'ALL',
    overdueDays: ''
  })

  // Report state
  const [summary, setSummary] = useState(null)
  const [reportData, setReportData] = useState(null)

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

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches()
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

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await apiService.request('/admin/branches', {
        method: 'GET'
      })

      if (response.success) {
        const activeBranches = (response.data || []).filter(b => b.status === 'ACTIVE')
        setBranches(activeBranches)
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

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Rs. 0.00'
    return `Rs. ${Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Get reminder badge
  const getReminderBadge = (reminderLevel) => {
    const levels = {
      0: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
      1: { label: '1st Reminder', color: 'bg-blue-100 text-blue-800' },
      2: { label: '2nd Reminder', color: 'bg-orange-100 text-orange-800' },
      3: { label: '3rd Reminder', color: 'bg-red-100 text-red-800' }
    }
    const level = levels[reminderLevel] || levels[0]
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${level.color}`}>
        {level.label}
      </span>
    )
  }

  // Get auction status badge
  const getStatusBadge = (status) => {
    const statuses = {
      ELIGIBLE: 'bg-yellow-100 text-yellow-800',
      AUCTIONED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-blue-100 text-blue-800'
    }
    return statuses[status] || 'bg-gray-100 text-gray-800'
  }

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true)
      setError(null)
      setReportData(null)
      setSummary(null)

      // Build query params
      const params = new URLSearchParams()
      if (filters.branch !== 'ALL') params.append('branch', filters.branch)
      if (filters.status !== 'ALL') params.append('status', filters.status)
      if (filters.overdueDays) params.append('overdueDays', filters.overdueDays)

      const queryString = params.toString()
      const url = `/reports/auction${queryString ? '?' + queryString : ''}`

      const response = await apiService.request(url, {
        method: 'GET'
      })

      if (response.success) {
        setSummary(response.data?.summary || null)
        setReportData(response.data?.data || [])
        setSuccess('Report generated successfully')
      } else {
        setError(response.message || 'Failed to generate report')
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError(err.message || 'An error occurred while generating the report')
    } finally {
      setReportLoading(false)
    }
  }

  // Summary Card Component
  const SummaryCard = ({ icon: Icon, label, value, color }) => (
    <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className={`border-l-4 ${color} p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className={`h-10 w-10 ${color.replace('border', 'text').replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Auction List Report</h1>
        <p className="text-gray-600 mt-2">View tickets eligible for auction</p>
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

      {/* Filters Card */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold text-yellow-600">Report Filters</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {/* Branch Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Branch
              </label>
              <select
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                disabled={reportLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.branch_id} value={b.branch_code}>
                    {b.branch_code} - {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Auction Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                disabled={reportLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="ALL">All Status</option>
                <option value="ELIGIBLE">Eligible</option>
                <option value="AUCTIONED">Auctioned</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Overdue Days Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min. Days Overdue
              </label>
              <input
                type="number"
                name="overdueDays"
                value={filters.overdueDays}
                onChange={handleFilterChange}
                placeholder="Optional"
                disabled={reportLoading}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reportLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                disabled={!summary || reportLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon={AlertTriangle}
            label="Total Overdue Tickets"
            value={summary.totalOverdue || 0}
            color="border-red-500"
          />
          <SummaryCard
            icon={Clock}
            label="Eligible for Auction"
            value={summary.eligible || 0}
            color="border-yellow-500"
          />
          <SummaryCard
            icon={Gavel}
            label="Auction Completed"
            value={summary.auctioned || 0}
            color="border-gray-500"
          />
          <SummaryCard
            icon={DollarSign}
            label="Total Estimated Value"
            value={formatCurrency(summary.totalEstimatedValue)}
            color="border-green-500"
          />
        </div>
      )}

      {/* Auction Candidates Table */}
      {reportData !== null && (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-yellow-600">
              Auction Candidates ({reportData.length})
            </h2>
            {summary && (
              <p className="text-sm text-gray-600 mt-1">
                {filters.branch === 'ALL' ? 'All Branches' : branches.find(b => b.branch_code === filters.branch)?.branch_name} · {filters.status === 'ALL' ? 'All Status' : filters.status}
              </p>
            )}
          </div>

          {/* Loading State */}
          {reportLoading ? (
            <div className="p-12 text-center">
              <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center">
              <Gavel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No auction candidates found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your filters to find eligible tickets
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Receipt No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Current Interest
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Days Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Reminder Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Auction Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Est. Auction Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-gray-900">{row.receiptNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{row.customerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{row.branch}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(row.loanAmount)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(row.currentInterest)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{new Date(row.dueDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded font-semibold text-sm ${
                          row.daysOverdue > 90 ? 'bg-red-100 text-red-800' :
                          row.daysOverdue > 60 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {row.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getReminderBadge(row.reminderLevel)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(row.auctionStatus)}`}>
                          {row.auctionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(row.estimatedValue)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Initial State Message */}
      {reportData === null && !reportLoading && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-8 text-center">
          <Gavel className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-900 font-semibold">Select filters and click "Generate Report"</p>
          <p className="text-sm text-yellow-700 mt-2">View tickets eligible for auction based on overdue status and reminders sent</p>
        </div>
      )}
    </div>
  )
}
