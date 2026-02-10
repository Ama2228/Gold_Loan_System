import { Calendar, Clock, MapPin } from 'lucide-react'

export default function Appointments() {
  const appointments = [
    {
      id: 1,
      customer: 'Mr. Bandara',
      date: '2026-02-01',
      time: '10:00 AM',
      type: 'Renewal',
      location: 'Colombo Branch',
      status: 'Confirmed',
      notes: 'Bring original documents'
    },
    {
      id: 2,
      customer: 'Ms. Silva',
      date: '2026-02-01',
      time: '2:00 PM',
      type: 'New Pawn',
      location: 'Kandy Branch',
      status: 'Pending',
      notes: 'Jewelry evaluation needed'
    },
    {
      id: 3,
      customer: 'Mr. Kumar',
      date: '2026-02-02',
      time: '11:00 AM',
      type: 'Part Payment',
      location: 'Colombo Branch',
      status: 'Confirmed',
      notes: ''
    },
    {
      id: 4,
      customer: 'Mr. Jayasuriya',
      date: '2026-02-02',
      time: '3:00 PM',
      type: 'Redemption',
      location: 'Galle Branch',
      status: 'Cancelled',
      notes: 'Rescheduled to 2026-02-05'
    },
    {
      id: 5,
      customer: 'Ms. Perera',
      date: '2026-02-03',
      time: '9:30 AM',
      type: 'Renewal',
      location: 'Colombo Branch',
      status: 'Pending',
      notes: 'Call before visit'
    }
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="border-b-2 border-yellow-500 pb-4">
        <h1 className="text-3xl font-bold text-yellow-600">Appointment List</h1>
        <p className="mt-2 text-gray-600">Manage customer appointments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
          <p className="text-sm font-semibold text-blue-700 mb-2">Total Appointments</p>
          <p className="text-3xl font-bold text-blue-900">5</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
          <p className="text-sm font-semibold text-green-700 mb-2">Confirmed</p>
          <p className="text-3xl font-bold text-green-900">2</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200 shadow-sm">
          <p className="text-sm font-semibold text-yellow-700 mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">2</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200 shadow-sm">
          <p className="text-sm font-semibold text-red-700 mb-2">Cancelled</p>
          <p className="text-3xl font-bold text-red-900">1</p>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map(appointment => (
          <div key={appointment.id} className={`rounded-lg p-6 shadow-md border-l-4 ${
            appointment.status === 'Confirmed' ? 'border-green-500 bg-green-50' :
            appointment.status === 'Pending' ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-gray-900">{appointment.customer}</p>
                <p className="text-sm text-gray-600">{appointment.type}</p>
              </div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-yellow-600" />
                {appointment.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-yellow-600" />
                {appointment.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-yellow-600" />
                {appointment.location}
              </div>
            </div>

            {appointment.notes && (
              <div className="bg-white p-3 rounded mb-4 text-xs text-gray-600">
                <strong>Note:</strong> {appointment.notes}
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-600 transition-colors">
                Edit
              </button>
              <button className="flex-1 rounded-lg border border-yellow-500 px-3 py-2 text-sm font-semibold text-yellow-500 hover:bg-yellow-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


