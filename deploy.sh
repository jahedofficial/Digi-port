#!/usr/bin/env bash

# ==============================================================================
# Digi-Port VPS Auto-Deployment Script
# ==============================================================================

set -e

echo "🚀 Starting Digi-Port Automated VPS Deployment..."

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw certbot python3-certbot-nginx

# 2. Install Node.js 20 LTS if not installed
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
    echo "🟢 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js $(node -v) is already installed."
fi

# 3. Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "⚙️ Installing PM2 process manager..."
    sudo npm install -g pm2
else
    echo "✅ PM2 is already installed."
fi

# 4. Clone or Pull Repository
APP_DIR="/var/www/Digi-port"

if [ -d "$APP_DIR" ]; then
    echo "🔄 Repository already exists. Pulling latest changes..."
    cd "$APP_DIR"
    git fetch --all
    git reset --hard origin/main
    git pull origin main
else
    echo "📥 Cloning repository from GitHub..."
    sudo mkdir -p /var/www
    cd /var/www
    sudo git clone https://github.com/jahedofficial/Digi-port.git
    cd Digi-port
    sudo chown -R $USER:$USER "$APP_DIR"
fi

cd "$APP_DIR"

# 5. Setup .env.local if not present
if [ ! -f ".env.local" ]; then
    echo "📝 Creating initial .env.local..."
    cp .env.example .env.local
    echo "⚠️ Note: Don't forget to update your secrets in $APP_DIR/.env.local"
fi

# 6. Install dependencies & Build
echo "🔨 Installing npm dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "⚡ Creating production build..."
npm run build

# 7. Start or Reload PM2
echo "🚀 Starting application with PM2..."
pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save

# 8. Setup Nginx reverse proxy if not configured
NGINX_CONF="/etc/nginx/sites-available/digi-port"
if [ ! -f "$NGINX_CONF" ]; then
    echo "🌐 Configuring Nginx reverse proxy..."
    sudo cp nginx.conf.example "$NGINX_CONF"
    sudo sed -i 's/yourdomain.com/_/g' "$NGINX_CONF"
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/digi-port
    sudo nginx -t && sudo systemctl reload nginx
fi

# Allow HTTP and HTTPS through UFW
sudo ufw allow 'Nginx Full' || true
sudo ufw allow OpenSSH || true

echo "=============================================================================="
echo "🎉 Digi-Port has been successfully deployed!"
echo "🌐 Your app is running on http://127.0.0.1:3000 and through your VPS IP on Port 80!"
echo "💡 To check status: pm2 status"
echo "💡 To check logs:   pm2 logs digi-port"
echo "=============================================================================="
