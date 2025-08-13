import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Bell, 
  CheckSquare, 
  FileText,
  Tag,
  Repeat,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  CalendarEvent, 
  EventType, 
  EventStatus, 
  EventPriority, 
  Reminder, 
  FollowUp, 
  Note,
  ReminderType,
  NotificationType,
  NoteType
} from '@/types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    type: 'meeting',
    status: 'scheduled',
    priority: 'medium',
    location: '',
    attendees: [],
    color: '#3b82f6',
    reminders: [],
    followUps: [],
    notes: [],
    tags: []
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'before_start',
    notificationType: 'in_app'
  });
  const [newFollowUp, setNewFollowUp] = useState<Partial<FollowUp>>({
    title: '',
    priority: 'medium',
    status: 'pending'
  });
  const [newNote, setNewNote] = useState<Partial<Note>>({
    content: '',
    type: 'general'
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        allDay: false,
        type: 'meeting',
        status: 'scheduled',
        priority: 'medium',
        location: '',
        attendees: [],
        color: '#3b82f6',
        reminders: [],
        followUps: [],
        notes: [],
        tags: []
      });
    }
  }, [event]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees?.includes(newAttendee.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), newAttendee.trim()]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (attendee: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a !== attendee) || []
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addReminder = () => {
    if (newReminder.type && newReminder.notificationType) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        eventId: event?.id || '',
        type: newReminder.type as ReminderType,
        time: new Date(),
        sent: false,
        notificationType: newReminder.notificationType as NotificationType,
        message: newReminder.message
      };
      setFormData(prev => ({
        ...prev,
        reminders: [...(prev.reminders || []), reminder]
      }));
      setNewReminder({
        type: 'before_start',
        notificationType: 'in_app'
      });
    }
  };

  const removeReminder = (reminderId: string) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders?.filter(r => r.id !== reminderId) || []
    }));
  };

  const addFollowUp = () => {
    if (newFollowUp.title && newFollowUp.dueDate) {
      const followUp: FollowUp = {
        id: Date.now().toString(),
        eventId: event?.id || '',
        title: newFollowUp.title,
        description: newFollowUp.description,
        dueDate: newFollowUp.dueDate,
        status: newFollowUp.status || 'pending',
        priority: newFollowUp.priority || 'medium',
        assignedTo: newFollowUp.assignedTo,
        createdAt: new Date()
      };
      setFormData(prev => ({
        ...prev,
        followUps: [...(prev.followUps || []), followUp]
      }));
      setNewFollowUp({
        title: '',
        priority: 'medium',
        status: 'pending'
      });
    }
  };

  const removeFollowUp = (followUpId: string) => {
    setFormData(prev => ({
      ...prev,
      followUps: prev.followUps?.filter(f => f.id !== followUpId) || []
    }));
  };

  const addNote = () => {
    if (newNote.content && newNote.type) {
      const note: Note = {
        id: Date.now().toString(),
        eventId: event?.id || '',
        content: newNote.content,
        type: newNote.type as NoteType,
        createdAt: new Date(),
        createdBy: 'current-user' // Replace with actual user ID
      };
      setFormData(prev => ({
        ...prev,
        notes: [...(prev.notes || []), note]
      }));
      setNewNote({
        content: '',
        type: 'general'
      });
    }
  };

  const removeNote = (noteId: string) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes?.filter(n => n.id !== noteId) || []
    }));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date || new Date() }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={formData.startDate ? format(formData.startDate, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.startDate || new Date());
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setFormData(prev => ({ ...prev, startDate: newDate }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date || new Date() }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={formData.endDate ? format(formData.endDate, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.endDate || new Date());
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setFormData(prev => ({ ...prev, endDate: newDate }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as EventStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="tentative">Tentative</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as EventPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 mt-3" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="flex gap-2">
                <Input
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  placeholder="Add attendee email"
                  onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                />
                <Button onClick={addAttendee} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.attendees?.map((attendee, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {attendee}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAttendee(attendee)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Reminder</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(value) => setNewReminder(prev => ({ ...prev, type: value as ReminderType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before_start">Before Start</SelectItem>
                      <SelectItem value="after_start">After Start</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notification</Label>
                  <Select
                    value={newReminder.notificationType}
                    onValueChange={(value) => setNewReminder(prev => ({ ...prev, notificationType: value as NotificationType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_app">In App</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Input
                    value={newReminder.message}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Custom message"
                  />
                </div>
              </div>
              <Button onClick={addReminder} className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Active Reminders</h3>
              {formData.reminders?.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="capitalize">{reminder.type.replace('_', ' ')}</span>
                    <Badge variant="outline">{reminder.notificationType}</Badge>
                    {reminder.message && <span className="text-sm text-muted-foreground">- {reminder.message}</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReminder(reminder.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="follow-ups" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Follow-up</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newFollowUp.title}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Follow-up title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newFollowUp.dueDate ? format(newFollowUp.dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newFollowUp.dueDate}
                        onSelect={(date) => setNewFollowUp(prev => ({ ...prev, dueDate: date || new Date() }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newFollowUp.description}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Follow-up description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newFollowUp.priority}
                    onValueChange={(value) => setNewFollowUp(prev => ({ ...prev, priority: value as EventPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Input
                    value={newFollowUp.assignedTo}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="User email"
                  />
                </div>
              </div>
              <Button onClick={addFollowUp} className="w-full">
                <CheckSquare className="mr-2 h-4 w-4" />
                Add Follow-up
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Active Follow-ups</h3>
              {formData.followUps?.map((followUp) => (
                <div key={followUp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{followUp.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {format(followUp.dueDate, 'PPP')}
                        {followUp.assignedTo && ` • Assigned to: ${followUp.assignedTo}`}
                      </div>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(followUp.priority)}>
                      {followUp.priority}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFollowUp(followUp.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Note</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newNote.type}
                    onValueChange={(value) => setNewNote(prev => ({ ...prev, type: value as NoteType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="action_item">Action Item</SelectItem>
                      <SelectItem value="decision">Decision</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Note content"
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={addNote} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Notes</h3>
              {formData.notes?.map((note) => (
                <div key={note.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{note.type.replace('_', ' ')}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(note.createdAt, 'PPp')}
                        </span>
                      </div>
                      <div className="mt-1">{note.content}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNote(note.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Settings</h3>
              
              <div className="space-y-2">
                <Label>Event Color</Label>
                <div className="flex gap-2">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recurring Pattern</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="No recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex justify-between w-full">
            {event && onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(event.id)}
              >
                Delete Event
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {event ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal; 