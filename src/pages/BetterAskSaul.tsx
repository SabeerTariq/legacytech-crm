
import React, { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

const BetterAskSaul = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Simple loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center my-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Better Ask Saul
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Saul's CRM Assistant</AlertTitle>
                  <AlertDescription>
                    Hi, I'm Saul! I can help with your CRM questions and tasks.
                    Ask me anything about your leads and projects.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <ScrollArea className="flex-1 min-h-[400px] mb-4 p-4 border rounded-md">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 p-3 rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-muted'
                      : msg.role === 'system'
                      ? 'bg-destructive/10 border border-destructive/20'
                      : 'bg-primary/10'
                  }`}
                >
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    {msg.role === 'assistant' 
                      ? 'Saul' 
                      : msg.role === 'system' 
                      ? <><AlertCircle size={16} /> System</>
                      : 'You'}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              
              {isLoading && <LoadingSpinner />}
            </ScrollArea>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Saul anything about your CRM..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Thinking...' : 'Send'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BetterAskSaul;
