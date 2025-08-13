import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    console.log('Fetching conversations for user:', userId);

    // Get conversations where the user is a participant
    const { data: userConversations, error: userConvError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (userConvError) {
      console.error('Error fetching user conversations:', userConvError);
      return res.status(500).json({ error: 'Failed to fetch user conversations' });
    }

    console.log('User conversations:', userConversations);

    const conversationIds = userConversations?.map(cp => cp.conversation_id) || [];
    
    if (conversationIds.length === 0) {
      return res.json({ conversations: [] });
    }

    // Get conversation details
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Get participants for all conversations
    const { data: participantsData, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, role')
      .in('conversation_id', conversationIds);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return res.status(500).json({ error: 'Failed to fetch participants' });
    }

    // Get user profiles for all participant user_ids
    const participantUserIds = [...new Set(participantsData?.map(p => p.user_id) || [])];
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, email')
      .in('user_id', participantUserIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return res.status(500).json({ error: 'Failed to fetch user profiles' });
    }

    // Create a map of user_id to profile
    const userProfileMap = new Map();
    userProfiles?.forEach(profile => {
      userProfileMap.set(profile.user_id, profile);
    });

    // Group participants by conversation
    const participantsMap = new Map();
    participantsData?.forEach(participant => {
      if (!participantsMap.has(participant.conversation_id)) {
        participantsMap.set(participant.conversation_id, []);
      }
      participantsMap.get(participant.conversation_id).push({
        ...participant,
        user: userProfileMap.get(participant.user_id) || null
      });
    });

        // Get the last message for each conversation
    const lastMessagesPromises = conversationIds.map(async (convId) => {
      try {
        const { data: lastMessage, error: messageError } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at')
          .eq('conversation_id', convId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (messageError) {
          console.log(`No messages found for conversation ${convId}:`, messageError.message);
          return { conversationId: convId, lastMessage: null };
        }
        
        return { conversationId: convId, lastMessage };
      } catch (error) {
        console.error(`Error fetching last message for conversation ${convId}:`, error);
        return { conversationId: convId, lastMessage: null };
      }
    });

    const lastMessagesResults = await Promise.all(lastMessagesPromises);
    const lastMessagesMap = new Map();
    lastMessagesResults.forEach(result => {
      if (result.lastMessage) {
        lastMessagesMap.set(result.conversationId, result.lastMessage);
      }
    });

    // Transform conversations to include participants and last message
    const transformedConversations = conversations?.map((conv) => ({
      ...conv,
      participants: participantsMap.get(conv.id) || [],
      last_message: lastMessagesMap.get(conv.id) || null
    })) || [];

    console.log('Transformed conversations:', transformedConversations);
    console.log('Last messages map:', Object.fromEntries(lastMessagesMap));

    res.json({ conversations: transformedConversations });
  } catch (error) {
    console.error('Error in get-conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 