
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export const useAiChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'Welcome to Better Ask Saul! Ask me anything about your leads, projects, or tasks and I\'ll help you find the information you need.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('better-ask-saul', {
        body: { 
          messages: [...messages, userMessage],
          userId: user?.id
        }
      });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('Error:', error);
      
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message || 'Failed to get response'}`
      }]);
      
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
  };
};
