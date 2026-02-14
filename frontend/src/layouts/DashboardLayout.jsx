import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'

const staffNavItems = [
  {
    label: 'Transactions',
    submenu: [
      { label: 'New Ticket', path: '/staff/transactions/new' },
      { label: 'Renewal', path: '/staff/transactions/renewal' },
      { label: 'Redemption', path: '/staff/transactions/redemption' },
      { label: 'Part Payment', path: '/staff/transactions/part-payment' }
    ]
  },
  {
    label: 'Customers',
    submenu: [
      { label: 'Register Customer', path: '/staff/customers/register' },
      { label: 'Customer Inquiry', path: '/staff/customers/inquiry' }
    ]
  },
  {
    label: 'Tickets',
    submenu: [
      { label: 'Auction List', path: '/staff/tickets/auction' },
      { label: 'Expired List', path: '/staff/tickets/expired' },
      { label: 'Ticket Inquiry', path: '/staff/tickets/inquiry' }
    ]
  },
  {
    label: 'Reminders',
    submenu: [
      { label: 'Reminder Status', path: '/staff/reminders/status' }
    ]
  },
  {
    label: 'Appointments',
    submenu: [
      { label: 'Appointment List', path: '/staff/appointments/list' }
    ]
  },
  {
    label: 'Reports',
    submenu: [
      { label: 'Monthly Reports', path: '/staff/reports/monthly' },
      { label: 'Daily Reports', path: '/staff/reports/daily' }
    ]
  }
]

const managerNavItems = [
  {
    label: 'Transactions',
    submenu: [
      { label: 'New Ticket', path: '/staff/transactions/new' },
      { label: 'Renewal', path: '/staff/transactions/renewal' },
      { label: 'Redemption', path: '/staff/transactions/redemption' },
      { label: 'Part Payment', path: '/staff/transactions/part-payment' }
    ]
  },
  {
    label: 'Customers',
    submenu: [
      { label: 'Register Customer', path: '/staff/customers/register' },
      { label: 'Customer Inquiry', path: '/staff/customers/inquiry' }
    ]
  },
  {
    label: 'Tickets',
    submenu: [
      { label: 'Auction List', path: '/staff/tickets/auction' },
      { label: 'Expired List', path: '/staff/tickets/expired' },
      { label: 'Ticket Inquiry', path: '/staff/tickets/inquiry' }
    ]
  },
  {
    label: 'Reminders',
    submenu: [
      { label: 'Reminder Status', path: '/staff/reminders/status' }
    ]
  },
  {
    label: 'Appointments',
    submenu: [
      { label: 'Appointment List', path: '/staff/appointments/list' }
    ]
  },
  {
    label: 'Reverse Pawning',
    submenu: [
      { label: 'Manage Requests', path: '/manager/reverse-pawning' }
    ]
  },
  {
    label: 'Reports',
    submenu: [
      { label: 'Monthly Reports', path: '/staff/reports/monthly' },
      { label: 'Daily Reports', path: '/staff/reports/daily' }
    ]
  }
]

const adminNavItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    submenu: null
  },
  {
    label: 'Management',
    submenu: [
      { label: 'Staff Management', path: '/admin/staff' },
      { label: 'Branch Management', path: '/admin/branches' },
      { label: 'Opening Hours', path: '/admin/opening-hours' }
    ]
  },
  {
    label: 'System',
    submenu: [
      { label: 'Occupations', path: '/admin/occupations' },
      { label: 'Pawning Periods', path: '/admin/pawning-periods' },
      { label: 'Time Slots', path: '/admin/time-slots' },
      { label: 'Karat Rates', path: '/admin/advance-rates' },
      { label: 'System Settings', path: '/admin/settings' }
    ]
  },
  {
    label: 'Reports',
    submenu: [
      { label: 'Daily Report', path: '/admin/reports/daily' },
      { label: 'Monthly Report', path: '/admin/reports/monthly' },
      { label: 'Auction List', path: '/admin/reports/auction' }
    ]
  }
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = useState(null)
  const userRole = sessionStorage.getItem('userRole') || 'STAFF'
  const userName = sessionStorage.getItem('userName') || 'User'
  
  // Use different nav items based on role
  const navItems = userRole === 'ADMIN' ? adminNavItems : userRole === 'MANAGER' ? managerNavItems : staffNavItems

  const handleLogout = () => {
    sessionStorage.removeItem('userRole')
    sessionStorage.removeItem('userNic')
    sessionStorage.removeItem('userName')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
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
                <p className="text-xs text-black/70">{userRole === 'ADMIN' ? 'Head Office Control Panel' : 'Pawning Assistant Dashboard'}</p>
              </div>
            </div>

            {/* Center Navigation */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {/* If item has no submenu, render as NavLink */}
                  {!item.submenu ? (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${ 
                          isActive
                            ? 'border-b-2 border-black bg-yellow-700/50 text-black'
                            : 'text-black hover:bg-yellow-700/50'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    <>
                      {/* If item has submenu, render as dropdown button */}
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className="flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-black transition-all hover:bg-yellow-700/50"
                      >
                        <span>{item.label}</span>
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === item.label && (
                        <div className="absolute left-0 top-full mt-1 w-56 rounded-lg bg-white shadow-xl z-10">
                          {item.submenu.map((subitem, idx) => (
                            <NavLink
                              key={subitem.path}
                              to={subitem.path}
                              onClick={closeDropdown}
                              className={({ isActive }) =>
                                `block px-4 py-3 text-sm font-medium transition-colors ${
                                  idx === 0 ? 'rounded-t-lg' : ''
                                } ${idx === item.submenu.length - 1 ? 'rounded-b-lg' : ''} ${
                                  isActive
                                    ? 'bg-yellow-100 border-l-4 border-yellow-600 text-yellow-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`
                              }
                            >
                              {subitem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side - User Section */}
            <div className="flex items-center gap-3">
              {userRole === 'ADMIN' && (
                <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1">
                  <span className="inline-block bg-yellow-700 text-white px-2 py-1 rounded text-xs font-semibold">
                    ADMIN (Head Office)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 rounded-full bg-black/20 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-yellow-400 font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-black">{userName}</p>
                  <p className="text-xs text-black/70">{userRole}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 p-2 text-white transition-colors hover:bg-red-700 shadow-md"
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


