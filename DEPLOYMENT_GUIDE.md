# Deployment Guide for orders.radbug.dev

Complete deployment setup instructions for the Restaurant Ordering System on DigitalOcean with domain `orders.radbug.dev`.

## Pre-Deployment Checklist

Before starting deployment, ensure you have:
- [ ] DigitalOcean account and API access
- [ ] Domain `radbug.dev` already owned
- [ ] SSH access configured
- [ ] GitHub repository access
- [ ] Local project cloned and ready

## Prerequisites Installed

The following deployment configuration files have been created:
- ✅ `ecosystem.config.js` - PM2 process management
- ✅ `nginx.conf` - Nginx reverse proxy configuration
- ✅ `backup-sqlite.sh` - Database backup script
- ✅ `monitor.sh` - Health monitoring script
- ✅ `logrotate.conf` - Log rotation configuration
- ✅ `.github/workflows/deploy.yaml` - CI/CD pipeline
- ✅ `src/lib/server/db/client-bun.ts` - Bun SQLite database client

## Deployment Steps

### Step 1: Configure DNS

1. Access your DNS registrar (where you purchased `radbug.dev`)
2. Add an A-record:
   - Type: A
   - Name/Host: `orders`
   - Value/Points to: `<your-droplet-ip-address>` (will get this in Step 2)
   - TTL: 3600 or default
3. Save and wait for DNS propagation (5-30 minutes)

### Step 2: Create DigitalOcean Resources

Choose one of the following methods:

**Option A: Using DigitalOcean Control Panel (Recommended)**
1. Navigate to [DigitalOcean Droplets](https://cloud.digitalocean.com/droplets)
2. Click "Create Droplet"
3. Configure:
   - Image: Ubuntu 24.04 LTS
   - Plan: Basic, $4/month (1GB RAM, 1 vCPU, 25GB SSD)
   - Add your SSH key
   - Enable Backups (adds ~$0.40/month)
   - Choose region (e.g., NYC1, SFO2)
   - Hostname: `restaurant-orders`
4. Create droplet
5. Note the IP address (you'll need it for DNS)

6. Navigate to [DigitalOcean Volumes](https://cloud.digitalocean.com/volumes)
7. Click "Create Volume"
8. Configure:
   - Size: 10GB
   - Region: Same as droplet
   - Attach to: `restaurant-orders` droplet
9. Create volume

**Option B: Using DigitalOcean CLI (doctl)**

```bash
# Install doctl if not installed
curl -sL https://github.com/digitalocean/doctl/releases/latest/download/doctl-linux-amd64.tar.gz | tar xz
sudo mv doctl /usr/local/bin/

# Authenticate
doctl auth init

# Create droplet
doctl compute droplet create restaurant-orders \
  --region nyc1 \
  --size s-1vcpu-1gb \
  --image ubuntu-24-04-x64 \
  --ssh-keys <your-ssh-key-fingerprint> \
  --enable-monitoring \
  --enable-backups

# Note the droplet ID from output
DROPLET_ID=<droplet-id-from-output>

# Create volume
doctl compute volume create sqlite-data \
  --size 10gb \
  --region nyc1 \
  --description "Restaurant Orders SQLite Database"

# Attach volume to droplet
doctl compute volume-action attach sqlite-data --droplet-id $DROPLET_ID

# Get droplet IP
doctl compute droplet get $DROPLET_ID --format PublicIPv4
```

**Cost Summary:**
- Droplet: $4.00/month
- Volume: $1.00/month
- Backups: ~$0.40/month
- **Total: ~$5.40/month**

### Step 3: Server Initial Setup

SSH into your new droplet:

```bash
# SSH into droplet
ssh root@<droplet-ip>

# Update system
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone America/New_York

# Install essential tools
apt install -y curl wget git ufw fail2ban

# Install Bun runtime
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify Bun
bun --version

# Install PM2 globally
bun install -g pm2

# Install Nginx
apt install nginx -y

# Setup volume for persistent SQLite storage
mkfs.ext4 /dev/disk/by-id/scsi-0DO_Volume_sqlite-data
mkdir -p /mnt/sqlite-data
mount /dev/disk/by-id/scsi-0DO_Volume_sqlite-data /mnt/sqlite-data

# Set permissions
chown -R www-data:www-data /mnt/sqlite-data

# Configure auto-mount on reboot
echo '/dev/disk/by-id/scsi-0DO_Volume_sqlite-data /mnt/sqlite-data ext4 defaults,nofail 0 0' >> /etc/fstab

# Verify mount
mount | grep sqlite-data

# Create application directory
mkdir -p /var/www/restaurant-orders/logs
chown -R www-data:www-data /var/www/restaurant-orders

# Configure firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Verify firewall
ufw status
```

### Step 4: Generate SSH Keys for CI/CD

On your **local machine** (not the server):

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copy public key to server's authorized_keys
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@<droplet-ip>

# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy root@<droplet-ip> "echo 'SSH connection successful'"

# Copy private key (for GitHub secrets)
cat ~/.ssh/github_actions_deploy
# Copy the output - you'll need it for GitHub secrets

# Get SSH host key (for GitHub secrets)
ssh-keyscan -H <droplet-ip>
# Copy the output - you'll need it for GitHub secrets
```

### Step 5: Configure GitHub Secrets

1. Navigate to your GitHub repository
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret" and add:

| Secret Name | Value | Description |
|-------------|--------|-------------|
| `DROPLET_IP` | `<droplet-ip-address>` | DigitalOcean Droplet IP |
| `SSH_PRIVATE_KEY` | `<private-key-from-step-4>` | GitHub Actions SSH private key |
| `SSH_HOST_KEY` | `<host-key-from-step-4>` | SSH host key fingerprint |

### Step 6: Initial Manual Deployment

SSH into the server and deploy manually first:

```bash
# SSH into server
ssh root@<droplet-ip>

# Clone repository
cd /var/www
git clone <your-repository-url> restaurant-orders
cd restaurant-orders

# Verify repository
git status

# Install dependencies
bun install --production --frozen-lockfile

# Create environment file
cat > .env.production << 'EOF'
DATABASE_URL=/mnt/sqlite-data/database.db
NODE_ENV=production
PORT=3000
ORIGIN=https://orders.radbug.dev
EOF

# Set secure permissions
chmod 600 .env.production

# Build application
bun run build

# Verify build output
ls -la build/

# Run database migrations
bun run db:push

# Seed initial data
bun run db:seed

# Verify database
ls -la /mnt/sqlite-data/

# Copy and setup deployment files from project
# (These files are in your project root)

# Copy PM2 ecosystem file
# (ecosystem.config.js is already in your project)

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs restaurant-orders

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions output by the command
```

### Step 7: Configure Nginx

```bash
# Copy Nginx config
cp /var/www/restaurant-orders/nginx.conf /etc/nginx/sites-available/restaurant-orders

# Remove default site
rm /etc/nginx/sites-enabled/default

# Enable restaurant-orders site
ln -s /etc/nginx/sites-available/restaurant-orders /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Verify Nginx is running
systemctl status nginx
```

### Step 8: Configure SSL Certificate

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Stop Nginx temporarily
systemctl stop nginx

# Obtain SSL certificate
certbot --nginx -d orders.radbug.dev

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to Terms of Service
# 3. Choose whether to share email
# 4. Choose redirect option (select option 2 to redirect HTTP to HTTPS)

# Start Nginx
systemctl start nginx

# Test auto-renewal
certbot renew --dry-run
```

### Step 9: Setup Backup and Monitoring

```bash
# Copy backup script
cp /var/www/restaurant-orders/backup-sqlite.sh /var/www/restaurant-orders/backup-sqlite.sh
chmod +x /var/www/restaurant-orders/backup-sqlite.sh

# Copy monitoring script
cp /var/www/restaurant-orders/monitor.sh /var/www/restaurant-orders/monitor.sh
chmod +x /var/www/restaurant-orders/monitor.sh

# Copy logrotate config
cp /var/www/restaurant-orders/logrotate.conf /etc/logrotate.d/restaurant-orders

# Setup cron jobs
crontab -e

# Add these lines:
# Daily backup at 2:00 AM
0 2 * * * /var/www/restaurant-orders/backup-sqlite.sh >> /var/www/restaurant-orders/logs/backup.log 2>&1

# Weekly database vacuum (optimization) on Sundays at 3:00 AM
0 3 * * 0 sqlite3 /mnt/sqlite-data/database.db "VACUUM;" >> /var/www/restaurant-orders/logs/maintenance.log 2>&1

# Health check every 5 minutes
*/5 * * * * /var/www/restaurant-orders/monitor.sh

# Save and exit
```

### Step 10: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs restaurant-orders --lines 50

# Check Nginx status
systemctl status nginx

# Check health endpoint
curl http://localhost:3000/health
curl https://orders.radbug.dev/health

# Check database
ls -la /mnt/sqlite-data/
sqlite3 /mnt/sqlite-data/database.db "PRAGMA integrity_check;"
```

### Step 11: Test CI/CD Pipeline

Now that everything is set up, test the automated deployment:

```bash
# On your local machine
cd /path/to/restaurant-orders

# Make a small change to trigger deployment
echo "# Deployment test" >> README.md

# Commit and push
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Run linter and type check
2. Run unit tests
3. Build application
4. Deploy to server via rsync
5. Install production dependencies
6. Seed database if not exists
7. Build on server
8. Restart PM2
9. Perform health check

Monitor the deployment in GitHub Actions tab.

## Monitoring and Maintenance

### PM2 Commands

```bash
# Interactive monitoring
pm2 monit

# View process list
pm2 list

# View detailed info
pm2 show restaurant-orders

# View logs
pm2 logs restaurant-orders --lines 100

# Restart application
pm2 restart restaurant-orders

# Zero-downtime reload
pm2 reload restaurant-orders
```

### Application Logs

```bash
# Tail output log
tail -f /var/www/restaurant-orders/logs/out.log

# Tail error log
tail -f /var/www/restaurant-orders/logs/error.log
```

### Database Maintenance

```bash
# Database file size
ls -lh /mnt/sqlite-data/database.db

# Database integrity check
sqlite3 /mnt/sqlite-data/database.db "PRAGMA integrity_check;"

# Database vacuum (optimization)
sqlite3 /mnt/sqlite-data/database.db "VACUUM;"

# Database analyze (statistics)
sqlite3 /mnt/sqlite-data/database.db "ANALYZE;"
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs restaurant-orders --lines 100

# Check if port is in use
lsof -i :3000

# Try manual start
cd /var/www/restaurant-orders
bun build/index.js
```

### Database connection errors

```bash
# Check environment variables
pm2 env restaurant-orders

# Check database file exists
ls -la /mnt/sqlite-data/database.db

# Check volume mount
mount | grep sqlite-data

# Remount if necessary
umount /mnt/sqlite-data
mount /dev/disk/by-id/scsi-0DO_Volume_sqlite-data /mnt/sqlite-data
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check if app listens on correct port
netstat -tlnp | grep :3000

# Check Nginx error logs
tail -n 50 /var/log/nginx/error.log

# Test app directly
curl http://localhost:3000
```

### SSL certificate errors

```bash
# Check certificate status
certbot certificates

# Test renewal
certbot renew --dry-run

# Manually renew
certbot renew

# Restart Nginx
systemctl restart nginx
```

## Post-Deployment

After successful deployment:

1. **Enable DigitalOcean automated backups** (if not already enabled):
   - Navigate to droplet → Backups → Enable Backups
   - Choose schedule (every 4-6 hours recommended)

2. **Monitor resource usage**:
   - Use DigitalOcean monitoring dashboard
   - Check disk space: `df -h`
   - Check memory: `free -h`

3. **Test all features**:
   - Navigate to https://orders.radbug.dev
   - Test login with test accounts
   - Create test order
   - Test kitchen view
   - Test delivery view
   - Test admin features

4. **Verify automated backups**:
   - Check `/mnt/sqlite-data/backups/` after next backup run
   - Verify cron jobs: `crontab -l`

## Cost Breakdown

| Service | Cost | Notes |
|---------|-------|-------|
| Droplet (1GB RAM, 1 vCPU) | $4.00/month | Basic plan |
| Volume (10GB SSD) | $1.00/month | Persistent storage for SQLite |
| Automated Backups | ~$0.40/month | 4-6 hour retention |
| Domain | $0 | Already owned (`radbug.dev`) |
| SSL | $0 | Free via Let's Encrypt |
| **Total** | **~$5.40/month** | |

## Next Steps

After deployment is complete:

1. Monitor GitHub Actions for future deployments
2. Set up alerts for resource usage
3. Configure monitoring dashboard (optional: Grafana/Prometheus)
4. Document any custom configurations
5. Plan for scaling as traffic grows

## Support Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs/adapters)
- [Bun Documentation](https://bun.sh/docs)
- [DigitalOcean Droplet Docs](https://docs.digitalocean.com/products/droplets/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
