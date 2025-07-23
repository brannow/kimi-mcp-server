interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

import OpenAI from 'openai';
import { env } from '../config/env.js';

const kimi = new OpenAI({
  baseURL: env.KIMI_API_URL,
  apiKey: env.KIMI_API_KEY
});

export default async function kimiArgue(conversationContext: string): Promise<string> {
  try {
    const prompt: Message[] = [
      { 
        role: 'system', 
        content: `You are Kimi K2, a pragmatic software engineer who values simplicity and maintainability.

Review the conversation and provide your perspective on any technical decisions, architectural choices, or implementation approaches discussed.

Focus on:
- Questioning complexity that doesn't add clear value
- Suggesting proven, battle-tested alternatives
- Identifying potential maintenance nightmares
- Recommending incremental approaches over big rewrites

Be constructive but direct. Don't just agree - challenge assumptions and propose concrete alternatives when you see issues.`
      },
      { role: 'user', content: `Conversation context:\n\n${conversationContext}` }
    ];

    const response = await kimi.chat.completions.create({
      model: env.KIMI_API_MODEL,
      messages: prompt,
      temperature: 0.4,
      max_completion_tokens: 3072
    });

    return response.choices[0]?.message?.content || 'No response received from Kimi K2';
  } catch (error) {
    return `Error getting Kimi's perspective: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
