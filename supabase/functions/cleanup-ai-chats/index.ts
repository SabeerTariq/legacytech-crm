import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured correctly');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧹 Starting AI chat cleanup process...');

    // Call the cleanup function
    const { data, error } = await supabase.rpc('manual_cleanup_ai_chats');

    if (error) {
      console.error('❌ Error during cleanup:', error);
      throw new Error(`Cleanup failed: ${error.message}`);
    }

    console.log('✅ Cleanup completed successfully:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      result: data,
      message: `Cleanup completed. Deleted ${data.deleted_conversations} conversations and ${data.deleted_messages} messages.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Error in cleanup function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 