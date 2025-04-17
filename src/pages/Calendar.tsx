
import React, { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("month");
  
  // Sample events data
  const events = [
    { id: 1, title: "Client Meeting", date: new Date(), type: "meeting", status: "confirmed" },
    { id: 2, title: "Project Deadline", date: new Date(Date.now() + 86400000 * 2), type: "deadline", status: "upcoming" },
    { id: 3, title: "Team Brainstorming", date: new Date(Date.now() + 86400000 * 4), type: "internal", status: "confirmed" },
    { id: 4, title: "Marketing Campaign Launch", date: new Date(Date.now() + 86400000 * 7), type: "marketing", status: "tentative" },
  ];

  // Filter events for today's date
  const todaysEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  // Get badge variant based on event type
  const getBadgeVariant = (type: string) => {
    switch(type) {
      case "meeting": return "default";
      case "deadline": return "destructive";
      case "internal": return "secondary";
      case "marketing": return "outline";
      default: return "default";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <Tabs defaultValue="month" className="w-full" onValueChange={setView}>
                  <div className="flex justify-between items-center">
                    <CardTitle>Schedule</CardTitle>
                    <TabsList>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="day">Day</TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border p-3 pointer-events-auto"
                />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Today's Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysEvents.length > 0 ? (
                    todaysEvents.map(event => (
                      <div key={event.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge variant={getBadgeVariant(event.type)}>{event.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No events scheduled for today</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
