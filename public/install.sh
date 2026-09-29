#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "          🔥 FIRECLOUD PANEL UNIVERSAL INSTALLER 🔥       "
echo "        Compatible with: VPS, CodeSandbox, Ubuntu/Debian  "
echo "=========================================================="

# Determine sudo requirement
SUDO=""
if [ "$EUID" -ne 0 ]; then
  if command -v sudo &> /dev/null; then
    SUDO="sudo"
  else
    echo "⚠️ Warning: Not running as root and sudo not found. Continuing with current user privileges..."
  fi
fi

# Detect Environment (CodeSandbox / Container / VPS)
IS_CONTAINER=false
if [ -f /.dockerenv ] || [ -d /workspace ] || [ -n "$CODESANDBOX_SSE" ] || [ -n "$CSB" ]; then
  IS_CONTAINER=true
  echo "📦 Environment detected: Container / CodeSandbox / Cloud Sandbox"
else
  echo "🖥️ Environment detected: Linux VPS / Dedicated Server"
fi

# 1. Install System Dependencies if apt-get is available
if command -v apt-get &> /dev/null; then
  echo ""
  echo "[1/6] Updating system packages & installing essentials..."
  $SUDO DEBIAN_FRONTEND=noninteractive apt-get update -y || true
  $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y curl git || true
fi

# 2. Check and Install Node.js (v18+ / v20 LTS recommended)
NEED_NODE=true
if command -v node &> /dev/null; then
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -ge 18 ]; then
    echo "✅ Node.js $(node -v) is already installed."
    NEED_NODE=false
  fi
fi

if [ "$NEED_NODE" = true ]; then
  echo ""
  echo "[2/6] Installing Node.js 20 LTS..."
  if command -v apt-get &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs || true
  fi
fi

# 3. Docker Setup (Handles VPS vs CodeSandbox)
echo ""
echo "[3/6] Setting up Docker engine..."
if command -v docker &> /dev/null; then
  echo "✅ Docker CLI is already present."
else
  if command -v apt-get &> /dev/null; then
    echo "Installing Docker..."
    $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io || true
  fi
fi

# Try starting Docker daemon safely
if command -v systemctl &> /dev/null && [ "$IS_CONTAINER" = false ]; then
  $SUDO systemctl enable --now docker || true
  $SUDO usermod -aG docker "$USER" 2>/dev/null || true
elif command -v service &> /dev/null; then
  $SUDO service docker start 2>/dev/null || true
else
  # Container/CodeSandbox fallback
  echo "ℹ️ Sandbox environment: FireCloud built-in sandbox demo mode is active."
fi

# 4. Repository Setup
echo ""
echo "[4/6] Preparing FireCloud Panel files..."
if [ ! -f "package.json" ] || ! grep -q "FireCloud" package.json 2>/dev/null; then
  if [ ! -d "firecloud" ]; then
    git clone https://github.com/avinashboy746/Jtg.git firecloud
    cd firecloud
  else
    cd firecloud
    git pull || true
  fi
fi

# 5. Dependencies and Build
echo ""
echo "[5/6] Installing dependencies and building panel..."
npm install
npm run build

# Start with PM2 if available, or background fallback
if command -v pm2 &> /dev/null || npm install -g pm2 2>/dev/null; then
  pm2 delete firecloud-panel 2>/dev/null || true
  pm2 start ecosystem.config.cjs || npm run start &
  pm2 save 2>/dev/null || true
  if command -v pm2 &> /dev/null && [ "$IS_CONTAINER" = false ]; then
    pm2 startup 2>/dev/null || true
  fi
else
  nohup npm run start > panel.log 2>&1 &
fi

# 6. Admin Account Setup
echo ""
echo "[6/6] Admin Account Setup"
# Read from /dev/tty so piped curl doesn't exhaust input
ADMIN_USERNAME=""
ADMIN_PASSWORD=""

if [ -n "$1" ] && [ -n "$2" ]; then
  ADMIN_USERNAME="$1"
  ADMIN_PASSWORD="$2"
elif [ -e /dev/tty ]; then
  echo "Enter details to create your Master Admin account:"
  read -r -p "Admin Username [default: admin]: " ADMIN_USERNAME </dev/tty || true
  read -r -s -p "Admin Password [default: admin123]: " ADMIN_PASSWORD </dev/tty || true
  echo ""
fi

ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

npx tsx scripts/createuser.ts "$ADMIN_USERNAME" "$ADMIN_PASSWORD" || true

# Firewall config if ufw is present
if command -v ufw &> /dev/null && [ "$IS_CONTAINER" = false ]; then
  $SUDO ufw allow 3000/tcp 2>/dev/null || true
  $SUDO ufw allow 25565/tcp 2>/dev/null || true
fi

# Get IP Address
SERVER_IP=$(curl -s --max-time 3 ifconfig.me || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo "=========================================================="
echo "    🎉 FIRECLOUD PANEL INSTALLED & RUNNING 24/7! 🎉      "
echo "=========================================================="
echo "👉 Web Panel URL : http://${SERVER_IP}:3000"
echo "👉 Admin Username: ${ADMIN_USERNAME}"
echo "👉 Admin Password: ${ADMIN_PASSWORD}"
echo "----------------------------------------------------------"
echo "Maintenance commands:"
echo "  - View live logs: pm2 logs"
echo "  - Restart panel : pm2 restart firecloud-panel"
echo "  - Stop panel    : pm2 stop firecloud-panel"
echo "=========================================================="
