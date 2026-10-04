# 🚀 VPS Deployment Guide — Digi-Port (Digital Marketr)

এই গাইডে দেখানো হয়েছে কিভাবে আপনার Ubuntu/Debian VPS-এ **Digi-Port** প্রোডাকশনে ডিপ্লয় করবেন।

---

## 📋 প্রয়োজনীয় বিষয়সমূহ (Prerequisites)
1. একটি Ubuntu 22.04 / 24.04 VPS (DigitalOcean, Contabo, Hetzner, Linode, AWS ইত্যাদি)।
2. একটি ডোমেন বা সাব-ডোমেন (যেমন: `app.yourdomain.com`), যার DNS A-Record আপনার VPS IP-র দিকে পয়েন্ট করা আছে।
3. VPS-এ root বা sudo অ্যাক্সেস।

---

## 🛠️ মেথড ১: PM2 + Nginx দিয়ে ডিপ্লয় (রেকমেন্ডেড)

### ধাপ ১: সার্ভার আপডেট ও Node.js ইনস্টলেশন
VPS-এ SSH দিয়ে লগইন করুন এবং কমান্ডগুলো রান করুন:

```bash
# সিস্টেম প্যাকেজ আপডেট
sudo apt update && sudo apt upgrade -y

# প্রয়োজনীয় টুলস ইনস্টল
sudo apt install -y curl git nginx ufw

# Node.js 20 LTS ইনস্টল (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 ইনস্টল (Background Process Manager)
sudo npm install -g pm2
```

ভার্সন চেক করুন:
```bash
node -v   # v20.x.x
npm -v    # v10.x.x
pm2 -v
```

---

### ধাপ ২: রিপোজিটরি ক্লোন করুন
```bash
# প্রোজেক্ট ফোল্ডারে যান
cd /var/www  # অথবা আপনার পছন্দের ফোল্ডার

# রিপোজিটরি ক্লোন করুন
git clone https://github.com/jahedofficial/Digi-port.git
cd Digi-port
```

---

### ধাপ ৩: `.env.local` কনফিগার করুন
প্রজেক্টের ভেতর `.env.local` ফাইল তৈরি করুন:

```bash
cp .env.example .env.local
nano .env.local
```

প্রয়োজনীয় সিক্রেটগুলো বসিয়ে দিন (Ctrl+O চেপে Save, Enter, তারপর Ctrl+X দিয়ে বের হন):
* `NEXT_PUBLIC_APP_URL=https://app.yourdomain.com`
* `TELEGRAM_BOT_TOKEN=your_telegram_bot_token`
* `META_APP_ID`, `META_APP_SECRET`, ইত্যাদি।

---

### ধাপ ৪: ডিপেন্ডেন্সি ইনস্টল ও প্রোডাকশন বিল্ড
```bash
# ডিপেন্ডেন্সি ইনস্টল
npm install

# Prisma ক্লায়েন্ট জেনারেট
npx prisma generate

# প্রোডাকশন বিল্ড
npm run build
```

---

### ধাপ ৫: PM2 দিয়ে অ্যাপ স্টার্ট ও অটো-রিস্টার্ট চালু
আমরা প্রোজেক্টের রুটে ইতিমধ্যে `ecosystem.config.cjs` কনফিগার করে দিয়েছি।

```bash
# PM2 দিয়ে অ্যাপ রান করুন
pm2 start ecosystem.config.cjs

# সার্ভার রিবুট হলেও যেন স্বয়ংক্রিয়ভাবে চালু হয়
pm2 save
pm2 startup
# (টার্মিনালে দেওয়া sudo env PATH... কমান্ডটি কপি করে রান করুন)
```

স্ট্যাটাস ও লগ চেক করতে:
```bash
pm2 status
pm2 logs digi-port
```

---

### ধাপ ৬: Nginx রিভার্স প্রক্সি ও SSL (HTTPS) সেটআপ

১. Nginx কনফিগ ফাইল তৈরি করুন:
```bash
sudo nano /etc/nginx/sites-available/digi-port
```

নিচের কনফিগারেশনটি পেস্ট করুন (আপনার ডোমেন নাম দিয়ে রিপ্লেস করুন):
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

২. সাইটটি এনাবল করুন এবং Nginx রিস্টার্ট দিন:
```bash
sudo ln -s /etc/nginx/sites-available/digi-port /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

৩. ফায়ারওয়ালে পোর্ট ওপেন করুন:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

৪. Certbot দিয়ে ফ্রি SSL (HTTPS) সেটআপ:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.yourdomain.com
```

---

### ধাপ ৭: Telegram Bot Webhook কানেক্ট করুন
আপনার সাইট যখন HTTPS-এ লাইভ হয়ে যাবে, ব্রাউজারে বা টার্মিনালে নিচের লিংকে হিট করুন (আপনার বট টোকেন ও ডোমেন বসিয়ে):

```bash
curl -F "url=https://app.yourdomain.com/api/telegram/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
রেসপন্সে `{"ok":true,"result":true,"description":"Webhook was set"}` আসলে আপনার টেলিগ্রাম বট সম্পূর্ণ অ্যাক্টিভ হয়ে যাবে!

---

## 🐳 মেথড ২: Docker দিয়ে ডিপ্লয় (Optional)

যদি আপনি Docker পছন্দ করেন, তবে শুধুমাত্র ২টি কমান্ডে পুরো সিস্টেম রান করতে পারবেন:

```bash
# Docker ও Docker Compose ইনস্টল করুন
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# রিপোজিটরি ফোল্ডারে এসে
docker compose up -d --build
```
এটি পোর্ট `3000`-এ অ্যাপ রান করবে।

---

## 🔄 ভবিষ্যতে নতুন কোড আপডেট করবেন কিভাবে? (1-Click Update)

পরবর্তীতে গিটহাবে কোনো নতুন পরিবর্তন পুশ করলে VPS-এ মাত্র এই কমান্ডগুলো রান করলেই অ্যাপ আপডেট হয়ে যাবে:

```bash
cd /var/www/Digi-port
git pull origin main
npm install
npm run build
pm2 reload digi-port
```
কোনো ডাউনটাইম ছাড়াই নতুন কোড রিলোড হয়ে যাবে!
