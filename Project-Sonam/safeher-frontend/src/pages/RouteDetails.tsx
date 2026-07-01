import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

function calcScore(r: { lighting:string; crowdDensity:string; policeNearby:boolean; crimeRisk:string; time:string; isolated:boolean }) {
  let s = 5
  if (r.lighting==='Good') s+=2; if (r.crowdDensity==='High') s+=2; if (r.policeNearby) s+=1
  if (r.crimeRisk==='Low') s+=2; if (r.time==='day') s+=1;          if (r.time==='night') s-=1
  if (r.crowdDensity==='Low') s-=2; if (r.crimeRisk==='High') s-=3; if (r.isolated) s-=2
  return Math.min(Math.max(s,1),10)
}

const DEFAULT = { name:'Route A – Main Road', time:'15 min', dist:'3.2 km', crowd:'High', crime:'Low', light:'Good', police:true, iso:false, tod:'day', via:'MG Road → Civil Lines → Azad Chowk' }

function ScoreRing({ score }: { score:number }) {
  const r=54, circ=2*Math.PI*r
  const color = score>=8?'#00C48C':score>=5?'#FFB800':'#FF5A7A'
  return (
    <div style={{ position:'relative', width:136, height:136 }}>
      <svg width="136" height="136" viewBox="0 0 136 136" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="68" cy="68" r={r} fill="none" stroke="#EAEDF5" strokeWidth="10"/>
        <motion.circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{strokeDashoffset:circ}}
          animate={{strokeDashoffset:circ-(score/10)*circ}}
          transition={{duration:1.1,delay:0.3,ease:'easeOut'}}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <motion.span initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} transition={{delay:0.6,type:'spring'}}
          style={{ fontSize:36, fontWeight:900, color, lineHeight:1 }}>{score}</motion.span>
        <span style={{ fontSize:13, color:'#7A7A95', fontWeight:500, marginTop:2 }}>/10</span>
      </div>
    </div>
  )
}

export default function RouteDetails() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const r = { ...DEFAULT, ...(state?.route||{}) }
  const score = calcScore({ lighting:r.light||r.lighting||'Good', crowdDensity:r.crowd||r.crowdDensity||'High', policeNearby:r.police??r.policeNearby??true, crimeRisk:r.crime||r.crimeRisk||'Low', time:r.tod||r.timeOfDay||'day', isolated:r.iso??r.isolated??false })
  const color  = score>=8?'#00C48C':score>=5?'#FFB800':'#FF5A7A'
  const label  = score>=8?'Safe Route':score>=5?'Medium Route':'Risky Route'
  const lightBg= score>=8?'#EDFBF6':score>=5?'#FFF8E6':'#FFEEF2'

  const lighting    = r.light||r.lighting||'Good'
  const crowd       = r.crowd||r.crowdDensity||'High'
  const crime       = r.crime||r.crimeRisk||'Low'
  const police      = r.police??r.policeNearby??true
  const isolated    = r.iso??r.isolated??false
  const tod         = r.tod||r.timeOfDay||'day'

  const factors = [
    { label:'Lighting Condition', value:lighting, icon:'💡', points:lighting==='Good'?2:0, positive:lighting==='Good' },
    { label:'Crowd Density',      value:crowd,    icon:'👥', points:crowd==='High'?2:crowd==='Low'?-2:0, positive:crowd==='High' },
    { label:'Police Nearby',      value:police?'Yes':'No', icon:'👮', points:police?1:0, positive:police },
    { label:'Crime Risk',         value:crime,    icon:'🚨', points:crime==='Low'?2:crime==='High'?-3:0, positive:crime==='Low' },
    { label:'Time of Travel',     value:tod==='day'?'Daytime':'Night', icon:'🕐', points:tod==='day'?1:-1, positive:tod==='day' },
    { label:'Isolated Area',      value:isolated?'Yes':'No', icon:'📍', points:isolated?-2:0, positive:!isolated },
  ]

  return (
    <div className="page-wrapper">
      {/* Back */}
      <button onClick={()=>navigate(-1)} style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, fontWeight:600, color:'#7A7A95', background:'none', border:'none', cursor:'pointer', marginBottom:28, padding:0, transition:'color 0.15s' }}
        onMouseEnter={e=>(e.currentTarget.style.color='#0F0F23')} onMouseLeave={e=>(e.currentTarget.style.color='#7A7A95')}>
        ← Back to Routes
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:28, alignItems:'start' }}>

        {/* ── Left: Main detail ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

          {/* Route header card */}
          <motion.div className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{padding:32}}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ background:color, color:'white', fontSize:12, fontWeight:800, padding:'4px 14px', borderRadius:999 }}>{label}</span>
                  {score>=8 && <span style={{ fontSize:13, color:'#7A7A95', fontWeight:500 }}>✓ Recommended</span>}
                </div>
                <h1 style={{ fontSize:'1.625rem', fontWeight:800, color:'#0F0F23', letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:8 }}>{r.name}</h1>
                <p style={{ fontSize:14, color:'#7A7A95', display:'flex', alignItems:'center', gap:6 }}>
                  <span>📍</span>{r.via}
                </p>
              </div>
              <ScoreRing score={score} />
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
              {[['🕐','Travel Time',r.time],['📏','Distance',r.dist||r.distance||'3.2 km'],['👥','Crowd',crowd]].map(([icon,lbl,val])=>(
                <div key={lbl as string} style={{ background:'#F7F8FC', borderRadius:14, padding:'18px 20px' }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontSize:12, color:'#7A7A95', fontWeight:500, marginBottom:4 }}>{lbl}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:'#0F0F23' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Score progress bar */}
            <div style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95' }}>Safety Score</span>
                <span style={{ fontSize:13, fontWeight:700, color }}>{score}/10 pts</span>
              </div>
              <div className="progress-bar">
                <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${score*10}%`}}
                  transition={{duration:1,delay:0.4,ease:'easeOut'}} style={{background:`linear-gradient(90deg,${color}80,${color})`}} />
              </div>
            </div>
          </motion.div>

          {/* Safety factors table */}
          <motion.div className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}} style={{padding:32}}>
            <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95', marginBottom:20 }}>Safety Factor Breakdown</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {factors.map((f,i)=>(
                <motion.div key={f.label} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.15+i*0.06}}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#F7F8FC', borderRadius:12, padding:'14px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <span style={{ fontSize:20, width:28, textAlign:'center' }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#0F0F23' }}>{f.label}</div>
                      <div style={{ fontSize:12, color:'#7A7A95', marginTop:2 }}>{f.value}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    {/* Mini bar */}
                    <div style={{ width:60, height:5, background:'#E2E4EE', borderRadius:999, overflow:'hidden' }}>
                      {f.points!==0 && (
                        <motion.div style={{ height:'100%', background:f.positive?'#00C48C':'#FF5A7A', borderRadius:999 }}
                          initial={{width:0}} animate={{width:`${Math.abs(f.points/3)*100}%`}} transition={{delay:0.3+i*0.06,duration:0.5}} />
                      )}
                    </div>
                    <span style={{
                      fontSize:13, fontWeight:800, width:36, textAlign:'right',
                      color: f.points>0?'#00A878':f.points<0?'#E04A6A':'#7A7A95',
                    }}>{f.points>0?`+${f.points}`:f.points===0?'0':f.points}</span>
                  </div>
                </motion.div>
              ))}
              {/* Base row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'2px solid #EAEDF5', paddingTop:14, marginTop:4 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#7A7A95' }}>Base Score</span>
                <span style={{ fontSize:14, fontWeight:800, color:'#6C63FF' }}>+5 pts</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right: Insight + actions ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Insight card */}
          <motion.div initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.15}}
            style={{ background:lightBg, border:`2px solid ${color}30`, borderRadius:20, padding:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                {score>=8?'🛡️':score>=5?'⚠️':'🚨'}
              </div>
              <span style={{ fontSize:15, fontWeight:700, color:'#0F0F23' }}>
                {score>=8?'Safety Insight':score>=5?'Travel Advisory':'Risk Warning'}
              </span>
            </div>
            <p style={{ fontSize:14, color:score>=8?'#00A878':score>=5?'#E5A600':'#E04A6A', lineHeight:1.6 }}>
              {score>=8
                ? 'This route has optimal lighting, high crowd density, low crime risk and nearby police. Best choice for safe travel at any time.'
                : score>=5
                ? 'Moderate safety. Share your live location with a trusted contact before traveling. Prefer daytime.'
                : 'High risk route — poor lighting, isolated, and high crime area. Avoid this route, especially at night.'}
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div className="card" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.2}} style={{padding:24}}>
            <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95', marginBottom:16 }}>Actions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-primary" style={{ width:'100%', padding:'14px 20px', fontSize:14 }}
                onClick={()=>navigate('/map')}>
                <span>🗺️</span> Show on Map
              </button>
              <button onClick={()=>navigate('/sos')} style={{
                width:'100%', padding:'13px 20px', fontSize:14, fontWeight:600, borderRadius:12, cursor:'pointer',
                background:'#FFEEF2', color:'#E04A6A', border:'1.5px solid #FF5A7A30', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
                🆘 Emergency SOS
              </button>
              <button onClick={()=>navigate(-1)} className="btn btn-ghost" style={{ width:'100%', padding:'12px 20px', fontSize:14 }}>
                ← Back to Routes
              </button>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div className="card" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.25}} style={{padding:24}}>
            <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95', marginBottom:16 }}>Route Summary</div>
            {[['⏱ Travel Time',r.time],['📏 Distance',r.dist||r.distance||'3.2 km'],['🏆 Safety Score',`${score}/10`],['🚦 Route Type',label]].map(([lbl,val])=>(
              <div key={lbl as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #EAEDF5' }}>
                <span style={{ fontSize:13, color:'#7A7A95' }}>{lbl}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#0F0F23' }}>{val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
