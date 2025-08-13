export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: EventType;
  status: EventStatus;
  priority: EventPriority;
  location?: string;
  color?: string;
  userId: string; // User who owns this event
  createdAt: Date;
  updatedAt: Date;
}

export type EventType = 
  | 'reminder'
  | 'meeting'
  | 'task'
  | 'appointment'
  | 'personal';

export type EventStatus = 
  | 'pending'
  | 'completed'
  | 'cancelled';

export type EventPriority = 
  | 'low'
  | 'medium'
  | 'high';

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  date: Date;
}

export interface CalendarFilter {
  types: EventType[];
  statuses: EventStatus[];
  priorities: EventPriority[];
} 