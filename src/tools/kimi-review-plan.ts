interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

import OpenAI from 'openai';

const kimi = new OpenAI({
  baseURL: 'https://api.moonshot.cn/v1',
  apiKey: process.env.KIMI_API_KEY!
});

export default async function reviewPlan(plan: string): Promise<string> {
  try {
    const prompt: Message[] = [
      { 
        role: 'system', 
        content: `You are Kimi K2, a senior software architect focused on pragmatic solutions.

Review the technical plan below and identify:
- Over-engineered components that add unnecessary complexity
- Missing error handling or edge cases
- Potential performance bottlenecks or scalability issues  
- Security vulnerabilities or best practice violations
- Simpler alternatives that achieve the same goals

Provide:
1. **Critical Issues**: Must-fix problems (security, performance, correctness)
2. **Simplification Opportunities**: Areas where the approach is unnecessarily complex
3. **Alternative Approach**: If significantly different, suggest a simpler path
4. **Overall Assessment**: One sentence summary

Be direct and concise. Focus on actionable feedback.`
      },
      { role: 'user', content: `Technical Plan:\n\n${plan}` }
    ];

    const response = await kimi.chat.completions.create({
      model: 'kimi-k2-latest',
      messages: prompt,
      temperature: 0.3,
      max_tokens: 2048
    });

    return response.choices[0]?.message?.content || 'No response received from Kimi K2';
  } catch (error) {
    return `Error getting Kimi review: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
