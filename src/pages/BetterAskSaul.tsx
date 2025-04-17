
import React, { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, AlertCircle, Key, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

const BetterAskSaul = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
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
      console.log("Sending request to Supabase function");
      
      const { data, error } = await supabase.functions.invoke('better-ask-saul', {
        body: { 
          messages: [...messages, userMessage],
          userId: user?.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to call Supabase function: ${error.message}`);
      }

      console.log("Response from Supabase function:", data);

      if (!data) {
        throw new Error('No response received from Saul');
      }

      if (data.error) {
        // Check if it's an API key related error
        if (data.error.includes('API key')) {
          setApiKeyDialogOpen(true);
          throw new Error(data.error);
        }
        throw new Error(data.error);
      }

      if (!data.response) {
        throw new Error('Invalid response from Saul');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('Error:', error);
      
      // Add an error message to the conversation
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message || 'Failed to get response from Saul'}`
      }]);
      
      toast({
        title: "Error",
        description: `Failed to get response from Saul: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                    Hi, I'm Saul! I can help you with your CRM-related questions and tasks.
                    I have access to your leads and projects data.
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

        <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" /> OpenAI API Key Required
              </DialogTitle>
              <DialogDescription>
                The Better Ask Saul feature requires a valid OpenAI API key to be configured in your Supabase secrets.
                Please contact your administrator to set up the API key.
              </DialogDescription>
            </DialogHeader>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700">Important</AlertTitle>
              <AlertDescription className="text-amber-600">
                The OpenAI API key in your Supabase secrets appears to be invalid or missing.
                This is a backend configuration issue that needs to be addressed by your system administrator.
              </AlertDescription>
            </Alert>
            <Button onClick={() => setApiKeyDialogOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BetterAskSaul;
