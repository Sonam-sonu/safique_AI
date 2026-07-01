import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiCheck, HiX } from 'react-icons/hi'

const COMMANDS = ['help', 'sos', 'emergency', 'save me', 'danger', 'safique help']

const BAR_COUNT = 9

function AudioBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-1 h-10">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ background: active ? '#6C63FF' : '#D1D1E0' }}
          animate={active ? {
            scaleY: [0.2, 1, 0.3, 0.8, 0.2],
            height: ['8px', '32px', '12px', '28px', '10px'],
          } : { scaleY: 0.25, height: '8px' }}
          transition={{
            duration: 0.7 + (i % 3) * 0.15,
            delay: i * 0.07,
            repeat: active ? Infinity : 0,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function VoiceTrigger() {
  const [permState, setPermState] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [listening, setListening] = useState(false)
  const [detected, setDetected] = useState('')
  const [activated, setActivated] = useState(false)
  const [activeCmd, setActiveCmd] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check mic permission on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setPermState(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown')
        result.onchange = () => setPermState(result.state === 'granted' ? 'granted' : 'denied')
      }).catch(() => setPermState('unknown'))
    }
  }, [])

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setPermState('granted')
    } catch {
      setPermState('denied')
    }
  }

  useEffect(() => {
    if (!listening) return
    timerRef.current = setTimeout(() => {
      // Simulate voice detection
      const cmd = COMMANDS[Math.floor(Math.random() * COMMANDS.length)]
      setDetected(cmd)
      setActiveCmd(cmd)
      setActivated(true)
      setTimeout(() => {
        setListening(false)
        setDetected('')
      }, 2200)
    }, 3500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [listening])

  const toggle = () => {
    if (listening) {
      setListening(false)
      setDetected('')
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      if (permState === 'denied') return
      setActivated(false)
      setActiveCmd('')
      setListening(true)
    }
  }

  const reset = () => {
    setActivated(false)
    setDetected('')
    setActiveCmd('')
    setListening(false)
  }

  return (
    <div className="min-h-screen w-full bg-[#1A1A2E] flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Permission denied banner */}
      <AnimatePresence>
        {permState === 'denied' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-4 left-4 right-4 bg-amber-500/10 border border-amber-400/30 rounded-xl px-4 py-3 flex items-start gap-2.5 z-10">
            <span className="text-base shrink-0">🎙️</span>
            <div>
              <p className="text-amber-300 text-xs font-bold">Microphone access denied</p>
              <p className="text-amber-300/60 text-[10px] mt-0.5 leading-relaxed">
                Enable microphone in your browser settings to use voice SOS.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center w-full max-w-xs">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">Voice Trigger SOS</h1>
          <p className="text-white/40 text-sm">Hands-free emergency activation</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activated ? (
            /* ── ACTIVATED ── */
            <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }} className="flex flex-col items-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse-ring-fast" />
                <div className="w-28 h-28 bg-gradient-to-br from-success to-success-dark rounded-full flex items-center justify-center shadow-2xl shadow-success/30">
                  <HiCheck className="text-4xl text-white" />
                </div>
              </div>
              <p className="text-success font-black text-xl mb-1">SOS Activated!</p>
              <p className="text-white/40 text-sm mb-4">Emergency response initiated</p>
              <div className="bg-white/5 border border-white/[0.08] rounded-2xl px-5 py-3.5 mb-6">
                <p className="text-white/30 text-[10px] mb-1 uppercase tracking-wider">Detected command</p>
                <p className="text-white font-bold text-base">"{activeCmd}"</p>
              </div>
              <div className="space-y-2 w-full mb-5">
                {['📍 Location shared with contacts', '📞 Emergency contacts alerted', '🚔 Police dispatch notified'].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3.5 py-2.5">
                    <span className="text-sm">{item.split(' ')[0]}</span>
                    <span className="text-white/70 text-xs">{item.split(' ').slice(1).join(' ')}</span>
                    <HiShieldCheck className="text-success ml-auto shrink-0" />
                  </motion.div>
                ))}
              </div>
              <button onClick={reset} className="px-6 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/15 transition-colors flex items-center gap-1.5">
                <HiX /> Dismiss
              </button>
            </motion.div>
          ) : (
            /* ── IDLE / LISTENING ── */
            <motion.div key="mic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              {/* Permission request */}
              {permState === 'unknown' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3.5 mb-6 text-left">
                  <p className="text-white/70 text-xs font-bold mb-1">Microphone permission needed</p>
                  <p className="text-white/30 text-[10px] mb-3 leading-relaxed">
                    Safique needs microphone access to detect your voice commands for emergency activation.
                  </p>
                  <button onClick={requestPermission}
                    className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md">
                    Grant Microphone Access
                  </button>
                </motion.div>
              )}

              {/* Audio bars */}
              <div className="mb-6">
                <AudioBars active={listening} />
              </div>

              {/* Main button */}
              <div className="relative flex items-center justify-center mb-7">
                {listening && (
                  <>
                    <div className="absolute w-52 h-52 rounded-full bg-primary/8 animate-pulse-ring" />
                    <div className="absolute w-44 h-44 rounded-full bg-primary/12 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
                  </>
                )}
                <motion.button
                  onClick={toggle}
                  disabled={permState === 'denied'}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all disabled:opacity-40"
                  style={{
                    background: listening
                      ? 'radial-gradient(circle at 40% 35%, #FF7A9A, #FF3A60)'
                      : 'radial-gradient(circle at 40% 35%, #8B85FF, #6C63FF)',
                    boxShadow: listening
                      ? '0 8px 40px rgba(255, 90, 122, 0.4)'
                      : '0 8px 40px rgba(108, 99, 255, 0.35)',
                  }}
                >
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  <span className="text-white font-bold text-sm mt-1.5">
                    {listening ? 'Listening…' : 'Hold & Speak'}
                  </span>
                </motion.button>
              </div>

              {/* Detected text */}
              <AnimatePresence>
                {detected && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-white/5 border border-white/[0.08] rounded-2xl px-5 py-3.5 mb-6 w-full">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Detected</p>
                    <p className="text-white font-bold text-base">"{detected}"</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status indicator */}
              {listening && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-white/50 text-xs font-medium">Microphone active — speak now</span>
                </motion.div>
              )}

              {/* Commands list */}
              <div className="w-full">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">Supported Commands</p>
                <div className="grid grid-cols-2 gap-2">
                  {COMMANDS.map((cmd) => (
                    <div key={cmd}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                        activeCmd === cmd && activated
                          ? 'bg-success/20 border-success/40'
                          : 'bg-white/5 border-white/[0.06]'
                      }`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={activeCmd === cmd && activated ? '#00C48C' : '#6C63FF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      </svg>
                      <span className="text-[11px] text-white/50 font-medium capitalize">"{cmd}"</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-white/15 text-[10px] mt-6 leading-relaxed text-center max-w-[260px]">
                Works best in quiet environments. Microphone access is required. Voice data is processed locally.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
