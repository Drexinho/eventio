# 🚀 Deployment Guide - Eventio

Detailní instrukce pro nasazení Eventio aplikace na produkční server.

## 📋 Předpoklady

- Server s Ubuntu 20.04+ nebo Debian 11+
- Root přístup nebo sudo oprávnění
- Doména (volitelně, ale doporučeno)

## 🛠️ Instalace na server

### 1. Aktualizace systému
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalace Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Instalace PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Instalace Nginx (volitelně)
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Instalace PM2 (process manager)
```bash
sudo npm install -g pm2
```

## 🗄️ Nastavení databáze

### 1. Vytvoření databázového uživatele
```bash
sudo -u postgres psql
```

```sql
CREATE USER eventplanner WITH PASSWORD 'your_secure_password';
CREATE DATABASE eventplanner OWNER eventplanner;
GRANT ALL PRIVILEGES ON DATABASE eventplanner TO eventplanner;
\q
```

### 2. Import schématu
```bash
sudo -u postgres psql -d eventplanner -f postgresql-schema.sql
```

### 3. Ověření instalace
```bash
sudo -u postgres psql -d eventplanner -c "SELECT version();"
```

## 📦 Nasazení aplikace

### 1. Klonování repozitáře
```bash
cd /var/www
sudo git clone https://github.com/Drexinho/Eventio.git
sudo chown -R $USER:$USER Eventio
cd Eventio
```

### 2. Instalace závislostí
```bash
npm install
```

### 3. Konfigurace prostředí
```bash
nano .env.local
```

Přidejte:
```env
DATABASE_URL=postgresql://eventplanner:your_secure_password@localhost:5432/eventplanner
NODE_ENV=production
```

### 4. Build aplikace
```bash
npm run build
```

### 5. Spuštění s PM2
```bash
pm2 start npm --name "eventio" -- start
pm2 startup
pm2 save
```

## 🌐 Nginx konfigurace

### 1. Vytvoření konfigurace
```bash
sudo nano /etc/nginx/sites-available/eventio
```

### 2. Konfigurační soubor
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

### 3. Aktivace konfigurace
```bash
sudo ln -s /etc/nginx/sites-available/eventio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/HTTPS (Let's Encrypt)

### 1. Instalace Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Získání SSL certifikátu
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Automatické obnovení
```bash
sudo crontab -e
```

Přidejte:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring a logy

### 1. PM2 monitoring
```bash
pm2 monit
pm2 logs eventio
```

### 2. Nginx logy
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. PostgreSQL logy
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🔄 Aktualizace aplikace

### 1. Zastavení aplikace
```bash
pm2 stop eventio
```

### 2. Aktualizace kódu
```bash
cd /var/www/Eventio
git pull origin main
npm install
npm run build
```

### 3. Restart aplikace
```bash
pm2 restart eventio
```

## 🛡️ Bezpečnostní opatření

### 1. Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. PostgreSQL bezpečnost
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Nastavte:
```
listen_addresses = 'localhost'
```

### 3. Pravidelné zálohy
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump eventplanner > /backup/eventio_$DATE.sql
find /backup -name "*.sql" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Aplikace se nespustí
```bash
pm2 logs eventio
pm2 restart eventio
```

### Databáze se nepřipojuje
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

### Nginx chyby
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 📈 Performance tuning

### 1. PostgreSQL optimalizace
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Doporučené hodnoty:
```
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

### 2. Node.js optimalizace
```bash
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 📞 Support

Pro problémy s deploymentem:
1. Zkontrolujte logy: `pm2 logs eventio`
2. Ověřte databázové připojení
3. Zkontrolujte firewall a porty
4. Otevřete issue na GitHubu

---

**Eventio** - Bezpečné a škálovatelné nasazení 