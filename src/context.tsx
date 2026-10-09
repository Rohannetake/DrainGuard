import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { complaintsSeed, regionsSeed } from './data'
import type { Complaint, Region, Role, Session } from './types'

type Theme = 'light' | 'dark'

type AppState = {
  theme: Theme
  fontScale: number
  session: Session | null
  complaints: Complaint[]
  regions: Region[]
  extraAttention: string[]
  duty: 'on' | 'off'
  sharing: boolean
  coverIdDraft: string
  materialsTaken: boolean
  workCompleted: boolean
  assignmentAccepted: boolean
  completionSubmitted: boolean
  setTheme: (t: Theme) => void
  setFontScale: (n: number) => void
  login: (session: Session) => void
  logout: () => void
  addComplaint: (c: Complaint) => void
  updateComplaint: (id: string, patch: Partial<Complaint>) => void
  addRegion: (r: Region) => void
  setRegionPin: (id: string, pin: string) => void
  markExtraAttention: (assetId: string) => void
  setDuty: (d: 'on' | 'off') => void
  setSharing: (v: boolean) => void
  setCoverIdDraft: (v: string) => void
  setMaterialsTaken: (v: boolean) => void
  setWorkCompleted: (v: boolean) => void
  setAssignmentAccepted: (v: boolean) => void
  setCompletionSubmitted: (v: boolean) => void
}

const AppCtx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('rne-theme') as Theme) || 'light')
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('rne-font') || 16))
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem('rne-session')
    return raw ? (JSON.parse(raw) as Session) : null
  })
  const [complaints, setComplaints] = useState<Complaint[]>(complaintsSeed)
  const [regions, setRegions] = useState<Region[]>(regionsSeed)
  const [extraAttention, setExtra] = useState<string[]>([])
  const [duty, setDuty] = useState<'on' | 'off'>('on')
  const [sharing, setSharing] = useState(false)
  const [coverIdDraft, setCoverIdDraft] = useState('')
  const [materialsTaken, setMaterialsTaken] = useState(false)
  const [workCompleted, setWorkCompleted] = useState(false)
  const [assignmentAccepted, setAssignmentAccepted] = useState(true)
  const [completionSubmitted, setCompletionSubmitted] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rne-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}px`
    localStorage.setItem('rne-font', String(fontScale))
  }, [fontScale])

  const value = useMemo<AppState>(
    () => ({
      theme,
      fontScale,
      session,
      complaints,
      regions,
      extraAttention,
      duty,
      sharing,
      coverIdDraft,
      materialsTaken,
      workCompleted,
      assignmentAccepted,
      completionSubmitted,
      setTheme,
      setFontScale,
      login: (s) => {
        setSession(s)
        localStorage.setItem('rne-session', JSON.stringify(s))
      },
      logout: () => {
        setSession(null)
        localStorage.removeItem('rne-session')
      },
      addComplaint: (c) => setComplaints((prev) => [c, ...prev]),
      updateComplaint: (id, patch) =>
        setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      addRegion: (r) => setRegions((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r])),
      setRegionPin: (id, pin) => setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, pin } : r))),
      markExtraAttention: (assetId) => setExtra((prev) => (prev.includes(assetId) ? prev : [...prev, assetId])),
      setDuty,
      setSharing,
      setCoverIdDraft,
      setMaterialsTaken,
      setWorkCompleted,
      setAssignmentAccepted,
      setCompletionSubmitted,
    }),
    [
      theme,
      fontScale,
      session,
      complaints,
      regions,
      extraAttention,
      duty,
      sharing,
      coverIdDraft,
      materialsTaken,
      workCompleted,
      assignmentAccepted,
      completionSubmitted,
    ],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function requireRole(session: Session | null, role: Role) {
  return session?.role === role
}
