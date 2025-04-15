
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import MessageChat, { Message } from "@/components/communication/MessageChat";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState("team");
  
  // Mock conversation data
  const conversations = [
    {
      id: "team",
      name: "Team Chat",
      lastMessage: "Let's discuss the project timeline",
      time: "11:45 AM",
      unread: 3,
      isGroup: true,
      members: [
        { name: "Alex Johnson", initials: "AJ" },
        { name: "Maria Garcia", initials: "MG" },
        { name: "James Smith", initials: "JS" },
      ]
    },
    {
      id: "project-design",
      name: "Project Design",
      lastMessage: "I've uploaded the new mockups",
      time: "Yesterday",
      unread: 0,
      isGroup: true,
      members: [
        { name: "Alex Johnson", initials: "AJ" },
        { name: "Sarah Wilson", initials: "SW" },
      ]
    },
    {
      id: "alex",
      name: "Alex Johnson",
      lastMessage: "Can you review the homepage design?",
      time: "Yesterday",
      unread: 0,
      isGroup: false,
      members: [
        { name: "Alex Johnson", initials: "AJ" },
      ]
    },
    {
      id: "maria",
      name: "Maria Garcia",
      lastMessage: "The client approved the design!",
      time: "Monday",
      unread: 0,
      isGroup: false,
      members: [
        { name: "Maria Garcia", initials: "MG" },
      ]
    },
  ];
  
  // Mock messages data
  const currentUserId = "current-user";
  const messages: Message[] = [
    {
      id: "1",
      content: "Hey team, let's discuss the project timeline for the new website",
      timestamp: "11:30 AM",
      sender: {
        id: "alex",
        name: "Alex Johnson",
        initials: "AJ",
      },
      isCurrentUser: false,
    },
    {
      id: "2",
      content: "I've reviewed the wireframes, and I think we need to make some adjustments to the homepage layout",
      timestamp: "11:32 AM",
      sender: {
        id: "maria",
        name: "Maria Garcia",
        initials: "MG",
      },
      isCurrentUser: false,
    },
    {
      id: "3",
      content: "I agree. The hero section seems too cluttered. We should simplify it.",
      timestamp: "11:35 AM",
      sender: {
        id: currentUserId,
        name: "Current User",
        initials: "CU",
      },
      isCurrentUser: true,
    },
    {
      id: "4",
      content: "What about the timeline? Do we still think we can deliver by the end of the month?",
      timestamp: "11:40 AM",
      sender: {
        id: "james",
        name: "James Smith",
        initials: "JS",
      },
      isCurrentUser: false,
    },
    {
      id: "5",
      content: "If we focus on the priority features first, I think we can make it. We'll need to schedule some extra design reviews though.",
      timestamp: "11:42 AM",
      sender: {
        id: currentUserId,
        name: "Current User",
        initials: "CU",
      },
      isCurrentUser: true,
    },
    {
      id: "6",
      content: "Sounds good. Let's plan for a design review on Friday.",
      timestamp: "11:45 AM",
      sender: {
        id: "alex",
        name: "Alex Johnson",
        initials: "AJ",
      },
      isCurrentUser: false,
    },
  ];
  
  const [chatMessages, setChatMessages] = useState(messages);
  
  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: `message-${Date.now()}`,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: {
        id: currentUserId,
        name: "Current User",
        initials: "CU",
      },
      isCurrentUser: true,
    };
    
    setChatMessages([...chatMessages, newMessage]);
  };
  
  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="flex h-full gap-4 overflow-hidden">
          {/* Conversations list */}
          <div className="w-80 flex-shrink-0 border rounded-lg bg-card overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md cursor-pointer",
                      selectedConversation === conversation.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    {conversation.isGroup ? (
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={""} />
                        <AvatarFallback>
                          {conversation.members[0].initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{conversation.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {conversation.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </span>
                        {conversation.unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Message chat */}
          <div className="flex-1 min-w-0">
            <MessageChat
              messages={chatMessages}
              currentUserId={currentUserId}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
