import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SimpleCalendar from '@/components/calendar/SimpleCalendar';
import SimpleEventModal from '@/components/calendar/SimpleEventModal';
import { CalendarEvent, CalendarView as CalendarViewType } from '@/types/calendar';

const SimpleCalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType['type']>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  // Sample events data for demonstration
  useEffect(() => {
    if (user) {
      // In a real app, you would fetch events from your database
      const sampleEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Meeting',
          description: 'Weekly team sync meeting',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
          allDay: false,
          type: 'meeting',
          status: 'pending',
          priority: 'medium',
          location: 'Conference Room A',
          color: '#3b82f6',
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Project Deadline',
          description: 'Submit final project report',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          allDay: true,
          type: 'task',
          status: 'pending',
          priority: 'high',
          color: '#ef4444',
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Doctor Appointment',
          description: 'Annual checkup',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 7 days + 30 minutes
          allDay: false,
          type: 'appointment',
          status: 'pending',
          priority: 'medium',
          location: 'Medical Center',
          color: '#10b981',
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setEvents(sampleEvents);
    }
  }, [user]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('day');
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = (date?: Date) => {
    setSelectedEvent(undefined);
    if (date) {
      setSelectedDate(date);
    }
    setIsEventModalOpen(true);
  };

  const handleViewChange = (view: CalendarViewType['type']) => {
    setCurrentView(view);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedEvent) {
      // Update existing event
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, ...eventData, updatedAt: new Date() }
          : event
      );
      setEvents(updatedEvents);
      toast({
        title: "Event Updated",
        description: "Your event has been updated successfully.",
      });
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEvents([...events, newEvent]);
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Your event has been deleted successfully.",
    });
  };

  // Filter events for current user
  const userEvents = events.filter(event => event.userId === user?.id);
  const pendingEvents = userEvents.filter(event => event.status === 'pending');
  const completedEvents = userEvents.filter(event => event.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground">
            Manage your personal schedule and reminders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleCreateEvent()}>
            Add Event
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar */}
      <Card>
        <CardContent className="p-6">
          <SimpleCalendar
            events={events}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            view={currentView}
            onViewChange={handleViewChange}
          />
        </CardContent>
      </Card>

      {/* Event Modal */}
      <SimpleEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default SimpleCalendarPage; 