import React, { useState, useEffect, useRef } from 'react';
import { useEnhancedChat, Message, Conversation } from '@/hooks/useEnhancedChat';
import { EnhancedMessage } from '@/components/communication/EnhancedMessage';
import { EnhancedMessageInput } from '@/components/communication/EnhancedMessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { 
  Search, 
  UserPlus, 
  ArrowLeft, 
  Loader2, 
  MoreHorizontal,
  Hash,
  Lock,
  Users,
  MessageSquare,
  Pin,
  Star,
  Settings,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextJWT';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const EnhancedMessages: React.FC = () => {
  console.log('=== EnhancedMessages component rendering ===');
  console.log('Component mount time:', new Date().toISOString());
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    conversations,
    messages,
    selectedConversation,
    loading,
    sending,
    typingUsers,
    userPresence,
    searchQuery,
    searchResults,
    setSelectedConversation,
    setSearchQuery,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    searchMessages,
    markAsRead,
    updateTypingIndicator,
    updatePresence
  } = useEnhancedChat();


  const [showUsersList, setShowUsersList] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle conversation selection
  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read
    if (conversation.unread_count && conversation.unread_count > 0) {
      await markAsRead(conversation.id);
    }
    
    // Scroll to bottom after a short delay to ensure messages are loaded
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Fetch conversations on mount
  useEffect(() => {
    console.log('=== EnhancedMessages useEffect calling fetchConversations ===');
    console.log('User in useEffect:', user);
    if (user) {
      console.log('Calling fetchConversations for user:', user.id);
      fetchConversations();
    }
  }, [user?.id]); // Only depend on user ID

  // Debug conversations when they change
  useEffect(() => {
    console.log('=== Conversations updated ===');
    console.log('Total conversations:', conversations.length);
    conversations.forEach((conv, index) => {
      const otherParticipant = conv.participants?.find(p => p.user_id !== user?.id);
      const participantName = otherParticipant?.user?.display_name || otherParticipant?.user?.email || 'Unknown User';
      console.log(`Conversation ${index + 1}:`, {
        id: conv.id,
        participantName,
        participantId: otherParticipant?.user_id,
        lastMessageAt: conv.last_message_at,
        lastMessage: conv.last_message,
        lastMessageContent: conv.last_message?.content
      });
    });
  }, [conversations, user?.id]);

  // Fetch users when users list is shown
  useEffect(() => {
    if (showUsersList) {
      console.log('Users list opened, fetching users...');
      fetchUsers();
    }
  }, [showUsersList]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      console.log('Conversation selected, fetching messages for:', selectedConversation.id);
      console.log('Selected conversation participants:', selectedConversation.participants);
      fetchMessages(selectedConversation.id);
      if (isMobile) {
        setShowConversationList(false);
      }
    }
  }, [selectedConversation, fetchMessages, isMobile]);

  // Scroll to bottom when new messages arrive or conversation changes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, selectedConversation]);

  // Fetch users for messaging
  const fetchUsers = async () => {
    if (!user) return;

    setIsLoadingUsers(true);
    setUsers([]); // Reset users to empty array
    try {
      console.log('Fetching users...');
      const response = await apiClient.getUserRoles();
      console.log('Response status:', response.error ? 'error' : 'success');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const data = response.data || response;
      console.log('Users data:', data);
      
      // Transform the data to include user info
      const userList = Object.entries(data).map(([userId, userData]: [string, any]) => ({
        id: userId,
        display_name: userData.display_name || userData.email || userId,
        email: userData.email || userId
      })).filter((userInfo: any) => userInfo.id !== user.id);

      console.log('User list:', userList);
      setUsers(userList || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversation) return;

    await sendMessage({
      conversation_id: selectedConversation.id,
      content,
      attachments
    });
    setReplyingTo(null);
  };

  // Handle typing indicator
  const handleTypingChange = async (isTyping: boolean) => {
    if (selectedConversation) {
      await updateTypingIndicator(selectedConversation.id, isTyping);
    }
  };

  // Handle start conversation with user
  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      const conversation = await createConversation({
        type: 'direct',
        participant_ids: [userId], // The API will add the current user automatically
        name: `Direct Message with ${userName}` // Add proper name for direct conversations
      });

      if (conversation) {
        setSelectedConversation(conversation);
        setShowUsersList(false);
        toast({
          title: "Success",
          description: `Started conversation with ${userName}`,
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchMessages(query);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Get conversation display name
  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'direct' && conversation.participants) {
      const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
      if (otherParticipant?.user?.display_name) {
        return otherParticipant.user.display_name;
      }
      if (otherParticipant?.user?.email) {
        return otherParticipant.user.email;
      }
      return 'Unknown User';
    }
    return conversation.name || 'Unnamed Conversation';
  };

  // Get conversation icon
  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.is_private) return <Lock className="h-4 w-4" />;
    if (conversation.type === 'channel') return <Hash className="h-4 w-4" />;
    if (conversation.type === 'group') return <Users className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  // Filter conversations and ensure unique users
  const filteredConversations = conversations
    .filter(conv => {
      // Skip conversations with no participants
      if (!conv.participants || conv.participants.length === 0) {
        return false;
      }
      
      const otherParticipant = conv.participants?.find(p => p.user_id !== user?.id);
      // Skip if no other participant found
      if (!otherParticipant) {
        return false;
      }
      
      const participantName = otherParticipant?.user?.display_name || otherParticipant?.user?.email || 'Unknown User';
      return participantName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .reduce((unique, conv) => {
      const otherParticipant = conv.participants?.find(p => p.user_id !== user?.id);
      const participantId = otherParticipant?.user_id;
      
      // Skip if no other participant found
      if (!participantId) {
        return unique;
      }
      
      // Check if we already have a conversation with this user
      const existingIndex = unique.findIndex(existingConv => {
        const existingOtherParticipant = existingConv.participants?.find(p => p.user_id !== user?.id);
        return existingOtherParticipant?.user_id === participantId;
      });
      
      if (existingIndex === -1) {
        // This is a new user, add it
        unique.push(conv);
      } else {
        // We already have this user, keep the one with the most recent message
        const existing = unique[existingIndex];
        const existingTime = new Date(existing.last_message_at || existing.created_at);
        const currentTime = new Date(conv.last_message_at || conv.created_at);
        
        if (currentTime > existingTime) {
          // Replace with the more recent conversation
          unique[existingIndex] = conv;
        }
      }
      
      return unique;
    }, [] as Conversation[]);

  // Debug filtered conversations
  useEffect(() => {
    console.log('=== Filtered conversations ===');
    console.log('Filtered conversations count:', filteredConversations.length);
    filteredConversations.forEach((conv, index) => {
      const otherParticipant = conv.participants?.find(p => p.user_id !== user?.id);
      const participantName = otherParticipant?.user?.display_name || otherParticipant?.user?.email || 'Unknown User';
      console.log(`Filtered ${index + 1}:`, {
        id: conv.id,
        participantName,
        participantId: otherParticipant?.user_id,
        lastMessageAt: conv.last_message_at
      });
    });
  }, [filteredConversations, user?.id]);

  // Debug messages when they change
  useEffect(() => {
    console.log('=== Messages updated ===');
    console.log('Total messages:', messages.length);
    console.log('Selected conversation:', selectedConversation?.id);
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, {
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: msg.sender?.display_name || 'Unknown',
        created_at: msg.created_at
      });
    });
  }, [messages, selectedConversation?.id]);



  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {isMobile && selectedConversation && !showConversationList ? (
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowConversationList(true)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold truncate">
              {getConversationName(selectedConversation)}
            </h1>
          </div>
        ) : (
          <h1 className="text-3xl font-bold">Messages</h1>
        )}
        
                 <div className="flex gap-2">

           <Button 
             variant="outline"
             onClick={() => setShowUsersList(true)}
           >
             <UserPlus className="mr-2 h-4 w-4" /> 
             {isMobile ? "" : "Message Users"}
           </Button>
         </div>
      </div>
      
      <div className="flex h-full gap-4 overflow-hidden">
        {/* Conversations list */}
        {(!isMobile || showConversationList) && (
          <div className={cn(
            "border rounded-lg bg-card overflow-hidden",
            isMobile ? "w-full" : "w-80 flex-shrink-0"
          )}>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                 <Input
                   placeholder="Search users..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-8"
                 />
              </div>
            </div>
            
                         <ScrollArea className="h-[calc(100%-60px)]">
               <div className="p-1">
                 {filteredConversations.length > 0 ? (
                   filteredConversations.map((conversation) => {
                     const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
                     const participantName = otherParticipant?.user?.display_name || otherParticipant?.user?.email || 'Unknown User';
                     const participantInitial = participantName.charAt(0).toUpperCase();
                     
                     return (
                       <div
                         key={conversation.id}
                         className={cn(
                           "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                           selectedConversation?.id === conversation.id
                             ? "bg-primary/10 border border-primary/20"
                             : conversation.unread_count && conversation.unread_count > 0
                             ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
                             : "hover:bg-muted/50"
                         )}
                         onClick={() => {
                           handleConversationSelect(conversation);
                         }}
                       >
                         <Avatar className="h-12 w-12">
                           <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                             {participantInitial}
                           </AvatarFallback>
                         </Avatar>
                         
                         <div className="flex-1 overflow-hidden">
                           <div className="flex items-center justify-between">
                             <span className={cn(
                               "font-semibold truncate",
                               conversation.unread_count && conversation.unread_count > 0 
                                 ? "font-bold text-foreground" 
                                 : "text-foreground"
                             )}>
                               {participantName}
                             </span>
                             <span className="text-xs text-muted-foreground">
                               {conversation.last_message_at && 
                                 formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                               }
                             </span>
                           </div>
                           <div className="flex items-center justify-between">
                                                           <span className={cn(
                                "text-sm truncate",
                                conversation.unread_count && conversation.unread_count > 0 
                                  ? "font-bold text-foreground" 
                                  : "text-muted-foreground"
                              )}>
                                {conversation.last_message?.content || (conversation.last_message_at ? "Message content unavailable" : "No messages yet")}
                              </span>
                             {conversation.unread_count && conversation.unread_count > 0 && (
                               <Badge variant="destructive" className="text-xs">
                                 {conversation.unread_count}
                               </Badge>
                             )}
                           </div>
                         </div>
                       </div>
                     );
                   })
                 ) : (
                   <div className="p-4 text-center text-muted-foreground">
                     No conversations found
                   </div>
                 )}
               </div>
             </ScrollArea>
          </div>
        )}
        
        {/* Messages area */}
        {(!isMobile || !showConversationList) && (
          <div className="flex-1 min-w-0 flex flex-col">
            {selectedConversation ? (
              <>
                                 {/* Conversation header */}
                 <div className="border-b bg-card p-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       {selectedConversation.participants && (
                         (() => {
                           const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user?.id);
                           const participantName = otherParticipant?.user?.display_name || otherParticipant?.user?.email || 'Unknown User';
                           const participantInitial = participantName.charAt(0).toUpperCase();
                           
                           return (
                             <>
                               <Avatar className="h-10 w-10">
                                 <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                   {participantInitial}
                                 </AvatarFallback>
                               </Avatar>
                               <div>
                                 <h2 className="font-semibold text-lg">{participantName}</h2>
                                 <p className="text-sm text-muted-foreground">
                                   Direct message
                                 </p>
                               </div>
                             </>
                           );
                         })()
                       )}
                     </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Star conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <EnhancedMessage
                        key={message.id}
                        message={message}
                        isCurrentUser={message.sender_id === user?.id}
                        onEdit={editMessage}
                        onDelete={deleteMessage}
                        onReply={setReplyingTo}
                        onAddReaction={addReaction}
                        onRemoveReaction={removeReaction}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Typing indicators */}
                {typingUsers.length > 0 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {typingUsers.map(user => user.user?.display_name).join(', ')} typing...
                  </div>
                )}

                {/* Message input */}
                <EnhancedMessageInput
                  onSendMessage={handleSendMessage}
                  onTypingChange={handleTypingChange}
                  disabled={sending}
                  replyingTo={replyingTo ? {
                    message: replyingTo,
                    onCancel: () => setReplyingTo(null)
                  } : undefined}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
                 )}
       </div>
       
       {/* Users List Modal */}
       {showUsersList && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b">
               <h2 className="text-lg font-semibold">Message Users</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowUsersList(false)}
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             <div className="p-4">
               {isLoadingUsers ? (
                 <div className="flex items-center justify-center py-8">
                   <Loader2 className="h-6 w-6 animate-spin mr-2" />
                   Loading users...
                 </div>
               ) : users.length > 0 ? (
                 <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                   {users.map((userInfo) => (
                     <div
                       key={userInfo.id}
                       className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                       onClick={() => handleStartConversation(userInfo.id, userInfo.display_name)}
                     >
                       <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback>
                             {userInfo.display_name.charAt(0).toUpperCase()}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="font-medium">{userInfo.display_name}</p>
                           <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                         </div>
                       </div>
                       <Button variant="ghost" size="sm">
                         <MessageSquare className="h-4 w-4" />
                       </Button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   No users available
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default EnhancedMessages; 