import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { StatusBadge } from './components'
import { useApp } from './context'
import { attentionLabel, hazardLabel, sampleSiteByRegion, satisfactionLabel } from './data'
import type { Attention, CaseStatus, Hazard, PhotoKind } from './types'

export function CitizenHome() {
  const { session, complaints } = useApp()
  const [filter, setFilter] = useState<'all' | CaseStatus | 'satisfied'>('all')
  if (!session || session.role !== 'citizen') return <Navigate to="/login" replace />

  const unresolved = complaints.filter((c) => c.status !== 'solved' && c.status !== 'rejected')
  const solved = complaints.filter((c) => c.status === 'solved')
  const rejected = complaints.filter((c) => c.status === 'rejected')
  const rows = complaints.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'satisfied') return c.satisfaction === 'satisfied' || c.status === 'solved'
    return c.status === filter
  })

  return (
    <>
      <p className="kicker">Citizen account · Pune</p>
      <div className="space">
        <div>
          <h1>Your complaints, in one place</h1>
          <p className="lede">Demo citizen account · Keep track of each case and its resolution.</p>
        </div>
        <Link className="btn" to="/complaints/new">
          + File a complaint
        </Link>
      </div>
      <div className="grid-3">
        <section className="card pad">
          <div className="stat">{String(unresolved.length).padStart(2, '0')}</div>
          <strong>Unresolved cases</strong>
          <div className="tiny muted">1 submitted · 1 pending · 1 in progress</div>
        </section>
        <section className="card pad">
          <div className="stat">{String(solved.length).padStart(2, '0')}</div>
          <strong>Solved cases</strong>
          <div className="tiny muted">1 satisfied · 1 awaiting confirmation</div>
        </section>
        <section className="card pad">
          <div className="stat">{String(rejected.length).padStart(2, '0')}</div>
          <strong>Rejected case</strong>
          <div className="tiny muted">See the reason in your case details</div>
        </section>
      </div>
      <section className="card pad" style={{ marginTop: 16 }}>
        <div className="space">
          <h2 style={{ margin: 0 }}>Complaint history</h2>
          <Link className="ghost" to="/status">
            View complaint status
          </Link>
        </div>
        <div className="chips" style={{ margin: '0.8rem 0' }}>
          {[
            ['all', 'All cases'],
            ['satisfied', 'Satisfied / Solved'],
            ['rejected', 'Rejected'],
            ['in-progress', 'In progress'],
            ['submitted', 'Submitted'],
            ['pending', 'Pending'],
          ].map(([k, label]) => (
            <button key={k} className={`chip ${filter === k ? 'on' : ''}`} type="button" onClick={() => setFilter(k as typeof filter)}>
              {label}
            </button>
          ))}
        </div>
        <p className="tiny muted">Sample data · "Solved" records resolution. "Satisfied" records the citizen's confirmation; they are not the same status.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Complaint / hazard</th>
              <th>Locality</th>
              <th>Reported</th>
              <th>Case status</th>
              <th>Citizen satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/status`} style={{ fontWeight: 700 }}>
                    {c.id}
                  </Link>
                  <div className="tiny muted">{hazardLabel[c.hazard]}</div>
                </td>
                <td>
                  {c.locality}
                  {c.pin ? ` · ${c.pin}` : ''}
                </td>
                <td>{c.reportedOn}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td>{satisfactionLabel[c.satisfaction]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

type Draft = {
  regionId: string
  pin: string
  hazard: Hazard | ''
  locationOn: boolean
  description: string
  audioName: string
  photoKind: PhotoKind
  photoName: string
  attention: Attention
}

const emptyDraft: Draft = {
  regionId: 'hadapsar',
  pin: '411028',
  hazard: 'open-drain',
  locationOn: false,
  description: '',
  audioName: '',
  photoKind: 'normal',
  photoName: '',
  attention: 'high',
}

export function FileComplaintPage() {
  const { session, regions, addComplaint } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [descMode, setDescMode] = useState<'written' | 'audio'>('written')
  if (!session || session.role !== 'citizen') return <Navigate to="/login?role=citizen" replace />

  const region = regions.find((r) => r.id === draft.regionId)
  const site = sampleSiteByRegion[draft.regionId] || sampleSiteByRegion.hadapsar
  const canStep2 = Boolean(draft.regionId && draft.hazard && draft.locationOn)
  const canStep3 = Boolean(draft.description.trim() || draft.audioName)

  function submit() {
    const n = 50 + Math.floor(Math.random() * 40)
    const id = `RNE-PUN-2026-00${n}`
    addComplaint({
      id,
      hazard: (draft.hazard || 'open-drain') as Hazard,
      locality: region?.name || 'Hadapsar',
      pin: draft.pin || region?.pin || null,
      reportedOn: '09 Oct 2026',
      reportedAt: '10:30 AM IST',
      status: 'submitted',
      satisfaction: 'not-yet-resolved',
      attention: draft.attention,
      description:
        draft.description ||
        'Audio description provided for this sample complaint. Location remains compulsory for both written and audio paths.',
      photoName: draft.photoName || 'hadapsar-drain-photo.jpg',
      photoKind: draft.photoKind,
      photoSize: '2.4 MB',
      site: site.site,
      coords: site.coords,
      drainId: draft.hazard === 'pothole' ? undefined : site.drainId,
      coverId: draft.hazard === 'pothole' ? undefined : site.coverId,
      potholeId: draft.hazard === 'pothole' ? 'ILL-PH-VNZ-0004' : undefined,
    })
    nav(`/complaints/submitted?id=${id}`)
  }

  return (
    <>
      <p className="kicker">File a complaint · Step {step} of 3</p>
      <h1>{step === 1 ? 'Where is the problem?' : step === 2 ? 'Describe the problem' : 'Add photo proof and attention level'}</h1>
      <p className="lede">
        {step === 1
          ? 'Choose a Pune locality and hazard type, then enable location to identify the exact site. * Required'
          : step === 2
            ? 'Write a detailed complaint or upload an audio description. Either path can be used. * Required'
            : 'A photo is mandatory. Choose a photograph type, then select the attention needed. * Required'}
      </p>
      <div className="steps">
        {['1 Locality & location', '2 Description', '3 Photo & attention'].map((label, i) => (
          <div key={label} className={`step ${step === i + 1 ? 'on' : step > i + 1 ? 'done' : ''}`}>
            {label} {step > i + 1 ? '✓' : ''}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid-2">
          <section className="card pad">
            <h2>1. Select your locality *</h2>
            <p className="tiny muted">Pune, Maharashtra · Choose a small area, not a city.</p>
            <label>
              PIN code (optional)
              <input value={draft.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value })} placeholder="Enter PIN code if known" />
            </label>
            <p className="hint">Leave blank if you do not know the PIN code. Location remains compulsory.</p>
            <div className="chips" style={{ marginTop: 12 }}>
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`chip ${draft.regionId === r.id ? 'on' : ''}`}
                  onClick={() => setDraft({ ...draft, regionId: r.id, pin: r.pin || draft.pin })}
                >
                  {r.name}
                  {r.pin ? ` · ${r.pin}` : ''}
                </button>
              ))}
            </div>
            <h2>2. Select the hazard *</h2>
            <div className="grid-3">
              {(
                [
                  ['open-drain', 'Open drain', 'Missing or open drain cover'],
                  ['overflowing-drain', 'Overflowing drain', 'Drain water overflowing onto the road'],
                  ['pothole', 'Pothole', 'Road damage or rainwater pooling that hides a road hazard'],
                ] as const
              ).map(([k, t, d]) => (
                <button key={k} type="button" className={`choice ${draft.hazard === k ? 'on' : ''}`} onClick={() => setDraft({ ...draft, hazard: k })}>
                  <strong>{t}</strong>
                  <div className="tiny muted">{d}</div>
                </button>
              ))}
            </div>
            <h2>3. Enable exact location *</h2>
            <div className="callout warn">
              <strong>Location is required to continue</strong>
              <div className="tiny">Your exact site is compulsory for every complaint, including normal-photo and audio-description submissions. No location is being accessed in this prototype.</div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" type="button" onClick={() => setDraft({ ...draft, locationOn: true })}>
                Enable location
              </button>
              <span className="tiny muted">{draft.locationOn ? 'Required state · Location enabled (sample)' : 'Required state · Location not yet enabled'}</span>
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button className="ghost" type="button" disabled={!canStep2} onClick={() => setStep(2)}>
                Next: description {canStep2 ? '' : '· Unavailable'}
              </button>
            </div>
          </section>
          <aside className="stack">
            <section className="card pad">
              <h3>A specific site matters</h3>
              <p className="muted tiny">For drains, your location is paired with a predefined drain and drain-cover number to identify the drainhole. Identifiers shown in later steps are illustrative, not a real municipal asset register.</p>
            </section>
            <div className="callout">
              <strong>Pune-only prototype</strong>
              <div className="tiny muted">PIN codes are shown only for selected localities with confirmed mappings. Other area options do not imply a PIN code.</div>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="grid-2">
          <section className="card pad">
            <div className="callout ok">
              <strong>Location enabled · Sample detection</strong>
              <div className="tiny">
                {site.site}. Coordinates: {site.coords}. This is a static sample; real geolocation is not running.
              </div>
            </div>
            <div className="row" style={{ margin: '12px 0' }}>
              <button type="button" className={`chip ${descMode === 'written' ? 'on' : ''}`} onClick={() => setDescMode('written')}>
                Written description
              </button>
              <button type="button" className={`chip ${descMode === 'audio' ? 'on' : ''}`} onClick={() => setDescMode('audio')}>
                Audio description
              </button>
            </div>
            <label>
              Detailed written complaint
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Describe the site in your own words."
              />
            </label>
            <p className="hint">Provide a written description OR an audio description. Location remains compulsory for both.</p>
            <div className="callout">
              <strong>Prefer to speak? Upload an audio description</strong>
              <div className="tiny muted">For citizens who cannot write. Describe the same site in your own words; written text is not required when audio is provided.</div>
              <button
                className="ghost"
                type="button"
                style={{ marginTop: 8 }}
                onClick={() => setDraft({ ...draft, audioName: 'complaint-audio-sample.mp3' })}
              >
                Choose audio file
              </button>
              <div className="tiny muted">{draft.audioName || 'No audio attached · Upload control is illustrative'}</div>
            </div>
            <div className="space" style={{ marginTop: 16 }}>
              <button className="ghost" type="button" onClick={() => setStep(1)}>
                Back: locality & location
              </button>
              <button className="btn" type="button" disabled={!canStep3} onClick={() => setStep(3)}>
                Next: photo & attention
              </button>
            </div>
          </section>
          <aside className="card pad">
            <span className="badge solved">Location enabled</span>
            <h3>Your selected site</h3>
            <p>
              {hazardLabel[(draft.hazard || 'open-drain') as Hazard]} · {region?.name}
              {draft.pin ? ` · ${draft.pin}` : ''}
            </p>
            {draft.hazard !== 'pothole' && (
              <>
                <div className="tiny muted">Predefined drain identifier</div>
                <p>{site.drainId}</p>
                <div className="tiny muted">Predefined cover identifier</div>
                <p>{site.coverId}</p>
              </>
            )}
            <p className="tiny muted">Illustrative identifiers only. A pothole report would not need a drain identifier.</p>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="grid-2">
          <section className="card pad">
            <h2>Photo proof *</h2>
            <div className="grid-equal">
              {(['geotagged', 'normal'] as PhotoKind[]).map((k) => (
                <button key={k} type="button" className={`choice ${draft.photoKind === k ? 'on' : ''}`} onClick={() => setDraft({ ...draft, photoKind: k })}>
                  <strong>{k === 'geotagged' ? 'Geotagged photo' : 'Normal photo'}</strong>
                  <div className="tiny muted">
                    {k === 'geotagged' ? 'Upload a photograph with embedded location data.' : 'Upload a photo without embedded location data.'}
                  </div>
                </button>
              ))}
            </div>
            <div className="callout" style={{ marginTop: 12 }}>
              <strong>Exact location remains compulsory</strong>
              <div className="tiny muted">Normal photos and geotagged photos both use the location captured in step 1. Photo metadata does not replace required citizen location.</div>
            </div>
            <div className="callout" style={{ marginTop: 12 }}>
              {draft.photoName || 'hadapsar-drain-photo.jpg'}
              <div className="tiny muted">
                {draft.photoKind === 'normal' ? 'Normal photo' : 'Geotagged photo'} · 2.4 MB · Illustrative attachment, no file uploaded
              </div>
              <button className="ghost" type="button" style={{ marginTop: 8 }} onClick={() => setDraft({ ...draft, photoName: 'hadapsar-drain-photo.jpg' })}>
                Choose / replace photo
              </button>
            </div>
            <h2>Attention level *</h2>
            <div className="grid-3">
              {(['high', 'moderate', 'low'] as Attention[]).map((a) => (
                <button key={a} type="button" className={`choice ${draft.attention === a ? 'on' : ''}`} onClick={() => setDraft({ ...draft, attention: a })}>
                  {attentionLabel[a]}
                </button>
              ))}
            </div>
            <p className="hint">Citizen-selected attention level. This does not imply a response-time commitment.</p>
            <div className="space" style={{ marginTop: 16 }}>
              <button className="ghost" type="button" onClick={() => setStep(2)}>
                Back: description
              </button>
              <button className="btn" type="button" onClick={submit}>
                Submit complaint
              </button>
            </div>
          </section>
          <aside className="card pad">
            <h3>Review your complaint</h3>
            <div className="tiny muted">Hazard</div>
            <p>{hazardLabel[(draft.hazard || 'open-drain') as Hazard]}</p>
            <div className="tiny muted">Locality</div>
            <p>
              {region?.name}, Pune{draft.pin ? ` · ${draft.pin}` : ''}
            </p>
            <div className="tiny muted">Location</div>
            <p>
              {site.site}
              <br />
              {site.coords}
            </p>
            {draft.hazard !== 'pothole' && (
              <>
                <div className="tiny muted">Drain / cover · Illustrative</div>
                <p>
                  {site.drainId}
                  <br />
                  {site.coverId}
                </p>
              </>
            )}
            <div className="tiny muted">Description</div>
            <p>{draft.description ? 'Written description provided' : draft.audioName ? 'Audio description provided' : 'Pending'}</p>
            <div className="tiny muted">Photo</div>
            <p>{draft.photoKind === 'normal' ? 'Normal photo provided' : 'Geotagged photo provided'}</p>
          </aside>
        </div>
      )}
    </>
  )
}

export function SubmittedPage() {
  const { complaints, session } = useApp()
  const id = new URLSearchParams(window.location.search).get('id')
  const c = complaints.find((x) => x.id === id) || complaints[0]
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="center" style={{ paddingTop: 24 }}>
      <div className="icon-circle" style={{ margin: '0 auto 12px', background: 'var(--ok-bg)', color: 'var(--ok)', width: 48, height: 48 }}>
        ✓
      </div>
      <h1>Complaint submitted</h1>
      <p className="lede">Illustrative success state · No complaint has been sent to a municipality.</p>
      <section className="card pad" style={{ textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
        <div className="tiny muted">Your sample tracking ID</div>
        <div className="space">
          <h2 style={{ margin: 0 }}>{c.id}</h2>
          <StatusBadge status={c.status} />
        </div>
        <p>
          {hazardLabel[c.hazard]} · {c.locality}, Pune{c.pin ? ` · ${c.pin}` : ''}
          <br />
          {c.reportedOn}
          {c.reportedAt ? `, ${c.reportedAt}` : ''} · {attentionLabel[c.attention]}
        </p>
        <div className="callout">
          <strong>Site and evidence recorded in the sample</strong>
          <div className="tiny muted">
            {c.site}
            {c.drainId ? ` · ${c.drainId}` : ''}
            {c.coverId ? ` / ${c.coverId}` : ''} (illustrative). Written description and {c.photoKind}-photo proof provided; required location enabled.
          </div>
        </div>
        <p>Keep this ID to view the case status or reference it in feedback and escalation.</p>
        <div className="row">
          <Link className="btn" to="/status">
            Track this complaint
          </Link>
          <Link className="ghost" to="/citizen">
            Back to citizen dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}

