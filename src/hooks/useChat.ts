
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextJWT';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  last_message_text?: string | null;
  participants?: { user_id: string; full_name?: string }[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversations (
            id,
            name,
            is_group,
            last_message_text
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const extractedConversations = data?.map(item => item.conversations) || [];
      setConversations(extractedConversations);
    } catch (err) {
      console.error('Exception fetching conversations:', err);
    }
  };

  const fetchMessagesForConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          sender_id,
          conversation_id,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Separate query to get sender details for each message
      const messagesWithSenders = await Promise.all(
        data?.map(async (msg) => {
          const { data: senderData } = await supabase
            .from('user_profiles')
            .select('display_name as full_name')
            .eq('user_id', msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender: senderData || undefined
          };
        }) || []
      );

      setMessages(messagesWithSenders);
    } catch (err) {
      console.error('Exception fetching messages:', err);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content,
          sender_id: user.id,
          conversation_id: conversationId
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Failed to send message",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Exception sending message:', err);
    }
  };

  const createConversation = async (participantIds: string[], name?: string) => {
    if (!user) return null;
    
    if (participantIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one participant",
        variant: "destructive"
      });
      return null;
    }
    
    setCreatingConversation(true);
    
    try {
      // Step 1: Create the conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({ 
          name: name || 'New Conversation', 
          is_group: participantIds.length > 1 
        })
        .select()
        .single();

      if (conversationError || !conversationData) {
        console.error('Error creating conversation:', conversationError);
        toast({
          title: "Failed to create conversation",
          description: conversationError?.message || "Unknown error",
          variant: "destructive"
        });
        setCreatingConversation(false);
        return null;
      }

      // Step 2: Add current user as participant
      const allParticipantIds = [...participantIds];
      if (!allParticipantIds.includes(user.id)) {
        allParticipantIds.push(user.id);
      }

      // Step 3: Add participants one by one to avoid RLS issues
      for (const participantId of allParticipantIds) {
        const { error: participantError } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: conversationData.id,
            user_id: participantId
          });

        if (participantError) {
          console.error(`Error adding participant ${participantId}:`, participantError);
          // Continue with other participants
        }
      }

      // Step 4: Refresh conversations list
      await fetchConversations();
      
      toast({
        title: "Conversation created",
        description: "Your new conversation has been created successfully",
      });

      setCreatingConversation(false);
      return conversationData;
    } catch (err) {
      console.error('Exception creating conversation:', err);
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive"
      });
      setCreatingConversation(false);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages' 
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Get sender details
          const { data: senderData } = await supabase
            .from('user_profiles')
            .select('display_name as full_name')
            .eq('user_id', newMessage.sender_id)
            .single();
          
          setMessages(prev => [
            ...prev, 
            { ...newMessage, sender: senderData || undefined }
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    conversations,
    messages,
    loading,
    creatingConversation,
    fetchMessagesForConversation,
    sendMessage,
    createConversation
  };
};
