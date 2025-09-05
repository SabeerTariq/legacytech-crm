import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageReaction, MessageAttachment } from '@/hooks/useEnhancedChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Reply, 
  Smile, 
  Paperclip, 
  Download,
  Eye,
  FileText,
  Image,
  Video,
  Music,
  File
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextJWT';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (message: Message) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onThreadClick?: (messageId: string) => void;
  showThread?: boolean;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🙏', '🔥', '💯'];

export const EnhancedMessage: React.FC<EnhancedMessageProps> = ({
  message,
  isCurrentUser,
  onEdit,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  onThreadClick,
  showThread = false
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState<MessageAttachment | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>) || {};

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setTimeout(() => {
      editTextareaRef.current?.focus();
    }, 100);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleReaction = (emoji: string) => {
    const hasReacted = message.reactions?.some(r => r.user_id === user?.id && r.emoji === emoji);
    
    if (hasReacted) {
      onRemoveReaction(message.id, emoji);
    } else {
      onAddReaction(message.id, emoji);
    }
    setShowReactionPicker(false);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAttachment = (attachment: MessageAttachment) => (
    <div 
      key={attachment.id}
      className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
      onClick={() => setShowAttachmentPreview(attachment)}
    >
      {getFileIcon(attachment.file_type)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <div className={cn(
      "group relative p-4 hover:bg-muted/50 transition-colors",
      isCurrentUser && "bg-muted/30"
    )}>
      {/* Message Container */}
      <div className={cn(
        "flex w-full",
        isCurrentUser ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "flex gap-3 max-w-[75%]",
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar - only show for other users */}
          {!isCurrentUser && (
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={message.sender?.avatar_url} />
              <AvatarFallback>
                {message.sender?.display_name?.slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Message content */}
          <div className={cn(
            "flex flex-col",
            isCurrentUser ? "items-end" : "items-start"
          )}>
            {/* Message Header */}
            <div className={cn(
              "flex items-center gap-2 mb-1",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}>
              <span className="font-medium text-sm text-muted-foreground">
                {isCurrentUser ? "You" : message.sender?.display_name || 'Unknown User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
              {message.is_edited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Message Content */}
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Edit your message..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-full break-words",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2">
                    {message.attachments.map(renderAttachment)}
                  </div>
                )}

                {/* Reactions */}
                {Object.keys(groupedReactions).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                      <Badge
                        key={emoji}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleReaction(emoji)}
                      >
                        {emoji} {reactions.length}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Thread indicator */}
                {message.thread_reply_count && message.thread_reply_count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onThreadClick?.(message.id)}
                  >
                    {message.thread_reply_count} replies
                  </Button>
                )}
              </div>
            )}

            {/* Message Actions */}
            {!isEditing && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    {isCurrentUser && (
                      <>
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(message.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setShowReactionPicker(true)}>
                      <Smile className="h-4 w-4 mr-2" />
                      Add reaction
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reaction Picker */}
      {showReactionPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-lg shadow-lg p-2 z-10">
          <div className="grid grid-cols-5 gap-1">
            {EMOJI_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview Dialog */}
      <Dialog open={!!showAttachmentPreview} onOpenChange={() => setShowAttachmentPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{showAttachmentPreview?.file_name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {showAttachmentPreview && (
              <div className="space-y-4">
                {showAttachmentPreview.file_type === 'image' ? (
                  <img
                    src={showAttachmentPreview.thumbnail_url}
                    alt={showAttachmentPreview.file_name}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : showAttachmentPreview.file_type === 'video' ? (
                  <video
                    controls
                    className="max-w-full h-auto rounded-lg"
                    src={showAttachmentPreview.thumbnail_url}
                  />
                ) : showAttachmentPreview.file_type === 'audio' ? (
                  <audio
                    controls
                    className="w-full"
                    src={showAttachmentPreview.thumbnail_url}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                    <div className="text-center">
                      {getFileIcon(showAttachmentPreview.file_type)}
                      <p className="mt-2 text-sm text-muted-foreground">
                        {showAttachmentPreview.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(showAttachmentPreview.file_size)}
                      </p>
                      <Button className="mt-2" onClick={() => window.open(showAttachmentPreview.thumbnail_url)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 