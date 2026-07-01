import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Tab {
  path: string
  label: string
  isSOS?: boolean
  icon?: ReactNode
  badge?: number
}

const tabs: Tab[] = [
  {
    path: '/dashboard', label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/map', label: 'Map',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  { path: '/sos', label: 'SOS', isSOS: true },
  {
    path: '/voice-trigger', label: 'Voice',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    path: '/profile', label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const hideOnPages = ['/sos', '/fake-call', '/voice-trigger']

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  if (hideOnPages.includes(location.pathname)) return null

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100/80 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-3">
        {tabs.map((tab) => {
          if (tab.isSOS) {
            return (
              <motion.button
                key="sos"
                onClick={() => navigate('/sos')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.91 }}
                className="relative -top-4 flex flex-col items-center"
              >
                {/* Outer pulse */}
                <div className="absolute inset-0 w-14 h-14 rounded-full bg-secondary/25 animate-pulse-ring mx-auto" />
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex flex-col items-center justify-center shadow-xl shadow-secondary/35 relative z-10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span className="text-white text-[9px] font-black leading-none mt-0.5">SOS</span>
                </div>
              </motion.button>
            )
          }

          const active = isActive(tab.path)

          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full"
            >
              {/* Active pill indicator */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-b-full"
                  />
                )}
              </AnimatePresence>

              {/* Icon container */}
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                active ? 'bg-primary/10' : 'bg-transparent'
              }`}>
                <div className={`transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-400'}`}>
                  {tab.icon}
                </div>
                {/* Badge */}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[9px] font-semibold transition-colors duration-200 ${
                active ? 'text-primary' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
