
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Send, PaperclipIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

// Mock conversation data
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    with: {
      id: '2',
      name: 'Sales Rep',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sales',
    },
    lastMessage: {
      content: 'Hey, can you check on the Smith project timeline?',
      timestamp: '2024-04-02T14:30:00Z',
      read: true,
    },
    unread: 0,
  },
  {
    id: '2',
    with: {
      id: '3',
      name: 'Project Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=project',
    },
    lastMessage: {
      content: 'The design assets for Johnson Digital are ready',
      timestamp: '2024-04-02T11:15:00Z',
      read: false,
    },
    unread: 2,
  },
  {
    id: '3',
    with: {
      id: '4',
      name: 'Designer 1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer1',
    },
    lastMessage: {
      content: 'I\'ve updated the mockups as requested',
      timestamp: '2024-04-01T16:45:00Z',
      read: true,
    },
    unread: 0,
  },
];

// Mock messages data
const MOCK_MESSAGES = {
  '1': [
    {
      id: '1',
      sender: '2',
      content: 'Hey, can you check on the Smith project timeline?',
      timestamp: '2024-04-02T14:30:00Z',
    },
    {
      id: '2',
      sender: '1',
      content: 'Sure, let me look into it. I believe they requested some changes to the scope.',
      timestamp: '2024-04-02T14:32:00Z',
    },
    {
      id: '3',
      sender: '2',
      content: 'That\'s right. They want to add an e-commerce section.',
      timestamp: '2024-04-02T14:34:00Z',
    },
    {
      id: '4',
      sender: '1',
      content: 'I\'ll check with the dev team to see how that affects the timeline and get back to you.',
      timestamp: '2024-04-02T14:37:00Z',
    },
  ],
  '2': [
    {
      id: '1',
      sender: '3',
      content: 'The design assets for Johnson Digital are ready',
      timestamp: '2024-04-02T11:15:00Z',
    },
    {
      id: '2',
      sender: '3',
      content: 'Can you approve them so we can start development?',
      timestamp: '2024-04-02T11:16:00Z',
    },
  ],
  '3': [
    {
      id: '1',
      sender: '4',
      content: 'I\'ve updated the mockups as requested',
      timestamp: '2024-04-01T16:45:00Z',
    },
    {
      id: '2',
      sender: '1',
      content: 'Thanks! They look great. Can you make the logo a bit larger?',
      timestamp: '2024-04-01T16:50:00Z',
    },
    {
      id: '3',
      sender: '4',
      content: 'Sure, I\'ll send the revised version shortly.',
      timestamp: '2024-04-01T16:55:00Z',
    },
  ],
};

export const MessagesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Filter conversations based on search term
  const filteredConversations = MOCK_CONVERSATIONS.filter((convo) => {
    const searchLower = searchTerm.toLowerCase();
    return convo.with.name.toLowerCase().includes(searchLower);
  });

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !activeConversation) return;
    
    // In a real app, this would send the message to an API
    console.log('Sending message:', newMessage, 'to conversation:', activeConversation);
    
    // Clear the input field
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-description">Internal team communication</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-0">
            <ScrollArea className="h-full w-full">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <React.Fragment key={conversation.id}>
                    <div 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                        activeConversation === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <div className="relative">
                        <img 
                          src={conversation.with.avatar} 
                          alt={conversation.with.name}
                          className="h-10 w-10 rounded-full"
                        />
                        {conversation.unread > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-teal text-white text-xs flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{conversation.with.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatMessageTime(conversation.lastMessage.timestamp)}
                          </p>
                        </div>
                        <p className={`text-sm truncate ${
                          !conversation.lastMessage.read ? 'font-medium' : 'text-muted-foreground'
                        }`}>
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </React.Fragment>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No conversations found
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={MOCK_CONVERSATIONS.find(c => c.id === activeConversation)?.with.avatar}
                    alt={MOCK_CONVERSATIONS.find(c => c.id === activeConversation)?.with.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <CardTitle>
                      {MOCK_CONVERSATIONS.find(c => c.id === activeConversation)?.with.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto p-0">
                <ScrollArea className="h-[calc(100vh-380px)] w-full p-4">
                  {MOCK_MESSAGES[activeConversation]?.map((message, index) => {
                    const isCurrentUser = message.sender === user?.id;
                    const showDate = index === 0 || 
                      formatMessageDate(message.timestamp) !== 
                      formatMessageDate(MOCK_MESSAGES[activeConversation][index - 1].timestamp);
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                              {formatMessageDate(message.timestamp)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`max-w-[80%] ${
                            isCurrentUser 
                              ? 'bg-brand-teal text-white' 
                              : 'bg-muted'
                          } rounded-lg px-4 py-2`}>
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 text-right ${
                              isCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t p-3 flex gap-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <PaperclipIcon className="h-5 w-5" />
                  <span className="sr-only">Attach</span>
                </Button>
                <Textarea 
                  placeholder="Type your message here..."
                  className="min-h-10 max-h-40"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  className="shrink-0"
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === ''}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
              <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="mt-2">Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
