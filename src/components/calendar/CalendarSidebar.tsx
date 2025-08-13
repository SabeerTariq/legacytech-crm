import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckSquare,
  Users,
  MapPin,
  Tag,
  Bell,
  FileText,
  Settings,
  Star,
  Pin
} from 'lucide-react';
import { format } from 'date-fns';
import { CalendarEvent, EventType, EventStatus, EventPriority, CalendarFilter } from '@/types/calendar';

interface CalendarSidebarProps {
  events: CalendarEvent[];
  filter: CalendarFilter;
  onFilterChange: (filter: CalendarFilter) => void;
  onCreateEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  events,
  filter,
  onFilterChange,
  onCreateEvent,
  onEventClick,
  selectedDate,
  onDateSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const eventTypes: EventType[] = [
    'meeting', 'deadline', 'appointment', 'task', 'reminder', 
    'follow-up', 'internal', 'client', 'marketing', 'sales', 'project', 'personal'
  ];

  const eventStatuses: EventStatus[] = [
    'scheduled', 'confirmed', 'tentative', 'cancelled', 'completed', 'overdue'
  ];

  const eventPriorities: EventPriority[] = ['low', 'medium', 'high', 'urgent'];

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'appointment': return <CalendarIcon className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      case 'follow-up': return <CheckSquare className="h-4 w-4" />;
      case 'internal': return <Users className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
      case 'marketing': return <Tag className="h-4 w-4" />;
      case 'sales': return <Tag className="h-4 w-4" />;
      case 'project': return <CheckSquare className="h-4 w-4" />;
      case 'personal': return <CalendarIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
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

  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filter.types.length > 0 && !filter.types.includes(event.type)) {
      return false;
    }

    // Status filter
    if (filter.statuses.length > 0 && !filter.statuses.includes(event.status)) {
      return false;
    }

    // Priority filter
    if (filter.priorities.length > 0 && !filter.priorities.includes(event.priority)) {
      return false;
    }

    // Tag filter
    if (filter.tags.length > 0 && !event.tags.some(tag => filter.tags.includes(tag))) {
      return false;
    }

    return true;
  });

  const todayEvents = filteredEvents.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const overdueEvents = filteredEvents.filter(event => event.status === 'overdue');

  const handleTypeToggle = (type: EventType) => {
    const newTypes = filter.types.includes(type)
      ? filter.types.filter(t => t !== type)
      : [...filter.types, type];
    onFilterChange({ ...filter, types: newTypes });
  };

  const handleStatusToggle = (status: EventStatus) => {
    const newStatuses = filter.statuses.includes(status)
      ? filter.statuses.filter(s => s !== status)
      : [...filter.statuses, status];
    onFilterChange({ ...filter, statuses: newStatuses });
  };

  const handlePriorityToggle = (priority: EventPriority) => {
    const newPriorities = filter.priorities.includes(priority)
      ? filter.priorities.filter(p => p !== priority)
      : [...filter.priorities, priority];
    onFilterChange({ ...filter, priorities: newPriorities });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter(t => t !== tag)
      : [...filter.tags, tag];
    onFilterChange({ ...filter, tags: newTags });
  };

  const clearFilters = () => {
    onFilterChange({
      types: [],
      statuses: [],
      priorities: [],
      tags: []
    });
  };

  const allTags = Array.from(new Set(events.flatMap(event => event.tags || [])));

  return (
    <div className="w-80 space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={onCreateEvent} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Button variant="outline" className="w-full">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today's View
          </Button>
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Calendar Settings
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {Object.values(filter).some(arr => arr.length > 0) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Types */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Event Types</Label>
            <div className="space-y-1">
              {eventTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filter.types.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <Label htmlFor={type} className="text-sm flex items-center gap-2">
                    {getEventTypeIcon(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Event Statuses */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-1">
              {eventStatuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={status}
                    checked={filter.statuses.includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label htmlFor={status} className="text-sm">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Event Priorities */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-1">
              {eventPriorities.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={priority}
                    checked={filter.priorities.includes(priority)}
                    onCheckedChange={() => handlePriorityToggle(priority)}
                  />
                  <Label htmlFor={priority} className="text-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="space-y-1">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={filter.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <Label htmlFor={tag} className="text-sm flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Events ({todayEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeIcon(event.type)}
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                      <Badge variant="outline" className={getPriorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events today
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeIcon(event.type)}
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(event.startDate), 'MMM d, HH:mm')}</span>
                      <Badge variant="outline" className={getPriorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Overdue Events */}
      {overdueEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Overdue Events ({overdueEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {overdueEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted border-red-200 bg-red-50"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeIcon(event.type)}
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Due: {format(new Date(event.startDate), 'MMM d, HH:mm')}</span>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarSidebar; 