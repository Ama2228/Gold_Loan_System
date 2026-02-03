import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'

const navItems = [
  {
    label: 'Transactions',
    icon: '📋',
    submenu: [
      { label: 'New Ticket', path: '/staff/transactions/new' },
      { label: 'Renewal', path: '/staff/transactions/renewal' },
      { label: 'Redemption', path: '/staff/transactions/redemption' },
      { label: 'Part Payment', path: '/staff/transactions/part-payment' }
    ]
  },
  {
    label: 'Customers',
    icon: '👥',
    submenu: [
      { label: 'Register Customer', path: '/staff/customers/register' },
      { label: 'Customer Inquiry', path: '/staff/customers/inquiry' }
    ]
  },
  {
    label: 'Tickets',
    icon: '🎫',
    submenu: [
      { label: 'Auction List', path: '/staff/tickets/auction' },
      { label: 'Expired List', path: '/staff/tickets/expired' },
      { label: 'Ticket Inquiry', path: '/staff/tickets/inquiry' }
    ]
  },
  {
    label: 'Reminders',
    icon: '🔔',
    submenu: [
      { label: 'Reminder Status', path: '/staff/reminders/status' }
    ]
  },
  {
    label: 'Appointments',
    icon: '📅',
    submenu: [
      { label: 'Appointment List', path: '/staff/appointments/list' }
    ]
  },
  {
    label: 'Reports',
    icon: '📊',
    submenu: [
      { label: 'Monthly Reports', path: '/staff/reports/monthly' },
      { label: 'Daily Reports', path: '/staff/reports/daily' }
    ]
  }
]

export default function DashboardLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar - Yellow/Black Theme */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black font-bold text-yellow-400 shadow-md">
                SG
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Smart Gold</h1>
                <p className="text-xs text-black/70">Pawning Assistant Dashboard</p>
              </div>
            </div>

            {/* Center Navigation */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  <button className="flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-black transition-all hover:bg-yellow-700/50">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.submenu && <ChevronDown className="h-4 w-4" />}
                  </button>

                  {/* Dropdown Menu */}
                  {item.submenu && (
                    <div className="invisible absolute left-0 top-full mt-0 w-48 rounded-lg bg-white shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                      {item.submenu.map((subitem) => (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          className={({ isActive }) =>
                            `block px-4 py-3 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              isActive
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`
                          }
                        >
                          {subitem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side - User Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-full bg-black/20 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-yellow-400 font-bold text-sm">
                  HN
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-black">Hasindu N.</p>
                  <p className="text-xs text-black/70">User</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="px-6 py-8">
        <div className="rounded-lg bg-white shadow-lg p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


