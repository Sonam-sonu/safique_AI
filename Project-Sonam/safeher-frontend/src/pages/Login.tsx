import { useState, type FormEvent, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '🛡️', title: 'AI Safety Scoring',     desc: 'Every route scored with crime stats, lighting & crowd density.' },
  { icon: '🗺️', title: 'Live Safety Heatmap',   desc: 'See danger zones overlaid on a live map before you step outside.' },
  { icon: '🆘', title: 'One-tap SOS',            desc: 'Alert contacts and dispatch police with a single hold.' },
  { icon: '📞', title: 'Fake Call Escape',       desc: 'Simulate a realistic incoming call to exit uncomfortable situations.' },
]

function Blob({ style }: { style: CSSProperties }) {
  return (
    <motion.div
      animate={{ scale:[1, 1.15, 1], opacity:[0.3, 0.5, 0.3] }}
      transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}
      style={{ position:'absolute', borderRadius:'50%', filter:'blur(90px)', pointerEvents:'none', ...style }}
    />
  )
}

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim())               { setError('Email address is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return }
    if (!password)                   { setError('Password is required'); return }
    setLoading(true)
    try {
      const { authApi } = await import('../services/api')
      const { data } = await authApi.login({ email: email.trim().toLowerCase(), password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-grid" style={{ display:'grid', gridTemplateColumns:'55% 45%', height:'100vh', overflow:'hidden', fontFamily:"'Inter', sans-serif" }}>

      {/* ═══ LEFT: Branding ═══ */}
      <div className="login-left" style={{ position:'relative', overflow:'hidden', background:'radial-gradient(ellipse 120% 80% at 30% 20%, #1A0A3C 0%, #060614 50%, #0A0A1E 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px' }}>
        <Blob style={{ width:600, height:600, top:'-150px', right:'-150px', background:'radial-gradient(circle, #7C6FFF, transparent)' }} />
        <Blob style={{ width:500, height:500, bottom:'-100px', left:'-100px', background:'radial-gradient(circle, #FF4D8D, transparent)', animationDelay:'3s' }} />
        <Blob style={{ width:350, height:350, top:'40%', left:'35%', background:'radial-gradient(circle, #00D98B, transparent)', animationDelay:'6s' }} />

        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize:'52px 52px' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Logo */}
          <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            style={{ display:'flex', alignItems:'center', gap:14, marginBottom:60 }}>
            <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg, #7C6FFF, #FF4D8D)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(124,111,255,0.5), 0 12px 32px rgba(0,0,0,0.4)', flexShrink:0, position:'relative' }}>
              <div style={{ position:'absolute', inset:0, borderRadius:16, background:'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents:'none' }} />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:22, lineHeight:1.1, background:'linear-gradient(135deg, #A78BFF, #FF80B0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Safique</div>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12, marginTop:2, fontWeight:500, letterSpacing:'0.04em' }}>AI Safety Navigation</div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.55 }} style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:56, fontWeight:800, color:'white', lineHeight:1.1, letterSpacing:'-0.03em', margin:0 }}>
              Travel Smarter,<br/>
              <span style={{ background:'linear-gradient(135deg, #A78BFF 0%, #FF80B0 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Stay Safer.</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
            style={{ fontSize:17, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:440, margin:'0 0 44px 0' }}>
            Safique uses AI to analyze route safety in real time — so every woman can travel with confidence.
          </motion.p>

          {/* Feature cards */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
            style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 + i * 0.08 }}
                whileHover={{ background:'rgba(255,255,255,0.09)', borderColor:'rgba(255,255,255,0.16)', y:-2 }}
                style={{ padding:'18px 18px', borderRadius:18, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(12px)', display:'flex', alignItems:'flex-start', gap:12, transition:'all 0.2s', cursor:'default' }}>
                <span style={{ fontSize:22, flexShrink:0, lineHeight:1, marginTop:2 }}>{f.icon}</span>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.9)', fontSize:13, fontWeight:700, marginBottom:4, lineHeight:1.3 }}>{f.title}</p>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11.5, lineHeight:1.55 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
          style={{ position:'absolute', bottom:28, left:64, color:'rgba(255,255,255,0.15)', fontSize:11.5, fontWeight:500, letterSpacing:'0.04em', zIndex:1 }}>
          Empowering Women's Safety Through Smart Navigation
        </motion.p>
      </div>

      {/* ═══ RIGHT: Form ═══ */}
      <div className="login-right" style={{ background:'#0A0A1E', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', overflowY:'auto', position:'relative' }}>
        <div style={{ position:'absolute', width:300, height:300, top:'-50px', right:'-50px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,111,255,0.08), transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />

        <motion.div initial={{ opacity:0, x:28 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ width:'100%', maxWidth:480, background:'rgba(255,255,255,0.04)', backdropFilter:'blur(24px)', borderRadius:28, padding:'44px', boxShadow:'0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.09)' }}>

          {/* Card logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg, #7C6FFF, #5A52D5)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(124,111,255,0.4)', flexShrink:0 }}>
              <HiShieldCheck style={{ color:'white', fontSize:20 }} />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:'white', lineHeight:1.1 }}>Safique</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1, fontWeight:500 }}>Secure Sign In</div>
            </div>
          </div>

          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:'-0.025em', lineHeight:1.15, margin:'0 0 8px 0', background:'linear-gradient(135deg, white 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Welcome back</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.35)', margin:0 }}>Sign in to continue to Safique</p>
          </div>

          <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:0 }}>

            {/* Email */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>Email address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="you@example.com" autoComplete="email"
                className="input-field" />
            </div>

            {/* Password */}
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>Password</label>
                <button type="button" style={{ fontSize:12, fontWeight:600, color:'#A78BFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>Forgot password?</button>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="Enter your password" autoComplete="current-password"
                  className="input-field" style={{ paddingRight:52 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}>
                  {showPwd ? <HiEyeOff style={{ fontSize:20 }} /> : <HiEye style={{ fontSize:20 }} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, height:0, marginBottom:0 }} animate={{ opacity:1, height:'auto', marginBottom:18 }} exit={{ opacity:0, height:0, marginBottom:0 }} style={{ overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,90,122,0.12)', border:'1px solid rgba(255,90,122,0.25)', borderRadius:12, padding:'12px 16px', fontSize:13.5, color:'#FF80A0', fontWeight:500 }}>
                    <HiExclamationCircle style={{ fontSize:18, flexShrink:0 }} />{error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In */}
            <motion.button type="submit" disabled={loading} className="btn btn-primary" whileHover={!loading ? { y:-2 } : {}} whileTap={!loading ? { scale:0.98 } : {}}
              style={{ width:'100%', height:54, fontSize:15, fontWeight:700, opacity:loading ? 0.7 : 1, cursor:loading ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <><div style={{ width:18, height:18, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin .7s linear infinite' }} />Signing in…</>
              ) : (
                <><HiShieldCheck style={{ fontSize:20 }} />Sign In to Safique</>
              )}
            </motion.button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontWeight:600, letterSpacing:'0.06em' }}>QUICK DEMO</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
            {[
              { label:'Demo User',  emoji:'👩', email:'user@safique.app',  pwd:'safique123', color:'#A78BFF', bg:'rgba(124,111,255,0.12)' },
              { label:'Demo Admin', emoji:'🛡️', email:'admin@safique.app', pwd:'admin123',   color:'#40E8AC', bg:'rgba(0,217,139,0.12)' },
            ].map(d => (
              <motion.button key={d.label} type="button" whileHover={{ y:-2, scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={() => { setEmail(d.email); setPassword(d.pwd); setError('') }}
                style={{ height:46, borderRadius:12, border:`1px solid ${d.color}30`, background:d.bg, cursor:'pointer', fontSize:13, fontWeight:700, color:d.color, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', transition:'all 0.15s' }}>
                <span style={{ fontSize:16 }}>{d.emoji}</span>{d.label}
              </motion.button>
            ))}
          </div>

          <p style={{ textAlign:'center', fontSize:14, color:'rgba(255,255,255,0.3)', margin:0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#A78BFF', fontWeight:700, textDecoration:'none' }}>Create an account</Link>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
