import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiPhone, HiLocationMarker, HiX } from 'react-icons/hi'

const HOLD_DURATION = 3000 // ms to hold before trigger

const contacts = [
  { name: 'Mother', phone: '+91 9876543210', initial: 'M', color: 'from-pink-400 to-pink-600' },
  { name: 'Father', phone: '+91 9876543211', initial: 'F', color: 'from-blue-400 to-blue-600' },
  { name: 'Best Friend', phone: '+91 9876543212', initial: 'B', color: 'from-purple-400 to-purple-600' },
]

function CountdownRing({ progress }: { progress: number }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
    </svg>
  )
}

export default function SOS() {
  const [phase, setPhase] = useState<'idle' | 'holding' | 'sent'>('idle')
  const [holdProgress, setHoldProgress] = useState(0)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  // Try to get GPS coords
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords({ lat: 28.6139, lng: 77.2090 }), // Delhi fallback
      )
    } else {
      setCoords({ lat: 28.6139, lng: 77.2090 })
    }
  }, [])

  // Elapsed timer when SOS sent
  useEffect(() => {
    if (phase === 'sent') {
      tickRef.current = setInterval(() => setTimeElapsed((t) => t + 1), 1000)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [phase])

  const startHold = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('holding')
    setHoldProgress(0)
    const start = Date.now()
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(elapsed / HOLD_DURATION, 1)
      setHoldProgress(pct)
      if (pct >= 1) {
        clearInterval(holdTimerRef.current!)
        setPhase('sent')
        setTimeElapsed(0)
      }
    }, 30)
  }, [phase])

  const cancelHold = useCallback(() => {
    if (phase !== 'holding') return
    if (holdTimerRef.current) clearInterval(holdTimerRef.current)
    setPhase('idle')
    setHoldProgress(0)
  }, [phase])

  const reset = () => {
    setPhase('idle')
    setHoldProgress(0)
    setTimeElapsed(0)
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const coordStr = coords
    ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`
    : 'Acquiring GPS...'

  return (
    <div className="min-h-screen w-full bg-[#1A1A2E] flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden">
      {/* Background rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-secondary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-secondary/8" />
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE / HOLDING ── */}
        {phase !== 'sent' && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center w-full max-w-xs"
          >
            {/* Status chip */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/50 text-xs font-medium">Ready · {coordStr}</span>
              </div>
            </div>

            {/* Big SOS button with hold ring */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Pulse rings (idle) */}
              {phase === 'idle' && (
                <>
                  <div className="absolute w-52 h-52 rounded-full bg-secondary/5 animate-pulse-ring" />
                  <div className="absolute w-44 h-44 rounded-full bg-secondary/8 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
                </>
              )}

              {/* Hold progress ring */}
              <div className="relative w-36 h-36">
                {phase === 'holding' && <CountdownRing progress={holdProgress} />}
                <button
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  className={`w-full h-full rounded-full flex flex-col items-center justify-center select-none transition-transform active:scale-95 ${
                    phase === 'holding' ? 'animate-sos-glow' : ''
                  }`}
                  style={{
                    background: phase === 'holding'
                      ? 'radial-gradient(circle at 40% 35%, #FF7A9A, #FF3A60)'
                      : 'radial-gradient(circle at 40% 35%, #FF5A7A, #E04A6A)',
                    boxShadow: '0 8px 40px rgba(255, 90, 122, 0.4)',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span className="text-white font-black text-xl mt-1 tracking-wide">SOS</span>
                  {phase === 'holding' && (
                    <span className="text-white/70 text-[10px] mt-0.5">
                      {Math.round((1 - holdProgress) * 3)}s
                    </span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-white/40 text-xs mb-2 font-medium">
              {phase === 'idle' ? 'Hold button for 3 seconds to activate' : 'Release to cancel'}
            </p>
            {phase === 'holding' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-secondary/80 text-xs font-bold animate-pulse"
              >
                Keep holding… SOS activating
              </motion.p>
            )}

            {/* Location display */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 w-full bg-white/5 border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <HiLocationMarker className="text-primary text-base" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-medium">Your location</p>
                <p className="text-xs text-white/60 font-semibold">{coordStr}</p>
              </div>
            </motion.div>

            {/* Contacts */}
            <div className="mt-5 w-full space-y-2">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Will notify</p>
              {contacts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/[0.06] rounded-xl px-3.5 py-2.5"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${c.color} rounded-lg flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xs font-bold">{c.initial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/80 truncate">{c.name}</p>
                    <p className="text-[10px] text-white/30">{c.phone}</p>
                  </div>
                  <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                    <HiPhone className="text-white/30 text-xs" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SENT ── */}
        {phase === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="flex flex-col items-center w-full max-w-xs"
          >
            {/* Success ring */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse-ring-fast" />
              <div className="w-28 h-28 bg-gradient-to-br from-success to-success-dark rounded-full flex flex-col items-center justify-center shadow-2xl shadow-success/30">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">SOS Sent!</h2>
            <p className="text-white/40 text-sm mb-2">Help is on the way</p>
            <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-success text-[11px] font-semibold">{formatTime(timeElapsed)} elapsed</span>
            </div>

            {/* Status list */}
            <div className="w-full bg-white/5 border border-white/[0.07] rounded-2xl p-4 space-y-3 mb-5">
              {[
                { icon: '📍', label: 'Location shared', detail: coordStr, done: true },
                { icon: '📞', label: `${contacts.length} contacts notified`, detail: 'Alert message sent', done: true },
                { icon: '🚔', label: 'Police dispatch alerted', detail: 'Nearest station informed', done: true },
                { icon: '🏥', label: 'Emergency services notified', detail: 'Ambulance on standby', done: true },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/80">{item.label}</p>
                    <p className="text-[10px] text-white/30">{item.detail}</p>
                  </div>
                  <HiShieldCheck className="text-success shrink-0" />
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-white/15 transition-colors"
              >
                <HiX /> Dismiss
              </button>
              <button
                onClick={() => alert('Calling 112...')}
                className="flex-1 py-3 bg-gradient-to-r from-success to-success-dark text-white font-bold rounded-xl text-sm shadow-lg shadow-success/25 flex items-center justify-center gap-1.5"
              >
                <HiPhone /> Call 112
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
