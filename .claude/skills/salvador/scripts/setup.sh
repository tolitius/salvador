#!/bin/bash
# Ensures p5.js, Vite, and Playwright are ready.

echo ">> [salvador] Checking environment..."

# 1. Init Project
if [ ! -f "package.json" ]; then
    npm init -y > /dev/null
    npm pkg set type="module"
fi

# 2. Install Dependencies (Idempotent)
if [ ! -d "node_modules/playwright" ]; then
    echo ">> [salvador] Installing core dependencies..."
    npm install p5
    npm install -D vite playwright

    echo ">> [salvador] Installing browser binaries..."
    npx playwright install chromium --with-deps
fi

# 3. Structure
mkdir -p src
# copy inspector to project root (so node can find node_modules)
cp "$(dirname "$0")/inspect.js" ./inspect.js

echo ">> [salvador] Ready."
