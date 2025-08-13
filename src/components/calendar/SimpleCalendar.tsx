import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Bell,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addDays, subDays, startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent, EventType, EventStatus, EventPriority } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

interface SimpleCalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  selectedDate?: Date;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  events,
  onDateSelect,
  onEventClick,
  onCreateEvent,
  view,
  onViewChange,
  selectedDate
}) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter events to only show user's events
  const userEvents = events.filter(event => event.userId === user?.id);

  const getEventsForDate = (date: Date) => {
    return userEvents.filter(event => isSameDay(new Date(event.startDate), date));
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'reminder': return <Bell className="h-3 w-3" />;
      case 'meeting': return <CalendarIcon className="h-3 w-3" />;
      case 'task': return <CheckSquare className="h-3 w-3" />;
      case 'appointment': return <Clock className="h-3 w-3" />;
      case 'personal': return <AlertCircle className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: EventPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStarts = eachWeekOfInterval({ start: monthStart, end: monthEnd });
    
    const weeks = weekStarts.map(weekStart => 
      eachDayOfInterval({ 
        start: weekStart, 
        end: endOfWeek(weekStart) 
      })
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subDays(currentDate, 30))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 30))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => onCreateEvent(currentDate)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border shadow-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-background">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "min-h-[80px] sm:min-h-[100px] p-2 bg-background relative",
                      !isCurrentMonth && "bg-muted/30",
                      isToday(day) && "bg-primary/5",
                      "hover:bg-muted/50 cursor-pointer transition-colors"
                    )}
                    onClick={() => onDateSelect(day)}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday(day) && "font-bold text-primary",
                        "relative z-10"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5 px-1">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:bg-muted/80 transition-colors"
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
                            <div className="text-muted-foreground text-[10px]">
                              {format(new Date(event.startDate), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subDays(currentDate, 7))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => onCreateEvent(currentDate)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            return (
              <Card key={day.toString()} className="min-h-[200px] sm:min-h-[250px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "text-sm font-medium",
                      isToday(day) && "text-primary font-bold"
                    )}>
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'd')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-2 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                        style={{ borderLeft: `3px solid ${event.color || '#3b82f6'}` }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getEventTypeIcon(event.type)}
                          <span className="font-medium truncate">{event.title}</span>
                        </div>
                        {!event.allDay && (
                          <div className="text-muted-foreground text-[10px]">
                            {format(new Date(event.startDate), 'HH:mm')}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-8">
                        No events
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    // Use selectedDate if available, otherwise use currentDate
    const displayDate = selectedDate || currentDate;
    const dayEvents = getEventsForDate(displayDate);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = subDays(displayDate, 1);
                setCurrentDate(newDate);
                onDateSelect(newDate);
              }}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
              {format(displayDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = addDays(displayDate, 1);
                setCurrentDate(newDate);
                onDateSelect(newDate);
              }}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => onCreateEvent(displayDate)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        {/* Day Events */}
        <div className="space-y-4">
          {dayEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events today</h3>
                <p className="text-muted-foreground mb-4">
                  You have no events scheduled for {format(displayDate, 'MMMM d, yyyy')}
                </p>
                <Button onClick={() => onCreateEvent(displayDate)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            dayEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {getEventTypeIcon(event.type)}
                        <h3 className="font-semibold text-base">{event.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                        <Badge variant="outline">
                          {event.status}
                        </Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('month')}
          className="whitespace-nowrap"
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('week')}
          className="whitespace-nowrap"
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('day')}
          className="whitespace-nowrap"
        >
          Day
        </Button>
      </div>

      {/* Calendar Content */}
      <div className="min-h-[400px]">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default SimpleCalendar; 