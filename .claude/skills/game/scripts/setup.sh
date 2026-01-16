#!/bin/bash
# game skill setup script
# ensures puppeteer is available for headless testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(pwd)"

echo "🎮 Game skill setup..."

# check if package.json exists, create minimal one if not
if [ ! -f "$PROJECT_DIR/package.json" ]; then
  echo "Creating package.json..."
  cat > "$PROJECT_DIR/package.json" << 'EOF'
{
  "name": "game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "playtest": "node playtest.js"
  }
}
EOF
fi

# check for node_modules / puppeteer
if [ ! -d "$PROJECT_DIR/node_modules/puppeteer" ]; then
  echo "Installing puppeteer for headless testing..."
  npm install puppeteer --save-dev
fi

# check for vite (for dev server)
if [ ! -d "$PROJECT_DIR/node_modules/vite" ]; then
  echo "Installing vite for dev server..."
  npm install vite --save-dev
fi

# create src directory if needed
mkdir -p "$PROJECT_DIR/src"

# copy playtest script if not present
if [ ! -f "$PROJECT_DIR/playtest.js" ]; then
  echo "Copying playtest.js..."
  cp "$SKILL_DIR/scripts/playtest.js" "$PROJECT_DIR/playtest.js"
fi

# create index.html from template if not present
if [ ! -f "$PROJECT_DIR/index.html" ]; then
  echo "Creating index.html from template..."
  cp "$SKILL_DIR/templates/kaplay-2d.html" "$PROJECT_DIR/index.html"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit index.html with your game code"
echo "  2. Run 'node playtest.js' to test"
echo "  3. Run 'npx vite --open' to play"
