import type { Assignment, Complaint, FeedbackItem, Region, RepairRecord } from './types'

export const MUNICIPAL_DOMAIN = 'xyz.ronetenter.org'
export const SNAPSHOT = '09 Oct 2026'
export const CITY = 'Pune, Maharashtra, India'

export const regionsSeed: Region[] = [
  { id: 'hadapsar', name: 'Hadapsar', pin: '411028' },
  { id: 'yerwada', name: 'Yerwada', pin: '411006' },
  { id: 'chandan-nagar', name: 'Chandan Nagar', pin: null },
  { id: 'vanaz', name: 'Vanaz', pin: null },
  { id: 'ramwadi', name: 'Ramwadi', pin: null },
  { id: 'sadashiv-peth', name: 'Sadashiv Peth', pin: '411030' },
  { id: 'shaniwar-peth', name: 'Shaniwar Peth', pin: null },
  { id: 'narayan-peth', name: 'Narayan Peth', pin: null },
  { id: 'kasba-peth', name: 'Kasba Peth', pin: null },
]

export const complaintsSeed: Complaint[] = [
  {
    id: 'RNE-PUN-2026-0048',
    hazard: 'open-drain',
    locality: 'Hadapsar',
    pin: '411028',
    reportedOn: '09 Oct 2026',
    reportedAt: '10:30 AM IST',
    status: 'submitted',
    satisfaction: 'not-yet-resolved',
    attention: 'high',
    description:
      'An open drain cover is missing beside the footpath near Gadital bus stop in Hadapsar. The opening is close to the road edge and becomes difficult to see when rainwater pools around it. Please inspect the identified drainhole.',
    photoName: 'hadapsar-drain-photo.jpg',
    photoKind: 'normal',
    photoSize: '2.4 MB',
    site: 'Near Gadital bus stop, Hadapsar, Pune, Maharashtra · 411028',
    coords: '18.5024° N, 73.9271° E',
    drainId: 'ILL-DR-HDP-0142',
    coverId: 'ILL-DC-HDP-0142',
  },
  {
    id: 'RNE-PUN-2026-0046',
    hazard: 'pothole',
    locality: 'Yerwada',
    pin: '411006',
    reportedOn: '08 Oct 2026',
    status: 'pending',
    satisfaction: 'not-yet-resolved',
    attention: 'moderate',
    description: 'Road damage and rainwater pooling that hides a road hazard on the sample Yerwada stretch.',
    photoName: 'yerwada-pothole.jpg',
    photoKind: 'normal',
    photoSize: '1.8 MB',
    site: 'Sample road site YRW-021, Yerwada',
    coords: '18.5520° N, 73.8770° E',
    potholeId: 'ILL-PH-YRW-0021',
  },
  {
    id: 'RNE-PUN-2026-0041',
    hazard: 'overflowing-drain',
    locality: 'Ramwadi',
    pin: null,
    reportedOn: '06 Oct 2026',
    status: 'in-progress',
    satisfaction: 'not-yet-resolved',
    attention: 'high',
    description: 'Drain water overflowing onto the road at the Ramwadi sample footpath.',
    photoName: 'ramwadi-overflow.jpg',
    photoKind: 'geotagged',
    photoSize: '3.1 MB',
    site: 'Ramwadi · Sample footpath, site RMW-009',
    coords: '18.5528° N, 73.9102° E',
    drainId: 'ILL-DR-RMW-0009',
    coverId: 'ILL-DC-RMW-0009',
    workerAssigned: 'worker@xyz.ronetenter.org',
  },
  {
    id: 'RNE-PUN-2026-0037',
    hazard: 'pothole',
    locality: 'Chandan Nagar',
    pin: null,
    reportedOn: '04 Oct 2026',
    status: 'rejected',
    satisfaction: 'not-applicable',
    attention: 'low',
    description: 'Reported location is on a private access lane outside this sample municipal boundary.',
    photoName: 'chandan-pothole.jpg',
    photoKind: 'normal',
    photoSize: '1.2 MB',
    site: 'Chandan Nagar · sample private access lane',
    coords: '18.5610° N, 73.9340° E',
    potholeId: 'ILL-PH-CNG-0010',
    rejectionReason:
      'The reported location is on a private access lane outside this sample municipal boundary.',
  },
  {
    id: 'RNE-PUN-2026-0032',
    hazard: 'open-drain',
    locality: 'Sadashiv Peth',
    pin: '411030',
    reportedOn: '02 Oct 2026',
    status: 'solved',
    satisfaction: 'awaiting-confirmation',
    attention: 'moderate',
    description: 'Open drain at Sadashiv Peth sample site, now marked solved pending citizen confirmation.',
    photoName: 'sadashiv-drain.jpg',
    photoKind: 'normal',
    photoSize: '2.0 MB',
    site: 'Sadashiv Peth · Site SDP-006',
    coords: '18.5089° N, 73.8478° E',
    drainId: 'ILL-DR-SDP-0006',
    coverId: 'ILL-DC-SDP-0006',
  },
  {
    id: 'RNE-PUN-2026-0028',
    hazard: 'pothole',
    locality: 'Vanaz',
    pin: null,
    reportedOn: '01 Oct 2026',
    status: 'solved',
    satisfaction: 'satisfied',
    attention: 'moderate',
    description: 'Pothole at Vanaz sample road, citizen marked satisfied.',
    photoName: 'vanaz-pothole.jpg',
    photoKind: 'geotagged',
    photoSize: '2.2 MB',
    site: 'Vanaz · Sample road site VNZ-004',
    coords: '18.5082° N, 73.8180° E',
    potholeId: 'ILL-PH-VNZ-0004',
  },
]

export const assignmentsSeed: Assignment[] = [
  {
    id: 'ILL-MNT-2026-0012',
    title: 'Visit the Vanaz drain',
    subtitle: 'ILL-MNT-2026-0012 · Maintenance',
    siteId: 'ILL-DR-VNZ-0017',
    siteLabel: 'Vanaz · Sample service lane, site VNZ-017',
    progress: 'Assignment accepted',
    action: 'Open assignment',
    actionTo: '/worker/assignments/vanaz',
  },
  {
    id: 'ILL-MNT-2026-0012-B',
    title: 'Maintain drain · Replace cover',
    subtitle: 'ILL-MNT-2026-0012 · Next step',
    siteId: 'ILL-DR-VNZ-0017',
    siteLabel: 'Old cover: ILL-DC-VNZ-0017-A',
    progress: 'New cover ID required',
    action: 'Collect materials',
    actionTo: '/worker/assignments/vanaz',
  },
  {
    id: 'RNE-PUN-2026-0041',
    title: 'Repair overflowing drain',
    subtitle: 'RNE-PUN-2026-0041 · Ramwadi',
    siteId: 'ILL-DR-RMW-0009',
    siteLabel: 'Ramwadi · Sample footpath, site RMW-009',
    progress: 'Awaiting admin approval',
    action: 'View request',
    actionTo: '/worker/assignments/vanaz#ramwadi',
  },
]

export const vanazRepairs: RepairRecord[] = [
  { date: '22 Sep 2026', id: 'ILL-HIST-VNZ-003', work: 'Cover seating adjusted; mortar renewed.', outcome: 'Recorded' },
  { date: '18 Aug 2026', id: 'ILL-HIST-VNZ-002', work: 'Drain opening cleaned; silt removed.', outcome: 'Recorded' },
  { date: '10 Jul 2026', id: 'ILL-HIST-VNZ-001', work: 'Cover inspected and re-seated.', outcome: 'Recorded' },
]

export const feedbackSeed: FeedbackItem[] = [
  {
    date: '25 Sep 2026',
    title: 'After seating repair',
    related: 'ILL-HIST-VNZ-003',
    text: 'The cover sits better, but it still moves when a vehicle passes. Please inspect the fitting again.',
    assetId: 'ILL-DR-VNZ-0017',
    locality: 'Vanaz',
    statusHint: 'Maintenance · Demo',
  },
  {
    date: '20 Aug 2026',
    title: 'After cleaning',
    related: 'ILL-HIST-VNZ-002',
    text: 'Water drained away after cleaning. Thank you for clearing the opening.',
    assetId: 'ILL-DR-VNZ-0017',
    locality: 'Vanaz',
  },
  {
    date: '08 Oct 2026',
    title: 'Sample case feedback',
    text: 'Water is still collecting at the footpath edge. Please check the flow after clearing.',
    assetId: 'ILL-DR-RMW-0009',
    locality: 'Ramwadi',
    complaintId: 'RNE-PUN-2026-0041',
    statusHint: 'Not yet resolved',
  },
  {
    date: '07 Oct 2026',
    title: 'Sample case feedback',
    text: 'The opening has been covered. I will check the fit again after the next rain.',
    assetId: 'ILL-DR-SDP-0006',
    locality: 'Sadashiv Peth',
    complaintId: 'RNE-PUN-2026-0032',
    statusHint: 'Awaiting confirmation',
  },
  {
    date: '03 Oct 2026',
    title: 'Sample comment',
    text: 'The road patch is level now. Thank you for the repair.',
    assetId: 'ILL-PH-VNZ-0004',
    locality: 'Vanaz',
    complaintId: 'RNE-PUN-2026-0028',
    statusHint: 'Citizen Satisfied',
  },
]

export const mostRepairedDrains = [
  { id: 'ILL-DR-RMW-0009', locality: 'Ramwadi', site: 'Footpath, site RMW-009', repairs: 4, last: '15 Sep 2026' },
  { id: 'ILL-DR-VNZ-0017', locality: 'Vanaz', site: 'Service lane, site VNZ-017', repairs: 3, last: '22 Sep 2026' },
  { id: 'ILL-DR-SDP-0006', locality: 'Sadashiv Peth', site: 'Site SDP-006', repairs: 2, last: '12 Sep 2026' },
]

export const mostRepairedPotholes = [
  { id: 'ILL-PH-YRW-0021', locality: 'Yerwada', site: 'Sample road site YRW-021', repairs: 5, last: '20 Sep 2026' },
  { id: 'ILL-PH-VNZ-0004', locality: 'Vanaz', site: 'Sample road site VNZ-004', repairs: 3, last: '10 Sep 2026' },
  { id: 'ILL-PH-CNG-0010', locality: 'Chandan Nagar', site: 'Site CNG-010', repairs: 2, last: '08 Sep 2026' },
]

export const sampleSiteByRegion: Record<string, { site: string; coords: string; drainId: string; coverId: string }> = {
  hadapsar: {
    site: 'Near Gadital bus stop, Hadapsar, Pune · 411028',
    coords: '18.5024° N, 73.9271° E',
    drainId: 'ILL-DR-HDP-0142',
    coverId: 'ILL-DC-HDP-0142',
  },
  yerwada: {
    site: 'Sample road site YRW-021, Yerwada',
    coords: '18.5520° N, 73.8770° E',
    drainId: 'ILL-DR-YRW-0021',
    coverId: 'ILL-DC-YRW-0021',
  },
  vanaz: {
    site: 'Vanaz · Sample service lane, site VNZ-017',
    coords: '18.5082° N, 73.8180° E',
    drainId: 'ILL-DR-VNZ-0017',
    coverId: 'ILL-DC-VNZ-0017',
  },
  ramwadi: {
    site: 'Ramwadi · Sample footpath, site RMW-009',
    coords: '18.5528° N, 73.9102° E',
    drainId: 'ILL-DR-RMW-0009',
    coverId: 'ILL-DC-RMW-0009',
  },
  'sadashiv-peth': {
    site: 'Sadashiv Peth · Site SDP-006',
    coords: '18.5089° N, 73.8478° E',
    drainId: 'ILL-DR-SDP-0006',
    coverId: 'ILL-DC-SDP-0006',
  },
}

export const hazardLabel: Record<Complaint['hazard'], string> = {
  'open-drain': 'Open drain',
  'overflowing-drain': 'Overflowing drain',
  pothole: 'Pothole',
}

export const statusLabel: Record<Complaint['status'], string> = {
  submitted: 'Submitted',
  pending: 'Pending',
  'in-progress': 'In progress',
  solved: 'Solved',
  rejected: 'Rejected',
}

export const satisfactionLabel: Record<Complaint['satisfaction'], string> = {
  'not-yet-resolved': 'Not yet resolved',
  'awaiting-confirmation': 'Awaiting confirmation',
  satisfied: 'Satisfied',
  'not-applicable': 'Not applicable',
  'not-satisfied': 'Not satisfied',
}

export const attentionLabel: Record<Complaint['attention'], string> = {
  high: 'High attention',
  moderate: 'Moderate attention',
  low: 'Low attention',
}
