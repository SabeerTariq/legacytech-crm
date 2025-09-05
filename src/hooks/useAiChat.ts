
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContextJWT';
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useAiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'Welcome to Better Ask Saul! Ask me anything about your leads, projects, or tasks and I\'ll help you find the information you need.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('current');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  // Load chat history from database
  const loadChatHistory = useCallback(async () => {
    if (!user) {
      console.log('No user authenticated, skipping chat history load');
      return;
    }

    setIsLoadingHistory(true);
    try {
      console.log('Loading chat history for user:', user.id);
      const { data, error } = await supabase
        .from('ai_chat_conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chat history:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive",
        });
        return;
      }

      console.log('Chat history loaded:', data?.length || 0, 'conversations');
      setChatHistory(data || []);
    } catch (error) {
      console.error('Exception loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, toast]);

  // Load messages for a specific conversation
  const loadMessagesForConversation = useCallback(async (conversationId: string) => {
    if (!user || conversationId === 'current') return;

    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      } else {
        // If no messages found, start with system message
        setMessages([
          { 
            role: 'system', 
            content: 'Welcome to Better Ask Saul! Ask me anything about your leads, projects, or tasks and I\'ll help you find the information you need.'
          }
        ]);
      }
    } catch (error) {
      console.error('Exception loading messages:', error);
    }
  }, [user]);

  // Save messages to database
  const saveMessagesToDatabase = useCallback(async (conversationId: string, messagesToSave: Message[]) => {
    if (!user || conversationId === 'current') {
      console.log('Cannot save messages: no user or current chat ID');
      return;
    }

    try {
      console.log('Saving messages to conversation:', conversationId);
      console.log('Messages to save:', messagesToSave.length);
      
      // Delete existing messages for this conversation
      const { error: deleteError } = await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (deleteError) {
        console.error('Error deleting existing messages:', deleteError);
        return;
      }

      // Insert new messages
      const messagesToInsert = messagesToSave.map(msg => ({
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content
      }));

      const { error: insertError } = await supabase
        .from('ai_chat_messages')
        .insert(messagesToInsert);

      if (insertError) {
        console.error('Error saving messages:', insertError);
      } else {
        console.log('Messages saved successfully');
      }
    } catch (error) {
      console.error('Exception saving messages:', error);
    }
  }, [user]);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    console.log('🚀 Starting chat submission...');
    console.log('User input:', input);
    console.log('User ID:', user?.id);

    const userMessage = { role: 'user' as const, content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      console.log('📡 Calling edge function...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      const functionPromise = supabase.functions.invoke('better-ask-saul', {
        body: { 
          messages: updatedMessages,
          userId: user?.id
        }
      });
      
      const { data, error } = await Promise.race([functionPromise, timeoutPromise]) as {
        data?: { response?: string; error?: string };
        error?: { message: string };
      };

      console.log('📥 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (data?.error) {
        console.error('❌ Data error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.response) {
        console.error('❌ No response in data:', data);
        throw new Error('No response received from AI');
      }

      console.log('✅ AI response received:', data.response);
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: data.response }];
      setMessages(finalMessages);

      // Save messages to database if we have a conversation ID
      if (currentChatId !== 'current') {
        await saveMessagesToDatabase(currentChatId, finalMessages);
      }
    } catch (error: unknown) {
      console.error('❌ Chat error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      const errorMessages = [...updatedMessages, { 
        role: 'system' as const, 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
      }];
      setMessages(errorMessages);
      
      // Save error messages to database
      if (currentChatId !== 'current') {
        await saveMessagesToDatabase(currentChatId, errorMessages);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Chat submission completed');
    }
  };

  const createNewChat = async () => {
    console.log('🔄 Creating new chat...');
    console.log('Current messages:', messages);
    console.log('Current chat ID:', currentChatId);
    console.log('User:', user?.id);
    
    if (!user) {
      console.error('No user authenticated, cannot create new chat');
      toast({
        title: "Error",
        description: "Please log in to create chats",
        variant: "destructive",
      });
      return;
    }
    
    // Save current chat to database if it has more than just the system message
    if (messages.length > 1) {
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      const chatTitle = firstUserMessage ? firstUserMessage.content.slice(0, 30) + '...' : 'New Chat';
      console.log('Saving current chat with title:', chatTitle);
      
      if (currentChatId === 'current') {
        // Create a new conversation for the current chat
        console.log('Creating new conversation for current chat...');
        const { data: newConversation, error: createError } = await supabase
          .from('ai_chat_conversations')
          .insert({
            user_id: user.id,
            title: chatTitle
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation for current chat:', createError);
          toast({
            title: "Error",
            description: "Failed to save current chat",
            variant: "destructive",
          });
        } else {
          // Save messages to the new conversation
          console.log('Saving messages to conversation:', newConversation.id);
          await saveMessagesToDatabase(newConversation.id, messages);
          console.log('Saved current chat to new conversation:', newConversation.id);
        }
      } else {
        // Update existing conversation title and save messages
        console.log('Updating existing conversation:', currentChatId);
        const { error: updateError } = await supabase
          .from('ai_chat_conversations')
          .update({ title: chatTitle })
          .eq('id', currentChatId);

        if (updateError) {
          console.error('Error updating conversation title:', updateError);
        }

        // Save messages
        await saveMessagesToDatabase(currentChatId, messages);
      }
    }

    // Create new conversation in database
    console.log('Creating new conversation for fresh chat...');
    const { data: newConversation, error: createError } = await supabase
      .from('ai_chat_conversations')
      .insert({
        user_id: user.id,
        title: 'New Chat'
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating new conversation:', createError);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
      return;
    }

    const newChatId = newConversation.id;
    console.log('New chat ID:', newChatId);
    setCurrentChatId(newChatId);
    setMessages([
      { 
        role: 'system', 
        content: 'Welcome to Better Ask Saul! Ask me anything about your leads, projects, or tasks and I\'ll help you find the information you need.'
      }
    ]);
    setInput('');

    // Reload chat history to include the new conversation
    await loadChatHistory();
  };

  const loadChat = async (chatId: string) => {
    console.log('📂 Loading chat:', chatId);
    console.log('Available chats:', chatHistory.map(c => ({ id: c.id, title: c.title })));
    
    if (chatId === 'current') {
      console.log('Loading current/new chat');
      setCurrentChatId('current');
      setMessages([
        { 
          role: 'system', 
          content: 'Welcome to Better Ask Saul! Ask me anything about your leads, projects, or tasks and I\'ll help you find the information you need.'
        }
      ]);
    } else {
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat) {
        console.log('Loading existing chat:', chat.title);
        setCurrentChatId(chatId);
        await loadMessagesForConversation(chatId);
      } else {
        console.log('Chat not found:', chatId);
      }
    }
    setInput('');
  };

  const deleteChat = async (chatId: string) => {
    try {
      // Archive the conversation instead of deleting
      const { error } = await supabase
        .from('ai_chat_conversations')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (error) {
        console.error('Error archiving conversation:', error);
        toast({
          title: "Error",
          description: "Failed to delete chat",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setChatHistory(prev => prev.filter(c => c.id !== chatId));
      
      if (currentChatId === chatId) {
        await loadChat('current');
      }

      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error('Exception deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isLoadingHistory,
    handleSubmit,
    chatHistory,
    currentChatId,
    createNewChat,
    loadChat,
    deleteChat,
    loadChatHistory,
  };
};
