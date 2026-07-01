import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

// ── Fallback: Patna, Bihar, India ────────────────────────────────────────────
const FALLBACK_POS: [number, number] = [25.5941, 85.1376]
const FALLBACK_LABEL = 'Patna, Bihar, India'

const routeA: [number,number][] = [[28.6139,77.209],[28.619,77.213],[28.626,77.219],[28.634,77.224],[28.641,77.228]]
const routeB: [number,number][] = [[28.6139,77.209],[28.617,77.201],[28.625,77.195],[28.633,77.190],[28.641,77.186]]
const routeC: [number,number][] = [[28.6139,77.209],[28.607,77.216],[28.600,77.222],[28.594,77.228],[28.588,77.234]]

const makeIcon = (html: string) => L.divIcon({ html, className:'', iconSize:[0,0] })
const userIcon = makeIcon(`<div style="background:#6C63FF;color:white;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;box-shadow:0 3px 12px rgba(108,99,255,0.35);white-space:nowrap;border:2px solid rgba(255,255,255,0.5)">📍 You</div>`)
const endIcon  = makeIcon(`<div style="background:#FF5A7A;color:white;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;box-shadow:0 3px 12px rgba(255,90,122,0.35);white-space:nowrap;border:2px solid rgba(255,255,255,0.5)">🏁 Destination</div>`)

const ROUTES = [
  { id:'A', label:'Route A – Main Road',   score:9, time:'15 min', dist:'3.2 km', color:'#00C48C', type:'Safe',   coords:routeA, dashed:false },
  { id:'B', label:'Route B – City Bypass', score:6, time:'11 min', dist:'2.6 km', color:'#FFB800', type:'Medium', coords:routeB, dashed:true  },
  { id:'C', label:'Route C – Short Cut',   score:3, time:'8 min',  dist:'1.8 km', color:'#FF5A7A', type:'Risky',  coords:routeC, dashed:true  },
]

function getGeoErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission denied. Please enable location access.'
    case err.TIMEOUT:
      return 'Location request timed out. Please try again.'
    case err.POSITION_UNAVAILABLE:
      return 'GPS unavailable. Using fallback location.'
    default:
      return 'An unknown error occurred while getting location.'
  }
}

// ── Moves the map view whenever center changes ───────────────────────────────
function MapViewUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevKey = useRef(`${center[0]},${center[1]}`)
  useEffect(() => {
    const key = `${center[0]},${center[1]}`
    if (key !== prevKey.current) {
      console.log('[MapScreen] MapViewUpdater: centering map →', center)
      map.setView(center, map.getZoom(), { animate: true })
      prevKey.current = key
    }
  }, [center[0], center[1]])
  return null
}

// ── Watches the user's position continuously ─────────────────────────────────
function LocationWatcher({ enabled, onPosition, onError }: {
  enabled: boolean
  onPosition: (pos: [number, number]) => void
  onError: (msg: string) => void
}) {
  const watchRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation && enabled) {
        onError('Geolocation is not supported by your browser')
      }
      return
    }

    console.log('[MapScreen] LocationWatcher: starting watchPosition...')

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        console.log('[MapScreen] watchPosition update:', loc, 'accuracy:', pos.coords.accuracy, 'm')
        onPosition(loc)
      },
      (err) => {
        console.warn('[MapScreen] watchPosition error:', err.code, err.message)
        onError(getGeoErrorMessage(err))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )

    return () => {
      if (watchRef.current !== null) {
        console.log('[MapScreen] LocationWatcher: clearing watch...')
        navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
      }
    }
  }, [enabled])

  return null
}

export default function MapScreen() {
  const navigate   = useNavigate()
  const [active, setActive]     = useState<string|null>(null)
  const [tracking, setTracking] = useState(false)
  const [userPos, setUserPos]   = useState<[number, number]>(FALLBACK_POS)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [geoResolved, setGeoResolved] = useState(false)

  // On mount: one-shot geolocation to get initial position
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('[MapScreen] Geolocation API not available — using fallback', FALLBACK_POS)
      setGeoError('Geolocation is not supported by your browser')
      setGeoResolved(true)
      return
    }

    console.log('[MapScreen] Requesting initial position (one-shot)...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        console.log('[MapScreen] Initial position obtained:', loc, 'accuracy:', pos.coords.accuracy, 'm')
        setUserPos(loc)
        setGeoError(null)
        setGeoResolved(true)
      },
      (err) => {
        console.warn('[MapScreen] Initial position failed:', err.code, err.message)
        setGeoError(getGeoErrorMessage(err))
        setUserPos(FALLBACK_POS)
        setGeoResolved(true)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  const retryGeo = () => {
    console.log('[MapScreen] Retrying geolocation...')
    setGeoError(null)
    setGeoResolved(false)

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      setUserPos(FALLBACK_POS)
      setGeoResolved(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        console.log('[MapScreen] Retry succeeded:', loc)
        setUserPos(loc)
        setGeoError(null)
        setGeoResolved(true)
        setTracking(true)
      },
      (err) => {
        console.warn('[MapScreen] Retry failed:', err.code, err.message)
        setGeoError(getGeoErrorMessage(err))
        setUserPos(FALLBACK_POS)
        setGeoResolved(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* ── Map fills the rest ── */}
      <div style={{ flex:1, position:'relative' }}>
        {/* Top bar */}
        <div style={{ position:'absolute', top:20, left:20, right:20, zIndex:1000, display:'flex', gap:12, alignItems:'center' }}>
          <button onClick={()=>navigate(-1)} style={{
            background:'white', border:'1.5px solid #E2E4EE', borderRadius:12, padding:'10px 14px',
            display:'flex', alignItems:'center', gap:6, fontSize:14, fontWeight:600, color:'#0F0F23',
            cursor:'pointer', boxShadow:'0 2px 10px rgba(15,15,35,0.08)', whiteSpace:'nowrap',
          }}>← Back</button>

          <div style={{ flex:1, background:'white', border:'1.5px solid #E2E4EE', borderRadius:12, padding:'12px 18px', boxShadow:'0 2px 10px rgba(15,15,35,0.08)' }}>
            <div style={{ fontSize:11, color:'#7A7A95', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Route Comparison</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#0F0F23', marginTop:2 }}>Showing 3 routes — click a route to highlight</div>
          </div>

          <motion.button whileTap={{scale:0.95}} onClick={()=>setTracking(!tracking)} style={{
            background: tracking?'#00C48C':'white',
            color: tracking?'white':'#7A7A95',
            border:'1.5px solid #E2E4EE', borderRadius:12, padding:'10px 18px',
            fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8,
            boxShadow:'0 2px 10px rgba(15,15,35,0.08)', transition:'all 0.2s',
          }}>
            {tracking && <span style={{ width:7, height:7, borderRadius:'50%', background:'white', display:'inline-block' }} className="animate-blink" />}
            {tracking ? '🔴 Live' : '📡 Track Live'}
          </motion.button>
        </div>

        {/* Geolocation error banner with retry button */}
        {geoError && (
          <div style={{
            position:'absolute', top:80, left:20, right:20, zIndex:1000,
            background:'#FFF0F3', border:'1.5px solid rgba(255,90,122,0.25)',
            borderRadius:12, padding:'12px 18px',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
            boxShadow:'0 4px 16px rgba(15,15,35,0.10)',
          }}>
            <span style={{ fontSize:13, color:'#E04A6A', fontWeight:500, flex:1 }}>
              {geoError}
            </span>
            <button onClick={retryGeo} style={{
              padding:'7px 16px', borderRadius:10, border:'none',
              background:'#E04A6A', color:'white', fontWeight:700, fontSize:12,
              cursor:'pointer', whiteSpace:'nowrap',
            }}>
              Retry
            </button>
          </div>
        )}

        <MapContainer center={userPos} zoom={13} style={{ height:'100%', width:'100%' }} zoomControl={false}>
          <MapViewUpdater center={userPos} />
          <LocationWatcher
            enabled={tracking}
            onPosition={(pos) => { setUserPos(pos); setGeoError(null) }}
            onError={(msg) => setGeoError(msg)}
          />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <Marker position={userPos} icon={userIcon} />
          <Circle center={userPos} radius={140} pathOptions={{color:'#6C63FF',fillColor:'#6C63FF',fillOpacity:0.12,weight:2}} />
          <Marker position={[28.641,77.228]} icon={endIcon} />
          {ROUTES.map(r => {
            const isActive = active===null || active===r.id
            return (
              <Polyline key={r.id} positions={r.coords} color={r.color}
                weight={isActive?7:3} opacity={isActive?0.9:0.3}
                dashArray={r.dashed?'10,7':undefined}
                eventHandlers={{click:()=>setActive(active===r.id?null:r.id)}}>
                <Popup><div style={{textAlign:'center',padding:'4px 2px'}}><b style={{fontSize:14}}>{r.label}</b><br/><span style={{fontSize:12,color:'#7A7A95'}}>Score: {r.score}/10 · {r.time}</span></div></Popup>
              </Polyline>
            )
          })}
        </MapContainer>
      </div>

      {/* ── Right sidebar panel ── */}
      <div style={{
        width:320, flexShrink:0, background:'white', borderLeft:'1px solid #EAEDF5',
        display:'flex', flexDirection:'column', overflow:'hidden',
        boxShadow:'-4px 0 20px rgba(15,15,35,0.06)',
      }}>
        {/* Header */}
        <div style={{ padding:'24px 24px 20px', borderBottom:'1px solid #EAEDF5' }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A7A95', marginBottom:6 }}>Route Panel</div>
          <h2 style={{ fontSize:18, fontWeight:700, color:'#0F0F23', lineHeight:1.3 }}>Compare All Routes</h2>
          {/* Legend */}
          <div style={{ display:'flex', gap:16, marginTop:12 }}>
            {ROUTES.map(r=>(
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#7A7A95' }}>
                <div style={{ width:18, height:5, borderRadius:999, background:r.color }} />
                {r.type}
              </div>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #EAEDF5', display:'flex', gap:8 }}>
          <button onClick={()=>setActive(null)} style={{
            padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s', border:'2px solid transparent',
            background: active===null?'#0F0F23':'#F7F8FC', color: active===null?'white':'#7A7A95',
          }}>All</button>
          {ROUTES.map(r=>(
            <button key={r.id} onClick={()=>setActive(active===r.id?null:r.id)} style={{
              padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
              background: active===r.id ? r.color : `${r.color}20`,
              color: active===r.id ? 'white' : r.color,
              border: `2px solid ${active===r.id ? r.color : 'transparent'}`,
            }}>Route {r.id}</button>
          ))}
        </div>

        {/* Route cards */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
          {ROUTES.map((r,i)=>(
            <motion.div key={r.id} whileHover={{y:-2}} onClick={()=>setActive(active===r.id?null:r.id)}
              style={{
                background: active===r.id ? `${r.color}12` : '#F7F8FC',
                border:`2px solid ${active===r.id?r.color:'transparent'}`,
                borderRadius:16, padding:18, cursor:'pointer', transition:'all 0.15s',
              }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#7A7A95' }}>Route {r.id}</span>
                    {i===0 && <span style={{ background:'#00C48C', color:'white', fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:999 }}>BEST</span>}
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#0F0F23' }}>{r.type} Route</div>
                </div>
                <div style={{
                  width:52, height:52, borderRadius:14,
                  background:`linear-gradient(135deg,${r.color},${r.color}CC)`,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 4px 14px ${r.color}40`,
                }}>
                  <span style={{ fontSize:20, fontWeight:900, color:'white', lineHeight:1 }}>{r.score}</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>/10</span>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['⏱ Time',r.time],['📏 Distance',r.dist]].map(([lbl,val])=>(
                  <div key={lbl as string} style={{ background:'white', borderRadius:10, padding:'8px 12px' }}>
                    <div style={{ fontSize:11, color:'#7A7A95' }}>{lbl}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0F0F23', marginTop:2 }}>{val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid #EAEDF5', display:'flex', flexDirection:'column', gap:10 }}>
          <button className="btn btn-primary" style={{ width:'100%', padding:'13px 20px', fontSize:14 }}
            onClick={()=>navigate('/route-details')}>View Route Details</button>
          <button onClick={()=>navigate('/sos')} style={{
            width:'100%', padding:'12px 20px', fontSize:14, fontWeight:600, borderRadius:12, cursor:'pointer',
            background:'#FFEEF2', color:'#E04A6A', border:'1.5px solid rgba(255,90,122,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>🆘 Emergency SOS</button>
        </div>
      </div>
    </div>
  )
}
