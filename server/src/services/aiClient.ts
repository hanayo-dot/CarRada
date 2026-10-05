import axios from 'axios';
import { ANTHROPIC_API_KEY, GROQ_API_KEY } from '../config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function callAI(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
  // Option 1: Anthropic
  if (ANTHROPIC_API_KEY) {
    try {
      const payload: any = {
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1024,
        messages: messages.map((m) => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content
        }))
      };
      if (systemPrompt) {
        payload.system = systemPrompt;
      }

      const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 20000
      });

      return response.data?.content?.[0]?.text || '';
    } catch (err: any) {
      console.error('[AI] Anthropic API call error:', err.response?.data || err.message);
      throw new Error(`Anthropic AI request failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Option 2: Groq
  if (GROQ_API_KEY) {
    try {
      const groqMessages = [];
      if (systemPrompt) {
        groqMessages.push({ role: 'system', content: systemPrompt });
      }
      for (const m of messages) {
        groqMessages.push({ role: m.role, content: m.content });
      }

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: 0.4,
          max_tokens: 1024
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      return response.data?.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('[AI] Groq API call error:', err.response?.data || err.message);
      throw new Error(`Groq AI request failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Fallback if no API key is provided
  return (
    'CarRada AI is ready. To enable live inference, configure ANTHROPIC_API_KEY (or GROQ_API_KEY) in server/.env.\n\n' +
    'Advice: For new car owners, always refer to your vehicle owner\'s manual for exact fluid specs and maintenance schedules.'
  );
}

export async function callVisionAI(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  // Option 1: Anthropic Claude 3.5 Sonnet / Haiku
  if (ANTHROPIC_API_KEY) {
    try {
      const payload = {
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      };

      const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });

      return response.data?.content?.[0]?.text || '';
    } catch (err: any) {
      console.error('[AI Vision] Anthropic error:', err.response?.data || err.message);
      throw new Error(`Vision analysis failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Option 2: Groq Vision (llama-3.2-11b-vision-preview)
  if (GROQ_API_KEY) {
    try {
      const payload = {
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      };

      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', payload, {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });

      return response.data?.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('[AI Vision] Groq error:', err.response?.data || err.message);
      throw new Error(`Vision analysis failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Fallback
  return JSON.stringify({
    identified: ['Check Engine Light (Mock)'],
    confidence: 'high',
    meaning: 'The engine management system detected a potential fault code. In live mode, connect your GROQ_API_KEY or ANTHROPIC_API_KEY to get instant photo diagnoses.',
    urgency: '🟠 Get checked soon',
    recommendation: 'Check that the gas cap is tightly closed, and schedule a diagnostic scan at an auto parts store or mechanic.',
    uncertainty: 'API key is not configured on the server.'
  });
}
