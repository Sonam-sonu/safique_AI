import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #1A0A3C 0%, #060614 50%, #0A0A1E 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 3D Orbs */}
      <div style={{ position:'absolute', width:600, height:600, top:'-200px', left:'-150px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,111,255,0.25), transparent 70%)', filter:'blur(80px)', animation:'aurora 8s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:400, height:400, bottom:'-100px', right:'-100px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,77,141,0.2), transparent 70%)', filter:'blur(80px)', animation:'aurora 10s ease-in-out infinite 2s' }} />
      <div style={{ position:'absolute', width:300, height:300, top:'40%', right:'10%', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,217,139,0.15), transparent 70%)', filter:'blur(60px)', animation:'aurora 12s ease-in-out infinite 4s' }} />

      {/* Grid overlay */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize:'60px 60px',
      }} />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
        style={{ position:'relative', zIndex:1, marginBottom:32 }}
      >
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          background: 'linear-gradient(135deg, #7C6FFF 0%, #5A52D5 50%, #FF4D8D 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(124,111,255,0.6), 0 0 120px rgba(124,111,255,0.3), 0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          {/* Inner glow */}
          <div style={{ position:'absolute', inset:0, borderRadius:28, background:'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents:'none' }} />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.5, duration:0.6 }}
        style={{
          fontSize:52, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1,
          background:'linear-gradient(135deg, #A78BFF 0%, #FF80B0 50%, #40E8AC 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          position:'relative', zIndex:1, marginBottom:12,
        }}
      >
        Safique
      </motion.h1>

      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:0.7, duration:0.5 }}
        style={{ color:'rgba(255,255,255,0.4)', fontSize:14, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', position:'relative', zIndex:1, marginBottom:48 }}
      >
        Safe · Unique · Empowered
      </motion.p>

      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:1.2 }}
        style={{ display:'flex', gap:10, position:'relative', zIndex:1 }}
      >
        {[0,1,2,3,4].map(i => (
          <motion.div
            key={i}
            animate={{ scaleY:[0.4, 1, 0.4] }}
            transition={{ duration:0.8, delay:i * 0.12, repeat:Infinity, ease:'easeInOut' }}
            style={{
              width:4, height:24, borderRadius:999,
              background:`linear-gradient(180deg, #7C6FFF, #FF4D8D)`,
              transformOrigin:'center',
              boxShadow:'0 0 8px rgba(124,111,255,0.6)',
            }}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:2 }}
        style={{ position:'absolute', bottom:32, color:'rgba(255,255,255,0.15)', fontSize:11, fontWeight:500, letterSpacing:'0.08em', zIndex:1 }}
      >
        Empowering Women's Safety Through Smart Navigation
      </motion.p>
    </div>
  )
}
