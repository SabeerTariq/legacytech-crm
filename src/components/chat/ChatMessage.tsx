
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
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] p-4 rounded-lg ${
          isAssistant
            ? 'bg-white border border-gray-200'
            : isSystem
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-600 text-white'
        }`}
      >
        <div className={`text-sm leading-relaxed text-left ${
          isUser ? 'text-white' : 'text-gray-800'
        }`}>
          {message.content.split('\n').map((line, index) => {
            // Handle bold text (**text**)
            let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Handle numbered lists (1. text)
            formattedLine = formattedLine.replace(/^(\d+)\.\s/, '<span class="font-medium">$1.</span> ');
            
            // Handle bullet points (- text)
            formattedLine = formattedLine.replace(/^-\s/, '• ');
            
            // Skip empty lines but keep spacing
            if (line.trim() === '') {
              return <div key={index} className="h-2" />;
            }
            
            return (
              <div key={index} className="mb-1 text-left" 
                dangerouslySetInnerHTML={{ __html: formattedLine }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

