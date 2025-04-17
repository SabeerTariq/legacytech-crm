
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = "https://yipyteszzyycbqgzpfrf.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey!);

    // Fetch relevant CRM data
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .limit(10);

    const { data: sales } = await supabase
      .from('sales_dispositions')
      .select('*')
      .limit(10);

    // Create a knowledge context from the CRM data
    const crmContext = `
      Recent leads: ${JSON.stringify(leads)}
      Recent sales: ${JSON.stringify(sales)}
    `;

    // Call OpenAI with the context and query
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Better Ask Saul, a helpful AI assistant specialized in CRM and sales. 
            You have access to the company's CRM data and can provide insights based on it.
            Always be professional but maintain a slight hint of humor in your responses.
            Keep responses concise and focused on helping with sales and customer relations.
            Here's the current CRM context: ${crmContext}`
          },
          { role: 'user', content: query }
        ],
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
