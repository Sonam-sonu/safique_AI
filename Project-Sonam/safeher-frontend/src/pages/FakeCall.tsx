import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiPhone, HiX } from 'react-icons/hi'

const callerPresets = [
  { name: 'Mom', emoji: '👩', color: 'from-pink-400 to-pink-600' },
  { name: 'Dad', emoji: '👨', color: 'from-blue-400 to-blue-600' },
  { name: 'Sister', emoji: '👧', color: 'from-purple-400 to-purple-600' },
  { name: 'Boss', emoji: '💼', color: 'from-gray-500 to-gray-700' },
]

function pad(n: number) { return String(n).padStart(2, '0') }

export default function FakeCall() {
  const [screen, setScreen] = useState<'setup' | 'ringing' | 'connected'>('setup')
  const [caller, setCaller] = useState(callerPresets[0])
  const [customName, setCustomName] = useState('')
  const [delay, setDelay] = useState(3)
  const [timer, setTimer] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  // countdown to ring
  const [countdown, setCountdown] = useState(0)
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const triggerCall = () => {
    setCountdown(delay)
    setScreen('ringing') // will show a brief waiting screen
    countRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (screen === 'ringing' && countdown === 0 && delay > 0) {
      // short delay before showing ring screen
    }
  }, [screen, countdown, delay])

  useEffect(() => {
    if (screen === 'connected') {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [screen])

  const handleAccept = () => { setScreen('connected'); setTimer(0) }
  const handleDecline = () => { setScreen('setup'); setCountdown(0) }
  const hangUp = () => { setScreen('setup'); setTimer(0) }

  const displayName = customName.trim() || caller.name
  const callTime = `${pad(Math.floor(timer / 60))}:${pad(timer % 60)}`

  if (screen === 'connected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6"
        style={{ background: 'linear-gradient(160deg, #0a2e1a 0%, #0d3d22 50%, #0a2e1a 100%)' }}>
        <div className="text-center">
          <p className="text-white/30 text-xs tracking-widest uppercase font-semibold mb-8">On Call</p>
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-900/50">
            <span className="text-4xl">{caller.emoji}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold">{callTime}</span>
          </div>
        </div>

        <div className="w-full max-w-xs">
          {/* Speaker / mute / etc placeholder buttons */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: '🔇', label: 'Mute' },
              { icon: '🔊', label: 'Speaker' },
              { icon: '⌨️', label: 'Keypad' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                  {b.icon}
                </div>
                <span className="text-white/40 text-[10px] font-medium">{b.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={hangUp}
            className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-900/50 hover:scale-105 transition-transform active:scale-95"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </button>
          <p className="text-white/20 text-[11px] text-center mt-3">Tap to end call</p>
        </div>
      </div>
    )
  }

  if (screen === 'ringing') {
    const isWaiting = countdown > 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #1e1e3a 100%)' }}>
        <AnimatePresence mode="wait">
          {isWaiting ? (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl">
                {caller.emoji}
              </div>
              <p className="text-white/40 text-sm mb-3">Incoming call in</p>
              <p className="text-5xl font-black text-white mb-6">{countdown}s</p>
              <button onClick={handleDecline}
                className="px-6 py-2.5 bg-white/10 rounded-xl text-white/60 text-sm font-medium hover:bg-white/15 transition-colors">
                Cancel
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="ring"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full max-w-xs"
            >
              {/* Pulsing avatar */}
              <div className="relative flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute w-36 h-36 rounded-full bg-emerald-400/10"
                />
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="absolute w-28 h-28 rounded-full bg-emerald-400/15"
                />
                <div className={`relative w-24 h-24 bg-gradient-to-br ${caller.color} rounded-full flex items-center justify-center shadow-2xl`}>
                  <span className="text-4xl">{caller.emoji}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
              <p className="text-white/40 text-sm mb-1">Safique Fake Call</p>
              <p className="text-white/20 text-xs mb-10">Incoming call…</p>

              <div className="flex gap-12 justify-center">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecline}
                    className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-xl shadow-red-500/20"
                  >
                    <HiX className="text-white text-2xl" />
                  </motion.button>
                  <span className="text-white/30 text-[10px] font-medium">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAccept}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20"
                  >
                    <HiPhone className="text-white text-2xl" />
                  </motion.button>
                  <span className="text-white/30 text-[10px] font-medium">Accept</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Setup screen
  return (
    <div className="min-h-screen w-full bg-[#1A1A2E] px-8 pt-8 pb-12 relative overflow-hidden flex flex-col items-center justify-center md:items-start">
      <div className="absolute top-0 right-0 w-48 h-48 bg-success/5 rounded-full blur-3xl pointer-events-none" />

      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white/70 transition-colors mb-6 flex items-center gap-1.5">
        <HiArrowLeft className="text-lg" /> <span className="text-sm font-medium">Back</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
          <HiPhone className="text-white text-3xl" />
        </div>
        <h1 className="text-xl font-bold text-white mb-1">Fake Call</h1>
        <p className="text-white/40 text-sm max-w-[260px] mx-auto leading-relaxed">
          Simulate a realistic incoming call to escape uncomfortable situations
        </p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {/* Caller preset */}
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2.5">Select Caller</p>
          <div className="grid grid-cols-4 gap-2">
            {callerPresets.map((c) => (
              <button
                key={c.name}
                onClick={() => setCaller(c)}
                className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  caller.name === c.name
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-[10px] font-semibold text-white/60">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom name */}
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Custom Name (optional)</p>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={`Showing as: ${caller.name}`}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm placeholder:text-white/20 focus:border-primary/60 transition-all"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Delay slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Call Delay</p>
            <span className="text-xs font-bold text-primary">{delay}s</span>
          </div>
          <input
            type="range" min={0} max={15} step={1} value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-white/20 mt-1">
            <span>Instant</span><span>15s</span>
          </div>
        </div>

        {/* Preview card */}
        <div className="bg-white/5 border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${caller.color} rounded-xl flex items-center justify-center shrink-0 text-2xl`}>
            {caller.emoji}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{displayName}</p>
            <p className="text-[11px] text-white/30">Incoming call · {delay === 0 ? 'Instant' : `after ${delay}s`}</p>
          </div>
        </div>

        {/* Trigger button */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={triggerCall}
          className="w-full py-4 bg-gradient-to-r from-success to-success-dark text-white font-bold rounded-2xl shadow-2xl shadow-success/25 flex items-center justify-center gap-2 text-base"
        >
          <HiPhone className="text-xl" />
          Trigger Fake Call
        </motion.button>

        <p className="text-white/15 text-[11px] text-center leading-relaxed">
          A realistic call screen will appear. Use it to excuse yourself from unsafe situations discreetly.
        </p>
      </div>
    </div>
  )
}
