import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import api from '../../services/api'
import CustomerRatingCard from '../../components/CustomerRatingCard'

const ITEM_TYPES = ['Chain', 'Ring', 'Bangle', 'Bracelet', 'Earring', 'Pendant', 'Necklace']
const INTEREST_PERCENTAGE = 100

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function NewTicket() {
  const navigate = useNavigate()
  const [karatRates, setKaratRates] = useState([])
  const [pawningPeriods, setPawningPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [branchId, setBranchId] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const debouncedSearch = useDebounce(customerSearch, 300)
  const [rating, setRating] = useState(null)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState(null)

  const [pawningPeriodMonths, setPawningPeriodMonths] = useState(6)
  const [articles, setArticles] = useState([])
  const [articleError, setArticleError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestedLoanAmount, setRequestedLoanAmount] = useState('')

  const [currentArticle, setCurrentArticle] = useState({
    item_type: 'Chain',
    quantity: 1,
    gross_weight_grams: '',
    net_weight_grams: '',
    purity_karat: '',
    notes: ''
  })

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true)
        const [ratesRes, periodsRes] = await Promise.all([
          api.get('/staff/pawn-tickets/meta/karat-rates'),
          api.get('/staff/pawn-tickets/meta/pawning-periods')
        ])
        if (ratesRes.success && ratesRes.data) setKaratRates(ratesRes.data)
        if (periodsRes.success && periodsRes.data) {
          setPawningPeriods(periodsRes.data)
          if (periodsRes.data.length > 0) {
            setPawningPeriodMonths(periodsRes.data[0].duration_months)
          }
        }
        const user = api.getCurrentUser()
        if (user?.branchId) setBranchId(user.branchId)
        if (ratesRes.success && ratesRes.data?.length > 0) {
          setCurrentArticle(prev => ({ ...prev, purity_karat: ratesRes.data[0].karat }))
        }
      } catch (err) {
        console.error('Failed to fetch metadata:', err)
        setSubmitError('Failed to load form data. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetchMetadata()
  }, [])

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setCustomerResults([])
      setShowCustomerDropdown(false)
      return
    }
    const searchCustomers = async () => {
      try {
        setLoadingSearch(true)
        const res = await api.get(`/staff/customers/search?q=${encodeURIComponent(debouncedSearch)}`)
        if (res.success && res.data) {
          setCustomerResults(res.data)
          setShowCustomerDropdown(true)
        }
      } catch (err) {
        setCustomerResults([])
      } finally {
        setLoadingSearch(false)
      }
    }
    searchCustomers()
  }, [debouncedSearch])

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer({
      customer_id: customer.customer_id,
      full_name: customer.full_name,
      nic: customer.nic,
      phone: customer.phone || '',
      email: customer.email || '',
      city_name: customer.city_name || '',
      registered_branch: customer.registered_branch || ''
    })
    setCustomerSearch(`${customer.full_name} (${customer.nic})`)
    setShowCustomerDropdown(false)

    setRating(null)
    setRatingError(null)
    setRatingLoading(true)
    api.getCustomerRating(customer.customer_id)
      .then((res) => setRating(res.data))
      .catch((err) => {
        setRatingError(err.message || 'Failed to load customer rating')
        setRating(null)
      })
      .finally(() => setRatingLoading(false))
  }

  const handleArticleChange = (e) => {
    const { name, value } = e.target
    const parsed = ['quantity', 'gross_weight_grams', 'net_weight_grams', 'purity_karat'].includes(name)
      ? (name === 'quantity' ? parseInt(value, 10) : parseFloat(value))
      : value
    setCurrentArticle(prev => ({ ...prev, [name]: parsed }))
  }

  const getRateForKarat = (karat) => {
    const r = karatRates.find(k => k.karat === karat)
    return r ? r.advance_value_per_gram : 0
  }

  const calculateArticleAssessedValue = (article) => {
    const net = parseFloat(article.net_weight_grams)
    const karat = parseInt(article.purity_karat, 10)
    if (!net || !karat) return 0
    return net * getRateForKarat(karat)
  }

  const totalNetWeight = articles.reduce((sum, a) => sum + (parseFloat(a.net_weight_grams) || 0), 0)
  const totalAssessedValue = articles.reduce((sum, a) => sum + calculateArticleAssessedValue(a), 0)
  const advanceAmount = (totalAssessedValue * INTEREST_PERCENTAGE) / 100
  const roundedAdvance = Math.round(advanceAmount * 100) / 100
  const parsedRequestedLoan = requestedLoanAmount === '' ? NaN : parseFloat(requestedLoanAmount)
  const hasRequestedLoan = Number.isFinite(parsedRequestedLoan)
  const finalLoanAmount = hasRequestedLoan ? Math.round(parsedRequestedLoan * 100) / 100 : roundedAdvance
  const minLoanMet = finalLoanAmount >= 5000
  const maxLoanMet = finalLoanAmount <= roundedAdvance

  const getDueDate = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + pawningPeriodMonths)
    return d.toISOString().split('T')[0]
  }

  const handleAddArticle = () => {
    setArticleError('')
    if (articles.length >= 5) {
      setArticleError('You can add up to 5 article types per receipt.')
      return
    }
    const gross = parseFloat(currentArticle.gross_weight_grams)
    const net = parseFloat(currentArticle.net_weight_grams)
    const karat = currentArticle.purity_karat ? parseInt(currentArticle.purity_karat, 10) : null
    if (!currentArticle.item_type?.trim()) {
      setArticleError('Article type is required.')
      return
    }
    if (!gross || gross <= 0) {
      setArticleError('Gross weight must be greater than 0.')
      return
    }
    if (!net || net <= 0) {
      setArticleError('Net weight must be greater than 0.')
      return
    }
    if (net > gross) {
      setArticleError('Net weight cannot exceed gross weight.')
      return
    }
    if (!karat || !karatRates.some(k => k.karat === karat)) {
      setArticleError('Please select a valid karat.')
      return
    }

    const assessed = net * getRateForKarat(karat)
    setArticles(prev => [...prev, {
      id: Date.now(),
      item_type: currentArticle.item_type.trim(),
      quantity: Math.max(1, parseInt(currentArticle.quantity, 10) || 1),
      gross_weight_grams: gross,
      net_weight_grams: net,
      purity_karat: karat,
      notes: (currentArticle.notes || '').trim() || null,
      assessed_value: assessed
    }])
    setCurrentArticle({
      item_type: 'Chain',
      quantity: 1,
      gross_weight_grams: '',
      net_weight_grams: '',
      purity_karat: karatRates[0]?.karat ?? '',
      notes: ''
    })
  }

  const handleRemoveArticle = (id) => {
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  const handleSave = async () => {
    setSubmitError('')
    setSubmitSuccess(null)
    if (!selectedCustomer?.customer_id) {
      setSubmitError('Please select a customer.')
      return
    }
    if (articles.length === 0) {
      setSubmitError('Please add at least one article.')
      return
    }
    if (!branchId) {
      setSubmitError('Unable to determine branch. Please log in again.')
      return
    }
    if (!minLoanMet) {
      setSubmitError('Advance amount must be at least Rs. 5,000.')
      return
    }
    if (!maxLoanMet) {
      setSubmitError(`Requested pawn amount cannot exceed eligible amount (Rs. ${roundedAdvance.toLocaleString()}).`)
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        customer_id: selectedCustomer.customer_id,
        branch_id: branchId,
        pawning_period_months: pawningPeriodMonths,
        interest_percentage: INTEREST_PERCENTAGE,
        requested_loan_amount: finalLoanAmount,
        articles: articles.map(a => ({
          item_type: a.item_type,
          quantity: a.quantity,
          gross_weight_grams: a.gross_weight_grams,
          net_weight_grams: a.net_weight_grams,
          purity_karat: a.purity_karat,
          notes: a.notes || undefined
        }))
      }
      const res = await api.post('/staff/pawn-tickets', payload)
      if (res.success && res.data) {
        setSubmitSuccess({
          receipt_no: res.data.receipt_no,
          ticket_id: res.data.ticket_id,
          loan_amount: res.data.loan_amount
        })
        setSelectedCustomer(null)
        setCustomerSearch('')
        setRating(null)
        setRatingError(null)
        setRatingLoading(false)
        setArticles([])
        setCurrentArticle({
          item_type: 'Chain',
          quantity: 1,
          gross_weight_grams: '',
          net_weight_grams: '',
          purity_karat: karatRates[0]?.karat ?? '',
          notes: ''
        })
        setRequestedLoanAmount('')
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to create pawn ticket.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAnother = () => {
    setSubmitSuccess(null)
    setSubmitError('')
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-center">
          Loading form data...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">New Ticket</h1>
        <p className="mt-2 text-gray-600">Create a new pawning ticket</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg space-y-2">
          <p className="font-semibold">Pawn ticket created successfully.</p>
          <p>Receipt: {submitSuccess.receipt_no} | Amount: Rs. {Number(submitSuccess.loan_amount).toLocaleString()}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateAnother}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-black font-semibold hover:bg-yellow-600"
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Section */}
          <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Customer (NIC or Name)</label>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    if (!e.target.value) setSelectedCustomer(null)
                  }}
                  onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)}
                  placeholder="Type to search..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  disabled={!!selectedCustomer}
                />
                {loadingSearch && (
                  <span className="absolute right-3 top-10 text-sm text-gray-500">Searching...</span>
                )}
                {showCustomerDropdown && customerResults.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {customerResults.map((c) => (
                      <li
                        key={c.customer_id}
                        onClick={() => handleSelectCustomer(c)}
                        className="px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-900">{c.full_name}</span>
                        <span className="text-gray-600 ml-2">({c.nic})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
                <select
                  value={pawningPeriodMonths}
                  onChange={(e) => setPawningPeriodMonths(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  {pawningPeriods.map((p) => (
                    <option key={p.period_id} value={p.duration_months}>
                      {p.period_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/staff/customers/register')}
              className="rounded-lg border-2 border-yellow-500 px-6 py-2 text-yellow-500 font-semibold hover:bg-yellow-50 transition-colors"
            >
              + New Customer
            </button>
          </div>

          {/* Article Section */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900">Article Details</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Article Type</label>
                <select
                  name="item_type"
                  value={currentArticle.item_type}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={currentArticle.quantity}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gross Weight (g)</label>
                <input
                  type="number"
                  name="gross_weight_grams"
                  step="0.001"
                  value={currentArticle.gross_weight_grams}
                  onChange={handleArticleChange}
                  placeholder="e.g. 8.5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Net Weight (g)</label>
                <input
                  type="number"
                  name="net_weight_grams"
                  step="0.001"
                  value={currentArticle.net_weight_grams}
                  onChange={handleArticleChange}
                  placeholder="e.g. 8.0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purity (Karat)</label>
                <select
                  name="purity_karat"
                  value={currentArticle.purity_karat}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="">Select Karat</option>
                  {karatRates.map((k) => (
                    <option key={k.karat} value={k.karat}>{k.karat}K</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  value={currentArticle.notes}
                  onChange={handleArticleChange}
                  placeholder="Add remarks..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            {articleError && <p className="text-sm text-red-600 font-semibold">{articleError}</p>}
            <button
              onClick={handleAddArticle}
              disabled={articles.length >= 5}
              className="w-full rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add Article ({articles.length}/5)
            </button>
          </div>

          {/* Articles Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Article</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Net (g)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Karat</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Assessed Value</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, idx) => (
                  <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{article.item_type}</td>
                    <td className="px-4 py-3 text-gray-600">{article.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{article.net_weight_grams}</td>
                    <td className="px-4 py-3 text-gray-600">{article.purity_karat}K</td>
                    <td className="px-4 py-3 text-yellow-600 font-semibold">
                      Rs. {Number(article.assessed_value || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveArticle(article.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 bg-gray-50 p-6 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Net Weight</p>
              <p className="text-2xl font-bold text-gray-900">{totalNetWeight.toFixed(3)} g</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Assess Value</p>
              <p className="text-2xl font-bold text-yellow-600">Rs. {totalAssessedValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Eligible Amount</p>
              <p className="text-2xl font-bold text-gray-900">Rs. {roundedAdvance.toLocaleString()}</p>
              {!minLoanMet && articles.length > 0 && (
                <p className="text-xs text-red-600 mt-1">Minimum Rs. 5,000 required</p>
              )}
              {!maxLoanMet && articles.length > 0 && (
                <p className="text-xs text-red-600 mt-1">Requested amount cannot exceed eligible amount</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Requested Pawn Amount (Rs.)</label>
            <input
              type="number"
              step="0.01"
              min="5000"
              max={roundedAdvance || undefined}
              value={requestedLoanAmount}
              onChange={(e) => setRequestedLoanAmount(e.target.value)}
              placeholder={`Default eligible amount: ${roundedAdvance.toLocaleString()}`}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
            <p className="mt-2 text-xs text-gray-600">
              Leave empty to grant full eligible amount. Enter a lower amount if customer requests less.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg bg-gray-50 p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
            {selectedCustomer ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600">Customer Name</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">NIC</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.nic}</p>
                </div>
                {selectedCustomer.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Phone</p>
                    <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                )}
                {selectedCustomer.city_name && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600">City</p>
                    <p className="text-sm text-gray-900">{selectedCustomer.city_name}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null)
                    setCustomerSearch('')
                    setRating(null)
                    setRatingError(null)
                    setRatingLoading(false)
                  }}
                  className="w-full mt-4 rounded-lg border-2 border-yellow-500 px-4 py-2 text-yellow-500 font-semibold hover:bg-yellow-50 transition-colors"
                >
                  Change Customer
                </button>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer Rating</p>
                    {ratingLoading && <span className="text-xs text-gray-500">Calculating...</span>}
                    {!ratingLoading && ratingError && <span className="text-xs text-red-600">{ratingError}</span>}
                  </div>
                  <CustomerRatingCard
                    score={rating?.score}
                    label={rating?.label}
                    metrics={rating?.metrics}
                    explanation={rating?.explanation}
                    compact={true}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Search and select a customer to continue.</p>
            )}
          </div>

          <div className="rounded-lg bg-yellow-50 p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grant Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Number</span>
                <span className="font-semibold text-gray-900">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period</span>
                <span className="font-semibold text-gray-900">{pawningPeriodMonths} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest</span>
                <span className="font-semibold text-gray-900">{INTEREST_PERCENTAGE}%</span>
              </div>
              <div className="border-t border-yellow-200 pt-3 flex justify-between">
                <span className="text-gray-600">Total Net Weight</span>
                <span className="font-semibold text-gray-900">{totalNetWeight.toFixed(3)} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">No. of Articles</span>
                <span className="font-semibold text-gray-900">{articles.length}</span>
              </div>
              <div className="border-t border-yellow-200 pt-3 flex justify-between">
                <span className="text-gray-600">Assess Value</span>
                <span className="font-semibold text-yellow-600">Rs. {totalAssessedValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Eligible Amount</span>
                <span className="font-semibold text-yellow-600">Rs. {roundedAdvance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grant Amount</span>
                <span className="font-semibold text-yellow-600">Rs. {finalLoanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date</span>
                <span className="font-semibold text-gray-900">{getDueDate()}</span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !selectedCustomer || articles.length === 0 || !minLoanMet || !maxLoanMet}
              className="w-full mt-6 rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save & Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
