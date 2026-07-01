import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Score logic ──────────────────────────────────────── */
function calcScore(r: { lighting: string; crowdDensity: string; policeNearby: boolean; crimeRisk: string; time: string; isolated: boolean }) {
  let s = 5
  if (r.lighting === 'Good')     s += 2; if (r.crowdDensity === 'High') s += 2
  if (r.policeNearby)            s += 1; if (r.crimeRisk === 'Low')     s += 2
  if (r.time === 'day')          s += 1; if (r.time === 'night')        s -= 1
  if (r.crowdDensity === 'Low')  s -= 2; if (r.crimeRisk === 'High')    s -= 3
  if (r.isolated)                s -= 2
  return Math.min(Math.max(s, 1), 10)
}

function getMeta(score: number) {
  if (score >= 8) return { label: 'Safe Route',   color: '#00C48C', lightBg: '#EDFBF6', textColor: '#00A878', scoreBg: 'linear-gradient(135deg,#00C48C,#00A878)' }
  if (score >= 5) return { label: 'Medium Route', color: '#FFB800', lightBg: '#FFF8E6', textColor: '#E5A600', scoreBg: 'linear-gradient(135deg,#FFB800,#E5A600)' }
  return               { label: 'Risky Route',  color: '#FF5A7A', lightBg: '#FFEEF2', textColor: '#E04A6A', scoreBg: 'linear-gradient(135deg,#FF5A7A,#E04A6A)' }
}

const RAW = [
  { id:1, name:'Route A – Main Road',   time:'15 min', dist:'3.2 km', crowd:'High',   crime:'Low',    light:'Good',     police:true,  iso:false, via:'MG Road → Civil Lines → Azad Chowk',         tip:'Well-lit main road with active police patrol. Highest safety score.' },
  { id:2, name:'Route B – City Bypass', time:'11 min', dist:'2.6 km', crowd:'Medium', crime:'Medium', light:'Moderate', police:false, iso:false, via:'Bypass Road → Market Street → Station Road',  tip:'Moderate crowd. Acceptable with caution during daytime.' },
  { id:3, name:'Route C – Short Cut',   time:'8 min',  dist:'1.8 km', crowd:'Low',    crime:'High',   light:'Poor',     police:false, iso:true,  via:'Park Lane → Isolated Path → Back Alley',      tip:'Isolated path with poor lighting and high crime risk. Avoid.' },
]

const FACTORS = [
  { key:'lighting',  label:'Lighting',      icon:'💡' },
  { key:'crowd',     label:'Crowd Density', icon:'👥' },
  { key:'crime',     label:'Crime Risk',    icon:'🚨' },
  { key:'police',    label:'Police Nearby', icon:'👮' },
]

export default function RouteFinder() {
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [tod, setTod]         = useState<'day'|'night'>('day')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [selId, setSelId]     = useState<number|null>(null)
  const navigate = useNavigate()

  const routes = RAW.map(r => {
    const score = calcScore({ lighting:r.light, crowdDensity:r.crowd, policeNearby:r.police, crimeRisk:r.crime, time:tod, isolated:r.iso })
    return { ...r, score, meta: getMeta(score) }
  }).sort((a,b) => b.score - a.score)

  const sel = routes.find(r => r.id === selId) ?? routes[0]

  const analyze = async () => {
    setLoading(true); setDone(false)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false); setDone(true); setSelId(routes[0].id)
  }

  const swap = () => { const t = from; setFrom(to); setTo(t) }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize:'2rem', fontWeight:800, color:'#0F0F23', letterSpacing:'-0.025em', lineHeight:1.2 }}>Route Finder</h1>
        <p style={{ fontSize:15, color:'#7A7A95', marginTop:8 }}>AI-powered safety analysis — find the safest path to your destination</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:28, alignItems:'start' }}>

        {/* ── Left: Input panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Journey card */}
          <div className="card" style={{ padding:28 }}>
            <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95', marginBottom:24 }}>
              Journey Details
            </div>

            {/* From */}
            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#0F0F23', display:'block', marginBottom:8 }}>From</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#F7F8FC', border:'2px solid #E2E4EE', borderRadius:12, padding:'12px 16px', transition:'border-color 0.15s' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#00C48C', flexShrink:0 }} />
                <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="Your current location"
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:'#0F0F23', fontFamily:'inherit' }} />
                <button onClick={()=>setFrom('Current Location 📍')} style={{
                  fontSize:11, fontWeight:700, color:'#6C63FF', background:'rgba(108,99,255,0.1)', border:'none',
                  padding:'4px 10px', borderRadius:8, cursor:'pointer', whiteSpace:'nowrap',
                }}>GPS</button>
              </div>
            </div>

            {/* Swap */}
            <div style={{ display:'flex', justifyContent:'center', margin:'4px 0' }}>
              <button onClick={swap} style={{
                width:32, height:32, borderRadius:'50%', background:'white', border:'2px solid #E2E4EE',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.15s',
                fontSize:16,
              }} title="Swap">⇅</button>
            </div>

            {/* To */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#0F0F23', display:'block', marginBottom:8 }}>To</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#F7F8FC', border:'2px solid #E2E4EE', borderRadius:12, padding:'12px 16px' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#FF5A7A', flexShrink:0 }} />
                <input value={to} onChange={e=>setTo(e.target.value)} placeholder="Enter destination"
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:'#0F0F23', fontFamily:'inherit' }} />
              </div>
            </div>

            {/* Time toggle */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#0F0F23', display:'block', marginBottom:10 }}>Time of Travel</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {(['day','night'] as const).map(t => (
                  <button key={t} onClick={()=>{setTod(t);setDone(false)}} style={{
                    padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    border: tod===t ? `2px solid ${t==='day'?'#E5A600':'#5A52D5'}` : '2px solid #E2E4EE',
                    background: tod===t ? (t==='day'?'#FFF8E6':'#1A1A3E') : '#F7F8FC',
                    color: tod===t ? (t==='day'?'#E5A600':'#8B85FF') : '#7A7A95',
                  }}>
                    {t==='day' ? '☀️  Daytime' : '🌙  Night'}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze button */}
            <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'14px 20px', fontSize:15, borderRadius:12 }}>
              {loading
                ? <><div style={{ width:18,height:18,border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite' }} /> Analyzing routes...</>
                : <><span>✨</span> {done ? 'Re-analyze Routes' : 'Find Safest Route'}</>}
            </button>

            {/* AI progress */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden',marginTop:16}}>
                  <div style={{ padding:16, background:'rgba(108,99,255,0.05)', border:'1.5px solid rgba(108,99,255,0.15)', borderRadius:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:14 }}>✨</span>
                      <span style={{ fontSize:13, fontWeight:600, color:'#0F0F23' }}>AI Safety Engine Processing…</span>
                    </div>
                    <div style={{ height:5, background:'#E2E4EE', borderRadius:999, overflow:'hidden' }}>
                      <motion.div style={{ height:'100%', background:'linear-gradient(90deg,#6C63FF,#8B85FF)', borderRadius:999 }}
                        initial={{width:'0%'}} animate={{width:'100%'}} transition={{duration:1.5,ease:'easeInOut'}} />
                    </div>
                    <p style={{ fontSize:12, color:'#7A7A95', marginTop:8 }}>Checking crime data, lighting, crowd density…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Safety breakdown (after analysis) */}
          <AnimatePresence>
            {done && (
              <motion.div className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{padding:28}}>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95', marginBottom:18 }}>
                  Safety Factors — {sel.name}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {FACTORS.map(f => {
                    const val = f.key==='lighting' ? sel.light : f.key==='crowd' ? sel.crowd : f.key==='crime' ? sel.crime : String(sel.police)
                    const good = (f.key==='lighting'&&val==='Good')||(f.key==='crowd'&&val==='High')||(f.key==='crime'&&val==='Low')||(f.key==='police'&&val==='true')
                    const bad  = (f.key==='lighting'&&val==='Poor')||(f.key==='crowd'&&val==='Low')||(f.key==='crime'&&val==='High')||(f.key==='police'&&val==='false')
                    return (
                      <div key={f.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#F7F8FC', borderRadius:12, padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:18, width:24, textAlign:'center' }}>{f.icon}</span>
                          <span style={{ fontSize:14, fontWeight:600, color:'#0F0F23' }}>{f.label}</span>
                        </div>
                        <span style={{
                          fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:999,
                          background: good ? '#EDFBF6' : bad ? '#FFEEF2' : '#FFF8E6',
                          color:       good ? '#00A878' : bad ? '#E04A6A' : '#E5A600',
                        }}>{f.key==='police' ? (sel.police ? 'Yes' : 'No') : val}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:18 }}>
                  <button className="btn btn-primary" style={{ padding:'12px 16px', fontSize:13 }}
                    onClick={()=>navigate('/route-details',{state:{route:sel}})}>View Full Details</button>
                  <button className="btn btn-ghost" style={{ padding:'12px 16px', fontSize:13 }}
                    onClick={()=>navigate('/map')}>🗺️ Open Map</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Route cards ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95' }}>Available Routes</div>
            <div style={{ display:'flex', gap:16, fontSize:13 }}>
              {[['#00C48C','Safe'],['#FFB800','Medium'],['#FF5A7A','Risky']].map(([c,l])=>(
                <span key={l} style={{ display:'flex', alignItems:'center', gap:6, color:'#7A7A95' }}>
                  <div style={{ width:10,height:10,borderRadius:'50%',background:c }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {routes.map((route,i)=>(
              <motion.div key={route.id}
                initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                onClick={()=>{setSelId(route.id);navigate('/route-details',{state:{route}})}}
                className="card"
                style={{
                  padding:28, cursor:'pointer', borderLeft:`5px solid ${route.meta.color}`,
                  outline: selId===route.id ? `2px solid ${route.meta.color}40` : 'none',
                  outlineOffset:2, transition:'all 0.2s',
                }}
                whileHover={{ y:-3, boxShadow:'0 8px 28px rgba(15,15,35,0.10)' }}
              >
                {/* Top row */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      {i===0 && <span style={{ background:'#00C48C', color:'white', fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:999 }}>✓ SAFEST</span>}
                      <h3 style={{ fontSize:18, fontWeight:700, color:'#0F0F23' }}>{route.name}</h3>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:route.meta.textColor, marginBottom:6 }}>{route.meta.label}</div>
                    <div style={{ fontSize:13, color:'#7A7A95', display:'flex', alignItems:'center', gap:4 }}>
                      <span>📍</span>{route.via}
                    </div>
                  </div>
                  {/* Score badge */}
                  <div style={{ width:72, height:72, borderRadius:20, background:route.meta.scoreBg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 20px ${route.meta.color}40`, flexShrink:0 }}>
                    <span style={{ fontSize:28, fontWeight:900, color:'white', lineHeight:1 }}>{route.score}</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:2 }}>/10</span>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
                  {[['⏱','Time',route.time],['📏','Distance',route.dist],['👥','Crowd',route.crowd],['💡','Lighting',route.light]].map(([icon,label,val])=>(
                    <div key={label as string} style={{ background:'#F7F8FC', borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                      <div style={{ fontSize:11, color:'#7A7A95', fontWeight:500, marginBottom:2 }}>{label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0F0F23' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:999,
                      background: route.crime==='Low'?'#EDFBF6':route.crime==='High'?'#FFEEF2':'#FFF8E6',
                      color:       route.crime==='Low'?'#00A878':route.crime==='High'?'#E04A6A':'#E5A600',
                    }}>{route.crime} Crime Risk</span>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:999,
                      background: route.police?'#EDFBF6':'#F4F6FB', color: route.police?'#00A878':'#7A7A95',
                    }}>{route.police?'👮 Police Nearby':'No Police'}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#6C63FF', display:'flex', alignItems:'center', gap:4 }}>
                    View Details →
                  </span>
                </div>

                {/* Insight (top route) */}
                {i===0 && (
                  <div style={{ marginTop:16, background:'#EDFBF6', border:'1.5px solid #00C48C30', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>🛡️</span>
                    <p style={{ fontSize:13.5, color:'#00A878', fontWeight:500 }}>{route.tip}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
