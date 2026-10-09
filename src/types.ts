export type Role = 'citizen' | 'worker' | 'admin'
export type Hazard = 'open-drain' | 'overflowing-drain' | 'pothole'
export type CaseStatus = 'submitted' | 'pending' | 'in-progress' | 'solved' | 'rejected'
export type Satisfaction = 'not-yet-resolved' | 'awaiting-confirmation' | 'satisfied' | 'not-applicable' | 'not-satisfied'
export type Attention = 'high' | 'moderate' | 'low'
export type PhotoKind = 'geotagged' | 'normal'

/** Browser-session preview only. Object URLs are not stored on a server. */
export type SessionAttachment = {
  name: string
  sizeLabel: string
  mime: string
  objectUrl: string
}

export type Session = {
  role: Role
  name: string
  contact: string
}

export type Region = {
  id: string
  name: string
  pin: string | null
}

export type Complaint = {
  id: string
  hazard: Hazard
  locality: string
  pin: string | null
  reportedOn: string
  reportedAt?: string
  status: CaseStatus
  satisfaction: Satisfaction
  attention: Attention
  description: string
  photoName: string
  photoKind: PhotoKind
  photoSize: string
  site: string
  coords: string
  drainId?: string
  coverId?: string
  potholeId?: string
  workerAssigned?: string
  rejectionReason?: string
  audioName?: string
  photos?: SessionAttachment[]
  audio?: SessionAttachment
}

export type Assignment = {
  id: string
  title: string
  subtitle: string
  siteId: string
  siteLabel: string
  progress: string
  action: string
  actionTo: string
}

export type RepairRecord = {
  date: string
  id: string
  work: string
  outcome: string
}

export type FeedbackItem = {
  date: string
  title: string
  related?: string
  text: string
  assetId: string
  locality: string
  complaintId?: string
  statusHint?: string
}
