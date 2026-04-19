import { useState, useEffect } from 'react'
import { AlertCircle, Loader, Calendar, Download, TrendingUp, DollarSign, FileText, Sheet } from 'lucide-react'
import apiService from '../../services/api'
import { exportToPdf, exportToExcel } from '../../utils/reportExport'

export default function DailyReport() {
  const userRole = sessionStorage.getItem('userRole') || 'STAFF'
  const userStr = localStorage.getItem('user')
  const userBranchId = userStr ? (JSON.parse(userStr)?.branchId ?? null) : null
  const isStaff = userRole === 'STAFF'
  const isAdmin = userRole === 'ADMIN'

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Filter state - STAFF defaults to their branch; others to ALL
  const [filters, setFilters] = useState({
    branch: 'ALL',
    date: new Date().toISOString().split('T')[0]
  })

  // Report state
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const staffBranch = isStaff ? branches.find(b => b.branch_id === userBranchId) : null

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches()
  }, [])

  // For STAFF: set default branch to their branch once branches load
  useEffect(() => {
    if (!isStaff || !userBranchId || branches.length === 0) return
    const myBranch = branches.find(b => b.branch_id === userBranchId)
    if (myBranch) {
      setFilters(prev => (prev.branch === 'ALL' ? { ...prev, branch: myBranch.branch_code } : prev))
    }
  }, [branches, userBranchId, isStaff])

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

  // Fetch branches - ADMIN uses admin API; STAFF/MANAGER use staff appointments branches
  const fetchBranches = async () => {
    try {
      setLoading(true)
      let response
      if (isAdmin) {
        response = await apiService.request('/admin/branches', { method: 'GET' })
        if (response.success) {
          const activeBranches = (response.data || []).filter(b => b.status === 'ACTIVE')
          setBranches(activeBranches)
        }
      } else {
        response = await apiService.getStaffAppointmentBranches()
        if (response.success) {
          let list = response.data || []
          if (isStaff && userBranchId) {
            list = list.filter(b => b.branch_id === userBranchId)
          }
          setBranches(list)
        }
      }
      if (!response.success) {
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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true)
      setError(null)
      setReportData(null)
      setSummary(null)

      // Build query params
      const params = new URLSearchParams({
        branch: filters.branch,
        date: filters.date
      }).toString()

      const response = await apiService.request(`/reports/daily?${params}`, {
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

  const handleExportPdf = () => {
    if (!summary || !reportData) return
    const totals = summary.transactionCounts || {}
    const branchLabel = filters.branch === 'ALL' ? 'All Branches' : branches.find(b => b.branch_code === filters.branch)?.branch_name || filters.branch
    exportToPdf({
      title: 'Daily Report',
      subtitle: `Report for ${formatDate(filters.date)} - ${branchLabel}`,
      summaryRows: [
        { label: 'Total Pawn Tickets', value: summary.totalTickets || 0 },
        { label: 'Total Payments', value: summary.totalPayments || 0 },
        { label: 'Total Interest Collected', value: formatCurrency(summary.totalInterest) },
        { label: 'Total Loan Issued', value: formatCurrency(summary.totalLoanIssued) },
        { label: 'Pawnings', value: totals.pawnings || 0 },
        { label: 'Redeems', value: totals.redeems || 0 },
        { label: 'Renewals', value: totals.renewals || 0 },
        { label: 'Part Payments', value: totals.partPayments || 0 }
      ],
      tableHeaders: ['Receipt No', 'Customer Name', 'Loan Amount', 'Interest Paid', 'Payment Type', 'Status', 'Branch'],
      tableData: reportData.map(r => [
        r.receiptNo,
        r.customerName,
        formatCurrency(r.loanAmount),
        formatCurrency(r.interestPaid),
        r.paymentType || 'NONE',
        r.status,
        r.branch || ''
      ]),
      filename: `daily-report-${filters.date}.pdf`
    })
  }

  const handleExportExcel = () => {
    if (!summary || !reportData) return
    const totals = summary.transactionCounts || {}
    const branchLabel = filters.branch === 'ALL' ? 'All Branches' : branches.find(b => b.branch_code === filters.branch)?.branch_name || filters.branch
    exportToExcel({
      title: 'Daily Report',
      subtitle: `Report for ${formatDate(filters.date)} - ${branchLabel}`,
      summaryRows: [
        { label: 'Total Pawn Tickets', value: summary.totalTickets || 0 },
        { label: 'Total Payments', value: summary.totalPayments || 0 },
        { label: 'Total Interest Collected', value: formatCurrency(summary.totalInterest) },
        { label: 'Total Loan Issued', value: formatCurrency(summary.totalLoanIssued) },
        { label: 'Pawnings', value: totals.pawnings || 0 },
        { label: 'Redeems', value: totals.redeems || 0 },
        { label: 'Renewals', value: totals.renewals || 0 },
        { label: 'Part Payments', value: totals.partPayments || 0 }
      ],
      tableHeaders: ['Receipt No', 'Customer Name', 'Loan Amount', 'Interest Paid', 'Payment Type', 'Status', 'Branch'],
      tableData: reportData.map(r => [
        r.receiptNo,
        r.customerName,
        formatCurrency(r.loanAmount),
        formatCurrency(r.interestPaid),
        r.paymentType || 'NONE',
        r.status,
        r.branch || ''
      ]),
      filename: `daily-report-${filters.date}.xlsx`
    })
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
        <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
        <p className="text-gray-600 mt-2">View all pawning transactions, payments and activity for selected date</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Branch */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Branch
              </label>
              {isStaff ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">
                  {staffBranch ? `${staffBranch.branch_code} - ${staffBranch.branch_name}` : 'Assigned branch'}
                </div>
              ) : (
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
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                disabled={reportLoading}
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
                    <Download className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>

            {/* Export PDF */}
            <div className="flex items-end">
              <button
                onClick={handleExportPdf}
                disabled={!summary || reportLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>

            {/* Export Excel */}
            <div className="flex items-end">
              <button
                onClick={handleExportExcel}
                disabled={!summary || reportLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sheet className="h-4 w-4" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon={FileText}
            label="Total Pawn Tickets"
            value={summary.totalTickets || 0}
            color="border-yellow-500"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Total Payments"
            value={summary.totalPayments || 0}
            color="border-green-500"
          />
          <SummaryCard
            icon={DollarSign}
            label="Total Interest Collected"
            value={formatCurrency(summary.totalInterest)}
            color="border-blue-500"
          />
          <SummaryCard
            icon={DollarSign}
            label="Total Loan Issued"
            value={formatCurrency(summary.totalLoanIssued)}
            color="border-purple-500"
          />
        </div>
      )}

      {/* Data Table Card */}
      {reportData !== null && (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b-2 border-yellow-500 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-yellow-600">
              Transaction Details ({reportData.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Report for {formatDate(filters.date)} - {filters.branch === 'ALL' ? 'All Branches' : branches.find(b => b.branch_code === filters.branch)?.branch_name}
            </p>
          </div>

          {/* Loading State */}
          {reportLoading ? (
            <div className="p-12 text-center">
              <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No transactions found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your filters or selecting a different date
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Interest Paid
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Branch
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
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(row.loanAmount)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(row.interestPaid)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            row.paymentType === 'FULL'
                              ? 'bg-green-100 text-green-800'
                              : row.paymentType === 'PART'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {row.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{row.branch}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary?.transactionCounts && reportData.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">End of Report Totals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded bg-white border border-gray-200 px-3 py-2">
                  <p className="text-gray-600">Pawnings</p>
                  <p className="font-bold text-gray-900">{summary.transactionCounts.pawnings || 0}</p>
                </div>
                <div className="rounded bg-white border border-gray-200 px-3 py-2">
                  <p className="text-gray-600">Redeems</p>
                  <p className="font-bold text-gray-900">{summary.transactionCounts.redeems || 0}</p>
                </div>
                <div className="rounded bg-white border border-gray-200 px-3 py-2">
                  <p className="text-gray-600">Renewals</p>
                  <p className="font-bold text-gray-900">{summary.transactionCounts.renewals || 0}</p>
                </div>
                <div className="rounded bg-white border border-gray-200 px-3 py-2">
                  <p className="text-gray-600">Part Payments</p>
                  <p className="font-bold text-gray-900">{summary.transactionCounts.partPayments || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State Message */}
      {reportData === null && !reportLoading && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-blue-900 font-semibold">Select filters and click "Generate Report"</p>
          <p className="text-sm text-blue-700 mt-2">Choose a branch and date to view daily transaction details</p>
        </div>
      )}
    </div>
  )
}
