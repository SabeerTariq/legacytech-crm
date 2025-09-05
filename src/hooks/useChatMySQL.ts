import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextJWT';
import { useToast } from '@/hooks/use-toast';
import { MessagesClient } from '@/lib/api/messagesClient';

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

export const useChatMySQL = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const data = await MessagesClient.getConversations();
      
      if (data.success && data.data.conversations) {
        setConversations(data.data.conversations);
      } else {
        console.error('Error fetching conversations:', data);
        setConversations([]);
      }
    } catch (err) {
      console.error('Exception fetching conversations:', err);
      setConversations([]);
    }
  };

  const fetchMessagesForConversation = async (conversationId: string) => {
    try {
      const data = await MessagesClient.getMessages(conversationId);
      
      if (data.success && data.data.messages) {
        setMessages(data.data.messages);
      } else {
        console.error('Error fetching messages:', data);
        setMessages([]);
      }
    } catch (err) {
      console.error('Exception fetching messages:', err);
      setMessages([]);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      const data = await MessagesClient.sendMessage(conversationId, content, 'text');
      
      if (data.success && data.data) {
        // Add the new message to the current messages
        setMessages(prev => [...prev, data.data]);
        
        // Update the conversation's last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, last_message_text: content }
              : conv
          )
        );
      } else {
        console.error('Error sending message:', data);
        toast({
          title: "Failed to send message",
          description: data.message || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Exception sending message:', err);
      toast({
        title: "Failed to send message",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
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
      const data = await MessagesClient.createConversation(
        name || 'New Conversation',
        participantIds,
        'general'
      );
      
      if (data.success && data.data) {
        // Add the new conversation to the list
        setConversations(prev => [data.data, ...prev]);
        
        toast({
          title: "Conversation created",
          description: "Your new conversation has been created successfully",
        });

        setCreatingConversation(false);
        return data.data;
      } else {
        console.error('Error creating conversation:', data);
        toast({
          title: "Failed to create conversation",
          description: data.message || "Unknown error",
          variant: "destructive"
        });
        setCreatingConversation(false);
        return null;
      }
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

  // Note: Real-time updates would require WebSocket implementation
  // For now, we'll rely on manual refresh or polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchConversations();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

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
