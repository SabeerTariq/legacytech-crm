
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextJWT';
import SimpleCalendar from '@/components/calendar/SimpleCalendar';
import SimpleEventModal from '@/components/calendar/SimpleEventModal';
import { CalendarEvent, CalendarView as CalendarViewType } from '@/types/calendar';
import { CalendarService } from '@/lib/calendarService';

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType['type']>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Handle authentication loading state
  useEffect(() => {
    if (user !== undefined) {
      setIsAuthLoading(false);
    }
  }, [user]);

  // Load events from database on component mount
  useEffect(() => {
    const loadEvents = async () => {
      // Only load events if user is authenticated and we have a valid user ID
      if (user && user.id) {
        try {
          setIsLoading(true);
          console.log('Loading events from database for user:', user.id);
          const events = await CalendarService.getEvents();
          console.log('Loaded events from database:', events);
          setEvents(events);
        } catch (error) {
          console.error('Error loading events from database:', error);
          // Don't show error toast for authentication issues
          if (error instanceof Error && error.message.includes('not authenticated')) {
            console.log('User not authenticated yet, skipping event load');
            setEvents([]);
          } else {
            toast({
              title: "Error",
              description: "Failed to load events. Please try again.",
              variant: "destructive",
            });
            setEvents([]);
          }
        } finally {
          setIsLoading(false);
        }
      } else if (!isAuthLoading) {
        // Clear events if no user is authenticated and auth loading is complete
        setEvents([]);
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [user?.id, isAuthLoading, toast]);



  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('day');
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = (date?: Date) => {
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create events.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Creating event for date:', date);
    setSelectedEvent(undefined);
    if (date) {
      setSelectedDate(date);
    }
    setIsEventModalOpen(true);
  };

  const handleViewChange = (view: CalendarViewType['type']) => {
    setCurrentView(view);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Saving event:', eventData);
      if (selectedEvent) {
        // Update existing event
        const updatedEvent = await CalendarService.updateEvent({
          id: selectedEvent.id,
          title: eventData.title,
          description: eventData.description,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          allDay: eventData.allDay,
          type: eventData.type,
          status: eventData.status,
          priority: eventData.priority,
          location: eventData.location,
          color: eventData.color,
        });
        
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id ? updatedEvent : event
          )
        );
        
        toast({
          title: "Event Updated",
          description: "Your event has been updated successfully.",
        });
      } else {
        // Create new event
        const newEvent = await CalendarService.createEvent({
          title: eventData.title,
          description: eventData.description,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          allDay: eventData.allDay,
          type: eventData.type,
          status: eventData.status,
          priority: eventData.priority,
          location: eventData.location,
          color: eventData.color,
        });
        
        setEvents(prevEvents => [...prevEvents, newEvent]);
        
        toast({
          title: "Event Created",
          description: "Your event has been created successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await CalendarService.deleteEvent(eventId);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };



  // Filter events for current user
  const userEvents = events.filter(event => event.userId === user?.id);
  const pendingEvents = userEvents.filter(event => event.status === 'pending');
  const completedEvents = userEvents.filter(event => event.status === 'completed');

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal schedule and reminders
          </p>
        </div>
                 <div className="flex justify-center sm:justify-end gap-2">
           <Button 
             onClick={() => handleCreateEvent()} 
             className="w-full sm:w-auto"
             disabled={!user || !user.id}
           >
             Add Event
           </Button>

        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEvents.length}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingEvents.length}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedEvents.length}</div>
          </CardContent>
        </Card>
      </div>

             {/* Main Calendar */}
       <Card className="shadow-lg">
         <CardContent className="p-4 sm:p-6">
                       {isAuthLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Checking authentication...</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading calendar events...</p>
                </div>
              </div>
            ) : (
                        <SimpleCalendar
             events={events}
             onDateSelect={handleDateSelect}
             onEventClick={handleEventClick}
             onCreateEvent={handleCreateEvent}
             view={currentView}
             onViewChange={handleViewChange}
             selectedDate={selectedDate}
           />
           )}
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

export default CalendarPage;
