import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

const NAV_ITEMS = [
  { path: '/customer', label: 'Overview', exact: true },
  { path: '/customer/receipts', label: 'My Receipts' },
  { path: '/customer/part-payments', label: 'Part Payments' },
  { path: '/customer/appointments', label: 'Appointments' },
  { path: '/customer/notifications', label: 'Notifications' },
  { path: '/customer/profile', label: 'Profile' },
]

export default function CustomerHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/customer')}
              className="flex items-center gap-4 hover:opacity-90 transition-opacity"
              aria-label="Go to dashboard"
            >
              <img
                src="/BOC%20logo.jpg"
                alt="BOC logo"
                className="h-10 w-10 rounded-lg bg-black object-cover shadow-md"
              />
              <div>
                <h1 className="text-lg font-bold text-black">Smart Gold</h1>
              </div>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-3 text-sm font-semibold text-black">
            {NAV_ITEMS.map((item, idx) => (
              <span key={item.path} className="flex items-center gap-3">
                {idx > 0 && <span className="text-black/40">|</span>}
                <button
                  onClick={() => navigate(item.path)}
                  className={`rounded-md px-3 py-2 transition-all hover:bg-yellow-700/50 ${
                    isActive(item) ? 'bg-yellow-700/50' : ''
                  }`}
                >
                  {item.label}
                </button>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-4" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black/30"
              >
                Profile
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">Account Settings</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        navigate('/customer/profile')
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-yellow-50 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
