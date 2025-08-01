# 🚀 Eventio Systemd Deployment

## ✅ Instalace dokončena

### Co bylo nainstalováno:

1. **Node.js aplikace**: Eventio Next.js aplikace
2. **Systemd service**: Automatické spouštění při bootu
3. **Nginx reverse proxy**: Pro přístup přes port 80
4. **PostgreSQL**: Databáze (potřebuje nastavení)

### Status služeb:

```bash
# Zkontrolovat status Eventio service
sudo systemctl status eventio.service

# Zkontrolovat status Nginx
sudo systemctl status nginx

# Zobrazit logy Eventio
sudo journalctl -u eventio.service -f

# Zobrazit logy Nginx
sudo tail -f /var/log/nginx/access.log
```

### Přístup k aplikaci:

- **Lokálně**: http://localhost:3000
- **Přes Nginx**: http://SERVER_IP
- **Přes doménu**: http://your-domain.com (pokud máte doménu)

### Správa služeb:

```bash
# Restart Eventio
sudo systemctl restart eventio.service

# Restart Nginx
sudo systemctl restart nginx

# Povolit automatické spouštění
sudo systemctl enable eventio.service
sudo systemctl enable nginx

# Zakázat automatické spouštění
sudo systemctl disable eventio.service
```

### Aktualizace aplikace:

```bash
cd /home/git/Eventio
git pull origin main
npm install
npm run build
sudo systemctl restart eventio.service
```

### Nastavení databáze:

```bash
# Instalace PostgreSQL
sudo apt install postgresql postgresql-contrib

# Vytvoření databáze
sudo -u postgres psql
CREATE USER eventplanner WITH PASSWORD 'eventplanner123';
CREATE DATABASE eventplanner OWNER eventplanner;
GRANT ALL PRIVILEGES ON DATABASE eventplanner TO eventplanner;
\q

# Import schématu
sudo -u postgres psql -d eventplanner -f postgresql-schema.sql
```

### Firewall:

```bash
# Povolit HTTP a HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw enable
```

### Monitoring:

```bash
# Zobrazit využití paměti
pm2 monit

# Zobrazit logy v reálném čase
sudo journalctl -u eventio.service -f

# Zkontrolovat porty
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

---

**Eventio** - Automaticky spouštěná služba s Nginx proxy
