
import React from 'react';
import { AlertCircle, Bot } from "lucide-react";

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`mb-4 p-3 rounded-lg ${
        message.role === 'assistant'
          ? 'bg-muted'
          : message.role === 'system'
          ? 'bg-destructive/10 border border-destructive/20'
          : 'bg-primary/10'
      }`}
    >
      <p className="text-sm font-medium mb-1 flex items-center gap-2">
        {message.role === 'assistant' 
          ? 'Saul' 
          : message.role === 'system' 
          ? <><AlertCircle size={16} /> System</>
          : 'You'}
      </p>
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  );
};

