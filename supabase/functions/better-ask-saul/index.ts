
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch relevant CRM data
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId);
    
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    // Create context from CRM data
    const crmContext = `
      You have access to the following CRM data:
      - ${leads?.length || 0} leads 
      - ${projects?.length || 0} projects
      
      You are Saul, an AI assistant specialized in CRM management and business development.
      Be concise, professional, and helpful. If asked about specific data, use the actual numbers from the CRM.
    `;

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      console.error('Missing OpenAI API key in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key is not configured in Supabase secrets. Please add your OpenAI API key to the project secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log to help debug
    console.log("Sending request to OpenAI API");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: crmContext },
          ...messages.slice(-10) // Keep last 10 messages for context
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      // Check specifically for API key issues
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key provided')) {
        return new Response(
          JSON.stringify({ 
            error: 'Your OpenAI API key is invalid. Please update it in your Supabase secrets.' 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Check if response has the expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data);
      return new Response(
        JSON.stringify({ error: 'Unexpected response format from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log("Received response from OpenAI");

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in better-ask-saul function:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
