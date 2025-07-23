# Kimi MCP Server

Get Kimi K2's pragmatic technical perspective directly in Claude Code. Perfect for code reviews, architecture decisions, and technical discussions.

## Quick Start

1. **Get API key**: [Moonshot AI](https://platform.moonshot.ai/console) or [OpenRouter](https://openrouter.ai) (free tier)
2. **Install**: `git clone <repo> && cd kimi-mcp-server && npm run setup`
3. **Use**: Open Claude Code, type `/kimi` or `/kimi-plan`

That's it! The setup script handles everything.

## What You Get

**Two powerful tools in Claude Code:**

- `/kimi` - Get pragmatic perspective on technical decisions
- `/kimi-plan` - Architectural review of your technical plans

## Configuration

The setup script will ask you to choose:

### Option 1: Moonshot AI (Direct)
- API Key: [Get yours here](https://platform.moonshot.ai/console)
- Model: `kimi-k2-0711-preview`
- Requires paid account

### Option 2: OpenRouter (Recommended)
- API Key: [Get yours here](https://openrouter.ai)
- Model: `moonshotai/kimi-k2:free`
- **Free tier available**

## Manual Setup

If you prefer to configure manually:

### 1. Install Dependencies
```bash
npm install
npm run build
```

### 2. Set Environment Variables
```bash
# For Moonshot AI
export KIMI_API_KEY=your_key_here
export KIMI_API_URL=https://api.moonshot.ai/v1
export KIMI_API_MODEL=kimi-k2-0711-preview

# For OpenRouter (free tier)
export KIMI_API_KEY=your_key_here
export KIMI_API_URL=https://openrouter.ai/api/v1
export KIMI_API_MODEL=moonshotai/kimi-k2:free
```

### 3. Register with Claude
```bash
# User scope (recommended)
claude mcp add --scope user kimi-server node $(pwd)/dist/server.js

# Project scope (team shared)
claude mcp add --scope project kimi-server node $(pwd)/dist/server.js
```

## Commands

- `npm run setup` - Interactive setup (recommended)
- `npm run remove` - Remove from Claude Code
- `npm run build` - Build TypeScript
- `npm start` - Test locally

## Environment Variables

Create a `.env` file or set environment variables:

```bash
KIMI_API_KEY=your_api_key_here          # Required
KIMI_API_URL=https://api.moonshot.ai/v1 # Optional, defaults shown
KIMI_API_MODEL=kimi-k2-0711-preview    # Optional, defaults shown
KIMI_ENV_FILE=.env                      # Optional, use custom env file
```

## Usage Examples

### Code Review
```
/kimi Should we use React Context or Redux for state management in a small app?
```

### Architecture Review
```
/kimi-plan 
We're building a microservices architecture:
- API Gateway (Kong)
- Auth Service (JWT)
- User Service (Node.js + PostgreSQL)
- Notification Service (Redis + WebSockets)
```

## Troubleshooting

**API key not working?**
- Verify key at your provider's console
- Check environment: `echo $KIMI_API_KEY`

**Commands not showing up?**
- Restart Claude Code
- Check registration: `claude mcp list`
- Re-run setup: `npm run setup`

**Setup fails?**
- Ensure Node.js 18+: `node --version`
- Install Claude CLI if missing
- Check permissions in project directory

## Development

### Project Structure
```
src/
├── config/
│   ├── defaults.ts    # Default configuration
│   └── env.ts         # Environment loading
├── tools/
│   ├── kimi-argue.ts      # Technical discussion
│   └── kimi-review-plan.ts # Architecture review
└── server.ts          # Main MCP server

scripts/
├── setup.js           # Interactive setup
└── remove.js          # Removal script
```

### Adding Tools

1. Create `src/tools/my-tool.ts`
2. Add to `server.ts` tools list
3. Run `npm run build`
4. Test with `npm start`

## Reset Everything

```bash
npm run remove        # Remove from Claude
rm -rf dist/ .env     # Clean files
npm run setup         # Fresh start
```

---

**Need help?**
- [Moonshot Console](https://platform.moonshot.ai/console)
- [OpenRouter Dashboard](https://openrouter.ai)
- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
