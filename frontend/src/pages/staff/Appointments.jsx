import { useState } from 'react'
import { Calendar, Clock, Search, Filter } from 'lucide-react'

export default function Appointments() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all')

  // Sample appointments data
  const allAppointments = [
    {
      id: 1,
      customer: 'Mr. Bandara',
      date: '2026-02-13',
      time: '10:00 AM',
      type: 'Renewal',
      location: 'Colombo Branch',
      status: 'Confirmed',
      phone: '+94 77 123 4567',
      notes: 'Bring original documents'
    },
    {
      id: 2,
      customer: 'Ms. Silva',
      date: '2026-02-13',
      time: '2:00 PM',
      type: 'New Pawn',
      location: 'Kandy Branch',
      status: 'Pending',
      phone: '+94 71 234 5678',
      notes: 'Jewelry evaluation needed'
    },
    {
      id: 3,
      customer: 'Mr. Kumar',
      date: '2026-02-13',
      time: '11:00 AM',
      type: 'Part Payment',
      location: 'Colombo Branch',
      status: 'Confirmed',
      phone: '+94 76 345 6789',
      notes: ''
    },
    {
      id: 4,
      customer: 'Mr. Jayasuriya',
      date: '2026-02-13',
      time: '3:00 PM',
      type: 'Redemption',
      location: 'Galle Branch',
      status: 'Cancelled',
      phone: '+94 75 456 7890',
      notes: 'Rescheduled to 2026-02-15'
    },
    {
      id: 5,
      customer: 'Ms. Perera',
      date: '2026-02-14',
      time: '9:30 AM',
      type: 'Renewal',
      location: 'Colombo Branch',
      status: 'Pending',
      phone: '+94 77 567 8901',
      notes: 'Call before visit'
    },
    {
      id: 6,
      customer: 'Mr. Fernando',
      date: '2026-02-14',
      time: '2:30 PM',
      type: 'New Pawn',
      location: 'Colombo Branch',
      status: 'Confirmed',
      phone: '+94 71 678 9012',
      notes: ''
    }
  ]

  // Time slot options
  const timeSlots = [
    { value: 'all', label: 'All Time Slots' },
    { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)' },
    { value: 'evening', label: 'Evening (4:00 PM - 8:00 PM)' }
  ]

  // Filter appointments based on selected date and time slot
  const filteredAppointments = allAppointments.filter(appointment => {
    if (appointment.date !== selectedDate) return false
    
    if (selectedTimeSlot === 'all') return true
    
    const hour = parseInt(appointment.time.split(':')[0])
    const isPM = appointment.time.includes('PM')
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour)
    
    if (selectedTimeSlot === 'morning') return hour24 >= 8 && hour24 < 12
    if (selectedTimeSlot === 'afternoon') return hour24 >= 12 && hour24 < 16
    if (selectedTimeSlot === 'evening') return hour24 >= 16 && hour24 < 20
    
    return true
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Appointment List</h1>
        <p className="mt-2 text-gray-600">View and manage customer appointments</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Time Slot Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Time Slot
            </label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Search className="h-4 w-4" />
          <span>Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-500">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment, index) => (
                  <tr key={appointment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{appointment.customer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{appointment.phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{appointment.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{appointment.notes || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">No appointments found</p>
            <p className="text-sm text-gray-600 mt-2">No appointments scheduled for the selected date and time slot.</p>
          </div>
        )}
      </div>
    </div>
  )
}


