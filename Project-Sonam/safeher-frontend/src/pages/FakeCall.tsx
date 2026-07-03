import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Caller presets ──────────────────────────────────────── */
const CALLERS = [
  { name: 'Mom',    emoji: '👩', grad: 'linear-gradient(135deg,#FF4D8D,#C0166F)',   glow: 'rgba(255,77,141,0.5)'   },
  { name: 'Dad',    emoji: '👨', grad: 'linear-gradient(135deg,#38BDF8,#0284C7)',   glow: 'rgba(56,189,248,0.5)'   },
  { name: 'Sister', emoji: '👧', grad: 'linear-gradient(135deg,#A78BFF,#6D28D9)',   glow: 'rgba(167,139,255,0.5)'  },
  { name: 'Boss',   emoji: '💼', grad: 'linear-gradient(135deg,#94A3B8,#475569)',   glow: 'rgba(148,163,184,0.4)'  },
  { name: 'BFF',    emoji: '🧡', grad: 'linear-gradient(135deg,#FB923C,#EA580C)',   glow: 'rgba(251,146,60,0.5)'   },
  { name: 'Doctor', emoji: '🩺', grad: 'linear-gradient(135deg,#34D399,#059669)',   glow: 'rgba(52,211,153,0.5)'   },
]

function pad(n: number) { return String(n).padStart(2, '0') }

/* ─── Ripple ring for ringing screen ─────────────────────── */
function PulseRings({ color }: { color: string }) {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
          animate={{ scale: [1, 1.8 + i * 0.25], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

/* ─── iPhone-style call button ────────────────────────────── */
function CallBtn({
  icon, label, color, size = 68, onClick,
}: {
  icon: ReactNode
  label: string
  color: string
  size?: number
  onClick?: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer',
      }}
    >
      <div style={{
        width: size, height: size, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 32px ${color}55, 0 0 0 1px rgba(255,255,255,0.08)`,
        position: 'relative',
      }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg,rgba(255,255,255,0.18),transparent)', pointerEvents:'none' }} />
        {icon}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
    </motion.button>
  )
}

/* ─── Connected screen ────────────────────────────────────── */
function ConnectedScreen({
  caller, displayName, timer, onHangUp,
}: {
  caller: typeof CALLERS[0]
  displayName: string
  timer: number
  onHangUp: () => void
}) {
  const callTime = `${pad(Math.floor(timer / 60))}:${pad(timer % 60)}`
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      style={{
        minHeight: '100dvh', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '60px 32px 52px',
        background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #061A12 0%, #030D0A 50%, #040810 100%)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* BG glow */}
      <div style={{ position:'absolute', width:400, height:400, top:'-100px', left:'50%', transform:'translateX(-50%)', borderRadius:'50%', background:`radial-gradient(circle, ${caller.glow.replace('0.5','0.18')}, transparent 70%)`, filter:'blur(80px)', pointerEvents:'none' }} />

      {/* Top info */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 28 }}>Safique · Fake Call</p>

        {/* Avatar */}
        <div style={{ position:'relative', width:120, height:120, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:caller.grad, opacity:0.15, filter:'blur(20px)' }} />
          <div style={{ width:100, height:100, borderRadius:'50%', background:caller.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, boxShadow:`0 0 40px ${caller.glow}, 0 16px 40px rgba(0,0,0,0.5)`, position:'relative' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg,rgba(255,255,255,0.22),transparent)', pointerEvents:'none' }} />
            {caller.emoji}
          </div>
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>{displayName}</h2>

        {/* Timer chip */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:999, padding:'5px 14px' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#34D399', boxShadow:'0 0 8px #34D399', display:'inline-block', animation:'blink 1.5s ease-in-out infinite' }} />
          <span style={{ color:'#34D399', fontSize:14, fontWeight:700, letterSpacing:'0.06em', fontVariantNumeric:'tabular-nums' }}>{callTime}</span>
        </div>
      </div>

      {/* Middle controls grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px 16px', position:'relative', zIndex:1 }}>
        {[
          { icon:'🔇', label: muted ? 'Unmute' : 'Mute',    active: muted,   action: () => setMuted(m => !m) },
          { icon:'🔊', label: speaker ? 'Earpiece' : 'Speaker', active: speaker, action: () => setSpeaker(s => !s) },
          { icon:'⌨️', label:'Keypad',  active: false, action: () => {} },
          { icon:'📷', label:'Camera',  active: false, action: () => {} },
          { icon:'➕', label:'Add',     active: false, action: () => {} },
          { icon:'⏸️', label:'Hold',    active: false, action: () => {} },
        ].map(btn => (
          <motion.button key={btn.label} whileTap={{ scale: 0.88 }} onClick={btn.action}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer' }}>
            <div style={{
              width:58, height:58, borderRadius:18,
              background: btn.active ? 'rgba(167,139,255,0.25)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${btn.active ? 'rgba(167,139,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, transition:'all 0.2s',
              boxShadow: btn.active ? '0 0 16px rgba(167,139,255,0.3)' : 'none',
              backdropFilter:'blur(12px)',
            }}>
              {btn.icon}
            </div>
            <span style={{ color: btn.active ? '#A78BFF' : 'rgba(255,255,255,0.35)', fontSize:10, fontWeight:600 }}>{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Hang up */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          onClick={onHangUp}
          style={{
            width:72, height:72, borderRadius:'50%', border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#FF4D8D,#E03A7A)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 40px rgba(255,77,141,0.5), 0 16px 40px rgba(0,0,0,0.5)',
            position:'relative',
          }}
        >
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg,rgba(255,255,255,0.2),transparent)', pointerEvents:'none' }} />
          {/* Phone hang-up SVG */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:'rotate(135deg)' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </motion.button>
        <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontWeight:600 }}>End Call</span>
      </div>
    </motion.div>
  )
}

/* ─── Ringing screen ──────────────────────────────────────── */
function RingingScreen({
  caller, displayName, countdown, onAccept, onDecline,
}: {
  caller: typeof CALLERS[0]
  displayName: string
  countdown: number
  onAccept: () => void
  onDecline: () => void
}) {
  const isWaiting = countdown > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100dvh', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '70px 32px 60px',
        background: 'radial-gradient(ellipse 120% 70% at 50% 0%, #0E0A2A 0%, #07071A 50%, #060614 100%)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* BG glow */}
      <div style={{ position:'absolute', width:500, height:500, top:'-150px', left:'50%', transform:'translateX(-50%)', borderRadius:'50%', background:`radial-gradient(circle, ${caller.glow.replace('0.5','0.15')}, transparent 70%)`, filter:'blur(100px)', pointerEvents:'none' }} />

      <AnimatePresence mode="wait">
        {isWaiting ? (
          /* Countdown waiting state */
          <motion.div key="wait" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, width:'100%', flex:1, justifyContent:'center' }}>
            <div style={{ width:80, height:80, borderRadius:24, background:caller.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:24, boxShadow:`0 0 30px ${caller.glow}` }}>
              {caller.emoji}
            </div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:12 }}>Incoming call in</p>
            <motion.div
              key={countdown}
              initial={{ scale:1.4, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              style={{ fontSize:72, fontWeight:900, color:'white', letterSpacing:'-0.04em', lineHeight:1, textShadow:`0 0 40px ${caller.glow}` }}
            >
              {countdown}
            </motion.div>
            <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12, marginTop:8, marginBottom:36 }}>seconds</p>
            <motion.button whileTap={{ scale:0.95 }} onClick={onDecline}
              style={{ padding:'10px 28px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:999, color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600, cursor:'pointer', backdropFilter:'blur(8px)', fontFamily:'inherit' }}>
              Cancel
            </motion.button>
          </motion.div>
        ) : (
          /* Ringing state */
          <motion.div key="ring" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>

            {/* Caller info */}
            <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:32 }}>Incoming Call</p>

            {/* Pulsing avatar */}
            <div style={{ position:'relative', width:180, height:180, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28 }}>
              <PulseRings color={caller.glow.replace('0.5','0.7')} />
              <div style={{
                width:120, height:120, borderRadius:'50%', background:caller.grad,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:50, position:'relative',
                boxShadow:`0 0 50px ${caller.glow}, 0 20px 50px rgba(0,0,0,0.5)`,
              }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg,rgba(255,255,255,0.22),transparent)', pointerEvents:'none' }} />
                {caller.emoji}
              </div>
            </div>

            <h2 style={{ fontSize:36, fontWeight:800, color:'white', letterSpacing:'-0.025em', marginBottom:8 }}>{displayName}</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>Safique Fake Call</p>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:56 }}>
              <motion.span
                animate={{ opacity:[1,0.3,1] }}
                transition={{ duration:1.2, repeat:Infinity }}
                style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}
              >
                ● ● ●
              </motion.span>
            </div>

            {/* Swipe-style decline / accept */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:56, justifyContent:'center' }}>
              <CallBtn
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                label="Decline"
                color="linear-gradient(135deg,#FF4D8D,#E03A7A)"
                size={72}
                onClick={onDecline}
              />
              <CallBtn
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                label="Accept"
                color="linear-gradient(135deg,#00D98B,#00B874)"
                size={72}
                onClick={onAccept}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main export ─────────────────────────────────────────── */
export default function FakeCall() {
  const [screen, setScreen]     = useState<'setup' | 'ringing' | 'connected'>('setup')
  const [caller, setCaller]     = useState(CALLERS[0])
  const [customName, setCustomName] = useState('')
  const [delay, setDelay]       = useState(3)
  const [timer, setTimer]       = useState(0)
  const [countdown, setCountdown] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate    = useNavigate()

  const displayName = customName.trim() || caller.name

  /* Trigger countdown → ringing */
  const triggerCall = () => {
    if (delay === 0) { setScreen('ringing'); setCountdown(0); return }
    setCountdown(delay)
    setScreen('ringing')
    countRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  /* Call timer when connected */
  useEffect(() => {
    if (screen === 'connected') {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [screen])

  const handleAccept  = () => { setScreen('connected'); setTimer(0) }
  const handleDecline = () => { if (countRef.current) clearInterval(countRef.current); setScreen('setup'); setCountdown(0) }
  const hangUp        = () => { setScreen('setup'); setTimer(0) }

  /* ── Connected ── */
  if (screen === 'connected') {
    return (
      <AnimatePresence mode="wait">
        <ConnectedScreen caller={caller} displayName={displayName} timer={timer} onHangUp={hangUp} />
      </AnimatePresence>
    )
  }

  /* ── Ringing ── */
  if (screen === 'ringing') {
    return (
      <AnimatePresence mode="wait">
        <RingingScreen caller={caller} displayName={displayName} countdown={countdown} onAccept={handleAccept} onDecline={handleDecline} />
      </AnimatePresence>
    )
  }

  /* ── Setup screen ── */
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-deep)',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', width:400, height:400, top:'-100px', right:'-100px', borderRadius:'50%', background:'radial-gradient(circle,rgba(0,217,139,0.1),transparent 70%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', width:300, height:300, bottom:'10%', left:'-80px', borderRadius:'50%', background:'radial-gradient(circle,rgba(124,111,255,0.1),transparent 70%)', filter:'blur(60px)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:520, margin:'0 auto', width:'100%', padding:'32px 24px 80px' }}>

        {/* Back */}
        <motion.button whileTap={{ scale:0.95 }} onClick={() => navigate(-1)}
          style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 14px', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:28, backdropFilter:'blur(8px)', fontFamily:'inherit' }}>
          ← Back
        </motion.button>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
            <div style={{ width:50, height:50, borderRadius:16, background:'linear-gradient(135deg,#00D98B,#00B874)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(0,217,139,0.4)', flexShrink:0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.025em', background:'linear-gradient(135deg,#A78BFF,#40E8AC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Fake Call</h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Escape uncomfortable situations discreetly</p>
            </div>
          </div>
        </div>

        {/* ── Caller Picker ── */}
        <div style={{ marginBottom:22 }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.3)', marginBottom:12 }}>Select Caller</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {CALLERS.map(c => {
              const isSelected = caller.name === c.name
              return (
                <motion.button key={c.name} whileHover={{ y:-2 }} whileTap={{ scale:0.95 }} onClick={() => setCaller(c)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    padding:'16px 10px', borderRadius:16, cursor:'pointer', fontFamily:'inherit',
                    background: isSelected ? `linear-gradient(135deg,${c.glow.replace('0.5','0.18')},${c.glow.replace('0.5','0.06')})` : 'rgba(255,255,255,0.04)',
                    border: isSelected ? `1px solid ${c.glow.replace('0.5','0.45')}` : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isSelected ? `0 0 20px ${c.glow.replace('0.5','0.2')}` : 'none',
                    transition:'all 0.2s',
                  }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:c.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow: isSelected ? `0 0 16px ${c.glow}` : 'none', transition:'box-shadow 0.2s' }}>
                    {c.emoji}
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}>{c.name}</span>
                  {isSelected && <div style={{ width:18, height:3, borderRadius:999, background:c.grad, boxShadow:`0 0 8px ${c.glow}` }} />}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Custom Name ── */}
        <div style={{ marginBottom:22 }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.3)', marginBottom:10 }}>Custom Name <span style={{ color:'rgba(255,255,255,0.18)', textTransform:'none', letterSpacing:'normal', fontWeight:500, fontSize:11 }}>(optional)</span></p>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17 }}>{caller.emoji}</span>
            <input
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder={`Showing as: ${caller.name}`}
              className="input-field"
              style={{ paddingLeft:42, fontSize:14 }}
            />
          </div>
        </div>

        {/* ── Delay Slider ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.3)' }}>Call Delay</p>
            <span style={{ fontSize:14, fontWeight:800, color:'#A78BFF', background:'rgba(124,111,255,0.15)', border:'1px solid rgba(124,111,255,0.25)', borderRadius:999, padding:'2px 12px' }}>
              {delay === 0 ? 'Instant' : `${delay}s`}
            </span>
          </div>
          {/* Custom styled slider */}
          <div style={{ position:'relative', height:20, display:'flex', alignItems:'center' }}>
            <div style={{ position:'absolute', left:0, right:0, height:6, borderRadius:999, background:'rgba(255,255,255,0.08)' }} />
            <div style={{ position:'absolute', left:0, height:6, borderRadius:999, width:`${(delay/15)*100}%`, background:'linear-gradient(90deg,#7C6FFF,#A78BFF)', boxShadow:'0 0 12px rgba(124,111,255,0.5)', transition:'width 0.1s' }} />
            <input type="range" min={0} max={15} step={1} value={delay}
              onChange={e => setDelay(Number(e.target.value))}
              style={{ position:'absolute', inset:0, width:'100%', opacity:0, cursor:'pointer', zIndex:2 }}
            />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.2)', fontWeight:600 }}>Instant</span>
            <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.2)', fontWeight:600 }}>15s</span>
          </div>
        </div>

        {/* ── Live Preview Card ── */}
        <motion.div
          layout
          style={{ background:`linear-gradient(135deg,${caller.glow.replace('0.5','0.12')},rgba(255,255,255,0.03))`, border:`1px solid ${caller.glow.replace('0.5','0.25')}`, borderRadius:20, padding:'18px 20px', display:'flex', alignItems:'center', gap:16, marginBottom:20, backdropFilter:'blur(12px)' }}>
          {/* Avatar */}
          <div style={{ width:56, height:56, borderRadius:'50%', background:caller.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0, boxShadow:`0 0 20px ${caller.glow}, 0 8px 20px rgba(0,0,0,0.4)`, position:'relative' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg,rgba(255,255,255,0.2),transparent)', pointerEvents:'none' }} />
            {caller.emoji}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:caller.grad.split(',')[1].replace(')','').trim(), boxShadow:`0 0 8px ${caller.glow}` }} className="animate-blink" />
              <p style={{ fontSize:16, fontWeight:800, color:'white' }}>{displayName}</p>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Incoming call · {delay === 0 ? 'Instant' : `in ${delay}s`}</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'6px 10px', fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Preview</div>
        </motion.div>

        {/* ── Trigger Button ── */}
        <motion.button
          whileHover={{ y:-3, boxShadow:'0 16px 48px rgba(0,217,139,0.45)' }}
          whileTap={{ scale:0.97 }}
          onClick={triggerCall}
          style={{
            width:'100%', padding:'17px 24px', border:'none', cursor:'pointer', fontFamily:'inherit',
            background:'linear-gradient(135deg,#00D98B,#00B874)',
            borderRadius:18, fontSize:16, fontWeight:800, color:'white',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            boxShadow:'0 8px 32px rgba(0,217,139,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            letterSpacing:'-0.01em', position:'relative', overflow:'hidden',
          }}
        >
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.15),transparent)', borderRadius:18 }} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Trigger Fake Call
        </motion.button>

        <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.18)', marginTop:14, lineHeight:1.6 }}>
          A realistic call screen will appear. Use it to excuse yourself from unsafe situations discreetly.
        </p>
      </div>
    </div>
  )
}
