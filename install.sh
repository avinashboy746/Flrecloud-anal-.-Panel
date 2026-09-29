#!/bin/bash
set -e

echo "=================================================="
echo "      🔥 FireCloud Panel Auto-Installer 🔥        "
echo "=================================================="

# Check if root
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Please run as root or use sudo: sudo bash install.sh"
  exit 1
fi

echo "[1/6] Updating system packages..."
apt update && apt upgrade -y

echo "[2/6] Installing Node.js 20, Git, and Docker..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git docker.io curl

echo "[3/6] Starting Docker daemon..."
systemctl enable --now docker

echo "[4/6] Installing npm packages & building FireCloud Panel..."
npm install
npm run build

echo "[5/6] Setting up PM2 process manager..."
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup || true

echo "[6/6] Creating Admin Account..."
npx tsx scripts/createuser.ts

# Configure firewall if ufw is installed
if command -v ufw &> /dev/null; then
  echo "Opening firewall ports (3000, 25565)..."
  ufw allow 3000/tcp || true
  ufw allow 25565/tcp || true
fi

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo ""
echo "=================================================="
echo "    🎉 FireCloud Panel Installation Complete! 🎉   "
echo "=================================================="
echo "Access your panel at: http://${SERVER_IP}:3000"
echo "Status check: pm2 status"
echo "View live logs: pm2 logs"
echo "=================================================="
