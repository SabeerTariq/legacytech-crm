import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const createConversationHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, participant_ids, name, description, is_private = false } = req.body;

    if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
      return res.status(400).json({ error: 'participant_ids is required and must be an array' });
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .insert({
        workspace_id: '00000000-0000-0000-0000-000000000000', // Default workspace
        name: name,
        description: description,
        type: type || 'direct',
        is_private: is_private,
        created_by: participant_ids[0] // Use first participant as creator
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return res.status(500).json({ error: 'Failed to create conversation' });
    }

    // Add participants
    const participantData = participant_ids.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: userId === participant_ids[0] ? 'admin' : 'member'
    }));

    const { error: participantError } = await supabaseAdmin
      .from('conversation_participants')
      .insert(participantData);

    if (participantError) {
      console.error('Error adding participants:', participantError);
      // Try to clean up the conversation if participant insertion fails
      await supabaseAdmin
        .from('conversations')
        .delete()
        .eq('id', conversation.id);
      return res.status(500).json({ error: 'Failed to add participants' });
    }

    console.log('Successfully created conversation:', conversation.id);
    res.status(200).json({ conversation });

  } catch (error) {
    console.error('Error in create conversation handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default createConversationHandler; 