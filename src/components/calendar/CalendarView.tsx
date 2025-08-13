import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Bell,
  CheckSquare,
  FileText,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addDays, subDays, startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent, EventType, EventStatus, EventPriority } from '@/types/calendar';

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
  view: 'month' | 'week' | 'day' | 'agenda';
  onViewChange: (view: 'month' | 'week' | 'day' | 'agenda') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
  onCreateEvent,
  view,
  onViewChange
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  useEffect(() => {
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), date));
  };

  const getEventsForWeek = (startDate: Date) => {
    const endDate = endOfWeek(startDate);
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), date));
  };

  const getPriorityColor = (priority: EventPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'meeting': return <Users className="h-3 w-3" />;
      case 'deadline': return <AlertCircle className="h-3 w-3" />;
      case 'appointment': return <CalendarIcon className="h-3 w-3" />;
      case 'task': return <CheckSquare className="h-3 w-3" />;
      case 'reminder': return <Bell className="h-3 w-3" />;
      case 'follow-up': return <CheckSquare className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStarts = eachWeekOfInterval({ start: monthStart, end: monthEnd });
    
    // Generate the actual weeks with days
    const weeks = weekStarts.map(weekStart => 
      eachDayOfInterval({ 
        start: weekStart, 
        end: endOfWeek(weekStart) 
      })
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subDays(currentDate, 30))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 30))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => onCreateEvent(currentDate)}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "min-h-[120px] p-2 border border-border",
                    !isCurrentMonth && "bg-muted/30",
                    isToday(day) && "bg-primary/10",
                    "hover:bg-muted/50 cursor-pointer"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm",
                      !isCurrentMonth && "text-muted-foreground",
                      isToday(day) && "font-bold text-primary"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-muted"
                        style={{ borderLeft: `3px solid ${event.color || '#3b82f6'}` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {getEventTypeIcon(event.type)}
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        {!event.allDay && (
                          <div className="text-muted-foreground">
                            {format(new Date(event.startDate), 'HH:mm')}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekEvents = getEventsForWeek(weekStart);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subDays(currentDate, 7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => onCreateEvent(currentDate)}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-1">
          <div className="p-2 text-center text-sm font-medium text-muted-foreground">
            Time
          </div>
          {days.map((day) => (
            <div key={day.toString()} className="p-2 text-center text-sm font-medium">
              <div className={cn(
                isToday(day) && "font-bold text-primary"
              )}>
                {format(day, 'EEE')}
              </div>
              <div className="text-muted-foreground">
                {format(day, 'd')}
              </div>
            </div>
          ))}
          
          {Array.from({ length: 24 }, (_, hour) => (
            <React.Fragment key={hour}>
              <div className="p-2 text-right text-xs text-muted-foreground border-t">
                {format(new Date().setHours(hour), 'HH:mm')}
              </div>
              {days.map((day) => {
                const hourEvents = weekEvents.filter(event => {
                  const eventDate = new Date(event.startDate);
                  return isSameDay(eventDate, day) && eventDate.getHours() === hour;
                });
                
                return (
                  <div key={`${day}-${hour}`} className="p-1 border-t min-h-[60px]">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded mb-1 cursor-pointer hover:bg-muted"
                        style={{ 
                          backgroundColor: `${event.color || '#3b82f6'}20`,
                          borderLeft: `3px solid ${event.color || '#3b82f6'}`
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => onCreateEvent(currentDate)}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourEvents = dayEvents.filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate.getHours() === hour;
            });
            
            return (
              <div key={hour} className="flex border-b">
                <div className="w-20 p-2 text-sm text-muted-foreground border-r">
                  {format(new Date().setHours(hour), 'HH:mm')}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="mb-2 p-3 rounded-lg cursor-pointer hover:bg-muted"
                      style={{ 
                        backgroundColor: `${event.color || '#3b82f6'}10`,
                        borderLeft: `4px solid ${event.color || '#3b82f6'}`
                      }}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={getPriorityColor(event.priority)}>
                            {event.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedEvents = events
      .filter(event => new Date(event.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Agenda</h2>
          <Button onClick={() => onCreateEvent(currentDate)}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventTypeIcon(event.type)}
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(event.startDate), 'PPP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEventClick(event)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {sortedEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming events
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('month')}
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('day')}
        >
          Day
        </Button>
        <Button
          variant={view === 'agenda' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('agenda')}
        >
          Agenda
        </Button>
      </div>

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
      {view === 'agenda' && renderAgendaView()}
    </div>
  );
};

export default CalendarView; 