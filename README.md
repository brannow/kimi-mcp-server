# Kimi MCP Server

A Model Context Protocol (MCP) server that provides Kimi AI tools for technical discussions and architectural reviews.

## Features

- **kimi-argue**: Get Kimi K2's pragmatic perspective on technical discussions and decisions
- **kimi-review-plan**: Get Kimi K2's architectural review of technical plans

## Prerequisites

- Node.js 18+
- npm or yarn
- **KIMI_API_KEY**: API key for Kimi services (get yours at https://platform.moonshot.ai/console)

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd kimi-mcp-server
npm run setup
```

The setup script will:
- Check Node.js version compatibility
- Guide you through API key configuration
- Install dependencies automatically
- Build the project
- Register with Claude Code (optional)

### 2. Get Your API Key
Create your API key at: https://platform.moonshot.ai/console

### 3. Start Using
Open Claude Code and type `/mcp` to access Kimi tools!

## Manual Installation

If you prefer manual setup or the quick start doesn't work:

### Step 1: Install Dependencies
```bash
npm install
npm run build
```

### Step 2: Configure API Key

**Option A: Environment Variable**
```bash
export KIMI_API_KEY=your_api_key_here
```

**Option B: Local .env File**
```bash
echo "KIMI_API_KEY=your_api_key_here" > .env
```

### Step 3: Add to Claude Code

Choose one of the following methods:

#### Basic Installation (User Scope - Recommended)
```bash
claude mcp add --scope user kimi-server node $(pwd)/dist/server.js -e KIMI_API_KEY=${KIMI_API_KEY}
```

#### Project Scope (Team Shared)
```bash
claude mcp add --scope project kimi-server node $(pwd)/dist/server.js -e KIMI_API_KEY=${KIMI_API_KEY}
```

#### JSON Configuration Method
```bash
claude mcp add-json kimi-server '{
  "type": "stdio",
  "command": "node",
  "args": ["'$(pwd)'/dist/server.js"],
  "env": {
    "KIMI_API_KEY": "${KIMI_API_KEY}"
  }
}'
```

## Management Commands

### Setup
```bash
npm run setup
```
Interactive setup script that handles everything from API key configuration to Claude Code registration.

### Remove
```bash
npm run remove
```
Safely removes the MCP server from Claude Code (both user and project scopes).

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript.

### Start (Development)
```bash
npm start
```
Starts the server locally for testing.

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `KIMI_API_KEY` | Yes | Your Kimi AI API key from https://platform.moonshot.ai/console | - |
| `MCP_TIMEOUT` | No | Server startup timeout in milliseconds | 10000 |

## Verification

### Check Installation
```bash
claude mcp list
```
Should show `kimi-server` in the list.

### Test Tools
1. Open Claude Code
2. Type `/mcp`
3. Select a Kimi tool (kimi-argue or kimi-review-plan)
4. Provide your technical question or plan

## Development

This MCP server is built with TypeScript and uses the Model Context Protocol SDK.

### Project Structure
```
kimi-mcp-server/
├── src/
│   ├── server.ts              # Main MCP server implementation
│   └── tools/                 # Tool implementations
│       ├── kimi-argue.ts      # Technical discussion tool
│       └── kimi-review-plan.ts # Architectural review tool
├── scripts/
│   ├── setup.js               # Interactive setup script
│   └── remove.js              # Removal script
├── dist/                      # Compiled JavaScript output
├── package.json
└── README.md
```

### Local Development Workflow
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm start

# Make changes to src/
# Rebuild
npm run build

# Re-register with Claude (if needed)
npm run remove
npm run setup
```

### Adding New Tools

1. Create a new tool file in `src/tools/`
2. Implement the tool following the MCP protocol
3. Register the tool in `src/server.ts`
4. Rebuild and test

## Troubleshooting

### Common Issues

**"Node v18+ required"**
- Update Node.js to version 18 or higher
- Check version: `node --version`

**"API key is required"**
- Ensure `KIMI_API_KEY` is set correctly
- Create your API key at https://platform.moonshot.ai/console
- Check environment: `echo $KIMI_API_KEY`

**"Claude CLI not found"**
- Install Claude Code CLI from Anthropic
- The setup script will skip MCP registration if CLI is not available

**"kimi-server not found"**
- Run `claude mcp list` to check current registrations
- Re-run setup: `npm run setup`
- Verify the path to `dist/server.js` exists

**Tools not appearing in Claude Code**
- Restart Claude Code application
- Check server is running: `claude mcp list`
- Verify API key is valid

### Reset Installation
```bash
# Remove current installation
npm run remove

# Clean build
rm -rf dist/ node_modules/

# Fresh setup
npm run setup
```

### Debug Mode
```bash
# Check what's registered
claude mcp list

# Test server directly
node dist/server.js

# Verbose npm output
npm run build --verbose

# claude debug mode
claude --debug
```

## API Reference

### kimi-argue
Provides Kimi K2's perspective on technical discussions and decisions.

**Input**: Technical question, decision, or discussion point
**Output**: Pragmatic analysis with pros, cons, and recommendations

### kimi-review-plan
Get architectural review of technical plans and designs.

**Input**: Technical plan, architecture description, or design document
**Output**: Detailed review with potential issues, improvements, and best practices

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test with `npm run build && npm start`
5. Submit a pull request

## License

MIT

---

**Need Help?**
- API Keys: https://platform.moonshot.ai/console
- MCP Protocol: https://modelcontextprotocol.org/
- Anthropic MCP Docs: https://docs.anthropic.com/en/docs/claude-code/mcp
- Issues: https://github.com/brannow/kimi-mcp-server/issues
