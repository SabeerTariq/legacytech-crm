
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperclipIcon, Send, SmilePlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  isCurrentUser: boolean;
}

interface MessageChatProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage?: (message: string) => void;
}

const MessageChat: React.FC<MessageChatProps> = ({
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      <div className="p-3 border-b">
        <h3 className="font-medium">Team Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.isCurrentUser ? "justify-end" : "justify-start")}
            >
              <div className="flex gap-2 max-w-[80%]">
                {!message.isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>{message.sender.initials}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {!message.isCurrentUser && (
                      <span className="text-sm font-medium">{message.sender.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <div
                    className={cn(
                      "message-bubble",
                      message.isCurrentUser
                        ? "sent"
                        : "received"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
                {message.isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>{message.sender.initials}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <SmilePlus className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageChat;
