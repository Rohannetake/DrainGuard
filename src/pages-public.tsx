import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthNote, Captcha, Icon, SideNote, StatusBadge } from './components'
import { useApp } from './context'
import { MUNICIPAL_DOMAIN, SNAPSHOT, hazardLabel, satisfactionLabel } from './data'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import type { CaseStatus, Role, Session } from './types'

export function PublicDashboard() {
  const { complaints } = useApp()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'all' | 'solved' | 'unsolved'>('all')
  const [day, setDay] = useState('Friday')
  const [date, setDate] = useState('09 / 10 / 2026')
  const [month, setMonth] = useState('October')
  const [year, setYear] = useState('2026')
  const [applied, setApplied] = useState(false)

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (status === 'solved' && c.status !== 'solved') return false
      if (status === 'unsolved' && c.status === 'solved') return false
      if (!applied) return true
      if (year && !c.reportedOn.includes(year)) return false
      if (month === 'October' && !c.reportedOn.includes('Oct')) return false
      return true
    })
  }, [complaints, status, applied, year, month])

  const unresolved = filtered.filter((c) => c.status !== 'solved' && c.status !== 'rejected')
  const solved = filtered.filter((c) => c.status === 'solved')

  return (
    <>
      <p className="kicker">Public dashboard · Pune</p>
      <div className="space" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1>Pune complaint dashboard</h1>
          <p className="lede">Report road and drain hazards, or follow the status of a complaint.</p>
        </div>
        <div className="dash-actions">
          <Link className="ghost" to="/status">
            <Icon name="search" /> View complaint status
          </Link>
          <Link className="btn" to="/complaints/new">
            <Icon name="plus" /> Register a complaint
          </Link>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <button className="ghost" type="button" onClick={() => setOpen((v) => !v)}>
          Filters ▾
        </button>
        {open && (
          <div className="card pad filter-pop">
            <div className="filter-grid">
              <div>
                <div className="label">Case status</div>
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                  <option value="all">All · Solved / Unsolved</option>
                  <option value="unsolved">Unsolved</option>
                  <option value="solved">Solved</option>
                </select>
              </div>
              <div>
                <div className="label">Specific day</div>
                <select value={day} onChange={(e) => setDay(e.target.value)}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Date</div>
                <select value={date} onChange={(e) => setDate(e.target.value)}>
                  <option>09 / 10 / 2026</option>
                  <option>08 / 10 / 2026</option>
                  <option>06 / 10 / 2026</option>
                  <option>04 / 10 / 2026</option>
                  <option>02 / 10 / 2026</option>
                  <option>01 / 10 / 2026</option>
                </select>
              </div>
              <div>
                <div className="label">Month</div>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Year</div>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
            </div>
            <div className="row" style={{ marginTop: '1rem' }}>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setStatus('all')
                  setApplied(false)
                }}
              >
                Reset
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setApplied(true)
                  setOpen(false)
                }}
              >
                Apply filters
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="tiny muted">
        Sample snapshot · {SNAPSHOT} · Pune only. Counts, incidents and repairs are illustrative, not municipal records.
        <span className="demo-pill" style={{ float: 'right' }}>
          Demo data
        </span>
      </p>

      <div className="grid-equal" style={{ marginTop: '1rem' }}>
        <section className="card pad">
          <div className="space">
            <div>
              <h2 style={{ margin: 0 }}>Active unresolved complaints</h2>
              <p className="tiny muted">Submitted, pending and in progress</p>
            </div>
            <div className="stat">{String(unresolved.length).padStart(2, '0')}</div>
          </div>
          {unresolved.map((c) => (
            <div className="list-row" key={c.id}>
              <div>
                <strong>
                  {hazardLabel[c.hazard]} · {c.locality}
                  {c.pin ? ` · ${c.pin}` : ''}
                </strong>
                <div className="tiny muted">
                  {c.id} · {c.reportedOn}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
          <Link className="linkish" to="/status">
            View unresolved cases →
          </Link>
        </section>
        <section className="card pad">
          <div className="space">
            <div>
              <h2 style={{ margin: 0 }}>Solved cases</h2>
              <p className="tiny muted">Resolution and satisfaction are separate</p>
            </div>
            <div className="stat" style={{ color: 'var(--ok)' }}>
              {String(solved.length).padStart(2, '0')}
            </div>
          </div>
          {solved.map((c) => (
            <div className="list-row" key={c.id}>
              <div>
                <strong>
                  {hazardLabel[c.hazard]} · {c.locality}
                  {c.pin ? ` · ${c.pin}` : ''}
                </strong>
                <div className="tiny muted">
                  {c.id} · {c.reportedOn}
                </div>
                <div className="tiny muted">Citizen: {satisfactionLabel[c.satisfaction].toLowerCase()}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
          <Link className="linkish" to="/status">
            View solved cases →
          </Link>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Share your feedback</h2>
          <p className="muted">Tell us about your experience with citizen services.</p>
          <Link className="ghost" to="/feedback">
            Submit feedback
          </Link>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Problem still unresolved?</h2>
          <p className="muted">Lodge a complaint against the municipality about an unresolved case.</p>
          <Link className="ghost" to="/escalation">
            Lodge an escalation
          </Link>
        </section>
      </div>
    </>
  )
}

export function LoginPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const initial = (params.get('role') as Role) || 'citizen'
  const [role, setRole] = useState<Role>(initial)
  const [contact, setContact] = useState(role === 'citizen' ? '' : role === 'worker' ? 'name@xyz.ronetenter.org' : 'officer@xyz.ronetenter.org')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchRole(next: Role) {
    setRole(next)
    setError('')
    setContact(next === 'citizen' ? '' : next === 'worker' ? 'name@xyz.ronetenter.org' : 'officer@xyz.ronetenter.org')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!captcha) return setError('Complete the illustrative CAPTCHA to continue.')
    if (!contact || !password) return setError('Enter your credentials to continue.')
    if (role !== 'citizen' && !contact.toLowerCase().endsWith(`@${MUNICIPAL_DOMAIN}`)) {
      return setError(`Authorized staff email must end in ${MUNICIPAL_DOMAIN}.`)
    }

    if (isSupabaseConfigured) {
      setLoading(true)
      try {
        const isEmail = contact.includes('@')
        if (!isEmail) {
          setLoading(false)
          return setError('Supabase authentication requires a valid email address.')
        }

        const { data, error: supaError } = await supabase.auth.signInWithPassword({
          email: contact.trim(),
          password,
        })

        if (supaError) {
          setLoading(false)
          return setError(supaError.message)
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, display_name, contact')
            .eq('id', data.user.id)
            .maybeSingle()

          const actualRole: Role = profile?.role || 'citizen'

          if (role === 'admin' && actualRole !== 'admin') {
            setLoading(false)
            return setError('This account does not have administrator privileges.')
          }

          if (role === 'worker' && actualRole !== 'worker' && actualRole !== 'admin') {
            setLoading(false)
            return setError('This account does not have municipal worker privileges.')
          }

          const userSession: Session = {
            id: data.user.id,
            role: actualRole,
            name: profile?.display_name || data.user.email?.split('@')[0] || (role === 'worker' ? 'Worker' : role === 'admin' ? 'Admin' : 'Citizen'),
            contact: data.user.email || contact,
          }

          login(userSession)

          if (role === 'admin') {
            sessionStorage.setItem('rne-admin-pending', JSON.stringify({ contact: userSession.contact, name: userSession.name }))
            nav('/login/admin-otp')
          } else {
            nav(role === 'worker' ? '/worker' : '/citizen')
          }
        }
      } catch (err: any) {
        setLoading(false)
        setError(err?.message || 'Login failed. Please check your credentials.')
      } finally {
        setLoading(false)
      }
    } else {
      if (role === 'admin') {
        sessionStorage.setItem('rne-admin-pending', JSON.stringify({ contact, name: 'Demo administrator' }))
        nav('/login/admin-otp')
        return
      }
      login({
        role,
        contact,
        name: role === 'worker' ? 'Demo worker' : 'Demo citizen',
      })
      nav(role === 'worker' ? '/worker' : '/citizen')
    }
  }

  const title = role === 'admin' ? 'Officer / Administrator login' : role === 'worker' ? 'Municipal worker login' : 'Login to your account'
  const lede =
    role === 'admin'
      ? 'Two-step account verification for authorized municipal administrators.'
      : role === 'worker'
        ? 'Use your authorized staff email. Public registration is for citizens only.'
        : 'Choose your role to continue. Citizens can sign in with email or phone.'

  return (
    <>
      <p className="kicker">Account access</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      <div className="grid-2">
        <form className="card pad" onSubmit={submit}>
          <div className="tabs">
            {(['citizen', 'worker', 'admin'] as Role[]).map((r) => (
              <button key={r} type="button" className={`tab ${role === r ? 'on' : ''}`} onClick={() => switchRole(r)}>
                {r === 'admin' ? 'Administrator' : r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          {role === 'admin' && <p className="tiny muted">Step 1 of 2 · Password</p>}
          <label>
            {role === 'citizen' ? 'Email or phone number' : 'Authorized municipal email'} <span className="req">*</span>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={role === 'citizen' ? 'Enter email or mobile number' : `name@${MUNICIPAL_DOMAIN}`}
            />
          </label>
          {role !== 'citizen' && <p className="hint">Example only · Staff email must end in {MUNICIPAL_DOMAIN}.</p>}
          <label>
            Password <span className="req">*</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </label>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Link className="linkish" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <Captcha checked={captcha} onChange={setCaptcha} />
          {error && <p className="hint" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button className="btn block" type="submit" disabled={loading}>
            {loading ? 'Authenticating…' : role === 'admin' ? 'Next' : role === 'worker' ? 'Login as worker' : 'Login as citizen'}
          </button>
          {role === 'citizen' && (
            <p>
              <Link className="linkish" to="/register">
                New citizen? Create an account →
              </Link>
            </p>
          )}
          {role === 'admin' && (
            <div className="callout" style={{ marginTop: 12 }}>
              <strong>Email verification follows</strong>
              <div className="tiny muted">The next step represents an OTP sent to the administrator's authorized email.</div>
            </div>
          )}
          {role === 'worker' && (
            <div className="callout" style={{ marginTop: 12 }}>
              <strong>Authorized staff only</strong>
              <div className="tiny muted">No public worker registration. Sign in to view assigned tasks and repair history.</div>
            </div>
          )}
        </form>
        {role === 'citizen' ? (
          <SideNote title="Your citizen services account">
            File complaints about local road and drain hazards, follow their progress, and record your satisfaction after a case is resolved.
          </SideNote>
        ) : (
          <AuthNote />
        )}
      </div>
    </>
  )
}

export function RegisterPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [captcha, setCaptcha] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!captcha) return setError('Complete the illustrative CAPTCHA to continue.')
    if (!name || !contact || !pass) return setError('Fill all required fields.')
    if (pass !== confirm) return setError('Passwords do not match.')
    if (pass.length < 6) return setError('Password must be at least 6 characters long.')

    if (isSupabaseConfigured) {
      setLoading(true)
      try {
        const isEmail = contact.includes('@')
        if (!isEmail) {
          setLoading(false)
          return setError('Supabase registration requires a valid email address.')
        }

        const { data, error: supaError } = await supabase.auth.signUp({
          email: contact.trim(),
          password: pass,
          options: {
            data: {
              display_name: name.trim(),
            },
          },
        })

        if (supaError) {
          setLoading(false)
          return setError(supaError.message)
        }

        if (data.user) {
          login({
            id: data.user.id,
            role: 'citizen',
            name: name.trim(),
            contact: contact.trim(),
          })
          nav('/citizen')
        }
      } catch (err: any) {
        setLoading(false)
        setError(err?.message || 'Registration failed. Try again.')
      } finally {
        setLoading(false)
      }
    } else {
      login({ role: 'citizen', name, contact })
      nav('/citizen')
    }
  }

  return (
    <>
      <p className="kicker">Account access</p>
      <h1>Create a citizen account</h1>
      <p className="lede">New-citizen registration · Use an email address or phone number.</p>
      <div className="grid-2">
        <form className="card pad" onSubmit={submit}>
          <h2 style={{ marginTop: 0 }}>Citizen registration</h2>
          <label>
            Full name <span className="req">*</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
          </label>
          <label>
            Email or phone number <span className="req">*</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter email address" />
          </label>
          <p className="hint">Provide a valid email address for account access and recovery.</p>
          <label>
            Create password <span className="req">*</span>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Create a password (min. 6 characters)" />
          </label>
          <label>
            Confirm password <span className="req">*</span>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" />
          </label>
          <Captcha checked={captcha} onChange={setCaptcha} />
          {error && <p className="hint" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button className="btn block" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create citizen account'}
          </button>
          <p>
            <Link className="linkish" to="/login">
              Already registered? Login →
            </Link>
          </p>
        </form>
        <SideNote title="Your citizen services account">
          File complaints about local road and drain hazards, follow their progress, and record your satisfaction after a case is resolved.
        </SideNote>
      </div>
    </>
  )
}

export function ForgotPage() {
  const [contact, setContact] = useState('')
  const [captcha, setCaptcha] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!captcha || !contact) return
    if (isSupabaseConfigured) {
      setLoading(true)
      try {
        const { error: supaError } = await supabase.auth.resetPasswordForEmail(contact.trim())
        if (supaError) {
          setError(supaError.message)
        } else {
          setSent(true)
        }
      } catch (err: any) {
        setError(err?.message || 'Password reset request failed.')
      } finally {
        setLoading(false)
      }
    } else {
      setSent(true)
    }
  }

  return (
    <>
      <p className="kicker">Account access</p>
      <h1>Recover your password</h1>
      <p className="lede">Use the email or phone number associated with your account.</p>
      <div className="grid-2">
        <form className="card pad" onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0 }}>Forgot password?</h2>
          <label>
            Registered email or phone number <span className="req">*</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter email address" />
          </label>
          <p className="hint">Municipal staff should use their authorized email.</p>
          <Captcha checked={captcha} onChange={setCaptcha} />
          {error && <p className="hint" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button className="btn block" type="submit" disabled={loading}>
            {loading ? 'Sending instructions…' : 'Send recovery instructions'}
          </button>
          {sent && <p className="callout ok">Password recovery instructions have been sent if an account exists for this email.</p>}
          <p>
            <Link className="linkish" to="/login">
              ← Back to login
            </Link>
          </p>
        </form>
        <SideNote title="Your citizen services account">
          File complaints about local road and drain hazards, follow their progress, and record your satisfaction after a case is resolved.
        </SideNote>
      </div>
    </>
  )
}

export function AdminOtpPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const pending = sessionStorage.getItem('rne-admin-pending')
  const parsed = pending ? (JSON.parse(pending) as { contact: string; name: string }) : { contact: `officer@${MUNICIPAL_DOMAIN}`, name: 'Demo administrator' }
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  function setAt(i: number, v: string) {
    const next = [...otp]
    next[i] = v.slice(-1)
    setOtp(next)
    const el = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null
    if (v && el) el.focus()
  }

  return (
    <>
      <p className="kicker">Account access</p>
      <h1>Verify your administrator email</h1>
      <p className="lede">Complete the second step of authorized account access.</p>
      <div className="grid-2">
        <form
          className="card pad"
          onSubmit={(e) => {
            e.preventDefault()
            if (otp.join('').length < 6) return
            login({ role: 'admin', name: parsed.name, contact: parsed.contact })
            sessionStorage.removeItem('rne-admin-pending')
            nav('/admin')
          }}
        >
          <p className="tiny muted">Step 2 of 2 · Email OTP</p>
          <h2>Enter verification code</h2>
          <div className="callout">
            <strong>OTP sent · Illustrative state</strong>
            <div className="tiny muted">Destination: {parsed.contact} (demo). No actual email has been sent.</div>
          </div>
          <div className="label">
            Email OTP <span className="req">*</span>
          </div>
          <div className="otp">
            {otp.map((d, i) => (
              <input key={i} id={`otp-${i}`} value={d} onChange={(e) => setAt(i, e.target.value)} maxLength={1} />
            ))}
          </div>
          <button className="btn block" type="submit" style={{ marginTop: 16 }} disabled={otp.join('').length < 6}>
            Verify OTP & login
          </button>
          <div className="space" style={{ marginTop: 12 }}>
            <button
              className="linkish"
              type="button"
              onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
            >
              Resend code
            </button>
            <Link className="linkish" to="/login?role=admin">
              ← Back to password
            </Link>
          </div>
          <p className="tiny muted">OTP entry completes login, then opens the administrator dashboard in this visual flow.</p>
        </form>
        <AuthNote />
      </div>
    </>
  )
}

export function StatusPage() {
  const { complaints } = useApp()
  const [id, setId] = useState('RNE-PUN-2026-0048')
  const [viewed, setViewed] = useState(complaints[0])
  const match = complaints.find((c) => c.id.toLowerCase() === id.trim().toLowerCase()) || viewed

  return (
    <>
      <p className="kicker">Complaint status · Sample case</p>
      <h1>Track your complaint</h1>
      <p className="lede">Enter a complaint ID to view its status. All case information shown here is sample data.</p>
      <form
        className="card pad"
        style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (match) setViewed(match)
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <label>
            Complaint ID <span className="req">*</span>
            <input value={id} onChange={(e) => setId(e.target.value)} />
          </label>
        </div>
        <button className="btn" type="submit">
          <Icon name="search" /> View status
        </button>
      </form>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="stack">
          <section className="card pad">
            <div className="space">
              <h2 style={{ margin: 0 }}>{match.id}</h2>
              <StatusBadge status={match.status} />
            </div>
            <p>
              <strong>
                {hazardLabel[match.hazard]} · {match.attention === 'high' ? 'High attention' : match.attention === 'moderate' ? 'Moderate attention' : 'Low attention'}
              </strong>
            </p>
            <div className="grid-equal">
              <div>
                <div className="tiny muted">Reported site</div>
                <div>{match.site}</div>
                <div className="tiny muted">{match.coords} · Sample location</div>
              </div>
              <div>
                <div className="tiny muted">Predefined identifiers · Illustrative</div>
                {match.drainId && <div>Drain: {match.drainId}</div>}
                {match.coverId && <div>Cover: {match.coverId}</div>}
                {match.potholeId && <div>Pothole: {match.potholeId}</div>}
              </div>
            </div>
            <p className="tiny muted">
              Submitted: {match.reportedOn}
              {match.reportedAt ? `, ${match.reportedAt}` : ''} · Location enabled · {match.photoKind === 'normal' ? 'Normal' : 'Geotagged'} photo provided
            </p>
          </section>
          <section className="card pad">
            <h3>Complaint description & evidence</h3>
            <p>{match.description}</p>
            <div className="callout">
              {match.photoName} · {match.photoKind === 'normal' ? 'Normal photo' : 'Geotagged photo'} · {match.photoSize}
              <div className="tiny muted">Illustrative attachment · Written description used; no audio attached</div>
            </div>
          </section>
        </div>
        <div className="stack">
          <section className="card pad">
            <h3>Latest update</h3>
            <p>
              <strong>{statusLabelSafe(match.status)}</strong>
              <div className="tiny muted">
                {match.reportedOn}
                {match.reportedAt ? ` · ${match.reportedAt}` : ''}
              </div>
            </p>
            <p className="tiny muted">The sample complaint has been recorded. No further update recorded in this sample.</p>
          </section>
          <div className="callout">
            <strong>Not resolved yet</strong>
            <div className="tiny muted">Citizen satisfaction: {satisfactionLabel[match.satisfaction]}. A solved case can still await citizen satisfaction; resolution alone is not a satisfaction confirmation.</div>
          </div>
          <section className="card pad">
            <h3>Want to raise an unresolved issue?</h3>
            <p className="tiny muted">Reference this ID in a complaint against the municipality.</p>
            <Link className="ghost" to={`/escalation?id=${match.id}`}>
              Lodge an escalation
            </Link>
          </section>
          <section className="card pad">
            <h3>Case feedback</h3>
            <p className="tiny muted">Share feedback about the action taken on this complaint. This helps the municipality improve follow-up for the same drain ID.</p>
            <div className="callout">
              Complaint ID · {match.id}
              {match.drainId ? <div>Drain ID · {match.drainId}</div> : null}
              <div className="tiny muted">Feedback is case-specific and separate from escalation or satisfaction.</div>
            </div>
            <Link className="ghost" to={`/feedback?id=${match.id}`}>
              Submit case feedback
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}

function statusLabelSafe(s: CaseStatus) {
  return s[0].toUpperCase() + s.slice(1).replace('-', ' ')
}

export function FeedbackPage() {
  const { complaints } = useApp()
  const [params] = useSearchParams()
  const pre = complaints.find((c) => c.id === params.get('id')) || complaints[0]
  const [type, setType] = useState<'general' | 'case'>('case')
  const [sent, setSent] = useState(false)
  const [sat, setSat] = useState<'satisfied' | 'not-satisfied' | 'not-yet-resolved'>('not-yet-resolved')

  return (
    <>
      <p className="kicker">Citizen voice · Feedback</p>
      <h1>Share your feedback</h1>
      <p className="lede">Tell RoNetEnter Municipal Corporation about your experience with citizen services. * Required</p>
      <div className="grid-2">
        <form
          className="card pad"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <div className="label">Feedback type</div>
          <div className="row">
            <button type="button" className={`chip ${type === 'general' ? 'on' : ''}`} onClick={() => setType('general')}>
              General service feedback
            </button>
            <button type="button" className={`chip ${type === 'case' ? 'on' : ''}`} onClick={() => setType('case')}>
              Feedback on a specific complaint
            </button>
          </div>
          <div className="grid-equal">
            <label>
              Name
              <input placeholder="Enter your name" />
            </label>
            <label>
              Email or phone number
              <input placeholder="Enter a contact (optional)" />
            </label>
          </div>
          {type === 'case' && (
            <>
              <label>
                Select complaint
                <input defaultValue={`${pre.id} · Drain ${pre.drainId || pre.potholeId} · ${pre.locality} Pune`} />
              </label>
              <div className="grid-equal">
                <label>
                  Complaint ID
                  <input defaultValue={pre.id} />
                </label>
                <label>
                  Drain/site identifier
                  <input defaultValue={pre.drainId || pre.potholeId || ''} />
                </label>
              </div>
              <div className="label">Citizen satisfaction</div>
              <div className="row">
                {(['satisfied', 'not-satisfied', 'not-yet-resolved'] as const).map((k) => (
                  <button key={k} type="button" className={`chip ${sat === k ? 'on' : ''}`} onClick={() => setSat(k)}>
                    {k === 'satisfied' ? 'Satisfied' : k === 'not-satisfied' ? 'Not satisfied' : 'Not yet resolved'}
                  </button>
                ))}
              </div>
            </>
          )}
          <label>
            Your feedback <span className="req">*</span>
            <textarea placeholder="What worked well? What could be improved?" required />
          </label>
          <p className="hint">This is an editable demonstration form. Feedback is not sent or stored.</p>
          {sent && <p className="callout ok">Illustrative feedback recorded for this prototype session.</p>}
          <div className="row">
            <button className="btn" type="submit">
              Submit feedback
            </button>
            <Link className="ghost" to="/">
              Back to dashboard
            </Link>
          </div>
        </form>
        <aside className="stack">
          <section className="card pad">
            <h3>Feedback or escalation?</h3>
            <p className="muted tiny">Use feedback for your service experience. To lodge a complaint against the municipality about an unresolved issue, use the separate escalation form.</p>
            <Link className="ghost" to="/escalation">
              Lodge an escalation
            </Link>
          </section>
          <div className="callout">
            <strong>Case feedback guidance</strong>
            <div className="tiny muted">For case feedback, the selected complaint and site are linked to your feedback. Citizen satisfaction choices capture your experience with the case, not the administrative resolution status.</div>
          </div>
          <section className="card pad">
            <h3>Example cases</h3>
            {complaints.slice(0, 3).map((c) => (
              <div key={c.id} className="list-row">
                <div>
                  <strong>
                    {c.id} · {c.drainId || c.potholeId} · {c.locality} Pune
                  </strong>
                  <div className="tiny muted">
                    {statusLabelSafe(c.status)} · Citizen satisfaction: {satisfactionLabel[c.satisfaction]}
                  </div>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </>
  )
}

export function EscalationPage() {
  const { complaints } = useApp()
  const [params] = useSearchParams()
  const pre = complaints.find((c) => c.id === params.get('id')) || complaints[0]
  const [sent, setSent] = useState(false)

  return (
    <>
      <p className="kicker">Citizen voice · Escalation</p>
      <h1>Lodge a complaint against the municipality</h1>
      <p className="lede">Reference an unresolved complaint and explain the issue you want to raise. * Required</p>
      <div className="grid-2">
        <form
          className="card pad"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <label>
            Original complaint ID <span className="req">*</span>
            <input defaultValue={pre.id} required />
          </label>
          <div className="grid-equal">
            <label>
              Your name <span className="req">*</span>
              <input placeholder="Enter your name" required />
            </label>
            <label>
              Email or phone number <span className="req">*</span>
              <input placeholder="Enter email or mobile number" required />
            </label>
          </div>
          <label>
            Why are you escalating this complaint? <span className="req">*</span>
            <textarea placeholder="Explain what remains unresolved and your concern with the municipality's handling of the original complaint." required />
          </label>
          <label>
            Additional details (optional)
            <input placeholder="Add relevant dates or previous communication" />
          </label>
          <p className="hint">Illustrative form only. No escalation is sent, and no escalation policy or response-time promise is implied.</p>
          {sent && <p className="callout ok">Illustrative escalation recorded. No message was sent to the municipality.</p>}
          <div className="row">
            <button className="btn" type="submit">
              Submit escalation
            </button>
            <Link className="ghost" to="/status">
              Back to complaint status
            </Link>
          </div>
        </form>
        <aside className="stack">
          <section className="card pad">
            <h3>Referenced complaint</h3>
            <strong>{pre.id}</strong>
            <div className="row" style={{ marginTop: 8 }}>
              <StatusBadge status={pre.status} />
              <span className="badge pending">Unresolved</span>
            </div>
            <p>
              {hazardLabel[pre.hazard]} · {pre.locality}, Pune{pre.pin ? ` · ${pre.pin}` : ''} Reported {pre.reportedOn}
            </p>
            <p className="tiny muted">Sample case only · No real incident or municipal action is asserted.</p>
          </section>
          <div className="callout">
            <strong>Keep the original case reference</strong>
            <div className="tiny muted">This form raises a concern about an unresolved complaint. It is separate from filing a new hazard complaint or submitting general feedback.</div>
          </div>
        </aside>
      </div>
    </>
  )
}
