import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages: history } = await req.json();

    if (!Array.isArray(history)) {
      throw new Error('Invalid message format');
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert AI assistant specializing in property management, 
        maintenance, and statutory warranty requirements. You help property managers understand 
        and implement best practices while ensuring compliance with regulations.
        Be concise but thorough in your responses.`
      },
      ...history,
    ];

    console.log('Sending request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false, // Explicitly disable streaming
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    console.log('OpenAI response received successfully');
    
    const aiResponse = data.choices[0].message.content;

    // Ensure we're sending a properly formatted JSON response
    const responseBody = JSON.stringify({ response: aiResponse });
    
    return new Response(responseBody, { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    
    const errorResponse = {
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      function: 'chat-with-ai'
    };

    return new Response(
      JSON.stringify(errorResponse), 
      {
        status: error.message === 'Rate limit exceeded. Please try again later.' ? 429 : 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        }
      }
    );
  }
});