import { useState } from 'react'

export default function RenewTicket() {
  const [ticketNumber, setTicketNumber] = useState('TCK12345')
  const [payableAmount, setPayableAmount] = useState('₨. 4,000.00')

  const ticketDetails = [
    { id: '01', article: 'Chain', count: '01', acidTest: 'Not Done', quality: 'Damage', gross: '8.00', net: '8.00', caratage: '24 K', adjust: '22 K' },
    { id: '02', article: 'Ring', count: '02', acidTest: 'Not Done', quality: 'Normal', gross: '7.50', net: '7.20', caratage: '22 K', adjust: '22 K' },
    { id: '03', article: 'Bangle', count: '01', acidTest: 'Not Done', quality: 'Bend', gross: '8.00', net: '8.00', caratage: '21 K', adjust: '22 K' },
    { id: '04', article: 'Bracelet', count: '01', acidTest: 'Not Done', quality: 'Normal', gross: '8.00', net: '8.00', caratage: '20 K', adjust: '22 K' },
    { id: '05', article: 'Earrings', count: '02', acidTest: 'Done', quality: 'Normal', gross: '6.00', net: '5.50', caratage: '18 K', adjust: '22 K' },
    { id: '06', article: 'Pendant', count: '01', acidTest: 'Done', quality: 'Normal', gross: '7.80', net: '6.00', caratage: '16 K', adjust: '22 K' },
    { id: '07', article: 'Necklace', count: '01', acidTest: 'Not Done', quality: 'Normal', gross: '4.00', net: '4.00', caratage: '14 K', adjust: '22 K' }
  ]

  const summary = {
    ticketNumber: 'TCK12345',
    receiptNumber: 'TCK12345-01',
    amount: '₨. 700,000.00',
    period: '6 Months',
    dueDate: '01-Jul-2025',
    totalDays: '42 Days',
    dueDays: '5 Days',
    letterCharges: '₨. 120.00',
    stampDuty: '₨. 25.00',
    odRate: '05 %',
    odAmount: '₨. 500.00',
    interestRate: '24 %',
    newDueDate: '01-Jan-2026',
    totalInterest: '₨. 3,500.00'
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Renew Ticket</h1>
        <p className="mt-2 text-gray-600">Renew existing pawning ticket</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Ticket Number</label>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="TCK12345"
              />
              <button className="rounded-lg bg-yellow-500 px-6 py-2 text-black font-semibold hover:bg-yellow-600 transition-colors">
                Find
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-yellow-600 mb-4">Ticket Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-yellow-500 bg-yellow-50">
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">#</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Article</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Count</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">AC Test</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Quality</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Gross Weight</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Net Weight</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Caratage</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Adjust K</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketDetails.map((row) => (
                    <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{row.id}</td>
                      <td className="px-3 py-2 text-gray-900 font-medium">{row.article}</td>
                      <td className="px-3 py-2 text-gray-600">{row.count}</td>
                      <td className="px-3 py-2 text-gray-600">{row.acidTest}</td>
                      <td className="px-3 py-2 text-gray-600">{row.quality}</td>
                      <td className="px-3 py-2 text-gray-600">{row.gross}</td>
                      <td className="px-3 py-2 text-gray-600">{row.net}</td>
                      <td className="px-3 py-2 text-gray-600">{row.caratage}</td>
                      <td className="px-3 py-2 text-gray-600">{row.adjust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-yellow-600">Renew Summary</h3>
              <span className="text-sm text-gray-600">{summary.ticketNumber}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Receipt Number</span><span className="font-semibold text-gray-900">{summary.receiptNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-semibold text-gray-900">{summary.amount}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Period</span><span className="font-semibold text-gray-900">{summary.period}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Due Date</span><span className="font-semibold text-gray-900">{summary.dueDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Total Days</span><span className="font-semibold text-gray-900">{summary.totalDays}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Due Days</span><span className="font-semibold text-gray-900">{summary.dueDays}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Letter Charges</span><span className="font-semibold text-gray-900">{summary.letterCharges}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Stamp Duty</span><span className="font-semibold text-gray-900">{summary.stampDuty}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">OD Rate</span><span className="font-semibold text-gray-900">{summary.odRate}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">OD Amount</span><span className="font-semibold text-gray-900">{summary.odAmount}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Interest Rate</span><span className="font-semibold text-gray-900">{summary.interestRate}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">New Due Date</span><span className="font-semibold text-gray-900">{summary.newDueDate}</span></div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-sm font-semibold text-gray-700">Total Interest :</span>
              <span className="text-lg font-bold text-green-600">{summary.totalInterest}</span>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Payable Amount :</label>
              <input
                type="text"
                value={payableAmount}
                onChange={(e) => setPayableAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button className="w-full rounded-lg bg-yellow-500 px-6 py-3 text-black font-semibold hover:bg-yellow-600 transition-colors">
                Save &amp; Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}