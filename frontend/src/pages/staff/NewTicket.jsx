import { useState } from 'react'
import { ChevronDown, Plus, Edit, Trash2 } from 'lucide-react'

export default function NewTicket() {
  const [formData, setFormData] = useState({
    customerId: '',
    period: '6',
    articles: []
  })
  const [currentArticle, setCurrentArticle] = useState({
    article: 'Chain',
    count: '01',
    quality: 'Broken',
    acidTest: 'Not Done',
    grossWeight: '',
    netWeight: '',
    karatage: '14K',
    adjustKaratage: '22K'
  })

  const [articleError, setArticleError] = useState('')

  const customerInfo = {
    name: 'Mr. TMHN Bandara',
    nic: '20012345678',
    type: 'Normal',
    address: 'No. 25, Lake Road',
    district: 'Kandy',
    mobile1: '077 123 4567',
    mobile2: '076 987 6543'
  }

  const grantSummary = {
    ticketNumber: 'TCK12345',
    period: '6 Months',
    interestRate: '24%',
    grossWeight: '15.20 g',
    netWeight: '14.50 g',
    noOfItems: '07',
    assessValue: '₨. 840,000.00',
    advanceAmount: '₨. 700,000.00',
    payableAmount: '₨. 500,000.00',
    serviceCharge: '₨. 5,000.00'
  }

  const handleArticleChange = (e) => {
    const { name, value } = e.target
    setCurrentArticle(prev => ({ ...prev, [name]: value }))
  }

  const handleAddArticle = () => {
    if (formData.articles.length >= 5) {
      setArticleError('You can add up to 5 article types per receipt.')
      return
    }

    setArticleError('')
    if (currentArticle.article) {
      setFormData(prev => ({
        ...prev,
        articles: [
          ...prev.articles,
          { id: prev.articles.length + 1, ...currentArticle }
        ]
      }))
      setCurrentArticle({
        article: 'Chain',
        count: '01',
        quality: 'Broken',
        acidTest: 'Not Done',
        grossWeight: '',
        netWeight: '',
        karatage: '14K',
        adjustKaratage: '22K'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">New Ticket</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Section - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Section */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer ID Number</label>
                <input
                  type="text"
                  placeholder="20012345678"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type</label>
                <select
                  name="article"
                  value={currentArticle.article}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option>General</option>
                  <option>VIP</option>
                  <option>Regular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500">
                  <option>6 Months</option>
                  <option>3 Months</option>
                  <option>12 Months</option>
                </select>
              </div>
            </div>
            <button className="rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors">
              Add
            </button>
            <button className="ml-2 rounded-lg border-2 border-yellow-500 px-6 py-2 text-yellow-500 font-semibold hover:bg-yellow-50 transition-colors">
              + New Customer
            </button>
          </div>

          {/* Article Section */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900">Article Details</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Article</label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500">
                  <option>Chain</option>
                  <option>Ring</option>
                  <option>Bangle</option>
                  <option>Bracelet</option>
                  <option>Earring</option>
                  <option>Pendant</option>
                  <option>Necklace</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Article Count</label>
                <input
                  type="text"
                  name="count"
                  value={currentArticle.count}
                  onChange={handleArticleChange}
                  placeholder="01"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quality</label>
                <select
                  name="quality"
                  value={currentArticle.quality}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option>Broken</option>
                  <option>Perfect</option>
                  <option>Damaged</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Acid Test</label>
                <select
                  name="acidTest"
                  value={currentArticle.acidTest}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option>Not Done</option>
                  <option>Done</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gross Weight</label>
                <input
                  type="text"
                  name="grossWeight"
                  value={currentArticle.grossWeight}
                  onChange={handleArticleChange}
                  placeholder="8.00"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Net Weight</label>
                <input
                  type="text"
                  name="netWeight"
                  value={currentArticle.netWeight}
                  onChange={handleArticleChange}
                  placeholder="9.00"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Caratage</label>
                <select
                  name="karatage"
                  value={currentArticle.karatage}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option>14 K</option>
                  <option>18 K</option>
                  <option>22 K</option>
                  <option>24 K</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adjust Caratage</label>
                <select
                  name="adjustKaratage"
                  value={currentArticle.adjustKaratage}
                  onChange={handleArticleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option>22 K</option>
                  <option>18 K</option>
                  <option>14 K</option>
                  <option>24 K</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Remark</label>
              <textarea placeholder="Add any remarks..." className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" rows="3"></textarea>
            </div>

            {articleError && (
              <p className="text-sm text-red-600 font-semibold">{articleError}</p>
            )}

            <button
              onClick={handleAddArticle}
              className="w-full rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
              disabled={formData.articles.length >= 5}
            >
              Add Article ({formData.articles.length}/5)
            </button>
          </div>

          {/* Articles Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Article</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Count</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Acid Test</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Net</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Adjust K</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Asses Value</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.articles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{article.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{article.article}</td>
                    <td className="px-4 py-3 text-gray-600">{article.count}</td>
                    <td className="px-4 py-3 text-gray-600">{article.acidTest}</td>
                    <td className="px-4 py-3 text-gray-600">{article.netWeight}</td>
                    <td className="px-4 py-3 text-gray-600">{article.adjustKaratage}</td>
                    <td className="px-4 py-3 text-yellow-600 font-semibold">{article.assessValue || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-yellow-600 hover:text-yellow-700 mr-2" disabled>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700" disabled>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid gap-4 sm:grid-cols-3 bg-gray-50 p-6 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Net Weight</p>
              <p className="text-2xl font-bold text-gray-900">14.5 g</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Asses Value</p>
              <p className="text-2xl font-bold text-yellow-600">₨. 700,000.00</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Payable Amount</p>
              <input type="text" placeholder="Enter Amount" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
          </div>
        </div>

        {/* Right Section - Customer Info & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Information */}
          <div className="rounded-lg bg-gray-50 p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600">Customer Name</p>
                <p className="text-sm text-gray-900">{customerInfo.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">NIC</p>
                <p className="text-sm text-gray-900">{customerInfo.nic}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Customer Type</p>
                <p className="text-sm text-gray-900">{customerInfo.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Address</p>
                <p className="text-sm text-gray-900">{customerInfo.address}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">District</p>
                <p className="text-sm text-gray-900">{customerInfo.district}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Mobile Number 1</p>
                <p className="text-sm text-gray-900">{customerInfo.mobile1}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Mobile Number 2</p>
                <p className="text-sm text-gray-900">{customerInfo.mobile2}</p>
              </div>
              <button className="w-full mt-4 rounded-lg border-2 border-yellow-500 px-4 py-2 text-yellow-500 font-semibold hover:bg-yellow-50 transition-colors">
                Edit Details ➜
              </button>
            </div>
          </div>

          {/* Grant Summary */}
          <div className="rounded-lg bg-yellow-50 p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grant Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Number</span>
                <span className="font-semibold text-gray-900">{grantSummary.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period</span>
                <span className="font-semibold text-gray-900">{grantSummary.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-semibold text-gray-900">{grantSummary.interestRate}</span>
              </div>
              <div className="border-t border-teal-200 pt-3 flex justify-between">
                <span className="text-gray-600">Gross Weight</span>
                <span className="font-semibold text-gray-900">{grantSummary.grossWeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Weight</span>
                <span className="font-semibold text-gray-900">{grantSummary.netWeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">No. of Items</span>
                <span className="font-semibold text-gray-900">{grantSummary.noOfItems}</span>
              </div>
              <div className="border-t border-teal-200 pt-3 flex justify-between">
                <span className="text-gray-600">Assess Value</span>
                <span className="font-semibold text-yellow-600">{grantSummary.assessValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Amount</span>
                <span className="font-semibold text-yellow-600">{grantSummary.advanceAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payable Amount</span>
                <span className="font-semibold text-yellow-600">{grantSummary.payableAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Charge</span>
                <span className="font-semibold text-gray-900">{grantSummary.serviceCharge}</span>
              </div>
            </div>

            <button className="w-full mt-6 rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


