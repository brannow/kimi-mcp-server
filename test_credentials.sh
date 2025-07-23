#!/bin/bash

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if API key is set
if [ -z "$KIMI_API_KEY" ]; then
    echo "Error: KIMI_API_KEY not found in .env file"
    exit 1
fi

echo "Testing credentials..."
echo "API URL: $KIMI_API_URL"
echo "Model: $KIMI_API_MODEL"
echo "API Key: ${KIMI_API_KEY:0:10}...${KIMI_API_KEY: -4}"
echo

curl -X POST \
  "$KIMI_API_URL/chat/completions" \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://github.com/brannow/kimi-mcp-server" \
  -H "X-Title: Kimi MCP Server Test" \
  -d '{
    "model": "'$KIMI_API_MODEL'",
    "messages": [
      {
        "role": "user",
        "content": "What is 23-56-9? Just give me the answer."
      }
    ],
    "max_tokens": 50
  }' | jq '.' 2>/dev/null || cat