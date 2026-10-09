import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from './context'
import type { CaseStatus } from './types'
import { statusLabel } from './data'

export function Logo() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="12" fill="#fff7f0" />
      <path d="M12 44c12-3 18-20 20-32 7 16 12 26 22 32" fill="none" stroke="#e37a2b" strokeWidth="5.5" strokeLinecap="round" />
      <text x="32" y="48" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" fill="#16344a">
        N
      </text>
    </svg>
  )
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <span className={`badge ${status}`}>{statusLabel[status]}</span>
}

export function Header() {
  const { session, theme, setTheme, fontScale, setFontScale, logout } = useApp()
  const loc = useLocation()
  const nav = useNavigate()
  const role = session?.role

  const links =
    role === 'worker'
      ? [
          ['/worker', 'Dashboard'],
          ['/worker/assignments/vanaz', 'Assignments'],
          ['/worker/history', 'Repair history'],
        ]
      : role === 'admin'
        ? [
            ['/admin', 'Dashboard'],
            ['/admin/feedback', 'Asset feedback'],
            ['/admin/regions', 'Regions & PINs'],
          ]
        : [
            ['/', 'Dashboard'],
            ['/complaints/new', 'File complaint'],
            ['/status', 'Complaint status'],
          ]

  const accountLabel = role === 'worker' ? 'Worker account' : role === 'admin' ? 'Administrator account' : role === 'citizen' ? 'Citizen account' : 'Login'
  const accountTo = role === 'worker' ? '/worker' : role === 'admin' ? '/admin' : role === 'citizen' ? '/citizen' : '/login'

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>Pune, Maharashtra · Citizen services</span>
          <span>Editable prototype · Sample data · Controls are illustrative</span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <NavLink to={role === 'worker' ? '/worker' : role === 'admin' ? '/admin' : '/'} className="brand">
            <Logo />
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.4, color: 'var(--accent)', fontWeight: 800 }}>NetEnter</div>
              <div className="brand-name">
                RoNetEnter Municipal
                <br />
                Corporation
              </div>
            </div>
          </NavLink>
          <nav className="nav">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive || (to === '/' && loc.pathname === '/') ? 'active' : '')} end={to === '/' || to === '/worker' || to === '/admin'}>
                {label}
              </NavLink>
            ))}
            <div className="nav-tools">
              <button className="nav-btn" type="button" onClick={() => setFontScale(Math.max(14, fontScale - 1))} aria-label="Decrease font size">
                A−
              </button>
              <button className="nav-btn" type="button" onClick={() => setFontScale(Math.min(20, fontScale + 1))} aria-label="Increase font size">
                A+
              </button>
              <button className="nav-btn" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                ✦ Light / Dark
              </button>
              {session ? (
                <>
                  <NavLink to={accountTo} className="account-chip">
                    {accountLabel}
                  </NavLink>
                  <button
                    className="nav-btn"
                    type="button"
                    onClick={() => {
                      logout()
                      nav('/')
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="account-chip">
                  Login
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <h3>Contact the corporation</h3>
            <div>RoNetEnter@gmail.com</div>
            <div className="muted tiny">citizens@RoNetEnter.gov.in · Demo email</div>
          </div>
          <div>
            <h3>Demo toll-free contacts</h3>
            <div>1800-000-0141 / 1800-000-0142</div>
            <div className="muted tiny">Placeholders only · Not emergency helplines</div>
          </div>
          <div>
            <h3>Social channels · Demo links</h3>
            <div className="socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <Icon name="ig" />
                Instagram
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <Icon name="x" />
                Twitter
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <Icon name="fb" />
                Facebook
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                <Icon name="yt" />
                YouTube
              </a>
            </div>
          </div>
        </div>
        <div className="legal">
          Prototype placeholders: Ownership — [entity] · Created & managed by — [team] · License — [to be specified]. No verified
          government affiliation.
        </div>
      </div>
    </footer>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="page">{children}</main>
      <Footer />
    </div>
  )
}

export function Icon({ name }: { name: 'ig' | 'x' | 'fb' | 'yt' | 'user' | 'shield' | 'pin' | 'search' | 'plus' }) {
  const common = { width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7 }
  if (name === 'ig')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    )
  if (name === 'x')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    )
  if (name === 'fb')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
      </svg>
    )
  if (name === 'yt')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M11 10l5 2-5 2v-4z" fill="currentColor" stroke="none" />
      </svg>
    )
  if (name === 'user')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19c1.5-3.2 4-4.8 7-4.8S17.5 15.8 19 19" />
      </svg>
    )
  if (name === 'shield')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z" />
      </svg>
    )
  if (name === 'pin')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    )
  if (name === 'search')
    return (
      <svg {...common} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l5 5" />
      </svg>
    )
  return (
    <svg {...common} viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function Captcha({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="captcha">
      <label>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>
          I'm not a robot
          <div className="hint">Illustrative CAPTCHA · No security integration</div>
        </span>
      </label>
      <Icon name="shield" />
    </div>
  )
}

export function SideNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="stack">
      <div className="icon-circle">
        <Icon name="user" />
      </div>
      <h2 className="serif" style={{ margin: 0 }}>
        {title}
      </h2>
      <p className="muted">{children}</p>
      <div className="callout">
        <strong>Static account prototype</strong>
        <div className="tiny muted">Authentication, verification and account controls are visual examples only. No real credentials are shown.</div>
      </div>
    </aside>
  )
}

export function AuthNote() {
  return (
    <aside className="stack">
      <div className="icon-circle">
        <Icon name="shield" />
      </div>
      <h2 className="serif" style={{ margin: 0 }}>
        Authorized municipal access
      </h2>
      <p className="muted">
        Staff access uses an authorized email ending in xyz.ronetenter.org. This is a prototype authorization convention, not a
        verified domain.
      </p>
      <div className="callout">
        <strong>Static account prototype</strong>
        <div className="tiny muted">Authentication, verification and account controls are visual examples only. No real credentials are shown.</div>
      </div>
    </aside>
  )
}
