import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system';
  parent_message_id?: string;
  reply_to_message_id?: string;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    display_name: string;
    email: string;
  };
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  thread_reply_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    display_name: string;
  };
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  thumbnail_url?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  workspace_id: string;
  name?: string;
  description?: string;
  type: 'channel' | 'direct' | 'group';
  is_private: boolean;
  is_archived: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
  user?: {
    id: string;
    display_name: string;
    email: string;
  };
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  custom_status?: string;
  updated_at: string;
}

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  started_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name: string;
  };
}

export interface CreateMessageData {
  conversation_id: string;
  content: string;
  message_type?: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system';
  parent_message_id?: string;
  reply_to_message_id?: string;
  attachments?: File[];
}

export interface CreateConversationData {
  name?: string;
  description?: string;
  type: 'channel' | 'direct' | 'group';
  is_private?: boolean;
  participant_ids: string[];
}

export const useEnhancedChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [userPresence, setUserPresence] = useState<UserPresence[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Realtime subscriptions
  const messagesSubscription = useRef<any>(null);
  const typingSubscription = useRef<any>(null);
  const presenceSubscription = useRef<any>(null);

    // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Use API endpoint to bypass RLS policies
      const response = await fetch(`/api/admin/get-conversations?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { conversations: transformedConversations } = await response.json();
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Then get user profiles for all sender_ids
      const senderIds = [...new Set(messagesData?.map(msg => msg.sender_id) || [])];
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, email')
        .in('user_id', senderIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const userProfileMap = new Map();
      userProfiles?.forEach(profile => {
        userProfileMap.set(profile.user_id, profile);
      });

      // Transform data
      const transformedMessages = messagesData?.map((msg: any) => ({
        ...msg,
        sender: userProfileMap.get(msg.sender_id) || null,
        reactions: [],
        attachments: []
      })) || [];

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Send message
  const sendMessage = useCallback(async (messageData: CreateMessageData) => {
    if (!user) return;

    setSending(true);
    try {
      console.log('Sending message:', messageData);
      
      // Create message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversation_id,
          sender_id: user.id,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          parent_message_id: messageData.parent_message_id,
          reply_to_message_id: messageData.reply_to_message_id
        })
        .select()
        .single();

      if (messageError) throw messageError;

      console.log('Message sent successfully:', message);

      // Handle file uploads
      if (messageData.attachments && messageData.attachments.length > 0) {
        for (const file of messageData.attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `messages/${message.id}/${fileName}`;

          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            continue;
          }

          // Get file URL
          const { data: urlData } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(filePath);

          // Create attachment record
          await supabase
            .from('message_attachments')
            .insert({
              message_id: message.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              file_type: getFileType(file.type),
              thumbnail_url: urlData.publicUrl
            });
        }
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id);

      console.log('Conversation updated with last_message_at');

      // Refresh messages for current conversation
      if (selectedConversation && selectedConversation.id === messageData.conversation_id) {
        await fetchMessages(messageData.conversation_id);
      }

      // Refresh conversations list to update last message
      await fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  }, [user, selectedConversation, fetchMessages, fetchConversations, toast]);

  // Create conversation
  const createConversation = useCallback(async (conversationData: CreateConversationData) => {
    if (!user) return;

    setSending(true);
    try {
      // Use backend API to create conversation (bypasses RLS)
      const response = await fetch('/api/admin/create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: conversationData.type,
          participant_ids: [user.id, ...conversationData.participant_ids],
          name: conversationData.name,
          description: conversationData.description,
          is_private: conversationData.is_private || false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }

      const { conversation } = await response.json();

      // Refresh conversations
      await fetchConversations();

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    } finally {
      setSending(false);
    }
  }, [user, fetchConversations, toast]);

  // Add reaction to message
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        });

      if (error) throw error;

      // Refresh messages
      if (selectedConversation) {
        await fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  }, [user, selectedConversation, fetchMessages, toast]);

  // Remove reaction from message
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;

      // Refresh messages
      if (selectedConversation) {
        await fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive"
      });
    }
  }, [user, selectedConversation, fetchMessages, toast]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Refresh messages
      if (selectedConversation) {
        await fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      });
    }
  }, [user, selectedConversation, fetchMessages, toast]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user.id
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Refresh messages
      if (selectedConversation) {
        await fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  }, [user, selectedConversation, fetchMessages, toast]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      // Update the last_read_at timestamp for the current user in this conversation
      const { error } = await supabase
        .from('conversation_participants')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh conversations to update unread counts
      await fetchConversations();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark conversation as read",
        variant: "destructive"
      });
    }
  }, [user, fetchConversations, toast]);

  // Search messages
  const searchMessages = useCallback(async (query: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('message_search')
        .select(`
          message_id,
          messages!inner(
            *,
            sender:user_profiles(user_id, display_name, email),
            conversation:conversations(id, name, type)
          )
        `)
        .textSearch('content_tsv', query)
        .limit(50);

      if (error) throw error;

      const transformedResults = data?.map((item: any) => ({
        ...item.messages,
        sender: item.messages.sender?.[0] || null,
        conversation: item.messages.conversation?.[0] || null
      })) || [];

      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Error",
        description: "Failed to search messages",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Update typing indicator
  const updateTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: isTyping,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'conversation_id,user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating typing indicator:', error);
    }
  }, [user]);

  // Update user presence
  const updatePresence = useCallback(async (status: 'online' | 'away' | 'busy' | 'offline', customStatus?: string) => {
    if (!user) return;

    try {
      // First try to update existing record
      const { error: updateError } = await supabase
        .from('user_presence')
        .update({
          status,
          custom_status: customStatus,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // If no rows were updated, insert new record
      if (updateError) {
        const { error: insertError } = await supabase
          .from('user_presence')
          .insert({
            user_id: user.id,
            status,
            custom_status: customStatus,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting presence:', insertError);
        }
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    console.log('Setting up real-time subscription for messages...');
    messagesSubscription.current = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new as Message;
        console.log('New message received via real-time:', newMessage);
        console.log('Current selected conversation:', selectedConversation?.id);
        console.log('Message conversation ID:', newMessage.conversation_id);
        
        // Always refresh conversations to update last message
        await fetchConversations();
        
        // If this message is for the currently selected conversation, add it to the messages
        if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
          console.log('Adding message to current conversation');
          // Get the sender information for the new message
          const { data: senderProfile } = await supabase
            .from('user_profiles')
            .select('user_id, display_name, email')
            .eq('user_id', newMessage.sender_id)
            .single();
          
          const messageWithSender = {
            ...newMessage,
            sender: senderProfile || null,
            reactions: [],
            attachments: []
          };
          
          setMessages(prev => [...prev, messageWithSender]);
        } else {
          console.log('Message not for current conversation, but conversation list updated');
        }
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    // Subscribe to typing indicators
    typingSubscription.current = supabase
      .channel('typing')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators'
      }, (payload) => {
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(t => t.user_id !== payload.new.user_id);
            if (payload.new.is_typing) {
              return [...filtered, payload.new];
            }
            return filtered;
          });
        }
      })
      .subscribe();

    // Subscribe to conversation updates (for last_message_at changes)
    const conversationSubscription = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('Conversation updated via real-time:', payload.new);
        // Refresh conversations when any conversation is updated
        fetchConversations();
      })
      .subscribe();

    // Store the conversation subscription for cleanup
    const conversationSubscriptionRef = { current: conversationSubscription };

    // Set user as online (temporarily disabled presence subscription)
    // updatePresence('online');

    return () => {
      // Set user as offline when component unmounts (temporarily disabled)
      // updatePresence('offline');
      
      if (messagesSubscription.current) {
        supabase.removeChannel(messagesSubscription.current);
      }
      if (typingSubscription.current) {
        supabase.removeChannel(typingSubscription.current);
      }
      if (presenceSubscription.current) {
        supabase.removeChannel(presenceSubscription.current);
      }
      if (conversationSubscriptionRef.current) {
        supabase.removeChannel(conversationSubscriptionRef.current);
      }
    };
  }, [user, selectedConversation, updatePresence, fetchConversations]);

  // Helper function to determine file type
  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
    return 'other';
  };

  return {
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
  };
}; 