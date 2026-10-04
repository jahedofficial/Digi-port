#!/usr/bin/env bash

# ==============================================================================
# OpenClaw Docker AI Setup & OpenRouter Integration Script
# ==============================================================================

set -e

echo "🚀 Starting OpenClaw Model & OpenRouter Configuration..."

# 1. Detect OpenClaw Docker Container
CONTAINER_NAME=$(docker ps --filter "name=openclaw" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME="openclaw-n7sg-openclaw-1"
    echo "⚠️ Auto-detection empty, defaulting to container: $CONTAINER_NAME"
else
    echo "✅ Found OpenClaw Container: $CONTAINER_NAME"
fi

# 2. Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Docker container '$CONTAINER_NAME' is not running!"
    echo "💡 Run 'docker ps' to see active containers."
    exit 1
fi

echo "------------------------------------------------------------------"
echo "Step 1: Setting up dual model provider (nexos & openrouter)..."
docker exec -i "$CONTAINER_NAME" openclaw config set agents.defaults.models '{
  "nexos/*": {},
  "openrouter/*": {}
}' --strict-json --merge || echo "⚠️ Config set warning (proceeding...)"

echo "------------------------------------------------------------------"
echo "Step 2: Checking/Installing OpenRouter plugin..."
docker exec -i "$CONTAINER_NAME" openclaw plugins install openrouter || echo "Plugin already installed or skipped."

echo "------------------------------------------------------------------"
echo "Step 3: Authenticating OpenRouter API Key..."
if [ -n "$1" ]; then
    OPENROUTER_KEY="$1"
    echo "Using OpenRouter API Key from argument."
    echo "$OPENROUTER_KEY" | docker exec -i "$CONTAINER_NAME" openclaw models auth login --provider openrouter --method api-key || true
else
    echo "Please enter your OpenRouter API Key (sk-or-v1-...):"
    read -r OPENROUTER_KEY
    if [ -n "$OPENROUTER_KEY" ]; then
        echo "$OPENROUTER_KEY" | docker exec -i "$CONTAINER_NAME" openclaw models auth login --provider openrouter --method api-key || true
    else
        echo "⚠️ Skipping interactive login (no key entered)."
    fi
fi

echo "------------------------------------------------------------------"
echo "Step 4: Setting Default Model to DeepSeek v4 Flash..."
docker exec -i "$CONTAINER_NAME" openclaw models set openrouter/deepseek/deepseek-v4-flash || true

echo "------------------------------------------------------------------"
echo "Step 5: Configuring Fallback Models..."
echo "Adding gpt-5.4-nano..."
docker exec -i "$CONTAINER_NAME" openclaw models fallbacks add openrouter/openai/gpt-5.4-nano || true

echo "Adding claude-sonnet-5..."
docker exec -i "$CONTAINER_NAME" openclaw models fallbacks add openrouter/anthropic/claude-sonnet-5 || true

echo "Adding gpt-5.5..."
docker exec -i "$CONTAINER_NAME" openclaw models fallbacks add openrouter/openai/gpt-5.5 || true

echo "Adding deepseek-v4-pro..."
docker exec -i "$CONTAINER_NAME" openclaw models fallbacks add openrouter/deepseek/deepseek-v4-pro || true

echo "Adding minimax-m3..."
docker exec -i "$CONTAINER_NAME" openclaw models fallbacks add openrouter/minimax/minimax-m3 || true

echo "------------------------------------------------------------------"
echo "Step 6: Verifying OpenClaw Model Status..."
echo ">>> Models Status:"
docker exec -i "$CONTAINER_NAME" openclaw models status || true

echo ">>> Default Model:"
docker exec -i "$CONTAINER_NAME" openclaw config get agents.defaults.model || true

echo "=================================================================="
echo "🎉 OpenClaw Configuration Complete!"
echo "Default Model: openrouter/deepseek/deepseek-v4-flash"
echo "Active Fallbacks: gpt-5.4-nano, claude-sonnet-5, gpt-5.5, deepseek-v4-pro, minimax-m3"
echo "=================================================================="
