import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { StatusBadge } from './components'
import { useApp } from './context'
import { attentionLabel, hazardLabel, sampleSiteByRegion, satisfactionLabel } from './data'
import { saveComplaintToSupabase } from './lib/api'
import { isSupabaseConfigured } from './lib/supabase'
import type { Attention, CaseStatus, Complaint, Hazard, PhotoKind, SessionAttachment } from './types'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_BYTES = 10 * 1024 * 1024
const MAX_PHOTOS = 8
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.aac', '.opus']
const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
const AUDIO_MIMES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a',
  'audio/opus',
])

type PhotoItem = { id: string; file: File; url: string }
type AudioItem = { id: string; blob: Blob; name: string; url: string; source: 'record' | 'upload' }

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileExt(name: string) {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

function isAllowedImage(file: File) {
  const mime = file.type ? file.type.toLowerCase() : ''
  const ext = fileExt(file.name)
  const commonImgExts = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.pjpeg', '.pjp', '.gif', '.bmp', '.heic', '.heif', '.svg']
  return mime.startsWith('image/') || IMAGE_MIMES.has(mime) || commonImgExts.includes(ext)
}

function isAllowedAudio(file: File) {
  const mime = file.type.toLowerCase()
  const ext = fileExt(file.name)
  return mime.startsWith('audio/') || AUDIO_MIMES.has(mime) || AUDIO_EXTS.includes(ext)
}

function toSessionAttachment(name: string, blob: Blob, url: string): SessionAttachment {
  return { name, sizeLabel: formatSize(blob.size), mime: blob.type || 'application/octet-stream', objectUrl: url }
}

function newId() {
  return crypto.randomUUID()
}

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
                  <Link to={`/status?id=${c.id}`} style={{ fontWeight: 700 }}>
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
  photoKind: PhotoKind
  attention: Attention
}

const emptyDraft: Draft = {
  regionId: 'hadapsar',
  pin: '411028',
  hazard: 'open-drain',
  locationOn: false,
  description: '',
  photoKind: 'normal',
  attention: 'high',
}

export function FileComplaintPage() {
  const { session, regions, addComplaint } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [descMode, setDescMode] = useState<'written' | 'audio'>('written')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [audio, setAudio] = useState<AudioItem | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [audioError, setAudioError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [recording, setRecording] = useState(false)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const photosRef = useRef<PhotoItem[]>([])
  const audioRef = useRef<AudioItem | null>(null)
  const keepUrlsRef = useRef<string[]>([])
  const pageLiveRef = useRef(true)

  useEffect(() => {
    photosRef.current = photos
    audioRef.current = audio
  }, [photos, audio])

  useEffect(() => {
    pageLiveRef.current = true
    return () => {
      pageLiveRef.current = false
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop()
        } catch {
          /* already stopped */
        }
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      const keep = new Set(keepUrlsRef.current)
      for (const p of photosRef.current) {
        if (!keep.has(p.url)) URL.revokeObjectURL(p.url)
      }
      const currentAudio = audioRef.current
      if (currentAudio && !keep.has(currentAudio.url)) URL.revokeObjectURL(currentAudio.url)
    }
  }, [])

  function stopMicTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function clearAudio(next: AudioItem | null) {
    if (audioRef.current && audioRef.current.url !== next?.url) {
      URL.revokeObjectURL(audioRef.current.url)
    }
    audioRef.current = next
    setAudio(next)
  }

  if (!session || session.role !== 'citizen') return <Navigate to="/login?role=citizen" replace />

  const region = regions.find((r) => r.id === draft.regionId)
  const site = sampleSiteByRegion[draft.regionId] || sampleSiteByRegion.hadapsar
  const canStep2 = Boolean(draft.regionId && draft.hazard && draft.locationOn)
  const canStep3 = Boolean(draft.description.trim() || audio)
  const recordingSupported = typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)

  function onPhotosSelected(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files
    e.target.value = ''
    if (!list?.length) return
    setPhotoError('')
    const messages: string[] = []
    const additions: PhotoItem[] = []
    let remaining = MAX_PHOTOS - photosRef.current.length
    if (remaining <= 0) {
      setPhotoError(`You can attach up to ${MAX_PHOTOS} photos.`)
      return
    }
    for (const file of Array.from(list)) {
      if (remaining <= 0) {
        messages.push(`Only ${MAX_PHOTOS} photos are allowed. Extra files were skipped.`)
        break
      }
      if (!isAllowedImage(file)) {
        messages.push(`${file.name}: use JPEG, PNG, or WebP.`)
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        messages.push(`${file.name}: larger than 5 MB (${formatSize(file.size)}).`)
        continue
      }
      additions.push({ id: newId(), file, url: URL.createObjectURL(file) })
      remaining -= 1
    }
    if (additions.length) {
      const next = [...photosRef.current, ...additions]
      photosRef.current = next
      setPhotos(next)
    }
    if (messages.length) setPhotoError(messages.join(' '))
  }

  function removePhoto(id: string) {
    const target = photosRef.current.find((p) => p.id === id)
    if (target) URL.revokeObjectURL(target.url)
    const next = photosRef.current.filter((p) => p.id !== id)
    photosRef.current = next
    setPhotos(next)
    setPhotoError('')
  }

  function onAudioSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAudioError('')
    if (!isAllowedAudio(file)) {
      setAudioError(`${file.name}: use an audio file such as MP3, WAV, OGG, WebM, or M4A.`)
      return
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setAudioError(`${file.name}: larger than 10 MB (${formatSize(file.size)}).`)
      return
    }
    clearAudio({ id: newId(), blob: file, name: file.name, url: URL.createObjectURL(file), source: 'upload' })
  }

  async function startRecording() {
    setAudioError('')
    if (!recordingSupported) {
      setAudioError('This browser cannot record from the microphone. Upload an audio file instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data)
      }
      rec.onerror = () => {
        stopMicTracks()
        if (!pageLiveRef.current) return
        setAudioError('Recording failed. Try again or upload an audio file.')
        setRecording(false)
      }
      rec.onstop = () => {
        const type = rec.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        stopMicTracks()
        recorderRef.current = null
        if (!pageLiveRef.current) return
        setRecording(false)
        if (blob.size === 0) {
          setAudioError('No audio was captured. Try recording again or upload a file.')
          return
        }
        if (blob.size > MAX_AUDIO_BYTES) {
          setAudioError(`Recording is larger than 10 MB (${formatSize(blob.size)}).`)
          return
        }
        const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm'
        clearAudio({
          id: newId(),
          blob,
          name: `complaint-recording.${ext}`,
          url: URL.createObjectURL(blob),
          source: 'record',
        })
      }
      recorderRef.current = rec
      rec.start()
      setRecording(true)
    } catch (err) {
      stopMicTracks()
      if (!pageLiveRef.current) return
      setRecording(false)
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setAudioError('Microphone permission was denied. You can still upload an audio file.')
        return
      }
      if (name === 'NotFoundError') {
        setAudioError('No microphone was found. Upload an audio file instead.')
        return
      }
      setAudioError('Could not start the microphone. Upload an audio file instead.')
    }
  }

  function stopRecording() {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    else {
      setRecording(false)
      stopMicTracks()
    }
  }

  function goToStep(next: number) {
    if (recording) stopRecording()
    setStep(next)
  }

  async function submit() {
    if (submitting) return
    setSubmitError('')
    if (recording) {
      setSubmitError('Stop the recording before submitting.')
      return
    }
    if (!photos.length) {
      setSubmitError('Add at least one photo before submitting.')
      return
    }
    if (!draft.description.trim() && !audio) {
      setSubmitError('Add a written description or an audio description.')
      return
    }
    setSubmitting(true)
    try {
      const n = 50 + Math.floor(Math.random() * 40)
      const id = `RNE-PUN-2026-00${n}`
      const photoAttachments = photos.map((p) => toSessionAttachment(p.file.name, p.file, p.url))
      const audioAttachment = audio ? toSessionAttachment(audio.name, audio.blob, audio.url) : undefined
      keepUrlsRef.current = [...photoAttachments.map((p) => p.objectUrl), audioAttachment?.objectUrl].filter(
        (u): u is string => Boolean(u),
      )

      const baseComplaint: Complaint = {
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
          draft.description.trim() ||
          'Audio description provided. Location remains compulsory for both written and audio paths.',
        photoName: photos.map((p) => p.file.name).join(', '),
        photoKind: draft.photoKind,
        photoSize: formatSize(photos.reduce((sum, p) => sum + p.file.size, 0)),
        site: site.site,
        coords: site.coords,
        drainId: draft.hazard === 'pothole' ? undefined : site.drainId,
        coverId: draft.hazard === 'pothole' ? undefined : site.coverId,
        potholeId: draft.hazard === 'pothole' ? 'ILL-PH-VNZ-0004' : undefined,
        audioName: audio?.name,
        photos: photoAttachments,
        audio: audioAttachment,
      }

      let finalComplaint = baseComplaint
      if (isSupabaseConfigured && session?.id) {
        finalComplaint = await saveComplaintToSupabase(
          baseComplaint,
          session.id,
          photos.map((p) => p.file),
          audio ? { blob: audio.blob, name: audio.name } : undefined
        )
      }

      addComplaint(finalComplaint)
      nav(`/complaints/submitted?id=${finalComplaint.id}`)
    } catch (err: any) {
      setSubmitting(false)
      keepUrlsRef.current = []
      setSubmitError(err?.message || 'Could not prepare this complaint. Try again.')
    }
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
              <button className="ghost" type="button" disabled={!canStep2} onClick={() => goToStep(2)}>
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
              <strong>Prefer to speak? Record or upload audio</strong>
              <div className="tiny muted">
                For citizens who cannot write. Audio stays in this browser session only until a later stage saves it. MP3, WAV,
                OGG, WebM, or M4A · up to 10 MB.
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a,.aac"
                hidden
                onChange={onAudioSelected}
              />
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {recording ? (
                  <button className="btn" type="button" onClick={stopRecording}>
                    Stop recording
                  </button>
                ) : (
                  <button className="btn" type="button" onClick={() => void startRecording()} disabled={!recordingSupported}>
                    Record with microphone
                  </button>
                )}
                <button className="ghost" type="button" onClick={() => audioInputRef.current?.click()} disabled={recording}>
                  Choose audio file
                </button>
              </div>
              {recording && (
                <p className="hint" style={{ color: 'var(--danger)' }}>
                  Recording… speak clearly, then press Stop recording. Next step is disabled until you stop.
                </p>
              )}
              {!recordingSupported && (
                <p className="hint">Microphone recording is not available here. Use Choose audio file instead.</p>
              )}
              {audio && (
                <div style={{ marginTop: 12 }}>
                  <audio controls src={audio.url} style={{ width: '100%', maxWidth: 420 }}>
                    Your browser cannot play this audio clip.
                  </audio>
                  <div className="tiny muted">
                    {audio.name} · {formatSize(audio.blob.size)} · {audio.source === 'record' ? 'Recorded' : 'Uploaded'} · this
                    session only
                  </div>
                  <button
                    className="ghost"
                    type="button"
                    style={{ marginTop: 8 }}
                    onClick={() => clearAudio(null)}
                    disabled={recording}
                  >
                    Remove audio
                  </button>
                </div>
              )}
              {!audio && !recording && <div className="tiny muted">No audio attached</div>}
              {audioError && (
                <p className="hint" style={{ color: 'var(--danger)' }}>
                  {audioError}
                </p>
              )}
            </div>
            <div className="space" style={{ marginTop: 16 }}>
              <button className="ghost" type="button" onClick={() => goToStep(1)}>
                Back: locality & location
              </button>
              <button className="btn" type="button" disabled={!canStep3 || recording} onClick={() => goToStep(3)}>
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
            <div
              className="callout"
              style={{ marginTop: 12, cursor: 'pointer', border: '2px dashed var(--border, #ccc)' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const files = e.dataTransfer.files
                if (files && files.length) {
                  const fakeEvent = { target: { files, value: '' } } as unknown as ChangeEvent<HTMLInputElement>
                  onPhotosSelected(fakeEvent)
                }
              }}
              onClick={() => photoInputRef.current?.click()}
            >
              <strong>Add photo proof *</strong>
              <div className="tiny muted">
                Click or drag & drop photos here (JPEG, PNG, WebP, HEIC · up to 5 MB each · up to {MAX_PHOTOS} photos).
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.pjpeg,.heic,.heif"
                multiple
                hidden
                onChange={onPhotosSelected}
              />
              <button className="ghost" type="button" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}>
                {photos.length ? 'Add more photos' : 'Choose photos'}
              </button>
            </div>
            {photos.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {photos.map((p) => (
                  <div key={p.id} className="card pad" style={{ padding: 8 }}>
                    <img
                      src={p.url}
                      alt={p.file.name}
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                    />
                    <div className="tiny" style={{ marginTop: 6, wordBreak: 'break-all' }}>
                      {p.file.name}
                    </div>
                    <div className="tiny muted">{formatSize(p.file.size)}</div>
                    <button className="ghost" type="button" style={{ marginTop: 6, width: '100%' }} onClick={() => removePhoto(p.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photoError && (
              <p className="hint" style={{ color: 'var(--danger)' }}>
                {photoError}
              </p>
            )}
            <h2>Attention level *</h2>
            <div className="grid-3">
              {(['high', 'moderate', 'low'] as Attention[]).map((a) => (
                <button key={a} type="button" className={`choice ${draft.attention === a ? 'on' : ''}`} onClick={() => setDraft({ ...draft, attention: a })}>
                  {attentionLabel[a]}
                </button>
              ))}
            </div>
            <p className="hint">Citizen-selected attention level. This does not imply a response-time commitment.</p>
            {submitError && (
              <p className="hint" style={{ color: 'var(--danger)' }}>
                {submitError}
              </p>
            )}
            {submitting && <p className="callout">Preparing your complaint in this browser session…</p>}
            <div className="space" style={{ marginTop: 16 }}>
              <button className="ghost" type="button" onClick={() => goToStep(2)} disabled={submitting}>
                Back: description
              </button>
              <button className="btn" type="button" onClick={submit} disabled={submitting || recording || photos.length === 0}>
                {submitting ? 'Submitting…' : 'Submit complaint'}
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
            <p>
              {draft.description.trim()
                ? 'Written description provided'
                : audio
                  ? 'Audio description provided'
                  : 'Pending'}
            </p>
            <div className="tiny muted">Photo</div>
            <p>
              {photos.length
                ? `${photos.length} photo${photos.length === 1 ? '' : 's'} selected · ${draft.photoKind === 'normal' ? 'Normal' : 'Geotagged'}`
                : 'No photo yet'}
            </p>
            {audio && <p className="tiny muted">Audio: {audio.name}</p>}
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
          <strong>Site and evidence recorded in this session</strong>
          <div className="tiny muted">
            {c.site}
            {c.drainId ? ` · ${c.drainId}` : ''}
            {c.coverId ? ` / ${c.coverId}` : ''} (illustrative). Files below are held in this browser tab only — they are not
            uploaded to a server yet. Refreshing the page will clear a newly filed complaint.
          </div>
        </div>
        {c.photos && c.photos.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
              margin: '12px 0',
            }}
          >
            {c.photos.map((p) => (
              <div key={p.objectUrl}>
                <img
                  src={p.objectUrl}
                  alt={p.name}
                  style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                />
                <div className="tiny muted" style={{ wordBreak: 'break-all' }}>
                  {p.name} · {p.sizeLabel}
                </div>
              </div>
            ))}
          </div>
        )}
        {c.audio && (
          <div style={{ marginBottom: 12 }}>
            <audio controls src={c.audio.objectUrl} style={{ width: '100%' }}>
              Your browser cannot play this audio clip.
            </audio>
            <div className="tiny muted">
              {c.audio.name} · {c.audio.sizeLabel}
            </div>
          </div>
        )}
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

