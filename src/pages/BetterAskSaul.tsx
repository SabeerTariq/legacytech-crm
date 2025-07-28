
import React from 'react';
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
    <div className="container mx-auto p-4 max-w-4xl">
        <Card className="min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Better Ask Saul
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 mb-4 overflow-y-auto">
              <MessageList messages={messages} isLoading={isLoading} />
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Saul anything about your CRM..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Thinking...' : 'Send'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default BetterAskSaul;
