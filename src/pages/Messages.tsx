
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import MessageChat from "@/components/communication/MessageChat";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { 
    conversations, 
    messages, 
    fetchMessagesForConversation, 
    sendMessage,
    createConversation,
    creatingConversation 
  } = useChat();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [users, setUsers] = useState<MultiSelectOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesForConversation(selectedConversation.id);

      // On mobile, hide the conversation list when a conversation is selected
      if (isMobile) {
        setShowConversationList(false);
      }
    }
  }, [selectedConversation, fetchMessagesForConversation, isMobile]);

  useEffect(() => {
    // Always show conversation list on desktop
    if (!isMobile) {
      setShowConversationList(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Fetch users for the MultiSelect when the dialog is opened
    if (isNewConversationDialogOpen && user) {
      fetchUsers();
    }
  }, [isNewConversationDialogOpen, user]);

  const fetchUsers = async () => {
    if (!user) return;

    setIsLoadingUsers(true);
    setUsers([]); // Reset users to prevent issues with stale data

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', user.id); // Exclude current user

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const formattedUsers = data.map(u => ({
          value: u.id,
          label: u.full_name || u.id
        }));
        
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Exception fetching users:', err);
      toast({
        title: "Error",
        description: "Could not load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSendMessage = () => {
    if (selectedConversation && newMessageText.trim()) {
      sendMessage(selectedConversation.id, newMessageText);
      setNewMessageText("");
    }
  };

  const handleCreateConversation = async () => {
    if (user && selectedParticipants.length > 0) {
      try {
        const newConversation = await createConversation([...selectedParticipants]);
        if (newConversation) {
          setSelectedConversation(newConversation);
          setIsNewConversationDialogOpen(false);
          setSelectedParticipants([]);
          
          // On mobile, hide the conversation list when a new conversation is created
          if (isMobile) {
            setShowConversationList(false);
          }
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    } else {
      toast({
        title: "Error",
        description: "Please select at least one participant",
        variant: "destructive"
      });
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset participant selection when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsNewConversationDialogOpen(open);
    if (!open) {
      setSelectedParticipants([]);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          {isMobile && selectedConversation && !showConversationList ? (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackToList}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold truncate">
                {selectedConversation.name || 'Unnamed conversation'}
              </h1>
            </div>
          ) : (
            <h1 className="text-3xl font-bold">Messages</h1>
          )}
          
          <Dialog 
            open={isNewConversationDialogOpen} 
            onOpenChange={handleDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" /> 
                {isMobile ? "" : "New Conversation"}
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "w-[90%] max-w-md" : ""}>
              <DialogHeader>
                <DialogTitle>Create New Conversation</DialogTitle>
                <DialogDescription>
                  Select users to start a conversation with.
                </DialogDescription>
              </DialogHeader>
              <MultiSelect 
                options={users} 
                value={selectedParticipants}
                onChange={setSelectedParticipants}
                placeholder={isLoadingUsers ? "Loading users..." : "Select participants"}
              />
              <Button 
                onClick={handleCreateConversation} 
                className="mt-4"
                disabled={selectedParticipants.length === 0 || isLoadingUsers || creatingConversation}
              >
                {creatingConversation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Conversation"
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex h-full gap-4 overflow-hidden">
          {/* Conversations list - hidden on mobile when a conversation is selected */}
          {(!isMobile || showConversationList) && (
            <div className={cn(
              "border rounded-lg bg-card overflow-hidden",
              isMobile ? "w-full" : "w-80 flex-shrink-0"
            )}>
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
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
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
                            {conversation.name?.slice(0, 2).toUpperCase() || 'CN'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{conversation.name || 'Unnamed conversation'}</span>
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
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No conversations found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Message chat - shown on mobile only when a conversation is selected */}
          {(!isMobile || !showConversationList) && (
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
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
