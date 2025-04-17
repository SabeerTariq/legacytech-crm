
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

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
  };

  const fetchMessagesForConversation = async (conversationId: string) => {
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
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        
        return {
          ...msg,
          sender: senderData || undefined
        };
      }) || []
    );

    setMessages(messagesWithSenders);
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        sender_id: user.id,
        conversation_id: conversationId
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const createConversation = async (participantIds: string[], name?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({ 
        name: name || 'New Conversation', 
        is_group: participantIds.length > 1 
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating conversation:', error);
      return null;
    }

    // Add participants
    const participantData = participantIds.map(id => ({
      conversation_id: data.id,
      user_id: id
    }));

    await supabase.from('conversation_participants').insert(participantData);

    return data;
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
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
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
    fetchMessagesForConversation,
    sendMessage,
    createConversation
  };
};
