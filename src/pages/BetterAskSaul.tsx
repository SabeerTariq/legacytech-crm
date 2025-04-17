
import React from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot } from "lucide-react";
import { MessageList } from "@/components/chat/MessageList";
import { useAiChat } from "@/hooks/useAiChat";

const BetterAskSaul = () => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit
  } = useAiChat();

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
            <MessageList messages={messages} isLoading={isLoading} />
            
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

