# Kimi MCP Server

A Model Context Protocol (MCP) server that provides Kimi AI tools for technical discussions and architectural reviews.

## Features

- **kimi-argue**: Get Kimi K2's pragmatic perspective on technical discussions and decisions
- **kimi-review-plan**: Get Kimi K2's architectural review of technical plans

## Prerequisites

- Node.js 18+ 
- npm or yarn
- **KIMI_API_KEY**: API key for Kimi services (get yours at https://platform.moonshot.ai/console)

## Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd kimi-mcp-server
npm install
```

2. Build the server:
```bash
npm run build
```

3. Set up your API key (create one at https://platform.moonshot.ai/console):
```bash
export KIMI_API_KEY=your_api_key_here
```

## Adding to Claude Code

### Method 1: Basic Installation (Local Scope)

```bash
claude mcp add kimi-server node /path/to/kimi-mcp-server/dist/server.js -e KIMI_API_KEY
```

### Method 2: Project Scope (Shared with Team)

```bash
claude mcp add --scope project kimi-server node /path/to/kimi-mcp-server/dist/server.js -e KIMI_API_KEY
```

### Method 3: User Scope (Available Across All Projects)

```bash
claude mcp add --scope user kimi-server node /path/to/kimi-mcp-server/dist/server.js -e KIMI_API_KEY
```

### Method 4: JSON Configuration

```bash
claude mcp add-json kimi-server '{
  "type": "stdio",
  "command": "node",
  "args": ["/path/to/kimi-mcp-server/dist/server.js"],
  "env": {
    "KIMI_API_KEY": "${KIMI_API_KEY}"
  }
}'
```

### Method 5: With Absolute Path

```bash
claude mcp add kimi-server "$(pwd)/dist/server.js" -e KIMI_API_KEY
```

## Environment Variables

- `KIMI_API_KEY` (required): Your Kimi AI API key. Create one at https://platform.moonshot.ai/console
- `MCP_TIMEOUT` (optional): Server startup timeout in milliseconds (default: 10000)

## Verification

After adding the server, verify it's working:

1. Check server status:
```bash
claude mcp list
```

2. Test the tools in Claude Code by typing `/mcp` and selecting the Kimi tools

## Development

This MCP server is built with TypeScript and uses the Model Context Protocol SDK.

### Project Structure

- `server.ts` - Main MCP server implementation
- `src/tools/` - Individual tool implementations
  - `kimi-argue.ts` - Technical discussion tool
  - `kimi-review-plan.ts` - Architectural review tool
- `dist/` - Compiled JavaScript output

### Local Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server locally
npm start
```

## Troubleshooting

- Ensure `KIMI_API_KEY` is properly set in your environment
- Create your API key at https://platform.moonshot.ai/console if you don't have one
- Verify the path to `dist/server.js` is correct
- Check that Node.js version is 18 or higher
- Use `claude mcp remove kimi-server` to remove and re-add if needed

## License

MIT