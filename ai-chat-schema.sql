-- AI Chat Storage Schema for Better Ask Saul
-- This schema stores AI chat conversations and messages with automatic cleanup after 30 days

-- 1. AI Chat Conversations
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- 2. AI Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_created_at ON ai_chat_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_chat_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_chat_conversations_updated_at 
    BEFORE UPDATE ON ai_chat_conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_ai_chat_updated_at_column();

CREATE TRIGGER update_ai_chat_messages_updated_at 
    BEFORE UPDATE ON ai_chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_ai_chat_updated_at_column();

-- Function to automatically clean up old conversations (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_chats()
RETURNS void AS $$
BEGIN
    -- Delete conversations older than 30 days
    DELETE FROM ai_chat_conversations 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Note: Messages will be automatically deleted due to CASCADE
END;
$$ language 'plpgsql';

-- Create a scheduled job to run cleanup every day
-- This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-ai-chats', '0 2 * * *', 'SELECT cleanup_old_ai_chats();');

-- Alternative: Create a function that can be called manually or via edge function
CREATE OR REPLACE FUNCTION manual_cleanup_ai_chats()
RETURNS json AS $$
DECLARE
    deleted_conversations INTEGER;
    deleted_messages INTEGER;
BEGIN
    -- Count messages to be deleted
    SELECT COUNT(*) INTO deleted_messages
    FROM ai_chat_messages am
    JOIN ai_chat_conversations ac ON am.conversation_id = ac.id
    WHERE ac.created_at < NOW() - INTERVAL '30 days';
    
    -- Count conversations to be deleted
    SELECT COUNT(*) INTO deleted_conversations
    FROM ai_chat_conversations 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old conversations (messages will be deleted via CASCADE)
    DELETE FROM ai_chat_conversations 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN json_build_object(
        'deleted_conversations', deleted_conversations,
        'deleted_messages', deleted_messages,
        'cleanup_date', NOW()
    );
END;
$$ language 'plpgsql';

-- Row Level Security (RLS) Policies
ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can view their own AI chat conversations" ON ai_chat_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chat conversations" ON ai_chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI chat conversations" ON ai_chat_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chat conversations" ON ai_chat_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access messages in their own conversations
CREATE POLICY "Users can view messages in their own AI chat conversations" ON ai_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_chat_conversations 
            WHERE id = ai_chat_messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their own AI chat conversations" ON ai_chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_chat_conversations 
            WHERE id = ai_chat_messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their own AI chat conversations" ON ai_chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM ai_chat_conversations 
            WHERE id = ai_chat_messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in their own AI chat conversations" ON ai_chat_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ai_chat_conversations 
            WHERE id = ai_chat_messages.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ai_chat_conversations TO authenticated;
GRANT ALL ON ai_chat_messages TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 