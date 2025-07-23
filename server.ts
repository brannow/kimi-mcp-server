#!/usr/bin/env node

import './src/config/env.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import kimiArgue from './src/tools/kimi-argue.js';
import reviewPlan from './src/tools/kimi-review-plan.js';

const server = new Server(
  {
    name: 'kimi-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'kimi-argue',
        description: 'Get Kimi K2 pragmatic perspective on technical discussions and decisions',
        inputSchema: {
          type: 'object',
          properties: {
            conversationContext: {
              type: 'string',
              description: 'The conversation context to analyze',
            },
          },
          required: ['conversationContext'],
        },
      },
      {
        name: 'kimi-review-plan',
        description: 'Get Kimi K2 architectural review of technical plans',
        inputSchema: {
          type: 'object',
          properties: {
            plan: {
              type: 'string',
              description: 'The technical plan to review',
            },
          },
          required: ['plan'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'kimi-argue': {
        const result = await kimiArgue(args?.conversationContext as string);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'kimi-review-plan': {
        const result = await reviewPlan(args?.plan as string);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);