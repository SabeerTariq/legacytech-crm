
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import MessageChat from "@/components/communication/MessageChat";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { supabase } from "@/integrations/supabase/client";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    fetchMessagesForConversation, 
    sendMessage,
    createConversation 
  } = useChat();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [users, setUsers] = useState<MultiSelectOption[]>([]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesForConversation(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessagesForConversation]);

  useEffect(() => {
    // Fetch users for the MultiSelect
    const fetchUsers = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .neq('id', user.id); // Exclude current user

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        if (data) {
          const formattedUsers = data.map(u => ({
            value: u.id,
            label: u.full_name || u.id
          }));
          
          setUsers(formattedUsers);
        } else {
          // Initialize with empty array if no data
          setUsers([]);
        }
      } catch (err) {
        console.error('Exception fetching users:', err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSendMessage = () => {
    if (selectedConversation && newMessageText.trim()) {
      sendMessage(selectedConversation.id, newMessageText);
      setNewMessageText("");
    }
  };

  const handleCreateConversation = async () => {
    if (user && selectedParticipants.length > 0) {
      const newConversation = await createConversation([...selectedParticipants, user.id]);
      if (newConversation) {
        setSelectedConversation(newConversation);
        setIsNewConversationDialogOpen(false);
        setSelectedParticipants([]);
      }
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Dialog 
            open={isNewConversationDialogOpen} 
            onOpenChange={setIsNewConversationDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" /> New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Conversation</DialogTitle>
              </DialogHeader>
              <MultiSelect 
                options={users || []} 
                value={selectedParticipants}
                onChange={setSelectedParticipants}
                placeholder="Select participants"
              />
              <Button onClick={handleCreateConversation} className="mt-4">
                Create Conversation
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex h-full gap-4 overflow-hidden">
          {/* Conversations list */}
          <div className="w-80 flex-shrink-0 border rounded-lg bg-card overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md cursor-pointer",
                      selectedConversation?.id === conversation.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversation.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{conversation.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {/* TODO: Add timestamp */}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate">
                          {conversation.last_message_text || "No messages yet"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Message chat */}
          <div className="flex-1 min-w-0">
            {selectedConversation ? (
              <MessageChat
                messages={messages.map(msg => ({
                  id: msg.id,
                  content: msg.content,
                  timestamp: new Date(msg.created_at).toLocaleTimeString(),
                  sender: {
                    id: msg.sender_id,
                    name: msg.sender?.full_name || 'Unknown',
                    initials: msg.sender?.full_name?.slice(0, 2) || 'UN',
                    avatar: msg.sender?.avatar_url
                  },
                  isCurrentUser: msg.sender_id === user?.id
                }))}
                currentUserId={user?.id || ''}
                onSendMessage={(message) => {
                  sendMessage(selectedConversation.id, message);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
