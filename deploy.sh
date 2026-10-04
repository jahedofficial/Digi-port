#!/usr/bin/env bash

# ==============================================================================
# Digi-Port VPS Safe Deployment Script (Multi-Site VPS Friendly)
# ==============================================================================

set -e

echo "🔒 Safe Deployment: Existing websites on this VPS will NOT be modified."

# 1. Update package list only (DO NOT upgrade existing system packages)
echo "📦 Checking package lists..."
sudo apt update -y

# Install git, curl if missing
command -v git >/dev/null 2>&1 || sudo apt install -y git
command -v curl >/dev/null 2>&1 || sudo apt install -y curl

# 2. Check Node.js
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
    echo "🟢 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js $(node -v) is already installed."
fi

# 3. Check PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚙️ Installing PM2 process manager..."
    sudo npm install -g pm2
else
    echo "✅ PM2 is already installed."
fi

# 4. Clone or Pull into /var/www/Digi-port
APP_DIR="/var/www/Digi-port"

if [ -d "$APP_DIR" ]; then
    echo "🔄 Pulling latest changes into $APP_DIR..."
    cd "$APP_DIR"
    git fetch --all
    git reset --hard origin/main
    git pull origin main
else
    echo "📥 Cloning repository into $APP_DIR..."
    sudo mkdir -p /var/www
    cd /var/www
    sudo git clone https://github.com/jahedofficial/Digi-port.git
    cd Digi-port
    sudo chown -R $USER:$USER "$APP_DIR"
fi

cd "$APP_DIR"

# 5. Environment setup
if [ ! -f ".env.local" ]; then
    echo "📝 Creating initial .env.local..."
    cp .env.example .env.local
fi

# 6. Install & Build
echo "🔨 Installing npm packages..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "⚡ Creating production build..."
npm run build

# 7. Start application via PM2 with isolated name
echo "🚀 Starting Digi-Port with PM2..."
pm2 reload digi-port || pm2 start ecosystem.config.cjs
pm2 save

echo "=============================================================================="
echo "🎉 Digi-Port is running safely on PM2!"
echo "💡 Existing websites were untouched and remain running."
echo "💡 Run 'pm2 status' to view all your running websites."
echo "=============================================================================="
