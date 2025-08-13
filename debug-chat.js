// Debug script for Better Ask Saul chat
const { createClient } = require('@supabase/supabase-js');

async function debugChat() {
  console.log('🔍 Debugging Better Ask Saul Chat...');
  
  // Test the edge function directly
  try {
    const supabase = createClient(
      'https://yipyteszzyycbqgzpfrf.supabase.co',
      'your-anon-key-here' // Replace with your actual anon key
    );
    
    console.log('📡 Testing edge function call...');
    
    const { data, error } = await supabase.functions.invoke('better-ask-saul', {
      body: {
        messages: [
          { role: 'user', content: 'Hello, test message' }
        ],
        userId: 'test-user-id'
      }
    });
    
    if (error) {
      console.error('❌ Edge function error:', error);
    } else {
      console.log('✅ Edge function response:', data);
    }
    
  } catch (err) {
    console.error('❌ Debug error:', err);
  }
}

debugChat(); 