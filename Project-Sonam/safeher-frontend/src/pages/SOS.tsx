import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiPhone, HiLocationMarker, HiX } from 'react-icons/hi'

const HOLD_DURATION = 3000

const contacts = [
  { name: 'Mother',      phone: '+91 9876543210', initial: 'M', color: 'linear-gradient(135deg, #FF4D8D, #E03A7A)' },
  { name: 'Father',      phone: '+91 9876543211', initial: 'F', color: 'linear-gradient(135deg, #38BDF8, #0EA5E9)' },
  { name: 'Best Friend', phone: '+91 9876543212', initial: 'B', color: 'linear-gradient(135deg, #7C6FFF, #5A52D5)' },
]

function CountdownRing({ progress }: { progress: number }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx="70" cy="70" r={radius} fill="none" stroke="url(#sosGrad)" strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition:'stroke-dashoffset 0.05s linear', filter:'drop-shadow(0 0 8px rgba(255,77,141,0.8))' }} />
      <defs>
        <linearGradient id="sosGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4D8D" />
          <stop offset="100%" stopColor="#FF80B0" />
        </linearGradient>
      </defs>
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()  => setCoords({ lat: 28.6139, lng: 77.2090 }),
      )
    } else { setCoords({ lat: 28.6139, lng: 77.2090 }) }
  }, [])

  useEffect(() => {
    if (phase === 'sent') {
      tickRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [phase])

  const startHold = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('holding'); setHoldProgress(0)
    const start = Date.now()
    holdTimerRef.current = setInterval(() => {
      const pct = Math.min((Date.now() - start) / HOLD_DURATION, 1)
      setHoldProgress(pct)
      if (pct >= 1) { clearInterval(holdTimerRef.current!); setPhase('sent'); setTimeElapsed(0) }
    }, 30)
  }, [phase])

  const cancelHold = useCallback(() => {
    if (phase !== 'holding') return
    if (holdTimerRef.current) clearInterval(holdTimerRef.current)
    setPhase('idle'); setHoldProgress(0)
  }, [phase])

  const reset = () => { setPhase('idle'); setHoldProgress(0); setTimeElapsed(0) }
  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const coordStr = coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Acquiring GPS...'

  return (
    <div style={{
      minHeight:'100vh', width:'100%',
      background:'radial-gradient(ellipse 120% 80% at 50% 0%, #1A0510 0%, #0A0014 40%, #060614 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'40px 20px', position:'relative', overflow:'hidden',
    }}>
      {/* BG orbs */}
      <div style={{ position:'absolute', width:600, height:600, top:'-200px', left:'-100px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,77,141,0.15), transparent 70%)', filter:'blur(80px)', animation:'aurora 10s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:400, height:400, bottom:'-100px', right:'-100px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,111,255,0.12), transparent 70%)', filter:'blur(80px)', animation:'aurora 14s ease-in-out infinite 3s' }} />
      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle at 50% 50%, rgba(255,77,141,0.05) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`, backgroundSize:'100% 100%, 50px 50px, 50px 50px', pointerEvents:'none' }} />

      {/* Ring decorations */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', border:'1px solid rgba(255,77,141,0.06)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:450, height:450, borderRadius:'50%', border:'1px solid rgba(255,77,141,0.08)', pointerEvents:'none' }} />

      <AnimatePresence mode="wait">
        {phase !== 'sent' ? (
          <motion.div key="main" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:0.9 }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:340, position:'relative', zIndex:1 }}>

            {/* Status chip */}
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:999, padding:'7px 16px', marginBottom:36, backdropFilter:'blur(12px)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#00D98B', boxShadow:'0 0 8px #00D98B', display:'inline-block' }} className="animate-blink" />
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:500 }}>Ready · {coordStr}</span>
            </div>

            {/* Big SOS button */}
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:32 }}>
              {phase === 'idle' && (
                <>
                  <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'rgba(255,77,141,0.06)', animation:'pulse-ring 2s ease-out infinite' }} />
                  <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(255,77,141,0.08)', animation:'pulse-ring 2s ease-out infinite 0.5s' }} />
                </>
              )}

              <div style={{ position:'relative', width:148, height:148 }}>
                {phase === 'holding' && <CountdownRing progress={holdProgress} />}
                <button
                  onMouseDown={startHold} onMouseUp={cancelHold}
                  onTouchStart={startHold} onTouchEnd={cancelHold}
                  style={{
                    width:'100%', height:'100%', borderRadius:'50%', border:'none',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', userSelect:'none', position:'relative',
                    background: phase === 'holding'
                      ? 'radial-gradient(circle at 40% 35%, #FF7AB0, #FF3A7A)'
                      : 'radial-gradient(circle at 40% 35%, #FF6BA0, #E03070)',
                    boxShadow: phase === 'holding'
                      ? '0 0 60px rgba(255,77,141,0.8), 0 0 120px rgba(255,77,141,0.4), 0 16px 48px rgba(0,0,0,0.5)'
                      : '0 0 40px rgba(255,77,141,0.5), 0 16px 48px rgba(0,0,0,0.5)',
                    transition:'box-shadow 0.3s',
                    animation: phase === 'holding' ? 'sos-glow 1.5s ease-in-out infinite' : undefined,
                  }}
                >
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents:'none' }} />
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  <span style={{ color:'white', fontWeight:900, fontSize:22, marginTop:4, letterSpacing:'0.1em' }}>SOS</span>
                  {phase === 'holding' && <span style={{ color:'rgba(255,255,255,0.7)', fontSize:11, marginTop:2 }}>{Math.round((1 - holdProgress) * 3)}s</span>}
                </button>
              </div>
            </div>

            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginBottom:4, fontWeight:500 }}>
              {phase === 'idle' ? 'Hold button for 3 seconds to activate' : 'Release to cancel'}
            </p>
            {phase === 'holding' && (
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ color:'#FF80B0', fontSize:12, fontWeight:700, letterSpacing:'0.04em' }}
                className="animate-blink">
                Keep holding… SOS activating
              </motion.p>
            )}

            {/* Location */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              style={{ marginTop:24, width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, backdropFilter:'blur(12px)' }}>
              <div style={{ width:36, height:36, background:'rgba(124,111,255,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px rgba(124,111,255,0.3)' }}>
                <HiLocationMarker style={{ color:'#A78BFF', fontSize:18 }} />
              </div>
              <div>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Your location</p>
                <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.55)', fontWeight:600 }}>{coordStr}</p>
              </div>
            </motion.div>

            {/* Contacts */}
            <div style={{ marginTop:16, width:'100%' }}>
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Will notify</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {contacts.map((c, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4 + i * 0.07 }}
                    style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'11px 14px', backdropFilter:'blur(8px)' }}>
                    <div style={{ width:34, height:34, background:c.color, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>
                      <span style={{ color:'white', fontSize:12, fontWeight:800 }}>{c.initial}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{c.name}</p>
                      <p style={{ fontSize:10.5, color:'rgba(255,255,255,0.25)' }}>{c.phone}</p>
                    </div>
                    <div style={{ width:28, height:28, background:'rgba(255,255,255,0.05)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <HiPhone style={{ color:'rgba(255,255,255,0.25)', fontSize:13 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="sent" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:100 }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:340, position:'relative', zIndex:1 }}>

            {/* Success ring */}
            <div style={{ position:'relative', marginBottom:24 }}>
              <div style={{ position:'absolute', inset:0, background:'rgba(0,217,139,0.2)', borderRadius:'50%' }} className="animate-pulse-ring-fast" />
              <div style={{ width:112, height:112, background:'linear-gradient(135deg, #00D98B, #00B874)', borderRadius:'50%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(0,217,139,0.5), 0 20px 48px rgba(0,0,0,0.4)', position:'relative' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents:'none' }} />
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>

            <h2 style={{ fontSize:28, fontWeight:900, color:'white', marginBottom:6, letterSpacing:'-0.02em' }}>SOS Sent!</h2>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14, marginBottom:12 }}>Help is on the way</p>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(0,217,139,0.1)', border:'1px solid rgba(0,217,139,0.2)', borderRadius:999, padding:'6px 16px', marginBottom:24 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#00D98B', display:'inline-block' }} className="animate-blink" />
              <span style={{ color:'#40E8AC', fontSize:12, fontWeight:700 }}>{formatTime(timeElapsed)} elapsed</span>
            </div>

            <div style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:18, marginBottom:18, backdropFilter:'blur(12px)' }}>
              {[
                { icon:'📍', label:'Location shared',           detail:coordStr },
                { icon:'📞', label:`${contacts.length} contacts notified`, detail:'Alert sent' },
                { icon:'🚔', label:'Police dispatch alerted',   detail:'Nearest station informed' },
                { icon:'🏥', label:'Emergency services notified', detail:'Ambulance on standby' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i * 0.1 }}
                  style={{ display:'flex', alignItems:'center', gap:12, marginBottom:i < 3 ? 14 : 0 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{item.label}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{item.detail}</p>
                  </div>
                  <HiShieldCheck style={{ color:'#40E8AC', fontSize:18, flexShrink:0 }} />
                </motion.div>
              ))}
            </div>

            <div style={{ display:'flex', gap:10, width:'100%' }}>
              <motion.button whileTap={{ scale:0.97 }} onClick={reset}
                style={{ flex:1, padding:'13px 20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontWeight:600, borderRadius:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:14, fontFamily:'inherit', backdropFilter:'blur(8px)' }}>
                <HiX /> Dismiss
              </motion.button>
              <motion.button whileTap={{ scale:0.97 }} onClick={() => alert('Calling 112...')} className="btn btn-success"
                style={{ flex:1, padding:'13px 20px', fontSize:14, fontWeight:700 }}>
                <HiPhone /> Call 112
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
