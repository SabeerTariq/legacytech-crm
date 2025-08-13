
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperclipIcon, Send, SmilePlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  messages = [],
  currentUserId,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex gap-3 max-w-[75%]",
                  message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Avatar - only show for other users */}
                  {!message.isCurrentUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>{message.sender.initials}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  {/* Message content */}
                  <div className={cn(
                    "flex flex-col",
                    message.isCurrentUser ? "items-end" : "items-start"
                  )}>
                    {/* Sender name and timestamp */}
                    <div className={cn(
                      "flex items-center gap-2 mb-1",
                      message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                    )}>
                      <span className="text-sm font-medium text-muted-foreground">
                        {message.isCurrentUser ? "You" : message.sender.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    
                    {/* Message bubble */}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-full break-words",
                        message.isCurrentUser
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                  
                  {/* Avatar for current user - only show for current user */}
                  {message.isCurrentUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>{message.sender.initials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No messages yet. Start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <Button variant="ghost" size="icon">
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <SmilePlus className="h-4 w-4" />
              </Button>
            </>
          )}
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
