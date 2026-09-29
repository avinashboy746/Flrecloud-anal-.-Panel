# 🔥 FireCloud Panel - Game Server Management

<div align="center">
  <img src="public/logo.png" width="160" height="160" alt="FireCloud Logo" style="border-radius: 50%;" />
  <h2>FireCloud - Premium Hosting, Zero Limits</h2>
  <p>A web-based game server management panel with file manager, interactive live terminal, automated backups, and Playit.gg tunnel integration.</p>
</div>

---

## 🚀 How to Install FireCloud Panel (Installation Guide)

FireCloud panel ko kisi bhi Ubuntu / Debian / CentOS VPS par install karne ka aasan step-by-step process:

### 1. Requirements (Zaroori Cheezein)
- **OS**: Ubuntu 20.04 / 22.04 / 24.04 LTS ya Debian 11 / 12
- **RAM**: Minimum 2 GB (Game servers ke liye 4GB+ recommended)
- **CPU**: 2+ Cores
- **Docker**: Containerization ke liye

---

### 2. Step-by-Step Installation Commands

#### Step 1: Update VPS & Install Dependencies (Node.js & Docker)
Terminal open karke ye command run karein:
```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 install karein:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git docker.io

# Docker service ko start aur enable karein:
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

#### Step 2: Clone the FireCloud Repository
```bash
git clone https://github.com/avinashboy746/Jtg.git firecloud
cd firecloud
```

#### Step 3: Install NPM Dependencies & Build
```bash
npm install
npm run build
```

#### Step 4: Create Admin User Account
Apne panel ka Master Admin username aur password banayein:
```bash
npx tsx scripts/createuser.ts
```
*(Aapse Username aur Password pucha jayega, apna desired login enter karein)*

#### Step 5: Run 24/7 in Background using PM2
Panel ko background mein hamesha chalate rehne ke liye PM2 use karein:
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

### 3. Open in Browser
Ab apne browser mein jaakar enter karein:
```
http://YOUR_VPS_IP:3000
```
- Step 4 mein jo **Username** aur **Password** banaya tha, usse login karein.
- Login ke baad aap seedha **Create Server** par jaakar Minecraft ya anya game server create kar sakte hain!

---

### 4. Firewall (UFW) Ports
Agar VPS par UFW firewall on hai toh ports open karein:
```bash
sudo ufw allow 3000/tcp   # FireCloud Web Panel
sudo ufw allow 25565/tcp  # Default Minecraft Port
sudo ufw reload
```

---

### 5. Managing the Service
- **Logs check karne ke liye**: `pm2 logs`
- **Restart karne ke liye**: `pm2 restart firecloud-panel`
- **Stop karne ke liye**: `pm2 stop firecloud-panel`
