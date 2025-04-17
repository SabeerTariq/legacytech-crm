
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  if (messages.length === 0) {
    return (
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
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-[400px] mb-4 p-4 border rounded-md">
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-center my-4">
          <Spinner size="md" />
        </div>
      )}
    </ScrollArea>
  );
};

