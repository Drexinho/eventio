# 🚀 Deployment Guide - EventPlanner v1.0

## 📋 Přehled

Tento návod popisuje, jak nasadit EventPlanner v1.0 na produkční server.

## 🎯 Požadavky

### Systémové požadavky:
- ✅ **Ubuntu 20.04+** nebo **Debian 11+**
- ✅ **Node.js 18+**
- ✅ **PostgreSQL 13+**
- ✅ **Nginx** (volitelně pro reverse proxy)

### Minimální konfigurace:
- ✅ **CPU:** 1 vCPU
- ✅ **RAM:** 2GB
- ✅ **Storage:** 10GB
- ✅ **Network:** Veřejná IP adresa

## 🔧 Instalace

### 1. Systémové závislosti

```bash
# Aktualizace systému
sudo apt update && sudo apt upgrade -y

# Instalace Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalace PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalace Nginx (volitelně)
sudo apt install nginx -y
```

### 2. Konfigurace PostgreSQL

```bash
# Spuštění PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vytvoření uživatele a databáze
sudo -u postgres psql -c "CREATE USER eventplanner WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE eventplanner_db OWNER eventplanner;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE eventplanner_db TO eventplanner;"

# Konfigurace pg_hba.conf pro hesla
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Změnit: local all all peer na local all all md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Deployment aplikace

```bash
# Vytvoření adresáře pro aplikaci
sudo mkdir -p /var/www/eventplanner
sudo chown $USER:$USER /var/www/eventplanner

# Klonování nebo kopírování kódu
cd /var/www/eventplanner
# Zde vložit kód aplikace

# Instalace závislostí
npm install

# Vytvoření produkční build
npm run build
```

### 4. Environment variables

```bash
# Vytvoření .env.local
cat > .env.local << EOF
DATABASE_URL=postgresql://eventplanner:your_secure_password@localhost:5432/eventplanner_db
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://your-domain.com
EOF
```

### 5. Spuštění databázového schématu

```bash
# Spuštění SQL skriptu
psql -U eventplanner -d eventplanner_db -f postgresql-schema.sql
```

## 🚀 Spuštění aplikace

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
# Instalace PM2 pro process management
npm install -g pm2

# Spuštění aplikace s PM2
pm2 start npm --name "eventplanner" -- start

# Nastavení autostart
pm2 startup
pm2 save
```

### Testování:
```bash
# Test databázového připojení
curl http://localhost:3000/api/test-db

# Test aplikace
curl http://localhost:3000
```

## 🔒 Bezpečnost

### 1. Firewall
```bash
# Povolení pouze potřebných portů
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Aplikace (pouze pro development)
sudo ufw enable
```

### 2. SSL/HTTPS (s Nginx)
```bash
# Instalace Certbot
sudo apt install certbot python3-certbot-nginx -y

# Získání SSL certifikátu
sudo certbot --nginx -d your-domain.com
```

### 3. Nginx konfigurace

```nginx
# /etc/nginx/sites-available/eventplanner
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktivace konfigurace
sudo ln -s /etc/nginx/sites-available/eventplanner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📊 Monitoring

### 1. PM2 monitoring
```bash
# Zobrazení logů
pm2 logs eventplanner

# Monitorování procesů
pm2 monit

# Restart aplikace
pm2 restart eventplanner
```

### 2. Databázové monitoring
```bash
# Kontrola PostgreSQL
sudo systemctl status postgresql

# Kontrola připojení
psql -U eventplanner -d eventplanner_db -c "SELECT version();"
```

## 🔄 Aktualizace

### 1. Backup databáze
```bash
# Vytvoření backup
pg_dump -U eventplanner eventplanner_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Aktualizace kódu
```bash
# Zastavení aplikace
pm2 stop eventplanner

# Backup staré verze
cp -r /var/www/eventplanner /var/www/eventplanner_backup_$(date +%Y%m%d)

# Aktualizace kódu
cd /var/www/eventplanner
git pull origin main  # nebo kopírování nového kódu

# Instalace nových závislostí
npm install

# Build nové verze
npm run build

# Spuštění aplikace
pm2 start eventplanner
```

## 🐛 Troubleshooting

### Časté problémy:

**1. Databáze se nepřipojuje:**
```bash
# Kontrola PostgreSQL
sudo systemctl status postgresql

# Kontrola připojení
psql -U eventplanner -d eventplanner_db -c "SELECT 1;"

# Kontrola .env.local
cat .env.local
```

**2. Aplikace se nespouští:**
```bash
# Kontrola logů
pm2 logs eventplanner

# Kontrola portu
netstat -tlnp | grep :3000

# Restart aplikace
pm2 restart eventplanner
```

**3. Nginx chyby:**
```bash
# Kontrola konfigurace
sudo nginx -t

# Kontrola logů
sudo tail -f /var/log/nginx/error.log
```

## 📝 Poznámky

### ✅ Doporučení pro produkci:
- ✅ **Pravidelné backupy** databáze
- ✅ **Monitoring** aplikace a databáze
- ✅ **SSL certifikáty** pro HTTPS
- ✅ **Firewall** konfigurace
- ✅ **Log rotation** pro logy

### 🔄 Automatizace:
- ✅ **Cron jobs** pro backupy
- ✅ **PM2** pro process management
- ✅ **Nginx** pro reverse proxy
- ✅ **Certbot** pro automatické SSL

## 🎉 Hotovo!

Po dokončení všech kroků bude EventPlanner v1.0 dostupný na:
- ✅ **HTTP:** http://your-domain.com
- ✅ **HTTPS:** https://your-domain.com
- ✅ **API:** https://your-domain.com/api/test-db

**Aplikace je připravena k použití!** 🚀 