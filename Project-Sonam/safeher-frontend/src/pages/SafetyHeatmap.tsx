import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet'
import { HiShieldCheck, HiExclamationCircle, HiLocationMarker, HiFilter } from 'react-icons/hi'

// ── Fallback: Patna, Bihar, India ────────────────────────────────────────────
const FALLBACK_POS: [number, number] = [25.5941, 85.1376]
const FALLBACK_LABEL = 'Patna, Bihar, India'

type RiskLevel = 'all' | 'High' | 'Medium' | 'Low'

const zones = [
  { pos: [28.620, 77.210] as [number, number], radius: 380, risk: 'High'   as const, label: 'City Center Market',  reports: 14, color: '#FF5A7A', detail: 'Multiple harassment incidents'   },
  { pos: [28.630, 77.195] as [number, number], radius: 260, risk: 'Medium' as const, label: 'Old Bus Stand',       reports: 8,  color: '#FFB800', detail: 'Poor lighting after 9 PM'        },
  { pos: [28.610, 77.224] as [number, number], radius: 290, risk: 'Medium' as const, label: 'Sector 7 Lane B',     reports: 6,  color: '#FFB800', detail: 'Broken street lights'            },
  { pos: [28.640, 77.215] as [number, number], radius: 210, risk: 'Low'    as const, label: 'MG Road Police Post', reports: 1,  color: '#00C48C', detail: 'Active police patrolling'        },
  { pos: [28.600, 77.200] as [number, number], radius: 230, risk: 'High'   as const, label: 'Riverside Path',      reports: 11, color: '#FF5A7A', detail: 'Isolated at night — avoid'      },
  { pos: [28.625, 77.180] as [number, number], radius: 190, risk: 'Low'    as const, label: 'Civil Hospital Area', reports: 0,  color: '#00C48C', detail: 'Well-lit, high footfall'         },
  { pos: [28.614, 77.235] as [number, number], radius: 170, risk: 'Medium' as const, label: 'Park Street Junction',reports: 5,  color: '#FFB800', detail: 'Moderate risk in evenings'       },
]

const filterOptions: { key: RiskLevel; label: string; color: string; bg: string }[] = [
  { key: 'all',    label: 'All Zones', color: '#7A7A95', bg: '#F4F6FB' },
  { key: 'High',   label: 'High Risk', color: '#FF5A7A', bg: '#FFF0F3' },
  { key: 'Medium', label: 'Moderate',  color: '#FFB800', bg: '#FFF8E6' },
  { key: 'Low',    label: 'Safe',      color: '#00C48C', bg: '#EDFBF6' },
]

const riskIcon = { High: '🔴', Medium: '🟡', Low: '🟢' }

// ── Moves the map view whenever center changes ───────────────────────────────
function MapViewUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevKey = useRef(`${center[0]},${center[1]}`)
  useEffect(() => {
    const key = `${center[0]},${center[1]}`
    if (key !== prevKey.current) {
      console.log('[SafetyHeatmap] MapViewUpdater: centering map →', center)
      map.setView(center, map.getZoom(), { animate: true })
      prevKey.current = key
    }
  }, [center[0], center[1]])
  return null
}

export default function SafetyHeatmap() {
  const [filter, setFilter] = useState<RiskLevel>('all')
  const [userPos, setUserPos] = useState<[number, number]>(FALLBACK_POS)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [geoDone, setGeoDone] = useState(false)
  const [locLabel, setLocLabel] = useState<string>('Detecting location...')

  // Reverse geocode coordinates to a human-readable label
  const reverseGeo = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const addr = data?.address
      if (addr) {
        const parts = [addr.city || addr.town || addr.county, addr.state].filter(Boolean)
        if (parts.length) {
          setLocLabel(parts.join(', '))
          return
        }
      }
      setLocLabel(`${lat.toFixed(1)}°N · ${lng.toFixed(1)}°E`)
    } catch {
      setLocLabel(`${lat.toFixed(1)}°N · ${lng.toFixed(1)}°E`)
    }
  }

  // On mount: one-shot geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('[SafetyHeatmap] Geolocation API not available — using fallback', FALLBACK_POS)
      setGeoError('Geolocation is not supported by your browser')
      reverseGeo(FALLBACK_POS[0], FALLBACK_POS[1])
      setGeoDone(true)
      return
    }

    console.log('[SafetyHeatmap] Requesting initial position...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        console.log('[SafetyHeatmap] Got position:', loc)
        setUserPos(loc)
        setGeoError(null)
        setGeoDone(true)
        // Show coordinates immediately, then reverse-geocode for a human label
        setLocLabel(`${loc[0].toFixed(1)}°N · ${loc[1].toFixed(1)}°E`)
        reverseGeo(loc[0], loc[1])
      },
      (err) => {
        console.warn('[SafetyHeatmap] Position error:', err.code, err.message)
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Location permission denied. Please enable location access.'
          : err.code === err.TIMEOUT
          ? 'Location request timed out.'
          : 'GPS unavailable. Using fallback location.'
        setGeoError(msg)
        setUserPos(FALLBACK_POS)
        setGeoDone(true)
        reverseGeo(FALLBACK_POS[0], FALLBACK_POS[1])
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  const displayed = filter === 'all' ? zones : zones.filter(z => z.risk === filter)
  const counts = {
    High:         zones.filter(z => z.risk === 'High').length,
    Medium:       zones.filter(z => z.risk === 'Medium').length,
    Low:          zones.filter(z => z.risk === 'Low').length,
    total:        zones.length,
    totalReports: zones.reduce((s, z) => s + z.reports, 0),
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Left sidebar panel ── */}
      <div style={{
        width: 340, flexShrink: 0, background: 'white', borderRight: '1.5px solid #EAEDF5',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(15,15,35,0.04)',
      }}>

        {/* Header */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1.5px solid #EAEDF5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5A7A' }} className="animate-blink" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>Live</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
            Safety Heatmap
          </h1>
          <p style={{ fontSize: 13, color: '#7A7A95' }}>{counts.totalReports} reports · {counts.total} zones tracked</p>
        </div>

        {/* Stats row */}
        <div style={{ padding: '16px 24px', borderBottom: '1.5px solid #EAEDF5', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'High Risk', count: counts.High,   color: '#FF5A7A', bg: '#FFF0F3', icon: '🔴' },
            { label: 'Moderate',  count: counts.Medium, color: '#FFB800', bg: '#FFF8E6', icon: '🟡' },
            { label: 'Safe',      count: counts.Low,    color: '#00C48C', bg: '#EDFBF6', icon: '🟢' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{s.icon}</span>
              <p style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 24px', borderBottom: '1.5px solid #EAEDF5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <HiFilter style={{ color: '#7A7A95', fontSize: 14 }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>Filter Zones</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {filterOptions.map(f => (
              <motion.button key={f.key} whileTap={{ scale: 0.94 }} onClick={() => setFilter(f.key)} style={{
                flex: 1, padding: '8px 8px', borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                background: filter === f.key ? f.color : f.bg,
                color: filter === f.key ? 'white' : f.color,
                boxShadow: filter === f.key ? `0 4px 12px ${f.color}35` : 'none',
              }}>
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Zone list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }} className="no-scrollbar">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 12 }}>
            {filter === 'all' ? 'All Zones' : `${filter} Risk Zones`} ({displayed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayed.map((zone, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 14px', background: '#F7F8FC', borderRadius: 12,
                  border: '1.5px solid #EAEDF5', borderLeft: `4px solid ${zone.color}`,
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F0F23', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{zone.label}</p>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                      background: zone.color + '20', color: zone.color, flexShrink: 0, marginLeft: 8,
                    }}>{zone.risk}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#7A7A95', lineHeight: 1.4, marginBottom: 6 }}>{zone.detail}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 11, color: zone.color, fontWeight: 600 }}>{riskIcon[zone.risk]}</span>
                    <span style={{ fontSize: 11, color: '#7A7A95' }}>{zone.reports} report{zone.reports !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer tip */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1.5px solid #EAEDF5' }}>
          <div style={{
            background: '#F0EEFF', border: '1.5px solid rgba(108,99,255,0.15)',
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <HiShieldCheck style={{ color: '#6C63FF', fontSize: 16, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: '#6C63FF', lineHeight: 1.5 }}>
              Tap any circle on the map for details. Avoid red zones especially after dark.
            </p>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Map overlay header */}
        <div style={{
          position: 'absolute', top: 20, left: 20, right: 20, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none',
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: '10px 16px',
            boxShadow: '0 4px 16px rgba(15,15,35,0.10)', border: '1.5px solid #EAEDF5',
            display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto',
          }}>
            <HiLocationMarker style={{ color: '#6C63FF', fontSize: 18 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0F0F23' }}>{locLabel}</p>
              <p style={{ fontSize: 11, color: '#7A7A95' }}>{userPos[0].toFixed(1)}°N · {userPos[1].toFixed(1)}°E</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
            {[
              { color: '#FF5A7A', label: 'High Risk' },
              { color: '#FFB800', label: 'Moderate'  },
              { color: '#00C48C', label: 'Safe'       },
            ].map(l => (
              <div key={l.label} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                background: 'white', borderRadius: 10, fontSize: 12, fontWeight: 600,
                boxShadow: '0 2px 8px rgba(15,15,35,0.08)', border: '1.5px solid #EAEDF5',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                <span style={{ color: '#7A7A95' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geolocation error banner */}
        {geoError && (
          <div style={{
            position: 'absolute', top: 76, left: 20, right: 20, zIndex: 1000,
            background: '#FFF0F3', border: '1.5px solid rgba(255,90,122,0.25)',
            borderRadius: 12, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(15,15,35,0.10)',
            pointerEvents: 'auto',
          }}>
            <HiExclamationCircle style={{ color: '#E04A6A', fontSize: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#E04A6A', fontWeight: 500 }}>{geoError}</span>
          </div>
        )}

        <MapContainer
          center={userPos}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapViewUpdater center={userPos} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          />
          {displayed.map((zone, i) => (
            <Circle key={i} center={zone.pos} radius={zone.radius}
              pathOptions={{
                color: zone.color, fillColor: zone.color,
                fillOpacity: 0.22, weight: 2.5,
              }}>
              <Popup>
                <div style={{ textAlign: 'center', padding: '6px 4px', minWidth: 160 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#0F0F23', marginBottom: 4 }}>{zone.label}</p>
                  <p style={{ fontSize: 12, color: '#7A7A95', marginBottom: 8 }}>{zone.detail}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: zone.color, color: 'white',
                    }}>
                      {zone.risk} Risk
                    </span>
                    <span style={{ fontSize: 11, color: '#7A7A95' }}>{zone.reports} reports</span>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
