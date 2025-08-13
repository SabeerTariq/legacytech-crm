import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: 'reminder' | 'meeting' | 'task' | 'appointment' | 'personal';
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export class CalendarService {
  /**
   * Get all events for the current user
   */
  static async getEvents(): Promise<CalendarEvent[]> {
    try {
      // Get user from localStorage (custom auth system)
      const storedUser = localStorage.getItem('crm_user');
      if (!storedUser) {
        console.log('No user found in localStorage');
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);
      if (!user || !user.id) {
        console.log('Invalid user data in localStorage');
        throw new Error('User not authenticated');
      }

      console.log('Fetching events for user:', user.id);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Successfully fetched events:', data?.length || 0);

      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        allDay: event.all_day,
        type: event.type,
        status: event.status,
        priority: event.priority,
        location: event.location,
        color: event.color,
        userId: event.user_id,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    try {
      // Get user from localStorage (custom auth system)
      const storedUser = localStorage.getItem('crm_user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      console.log('Creating event for user:', user.id, 'Event data:', eventData);

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.startDate.toISOString(),
          end_date: eventData.endDate.toISOString(),
          all_day: eventData.allDay,
          type: eventData.type,
          status: eventData.status,
          priority: eventData.priority,
          location: eventData.location,
          color: eventData.color,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating event:', error);
        throw error;
      }

      console.log('Successfully created event:', data);

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        allDay: data.all_day,
        type: data.type,
        status: data.status,
        priority: data.priority,
        location: data.location,
        color: data.color,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(eventData: UpdateEventData): Promise<CalendarEvent> {
    try {
      // Get user from localStorage (custom auth system)
      const storedUser = localStorage.getItem('crm_user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const updateData: Partial<{
        title: string;
        description: string;
        start_date: string;
        end_date: string;
        all_day: boolean;
        type: string;
        status: string;
        priority: string;
        location: string;
        color: string;
      }> = {};
      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.startDate !== undefined) updateData.start_date = eventData.startDate.toISOString();
      if (eventData.endDate !== undefined) updateData.end_date = eventData.endDate.toISOString();
      if (eventData.allDay !== undefined) updateData.all_day = eventData.allDay;
      if (eventData.type !== undefined) updateData.type = eventData.type;
      if (eventData.status !== undefined) updateData.status = eventData.status;
      if (eventData.priority !== undefined) updateData.priority = eventData.priority;
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.color !== undefined) updateData.color = eventData.color;

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventData.id)
        .eq('user_id', user.id) // Ensure user can only update their own events
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        allDay: data.all_day,
        type: data.type,
        status: data.status,
        priority: data.priority,
        location: data.location,
        color: data.color,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      // Get user from localStorage (custom auth system)
      const storedUser = localStorage.getItem('crm_user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id); // Ensure user can only delete their own events

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific date range
   */
  static async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      // Get user from localStorage (custom auth system)
      const storedUser = localStorage.getItem('crm_user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', startDate.toISOString())
        .lte('end_date', endDate.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        allDay: event.all_day,
        type: event.type,
        status: event.status,
        priority: event.priority,
        location: event.location,
        color: event.color,
        userId: event.user_id,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  }

  /**
   * Get events for today
   */
  static async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getEventsByDateRange(startOfDay, endOfDay);
  }

  /**
   * Get upcoming events (next 7 days)
   */
  static async getUpcomingEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.getEventsByDateRange(today, nextWeek);
  }
} 