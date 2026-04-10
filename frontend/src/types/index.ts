export type Role = 'ADMIN' | 'ORGANIZER' | 'GOVERNANCE' | 'SPEAKER' | 'AUDIENCE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  title?: string;
  phone?: string;
  linkedIn?: string;
  headshotUrl?: string;
  notifFrequency: string;
  notifMechanism: string;
  preferredTypes: string;
}

export interface Session {
  id: string;
  eventId: string;
  topic: string;
  topicBrief: string;
  startTime: string;
  endTime: string;
  speakerName: string;
  speakerTitle?: string;
  speakerLinkedIn?: string;
  speakerHeadshot?: string;
  sortOrder: number;
}

export interface OrgGroup {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  _count?: { members: number; events: number };
  children?: OrgGroup[];
}

export interface EventGroup {
  id: string;
  eventId: string;
  groupId: string;
  group: OrgGroup;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  user?: { id: string; name: string; email: string };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string;
  venue?: string;
  bridgeLink?: string;
  organizerId?: string;
  speakerId: string;
  createdAt: string;
  updatedAt: string;
  speaker: { id: string; name: string; email?: string; title?: string; linkedIn?: string; headshotUrl?: string };
  organizer?: { id: string; name: string };
  sessions: Session[];
  groups: EventGroup[];
  registrations?: Registration[];
  _count?: { registrations: number };
}

export interface Campaign {
  id: string;
  eventId: string;
  channel: string;
  targetGroup: string;
  message: string;
  scheduledAt: string;
  status: string;
  sentAt?: string;
  event: { id: string; title: string; startDate?: string };
  createdBy: { id: string; name: string };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  user: { id: string; name: string; email: string };
  createdAt: string;
}

export interface AccessGrant {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  user: { id: string; name: string; email: string };
  group: { id: string; name: string; type: string };
}

export interface AppConfig {
  id: string;
  key: string;
  value: string;
}
