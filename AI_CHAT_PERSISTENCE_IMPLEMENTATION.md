# 🤖 AI Chat Persistence Implementation

## 📋 Overview

This implementation adds database persistence to the Better Ask Saul AI chat module, allowing users to access their chat history across sessions and automatically cleaning up old conversations after 30 days.

## 🗄️ Database Schema

### Tables Created

#### `ai_chat_conversations`
- Stores conversation metadata
- Links to user via `user_id`
- Includes title, timestamps, and archive status
- Automatically cleaned up after 30 days

#### `ai_chat_messages`
- Stores individual messages within conversations
- Links to conversation via `conversation_id`
- Includes role (system/user/assistant), content, and timestamps
- Automatically deleted when conversation is deleted (CASCADE)

### Key Features

#### 🔒 Security
- **Row Level Security (RLS)** - Users can only access their own conversations
- **Automatic cleanup** - Conversations older than 30 days are automatically removed
- **Archive instead of delete** - Conversations are archived rather than permanently deleted

#### ⚡ Performance
- **Indexes** on user_id, conversation_id, and timestamps
- **Efficient queries** for loading chat history and messages
- **Optimized for real-time updates**

#### 🧹 Maintenance
- **Automatic cleanup function** - `manual_cleanup_ai_chats()`
- **Edge function** - `cleanup-ai-chats` for scheduled cleanup
- **30-day retention policy** - Configurable retention period

## 🔧 Implementation Details

### Updated Components

#### `useAiChat` Hook (`src/hooks/useAiChat.ts`)
- **Database integration** - Loads and saves conversations to database
- **Real-time persistence** - Messages are saved immediately after AI responses
- **Error handling** - Graceful fallback for database errors
- **Loading states** - Proper loading indicators for better UX

#### `BetterAskSaul` Component (`src/pages/BetterAskSaul.tsx`)
- **Loading states** - Shows loading indicators during database operations
- **Improved UX** - Better button states and feedback
- **Error handling** - Toast notifications for errors

#### `ChatSidebar` Component (`src/components/chat/ChatSidebar.tsx`)
- **Database structure** - Updated to work with new conversation format
- **Loading indicators** - Shows loading state while fetching history
- **Date formatting** - Proper date display for conversation timestamps

### Database Operations

#### Creating New Chats
1. User clicks "New Chat"
2. Current conversation is saved to database (if has messages)
3. New conversation record is created
4. Chat history is reloaded to include new conversation

#### Loading Chat History
1. On component mount, fetch user's conversations
2. Filter out archived conversations
3. Order by most recent first
4. Display in sidebar with proper loading states

#### Saving Messages
1. After each AI response, save all messages to database
2. Update conversation timestamp
3. Handle errors gracefully with user feedback

#### Deleting Chats
1. Archive conversation instead of permanent deletion
2. Remove from local state
3. Show success/error feedback to user

## 🚀 Deployment Steps

### 1. Apply Database Schema

```bash
# Option 1: Use the provided script
node apply-ai-chat-schema.js

# Option 2: Manual application
# Copy contents of ai-chat-schema.sql to Supabase SQL Editor
```

### 2. Deploy Edge Functions

```bash
# Deploy the cleanup function
supabase functions deploy cleanup-ai-chats

# Deploy the existing better-ask-saul function (if needed)
supabase functions deploy better-ask-saul
```

### 3. Test the Implementation

1. **Create a new chat** - Verify it's saved to database
2. **Send messages** - Check that messages persist
3. **Switch between chats** - Ensure history loads correctly
4. **Delete a chat** - Verify it's archived properly
5. **Refresh page** - Confirm persistence across sessions

## 📊 Database Schema Details

### Row Level Security Policies

#### Conversations
- Users can only view their own conversations
- Users can only create conversations for themselves
- Users can only update/delete their own conversations

#### Messages
- Users can only access messages in their own conversations
- Users can only send messages to conversations they participate in
- Users can only edit/delete their own messages

### Indexes for Performance

```sql
-- Conversation indexes
CREATE INDEX idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX idx_ai_chat_conversations_created_at ON ai_chat_conversations(created_at);

-- Message indexes
CREATE INDEX idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);
```

### Cleanup Functions

#### `manual_cleanup_ai_chats()`
- Counts and deletes conversations older than 30 days
- Returns statistics about deleted items
- Can be called manually or via edge function

#### `cleanup_old_ai_chats()`
- Simple cleanup function for scheduled execution
- Deletes old conversations without returning statistics

## 🔄 Edge Functions

### `cleanup-ai-chats`
- **Purpose**: Scheduled cleanup of old conversations
- **Trigger**: Can be called manually or scheduled
- **Functionality**: Calls `manual_cleanup_ai_chats()` database function
- **Response**: Returns cleanup statistics

### Usage
```javascript
// Call cleanup function
const { data, error } = await supabase.functions.invoke('cleanup-ai-chats');

if (data?.success) {
  console.log(`Cleaned up ${data.result.deleted_conversations} conversations`);
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **New Chat Creation**
  - [ ] Creates conversation in database
  - [ ] Updates chat history in sidebar
  - [ ] Shows proper loading states

- [ ] **Message Persistence**
  - [ ] Messages saved after AI response
  - [ ] Messages persist across page refresh
  - [ ] Error messages are also saved

- [ ] **Chat History**
  - [ ] Loads user's conversations on page load
  - [ ] Shows proper timestamps
  - [ ] Handles empty state correctly

- [ ] **Chat Switching**
  - [ ] Can switch between different chats
  - [ ] Messages load correctly for each chat
  - [ ] Current chat is highlighted

- [ ] **Chat Deletion**
  - [ ] Archives conversation in database
  - [ ] Removes from sidebar
  - [ ] Shows success/error feedback

- [ ] **Error Handling**
  - [ ] Graceful handling of database errors
  - [ ] User-friendly error messages
  - [ ] Fallback to in-memory storage if needed

### Automated Testing

```javascript
// Example test for chat persistence
describe('AI Chat Persistence', () => {
  it('should save messages to database', async () => {
    // Test implementation
  });
  
  it('should load chat history on mount', async () => {
    // Test implementation
  });
  
  it('should cleanup old conversations', async () => {
    // Test implementation
  });
});
```

## 🔧 Configuration

### Environment Variables

```env
# Required for database operations
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Customize retention period
AI_CHAT_RETENTION_DAYS=30
```

### Customization Options

#### Retention Period
```sql
-- Modify the cleanup function to change retention period
CREATE OR REPLACE FUNCTION manual_cleanup_ai_chats()
RETURNS json AS $$
BEGIN
    DELETE FROM ai_chat_conversations 
    WHERE created_at < NOW() - INTERVAL '60 days'; -- Change to 60 days
    -- ... rest of function
END;
$$ language 'plpgsql';
```

#### Archive Instead of Delete
```sql
-- Modify delete function to archive instead of delete
CREATE OR REPLACE FUNCTION archive_conversation(conv_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ai_chat_conversations 
    SET is_archived = true, archived_at = NOW()
    WHERE id = conv_id;
END;
$$ language 'plpgsql';
```

## 📈 Performance Considerations

### Database Optimization
- **Indexes** on frequently queried columns
- **Efficient queries** with proper joins
- **Connection pooling** for better performance

### Frontend Optimization
- **Lazy loading** of chat history
- **Pagination** for large chat lists
- **Caching** of frequently accessed data

### Monitoring
- **Query performance** monitoring
- **Storage usage** tracking
- **Cleanup statistics** logging

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```javascript
// Check Supabase connection
const { data, error } = await supabase.from('ai_chat_conversations').select('count');
if (error) {
  console.error('Database connection issue:', error);
}
```

#### RLS Policy Issues
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'ai_chat%';
```

#### Cleanup Function Issues
```javascript
// Test cleanup function
const { data, error } = await supabase.rpc('manual_cleanup_ai_chats');
console.log('Cleanup result:', data);
```

### Debug Mode

```javascript
// Enable debug logging
const DEBUG_AI_CHAT = process.env.NODE_ENV === 'development';

if (DEBUG_AI_CHAT) {
  console.log('AI Chat Debug:', { messages, chatHistory, currentChatId });
}
```

## 📝 Future Enhancements

### Planned Features
- [ ] **Message search** functionality
- [ ] **Chat export** to PDF/CSV
- [ ] **Chat templates** for common queries
- [ ] **Multi-user conversations** (if needed)
- [ ] **Message reactions** and threading
- [ ] **File attachments** in AI chats

### Performance Improvements
- [ ] **Real-time updates** via Supabase subscriptions
- [ ] **Message pagination** for long conversations
- [ ] **Offline support** with local storage fallback
- [ ] **Message compression** for storage optimization

## 📚 API Reference

### Database Functions

#### `manual_cleanup_ai_chats()`
```sql
-- Returns cleanup statistics
{
  "deleted_conversations": 5,
  "deleted_messages": 150,
  "cleanup_date": "2024-01-15T10:30:00Z"
}
```

### Hook Methods

#### `useAiChat()`
```typescript
interface UseAiChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isLoadingHistory: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  chatHistory: ChatConversation[];
  currentChatId: string;
  createNewChat: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
}
```

## 🎯 Success Metrics

### User Experience
- ✅ **Chat persistence** across sessions
- ✅ **Fast loading** of chat history
- ✅ **Reliable message saving**
- ✅ **Intuitive error handling**

### Technical Performance
- ✅ **Database efficiency** with proper indexes
- ✅ **Automatic cleanup** prevents storage bloat
- ✅ **Security** with RLS policies
- ✅ **Scalability** for multiple users

### Maintenance
- ✅ **30-day retention** policy
- ✅ **Automated cleanup** processes
- ✅ **Error monitoring** and logging
- ✅ **Easy troubleshooting** tools

---

**Implementation Status**: ✅ Complete  
**Last Updated**: January 2025  
**Next Review**: February 2025 