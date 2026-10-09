import type { Attention, CaseStatus, Complaint, Hazard, PhotoKind, Region, Satisfaction, SessionAttachment } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

export type SupabaseAttachmentRow = {
  id: string
  complaint_id: string
  kind: 'photo' | 'audio'
  storage_bucket: string
  storage_path: string
  file_name: string
  mime: string
  size_bytes: number
}

export type SupabaseComplaintRow = {
  id: string
  public_id: string
  citizen_id: string
  hazard: Hazard
  locality: string
  pin: string | null
  status: CaseStatus
  satisfaction: Satisfaction
  attention: Attention
  description: string
  photo_kind: PhotoKind
  site: string
  coords: string
  drain_id: string | null
  cover_id: string | null
  pothole_id: string | null
  worker_assigned: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  complaint_attachments?: SupabaseAttachmentRow[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '09 Oct 2026'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '10:30 AM IST'
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function mapRowToComplaint(row: SupabaseComplaintRow): Complaint {
  const photos = (row.complaint_attachments || [])
    .filter((a) => a.kind === 'photo')
    .map((a) => {
      const { data } = supabase.storage.from(a.storage_bucket).getPublicUrl(a.storage_path)
      return {
        name: a.file_name,
        sizeLabel: formatBytes(a.size_bytes),
        mime: a.mime,
        objectUrl: data.publicUrl,
      } as SessionAttachment
    })

  const audioAttachment = (row.complaint_attachments || []).find((a) => a.kind === 'audio')
  const audio = audioAttachment
    ? ({
        name: audioAttachment.file_name,
        sizeLabel: formatBytes(audioAttachment.size_bytes),
        mime: audioAttachment.mime,
        objectUrl: supabase.storage.from(audioAttachment.storage_bucket).getPublicUrl(audioAttachment.storage_path).data.publicUrl,
      } as SessionAttachment)
    : undefined

  const photoNames = photos.map((p) => p.name).join(', ') || 'photo.jpg'
  const totalPhotoBytes = (row.complaint_attachments || [])
    .filter((a) => a.kind === 'photo')
    .reduce((sum, a) => sum + a.size_bytes, 0)

  return {
    id: row.public_id,
    dbId: row.id,
    citizenId: row.citizen_id,
    hazard: row.hazard,
    locality: row.locality,
    pin: row.pin,
    reportedOn: formatDate(row.created_at),
    reportedAt: formatTime(row.created_at),
    status: row.status,
    satisfaction: row.satisfaction,
    attention: row.attention,
    description: row.description,
    photoName: photoNames,
    photoKind: row.photo_kind,
    photoSize: formatBytes(totalPhotoBytes),
    site: row.site,
    coords: row.coords,
    drainId: row.drain_id || undefined,
    coverId: row.cover_id || undefined,
    potholeId: row.pothole_id || undefined,
    workerAssigned: row.worker_assigned || undefined,
    rejectionReason: row.rejection_reason || undefined,
    audioName: audio?.name,
    photos,
    audio,
  }
}

export async function fetchComplaintsFromSupabase(): Promise<Complaint[] | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, complaint_attachments(*)')
      .order('created_at', { ascending: false })

    if (error || !data) return null
    return data.map(mapRowToComplaint)
  } catch {
    return null
  }
}

export async function fetchRegionsFromSupabase(): Promise<Region[] | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase.from('regions').select('id, name, pin').order('name')

    if (error || !data || data.length === 0) return null
    return data as Region[]
  } catch {
    return null
  }
}

export async function saveComplaintToSupabase(
  c: Complaint,
  citizenUserId: string,
  rawPhotos: File[],
  rawAudio?: { blob: Blob; name: string }
): Promise<Complaint> {
  if (!isSupabaseConfigured) return c

  const complaintUuid = crypto.randomUUID()

  // 1. Upload photos to storage
  const attachmentsToInsert: {
    complaint_id: string
    kind: 'photo' | 'audio'
    storage_bucket: string
    storage_path: string
    file_name: string
    mime: string
    size_bytes: number
  }[] = []

  for (const photoFile of rawPhotos) {
    const cleanFileName = photoFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const path = `${citizenUserId}/${complaintUuid}/${cleanFileName}`
    const { error: uploadErr } = await supabase.storage.from('complaint-photos').upload(path, photoFile, {
      contentType: photoFile.type || 'image/jpeg',
      upsert: true,
    })

    if (uploadErr) {
      console.warn('[DrainGuard] Photo storage upload note:', uploadErr.message)
    } else {
      attachmentsToInsert.push({
        complaint_id: complaintUuid,
        kind: 'photo',
        storage_bucket: 'complaint-photos',
        storage_path: path,
        file_name: photoFile.name,
        mime: photoFile.type || 'image/jpeg',
        size_bytes: photoFile.size,
      })
    }
  }

  // 2. Upload audio if present
  if (rawAudio) {
    const path = `${citizenUserId}/${complaintUuid}/${rawAudio.name}`
    const { error: audioErr } = await supabase.storage.from('complaint-audio').upload(path, rawAudio.blob, {
      contentType: rawAudio.blob.type || 'audio/webm',
      upsert: true,
    })

    if (!audioErr) {
      attachmentsToInsert.push({
        complaint_id: complaintUuid,
        kind: 'audio',
        storage_bucket: 'complaint-audio',
        storage_path: path,
        file_name: rawAudio.name,
        mime: rawAudio.blob.type || 'audio/webm',
        size_bytes: rawAudio.blob.size,
      })
    }
  }

  // 3. Insert complaint row
  const { data: inserted, error: complaintErr } = await supabase
    .from('complaints')
    .insert({
      id: complaintUuid,
      public_id: c.id,
      citizen_id: citizenUserId,
      hazard: c.hazard,
      locality: c.locality,
      pin: c.pin || null,
      status: c.status,
      satisfaction: c.satisfaction,
      attention: c.attention,
      description: c.description,
      photo_kind: c.photoKind,
      site: c.site,
      coords: c.coords,
      drain_id: c.drainId || null,
      cover_id: c.coverId || null,
      pothole_id: c.potholeId || null,
      worker_assigned: c.workerAssigned || null,
      rejection_reason: c.rejectionReason || null,
    })
    .select('*, complaint_attachments(*)')
    .single()

  if (complaintErr) {
    throw new Error(complaintErr.message)
  }

  // 4. Insert attachments rows
  if (attachmentsToInsert.length > 0) {
    await supabase.from('complaint_attachments').insert(attachmentsToInsert)
  }

  return inserted ? mapRowToComplaint(inserted) : c
}

export async function updateComplaintInSupabase(id: string, patch: Partial<Complaint>): Promise<void> {
  if (!isSupabaseConfigured) return

  const dbPatch: Record<string, any> = {}
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.satisfaction !== undefined) dbPatch.satisfaction = patch.satisfaction
  if (patch.attention !== undefined) dbPatch.attention = patch.attention
  if (patch.workerAssigned !== undefined) dbPatch.worker_assigned = patch.workerAssigned
  if (patch.rejectionReason !== undefined) dbPatch.rejection_reason = patch.rejectionReason

  if (Object.keys(dbPatch).length === 0) return

  await supabase
    .from('complaints')
    .update(dbPatch)
    .or(`id.eq.${id},public_id.eq.${id}`)
}
