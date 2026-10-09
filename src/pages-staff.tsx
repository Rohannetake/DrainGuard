import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from './components'
import { useApp } from './context'
import {
  assignmentsSeed,
  feedbackSeed,
  hazardLabel,
  mostRepairedDrains,
  mostRepairedPotholes,
  SNAPSHOT,
  vanazRepairs,
} from './data'

function Need({ role, children }: { role: 'worker' | 'admin'; children: React.ReactNode }) {
  const { session } = useApp()
  if (!session || session.role !== role) return <Navigate to={`/login?role=${role === 'admin' ? 'admin' : 'worker'}`} replace />
  return <>{children}</>
}

export function WorkerHome() {
  const { session, duty, setDuty, sharing, setSharing, complaints } = useApp()
  const request = complaints.find((c) => c.id === 'RNE-PUN-2026-0041')
  return (
    <Need role="worker">
      <p className="kicker">Worker workspace · Pune</p>
      <h1>Your duty and assignments</h1>
      <p className="lede">Demo worker · {session?.contact || 'worker@xyz.ronetenter.org'} · Visit, repair and maintain assigned sites.</p>
      <div className="grid-equal">
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Duty status</h2>
          <div className="row">
            <button className={`chip ${duty === 'on' ? 'on' : ''}`} type="button" onClick={() => setDuty('on')}>
              ● On duty
            </button>
            <button className={`chip ${duty === 'off' ? 'on' : ''}`} type="button" onClick={() => setDuty('off')}>
              Off duty
            </button>
          </div>
          <p className="hint">On duty selected in this demo. Duty status does not enable location sharing.</p>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Live location sharing</h2>
          <div className="space">
            <span className="badge pending">{sharing ? 'Sharing on' : 'Sharing off'}</span>
            <button className="ghost" type="button" onClick={() => setSharing(!sharing)}>
              {sharing ? 'Stop sharing' : 'Share live location'}
            </button>
          </div>
          <p className="hint">Demo only · No location is being collected. Sharing is a separate, optional control.</p>
        </section>
      </div>
      <section className="card pad" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Assigned tasks</h2>
        <div className="row">
          <span className="chip on">All assignments · {assignmentsSeed.length}</span>
          <span className="chip">Filters ▾</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Task / assignment</th>
              <th>Fixed site / asset</th>
              <th>Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignmentsSeed.map((a) => (
              <tr key={a.id + a.title}>
                <td>
                  <strong>{a.title}</strong>
                  <div className="tiny muted">{a.subtitle}</div>
                </td>
                <td>
                  {a.siteId}
                  <div className="tiny muted">{a.siteLabel}</div>
                </td>
                <td>
                  <span className={`badge ${a.progress.includes('Awaiting') ? 'in-progress' : a.progress.includes('New cover') ? 'in-progress' : 'submitted'}`}>
                    {a.progress}
                  </span>
                </td>
                <td>
                  <Link className="linkish" to={a.actionTo}>
                    {a.action} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tiny muted">Visit and maintenance are steps of one Vanaz assignment, separate from the 3 active citizen complaints.</p>
      </section>
      <div className="grid-equal" style={{ marginTop: 16 }}>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Your completion request</h2>
          <div className="space">
            <strong>ILL-REQ-2026-0007 · Ramwadi</strong>
            <span className="badge in-progress">Awaiting admin approval</span>
          </div>
          <p className="tiny muted">
            {request?.id} · Submitted 09 Oct 2026, 11:20 AM IST
          </p>
          <p>Worker report: blockage removed and drain cleared. Public case remains In progress until administrator approval.</p>
          <Link className="linkish" to="/worker/assignments/vanaz#ramwadi">
            View completion request →
          </Link>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Repair history & citizen feedback</h2>
          <p className="muted">See earlier repairs against the same drainhole and read feedback before visiting the site.</p>
          <Link className="ghost" to="/worker/history">
            View history & feedback
          </Link>
        </section>
      </div>
      <p className="tiny muted" style={{ marginTop: 16 }}>
        Sample snapshot · {SNAPSHOT} · Pune only. All assignments, locations, identifiers and records are illustrative.
      </p>
    </Need>
  )
}

export function WorkerAssignment() {
  const {
    coverIdDraft,
    setCoverIdDraft,
    materialsTaken,
    setMaterialsTaken,
    workCompleted,
    setWorkCompleted,
    assignmentAccepted,
    setAssignmentAccepted,
    setCompletionSubmitted,
    completionSubmitted,
  } = useApp()
  const valid = /^ILL-DC-VNZ-0017-[B-Z]$/i.test(coverIdDraft.trim()) || coverIdDraft.trim() === 'ILL-DC-VNZ-0017-B'
  return (
    <Need role="worker">
      <p className="tiny">
        <Link to="/worker">← Assignments</Link>
      </p>
      <p className="kicker">Worker workspace · Pune</p>
      <h1>Visit and maintain the Vanaz drain</h1>
      <p className="lede">ILL-MNT-2026-0012 · Drain-cover replacement · Maintenance assignment, not a citizen complaint.</p>
      <div className="grid-2">
        <div className="stack">
          <section className="card pad">
            <h2 style={{ marginTop: 0 }}>Assignment checklist</h2>
            <label>
              <input type="checkbox" checked={assignmentAccepted} onChange={(e) => setAssignmentAccepted(e.target.checked)} /> Assignment accepted
              <div className="hint">08 Oct 2026, 09:00 AM IST · Visit Vanaz site VNZ-017</div>
            </label>
            <label>
              <input type="checkbox" checked={materialsTaken} onChange={(e) => setMaterialsTaken(e.target.checked)} /> Raw material taken
              <div className="hint">Not yet recorded · Register the new cover ID before confirming collection.</div>
            </label>
            <label>
              <input type="checkbox" checked={workCompleted} onChange={(e) => setWorkCompleted(e.target.checked)} /> Work completed
              <div className="hint">Pending material collection and drain-cover replacement.</div>
            </label>
          </section>
          <section className="card pad">
            <h2 style={{ marginTop: 0 }}>Collect materials & register the new cap</h2>
            <p>Read the unique number stamped on the new drainhole cap. It must be registered against this existing drain and exact site.</p>
            <div className="grid-equal">
              <label>
                Existing drain ID · Fixed
                <input value="ILL-DR-VNZ-0017" readOnly />
              </label>
              <label>
                Existing cover ID · Old cap
                <input value="ILL-DC-VNZ-0017-A" readOnly />
              </label>
            </div>
            <label>
              Exact site · Fixed association
              <input value="Vanaz · Sample service lane, site VNZ-017 · Pune, Maharashtra" readOnly />
            </label>
            <label>
              New cover unique ID <span className="req">*</span>
              <input value={coverIdDraft} onChange={(e) => setCoverIdDraft(e.target.value)} placeholder="Enter the number stamped on the new cap" />
            </label>
            <p className="hint">Required. Collection cannot continue until a new, unique cap ID is entered. Do not reuse the old cover ID.</p>
            <div className="callout warn">
              <strong>Illustrative validation state</strong>
              <div className="tiny">Example new ID: ILL-DC-VNZ-0017-B. This differs from old cap ILL-DC-VNZ-0017-A. The example is guidance only; no new cap is registered yet.</div>
            </div>
            <label>
              Raw materials to collect
              <input value="1 replacement drain cover · 1 bag bedding mortar (25 kg)" readOnly />
            </label>
            <div className="space">
              <Link className="ghost" to="/worker">
                Back to assignments
              </Link>
              <button className="btn" type="button" disabled={!coverIdDraft} onClick={() => setMaterialsTaken(true)}>
                Register cap & confirm collection
              </button>
            </div>
            {materialsTaken && <p className="callout ok">New cap {coverIdDraft || 'ILL-DC-VNZ-0017-B'} recorded against ILL-DR-VNZ-0017 in this prototype.</p>}
            {valid && <span className="tiny muted">Format looks like the sample series.</span>}
          </section>
          <section className="card pad" id="ramwadi">
            <h2 style={{ marginTop: 0 }}>Completion request · Ramwadi drain repair</h2>
            <p className="tiny muted">RNE-PUN-2026-0041 · ILL-DR-RMW-0009 · Sample footpath, site RMW-009</p>
            <label>
              <input type="checkbox" checked={assignmentAccepted} readOnly /> Assignment accepted
            </label>
            <label>
              <input type="checkbox" checked readOnly /> Raw material taken
              <div className="hint">Cleaning tools and disposal bags · No cap replacement</div>
            </label>
            <label>
              <input type="checkbox" checked={workCompleted} onChange={(e) => setWorkCompleted(e.target.checked)} /> Work completed
            </label>
            <div className="label">Work-done statement</div>
            <textarea defaultValue="The blockage has been removed, accumulated waste cleared and water flow checked. The drain is cleared at sample site RMW-009." />
            <p className="tiny muted">Already submitted as ILL-REQ-2026-0007 · 09 Oct 2026, 11:20 AM IST. Submit is disabled to prevent a duplicate request.</p>
            <div className="space">
              <span className="badge in-progress">Awaiting admin approval</span>
              <button className="ghost" type="button" disabled={completionSubmitted} onClick={() => setCompletionSubmitted(true)}>
                Submit completion request
              </button>
            </div>
            <p className="callout">Citizen and worker case status: In progress · Not solved yet</p>
          </section>
        </div>
        <aside className="stack">
          <section className="card pad">
            <h3>Your assigned site</h3>
            <span className="badge submitted">Maintenance · Accepted</span>
            <p>
              <strong>ILL-DR-VNZ-0017</strong>
              <div className="tiny muted">Illustrative drainhole identifier</div>
            </p>
            <p>Vanaz · Sample service lane, site VNZ-017</p>
            <p className="tiny muted">Task: visit the drain, inspect the cover seating and the worn cover mortar. Maintain the drain opening after fitting.</p>
            <div className="callout">
              <strong>Site association stays fixed</strong>
              <div className="tiny muted">The new cap is attached to this drain and site, not to a different drainhole or the solved Vanaz pothole case 0028.</div>
            </div>
            <Link className="ghost" to="/worker/history">
              View repair history & feedback
            </Link>
          </section>
          <div className="callout">
            <strong>Pothole assignments</strong>
            <div className="tiny muted">Pothole work uses a stable site ID, such as ILL-PH-YRW-0021. No drain-cap field is mandatory for pothole repairs.</div>
          </div>
          <div className="callout">
            <strong>Worker authority</strong>
            <div className="tiny muted">You can record work and submit a completion request. Only an administrator can approve it and publish the result.</div>
          </div>
        </aside>
      </div>
    </Need>
  )
}

export function RepairHistoryPage() {
  return (
    <Need role="worker">
      <p className="tiny">
        <Link to="/worker">← Assignments</Link>
      </p>
      <p className="kicker">Worker workspace · Pune</p>
      <h1>Repair history & citizen feedback</h1>
      <p className="lede">Read previous work at the same drainhole before your next visit. All history and feedback below are demonstration records.</p>
      <section className="card pad">
        <div className="space">
          <div>
            <h2 style={{ marginTop: 0 }}>Selected drainhole</h2>
            <strong>ILL-DR-VNZ-0017 · Vanaz</strong>
            <div className="tiny muted">Sample service lane, site VNZ-017 · Current assignment ILL-MNT-2026-0012</div>
            <p className="tiny muted">Stable drain ID links repairs and feedback even when the cover is replaced. Current old cover: ILL-DC-VNZ-0017-A.</p>
          </div>
          <button className="ghost" type="button">
            Change asset ▾
          </button>
        </div>
      </section>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Drainhole repair history</h2>
          <span className="badge submitted">3 historical repairs · Demo</span>
          <table className="table">
            <thead>
              <tr>
                <th>Date / record</th>
                <th>Work performed</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {vanazRepairs.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.date}
                    <div className="tiny muted">{r.id}</div>
                  </td>
                  <td>{r.work}</td>
                  <td>
                    <span className="badge submitted">{r.outcome}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="callout warn">
            <strong>Current maintenance is not complete</strong>
            <div className="tiny">09 Oct 2026 · Replacement cover collection is blocked until the new cap ID is entered. This assignment is not included in the historical repair count.</div>
          </div>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Feedback for this drainhole</h2>
          <p className="tiny muted">ILL-DR-VNZ-0017 · Latest first · Sample citizen comments</p>
          {feedbackSeed
            .filter((f) => f.assetId === 'ILL-DR-VNZ-0017')
            .map((f) => (
              <div className="list-row" key={f.date + f.title}>
                <div>
                  <strong>
                    {f.date} · {f.title}
                  </strong>
                  {f.related && <div className="tiny muted">Related history: {f.related}</div>}
                  <p>“{f.text}”</p>
                </div>
              </div>
            ))}
          <p className="tiny muted">Comments are feedback, not an approval or a satisfaction status. Only the administrator can publish complaint resolution.</p>
        </section>
      </div>
      <section className="card pad" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Published complaint results · Read only</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Complaint / asset</th>
              <th>Location</th>
              <th>Published status</th>
              <th>Citizen satisfaction</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                RNE-PUN-2026-0032 · Open drain
                <div className="tiny muted">ILL-DR-SDP-0006 · Illustrative ID</div>
              </td>
              <td>Sadashiv Peth · 411030</td>
              <td>
                <span className="badge solved">Solved</span>
              </td>
              <td>Awaiting confirmation</td>
            </tr>
            <tr>
              <td>
                RNE-PUN-2026-0028 · Pothole
                <div className="tiny muted">ILL-PH-VNZ-0004 · Stable sample site ID</div>
              </td>
              <td>Vanaz</td>
              <td>
                <span className="badge solved">Solved</span>
              </td>
              <td>Satisfied</td>
            </tr>
          </tbody>
        </table>
        <p className="tiny muted">Ramwadi case 0041 remains In progress with request Awaiting admin approval. Approval does not imply citizen satisfaction.</p>
      </section>
    </Need>
  )
}

export function AdminHome() {
  const { complaints } = useApp()
  const active = complaints.filter((c) => c.status !== 'solved' && c.status !== 'rejected')
  const solved = complaints.filter((c) => c.status === 'solved')
  const rejected = complaints.filter((c) => c.status === 'rejected')
  const request = complaints.find((c) => c.status === 'in-progress')
  return (
    <Need role="admin">
      <p className="kicker">Administrator workspace · Pune</p>
      <h1>Cases and completion requests</h1>
      <p className="lede">Demo administrator · admin@xyz.ronetenter.org · Review active cases and approve work before publishing a result.</p>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <section className="card pad">
          <div className="stat">{String(active.length).padStart(2, '0')}</div>
          <strong>Active complaints</strong>
          <div className="tiny muted">1 submitted · 1 pending · 1 in progress</div>
        </section>
        <section className="card pad">
          <div className="stat">01</div>
          <strong>Work-done request</strong>
          <div className="tiny muted">Awaiting administrator approval</div>
        </section>
        <section className="card pad">
          <div className="stat">{String(solved.length).padStart(2, '0')}</div>
          <strong>Solved complaints</strong>
          <div className="tiny muted">1 satisfied · 1 awaiting confirmation</div>
        </section>
        <section className="card pad">
          <div className="stat">{String(rejected.length).padStart(2, '0')}</div>
          <strong>Rejected complaint</strong>
          <div className="tiny muted">Reason recorded in case details</div>
        </section>
      </div>
      <section className="card pad" style={{ marginTop: 16 }}>
        <div className="space">
          <h2 style={{ margin: 0 }}>All active cases</h2>
          <button className="ghost" type="button">
            Filters ▾
          </button>
        </div>
        <p className="tiny muted">{active.length} of {active.length} active complaints · Snapshot {SNAPSHOT}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Complaint / hazard</th>
              <th>Locality / reported</th>
              <th>Case status</th>
              <th>Worker / request</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {active.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.id}</strong>
                  <div className="tiny muted">
                    {hazardLabel[c.hazard]}
                    {c.attention === 'high' ? ' · High attention' : ''}
                    {c.potholeId ? ` · ${c.potholeId}` : ''}
                    {c.drainId && c.status === 'in-progress' ? ` · ${c.drainId}` : ''}
                  </div>
                </td>
                <td>
                  {c.locality}
                  {c.pin ? ` · ${c.pin}` : ''}
                  <div className="tiny muted">{c.reportedOn}</div>
                </td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td>
                  {c.status === 'in-progress' ? (
                    <>
                      Demo worker
                      <div className="tiny muted">Awaiting admin approval</div>
                    </>
                  ) : c.status === 'submitted' ? (
                    'No worker assigned'
                  ) : (
                    'No completion request'
                  )}
                </td>
                <td>
                  <Link className="linkish" to={c.status === 'in-progress' ? '/admin/requests/ramwadi' : `/admin/cases/${c.id}`}>
                    {c.status === 'in-progress' ? 'Review work →' : 'Review →'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card pad" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Worker work-done requests</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Request / complaint</th>
              <th>Worker report</th>
              <th>Submitted</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                ILL-REQ-2026-0007
                <div className="tiny muted">
                  {request?.id} · Ramwadi
                </div>
              </td>
              <td>
                Drain cleared; water flow checked
                <div className="tiny muted">worker@xyz.ronetenter.org · Demo account</div>
              </td>
              <td>
                09 Oct 2026
                <div className="tiny muted">11:20 AM IST</div>
              </td>
              <td>
                <Link className="btn" to="/admin/requests/ramwadi">
                  Review request
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="callout">
          <strong>Only administrator approval publishes Solved</strong>
          <div className="tiny muted">The Ramwadi case is still in progress. Submission alone does not resolve it. An approved result is shown to both citizens and workers; citizen satisfaction remains independent.</div>
        </div>
      </section>
      <div className="grid-equal" style={{ marginTop: 16 }}>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Recurring repairs & citizen feedback</h2>
          <p className="muted">Review historical drainhole and pothole repairs, with comments grouped by stable asset ID.</p>
          <Link className="ghost" to="/admin/feedback">
            View asset feedback
          </Link>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Regions & PIN codes</h2>
          <p className="muted">Manage Pune regions and their PIN mappings. A region may be created without a PIN.</p>
          <Link className="ghost" to="/admin/regions">
            Manage regions & PINs
          </Link>
        </section>
      </div>
    </Need>
  )
}

export function AdminReviewCase() {
  const { complaints, updateComplaint } = useApp()
  const { id = '' } = useParams()
  const c = complaints.find((x) => x.id === id) || complaints[0]
  const [reason, setReason] = useState('')
  const nav = useNavigate()
  return (
    <Need role="admin">
      <p className="tiny">
        <Link to="/admin">← Active cases</Link>
      </p>
      <p className="kicker">Administrator workspace · Pune</p>
      <h1>Review a complaint</h1>
      <p className="lede">
        {c.id} · Review the reported site and record a reason if rejecting the complaint.
      </p>
      <div className="grid-2">
        <div className="stack">
          <section className="card pad">
            <h2 style={{ marginTop: 0 }}>{c.id}</h2>
            <div className="row">
              <StatusBadge status={c.status} />
              {c.attention === 'high' && <span className="badge in-progress">High attention</span>}
            </div>
            <p>
              <strong>
                {hazardLabel[c.hazard]} · {c.locality}
                {c.pin ? ` · ${c.pin}` : ''}
              </strong>
            </p>
            <div className="grid-equal">
              <div>
                <div className="tiny muted">Reported site</div>
                <div>{c.site}</div>
                <div className="tiny muted">{c.coords} · Sample location</div>
              </div>
              <div>
                <div className="tiny muted">Illustrative identifiers</div>
                {c.drainId && <div>Drain: {c.drainId}</div>}
                {c.coverId && <div>Cover: {c.coverId}</div>}
                {c.potholeId && <div>Pothole: {c.potholeId}</div>}
              </div>
            </div>
            <p className="tiny muted">
              Submitted {c.reportedOn}
              {c.reportedAt ? `, ${c.reportedAt}` : ''} · No worker assigned
            </p>
          </section>
          <section className="card pad">
            <h3>Complaint description & evidence</h3>
            <p>{c.description}</p>
            <div className="callout">
              {c.photoName} · {c.photoKind === 'normal' ? 'Normal photo' : 'Geotagged photo'} · {c.photoSize}
              <div className="tiny muted">Illustrative attachment · Written description used; no audio attached</div>
            </div>
          </section>
          <div className="callout">
            <strong>Current state is unchanged</strong>
            <div className="tiny muted">This is a rejection draft, not a recorded decision. The case remains {c.status} and included in active complaints until the administrator confirms a decision.</div>
          </div>
        </div>
        <div className="stack">
          <section className="card pad">
            <h3>Reject complaint · Administrator only</h3>
            <span className="badge pending">Draft · Not applied</span>
            <label>
              Rejection reason <span className="req">*</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter a clear reason for the citizen" />
            </label>
            <p className="hint" style={{ color: 'var(--danger)' }}>
              Required before rejection. Explain why this complaint cannot proceed; a reason must not be left blank.
            </p>
            <div className="callout danger">
              <strong>Effect of rejection</strong>
              <div className="tiny">On confirmation, the case becomes Rejected. The reason appears in citizen case details and worker views if an assignment exists. Rejection is not a repair or a Solved result.</div>
            </div>
            <button
              className="btn"
              type="button"
              disabled={!reason.trim()}
              onClick={() => {
                updateComplaint(c.id, { status: 'rejected', rejectionReason: reason, satisfaction: 'not-applicable' })
                nav('/admin')
              }}
            >
              Reject complaint & publish reason
            </button>
            <div style={{ marginTop: 8 }}>
              <Link className="ghost" to="/admin">
                Cancel · Keep Submitted
              </Link>
            </div>
          </section>
          <section className="card pad">
            <h3>Existing rejection · Read only</h3>
            <strong>RNE-PUN-2026-0037 · Pothole</strong>
            <div className="tiny muted">Chandan Nagar · Reported 04 Oct 2026</div>
            <p>
              <span className="badge rejected">Rejected</span>
            </p>
            <p>
              <strong>Recorded reason · Sample text</strong>
              <br />
              The reported location is on a private access lane outside this sample municipal boundary.
            </p>
            <p className="tiny muted">Citizen satisfaction: Not applicable. This existing rejected case is separate from the draft above.</p>
          </section>
        </div>
      </div>
    </Need>
  )
}

export function AdminReviewRequest() {
  const { complaints, updateComplaint } = useApp()
  const c = complaints.find((x) => x.id === 'RNE-PUN-2026-0041') || complaints[2]
  const [statement, setStatement] = useState(
    'Drain blockage cleared and water flow checked at the reported Ramwadi site.',
  )
  const nav = useNavigate()
  return (
    <Need role="admin">
      <p className="tiny">
        <Link to="/admin">← Work-done requests</Link>
      </p>
      <p className="kicker">Administrator workspace · Pune</p>
      <h1>Review the Ramwadi completion request</h1>
      <p className="lede">ILL-REQ-2026-0007 · {c.id} · Pending administrator decision.</p>
      <div className="callout warn">
        <strong>Current case: In progress · Request: Awaiting admin approval</strong>
        <div className="tiny">No resolution has been published. Review the worker's declaration before approving. Only an administrator can change the case to Solved for citizens and workers.</div>
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="stack">
          <section className="card pad">
            <h2 style={{ marginTop: 0 }}>Worker work-done report</h2>
            <div className="space">
              <strong>
                {hazardLabel[c.hazard]} · {c.locality}
              </strong>
              <StatusBadge status={c.status} />
            </div>
            <p className="tiny muted">
              Reported {c.reportedOn} · {c.drainId}
            </p>
            <label>
              Exact work site
              <input value="Ramwadi · Sample footpath, site RMW-009 · Pune, Maharashtra" readOnly />
            </label>
            <p>
              <strong>Worker declaration</strong>
              <br />
              “The blockage has been removed, accumulated waste cleared and water flow checked. The drain is cleared at sample site RMW-009.”
            </p>
            <p className="tiny muted">worker@xyz.ronetenter.org · Demo worker · Request submitted 09 Oct 2026, 11:20 AM IST</p>
          </section>
          <section className="card pad">
            <h3>Assignment record</h3>
            <p>✓ Assignment accepted · 06 Oct 2026 · Worker confirmation</p>
            <p>✓ Raw materials taken · Cleaning tools and disposal bags · No cover replacement</p>
            <p>✓ Work completed · 09 Oct 2026 · Worker declaration, not administrator approval</p>
            <div className="callout">
              <strong>No cap change in this repair</strong>
              <div className="tiny muted">Drain ID ILL-DR-RMW-0009 stays fixed. A new-cover registration is not required because the work was drain clearing, not a cap replacement.</div>
            </div>
          </section>
        </div>
        <div className="stack">
          <section className="card pad">
            <h3>Administrator decision</h3>
            <span className="badge in-progress">Awaiting admin approval</span>
            <label>
              Resolution to publish
              <textarea value={statement} onChange={(e) => setStatement(e.target.value)} />
            </label>
            <p className="tiny muted">Approving publishes this result to the citizen complaint detail and worker assignment/history.</p>
            <button
              className="btn"
              type="button"
              disabled={c.status === 'solved'}
              onClick={() => {
                updateComplaint(c.id, { status: 'solved', satisfaction: 'awaiting-confirmation' })
                nav('/admin')
              }}
            >
              Approve & publish Solved
            </button>
            <p className="tiny muted">Administrator-only control · Illustrative, not yet applied</p>
          </section>
          <section className="card pad">
            <h3>Published result preview</h3>
            <span className="badge pending">Preview only · {c.status === 'solved' ? 'Published' : 'Not published'}</span>
            <p>
              <strong>{c.id}</strong>
              <div className="tiny muted">Citizen view and worker views if after approval</div>
            </p>
            <span className="badge solved">Solved · After approval</span>
            <p>{statement}</p>
            <p>
              <strong>Citizen satisfaction</strong>
              <div>Awaiting confirmation after publication</div>
            </p>
            <div className="callout">
              <strong>Resolution ≠ satisfaction</strong>
              <div className="tiny muted">Approval does not imply citizen satisfaction. Only the citizen's independent confirmation records satisfaction.</div>
            </div>
          </section>
        </div>
      </div>
    </Need>
  )
}

export function AdminFeedback() {
  const { extraAttention, markExtraAttention } = useApp()
  return (
    <Need role="admin">
      <p className="kicker">Administrator workspace · Pune</p>
      <h1>Recurring repairs & asset feedback</h1>
      <p className="lede">Review the most-repaired drainholes and pothole sites, then give recurring assets extra attention.</p>
      <div className="callout">
        <strong>Historical demonstration records · Jul–Sep 2026</strong>
        <div className="tiny muted">Repair counts are past repair events at a stable site, not current complaint counts. These invented records do not indicate that any real Pune area is unusually dangerous.</div>
      </div>
      <div className="grid-equal" style={{ marginTop: 16 }}>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Most-repaired drainholes</h2>
          <p className="tiny muted">Historical repairs · Sorted highest first</p>
          <table className="table">
            <thead>
              <tr>
                <th>Drainhole / sample site</th>
                <th>Repairs</th>
                <th>Last repair</th>
              </tr>
            </thead>
            <tbody>
              {mostRepairedDrains.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.id}
                    <div className="tiny muted">
                      {r.locality} · {r.site}
                    </div>
                  </td>
                  <td>{r.repairs}</td>
                  <td>{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card pad">
          <h2 style={{ marginTop: 0 }}>Most-repaired pothole sites</h2>
          <p className="tiny muted">Historical repairs · Stable site IDs, not cap IDs</p>
          <table className="table">
            <thead>
              <tr>
                <th>Pothole / sample site</th>
                <th>Repairs</th>
                <th>Last repair</th>
              </tr>
            </thead>
            <tbody>
              {mostRepairedPotholes.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.id}
                    <div className="tiny muted">
                      {r.locality} · {r.site}
                    </div>
                  </td>
                  <td>{r.repairs}</td>
                  <td>{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <section className="card pad" style={{ marginTop: 16 }}>
        <div className="space">
          <div>
            <h2 style={{ marginTop: 0 }}>Selected asset · Extra attention</h2>
            <strong>ILL-DR-RMW-0009 · Ramwadi</strong>
            <div className="tiny muted">4 historical repairs · Current case 0041 remains In progress; pending request excluded from count</div>
          </div>
          <button className="ghost" type="button" onClick={() => markExtraAttention('ILL-DR-RMW-0009')}>
            {extraAttention.includes('ILL-DR-RMW-0009') ? 'Extra attention marked' : 'Mark for extra attention'}
          </button>
        </div>
        <p className="tiny muted">Administrator attention applies to this specific sample asset, not to the whole locality.</p>
      </section>
      <section className="card pad" style={{ marginTop: 16 }}>
        <div className="space">
          <h2 style={{ marginTop: 0 }}>Citizen feedback grouped by asset</h2>
          <button className="ghost" type="button">
            Filters ▾
          </button>
        </div>
        <p className="tiny muted">Group: Drainhole / site ID · Latest comments first within each group</p>
        <div className="grid-3">
          {['ILL-DR-RMW-0009', 'ILL-DR-VNZ-0017', 'ILL-DR-SDP-0006'].map((id) => (
            <div key={id}>
              {feedbackSeed
                .filter((f) => f.assetId === id)
                .map((f) => (
                  <div key={f.text} className="list-row">
                    <div>
                      <strong>
                        {id} · {f.locality}
                      </strong>
                      {f.complaintId && <div className="tiny muted">{f.complaintId}</div>}
                      {f.statusHint && <div className="tiny muted">{f.statusHint}</div>}
                      <p>“{f.text}”</p>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
        {feedbackSeed
          .filter((f) => f.assetId === 'ILL-PH-VNZ-0004')
          .map((f) => (
            <p key={f.text}>
              <strong>ILL-PH-VNZ-0004 · Vanaz</strong> · {f.complaintId} · Solved · Citizen Satisfied
              <br />
              {f.date} · {f.title}: “{f.text}”
            </p>
          ))}
      </section>
    </Need>
  )
}

export function AdminRegions() {
  const { regions, addRegion, setRegionPin } = useApp()
  const [name, setName] = useState('Narayan Peth')
  const [pin, setPin] = useState('')
  const [existing, setExisting] = useState('ramwadi')
  const [addPin, setAddPin] = useState('')
  function add(e: FormEvent) {
    e.preventDefault()
    const id = name.toLowerCase().replace(/\s+/g, '-')
    addRegion({ id, name, pin: pin || null })
    setName('')
    setPin('')
  }
  return (
    <Need role="admin">
      <p className="kicker">Administrator workspace · Pune</p>
      <h1>Manage regions & PIN codes</h1>
      <p className="lede">Administrator-only region management · Pune, Maharashtra, India · Sample configuration, not an official postal directory.</p>
      <div className="grid-2">
        <section className="card pad">
          <div className="space">
            <h2 style={{ margin: 0 }}>Existing regions</h2>
            <button className="ghost" type="button">
              Filters ▾
            </button>
          </div>
          <p className="tiny muted">
            {regions.length} sample regions · {regions.filter((r) => r.pin).length} confirmed sample PIN mappings
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>Region</th>
                <th>PIN code</th>
                <th>Mapping state</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.pin || 'Not added'}</td>
                  <td>
                    <span className={`badge ${r.pin ? 'submitted' : 'in-progress'}`}>{r.pin ? 'PIN added' : 'No PIN yet'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tiny muted">Only Hadapsar 411028, Yerwada 411006 and Sadashiv Peth 411030 are supplied sample mappings. Other PINs are intentionally unspecified.</p>
        </section>
        <div className="stack">
          <form className="card pad" onSubmit={add}>
            <h2 style={{ marginTop: 0 }}>Add a region</h2>
            <label>
              Region name <span className="req">*</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              City / state · Fixed
              <input value="Pune, Maharashtra, India" readOnly />
            </label>
            <label>
              PIN code · Optional
              <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Leave blank to add the region without a PIN" />
            </label>
            <p className="hint">If supplied, enter a confirmed 6-digit PIN. No PIN is entered in this demo.</p>
            <div className="callout">
              <strong>Ready to create · Without a PIN</strong>
              <div className="tiny muted">
                {name || 'New region'} will be added with “No PIN yet”. This is a draft; it is not included in the existing region list until you add it.
              </div>
            </div>
            <button className="btn" type="submit">
              Add region
            </button>
          </form>
          <form
            className="card pad"
            onSubmit={(e) => {
              e.preventDefault()
              if (addPin) setRegionPin(existing, addPin)
            }}
          >
            <h2 style={{ marginTop: 0 }}>Add a PIN to an existing region</h2>
            <label>
              Select region <span className="req">*</span>
              <select value={existing} onChange={(e) => setExisting(e.target.value)}>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              PIN code <span className="req">*</span>
              <input value={addPin} onChange={(e) => setAddPin(e.target.value)} placeholder="Enter a confirmed 6-digit PIN" />
            </label>
            <p className="hint">Required to save a PIN mapping. No postal code has been inferred.</p>
            <button className="ghost" type="submit" disabled={!addPin}>
              Add PIN code
            </button>
          </form>
        </div>
      </div>
      <div className="callout" style={{ marginTop: 16 }}>
        <strong>Region and PIN are separate</strong>
        <div className="tiny muted">A region can exist before its PIN is added. Citizen PIN entry stays optional; creating a region without a PIN does not block citizen complaints.</div>
      </div>
    </Need>
  )
}
