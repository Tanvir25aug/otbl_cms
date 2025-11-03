# CMS Application - Deployment Guide

## Overview

This guide explains how to set up automated deployment from GitHub to your Ubuntu VPS server using GitHub Actions.

## Architecture

```
Developer → Git Push → GitHub → GitHub Actions → SSH Deploy → VPS Server → Live Application
```

## Prerequisites

- Ubuntu VPS server with root/sudo access
- Nginx and PM2 already configured
- GitHub repository
- SSH access to your VPS

---

## Step 1: Prepare Your VPS Server

### 1.1 Create Deployment User

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Create deployer user
sudo useradd -m -s /bin/bash deployer
sudo usermod -aG sudo deployer

# Switch to deployer user
sudo su - deployer
```

### 1.2 Generate SSH Key for GitHub Actions

```bash
# Generate SSH key (press Enter for no passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Add public key to authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Display private key (copy this for GitHub Secrets)
cat ~/.ssh/github_deploy
```

**Important**: Copy the entire private key output, including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
... (all content)
-----END OPENSSH PRIVATE KEY-----
```

### 1.3 Set Up Application Directories

```bash
# Create application directory
sudo mkdir -p /var/www/cms/backend
sudo mkdir -p /var/www/cms/frontend
sudo mkdir -p /var/www/cms/logs
sudo mkdir -p /var/www/cms/backups

# Set ownership
sudo chown -R deployer:deployer /var/www/cms

# Set permissions
sudo chmod -R 755 /var/www/cms
```

### 1.4 Configure Sudo Permissions

```bash
# Edit sudoers file
sudo visudo

# Add these lines at the end:
deployer ALL=(ALL) NOPASSWD: /usr/bin/pm2
deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx
deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
deployer ALL=(ALL) NOPASSWD: /usr/bin/nginx
deployer ALL=(ALL) NOPASSWD: /bin/cp
deployer ALL=(ALL) NOPASSWD: /bin/chown
```

### 1.5 Test SSH Connection

```bash
# From your local machine, test SSH connection
ssh -i ~/.ssh/github_deploy deployer@your-vps-ip

# If successful, you should be logged in as deployer user
```

---

## Step 2: Configure GitHub Repository

### 2.1 Add Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SSH_PRIVATE_KEY` | Private key from `~/.ssh/github_deploy` | -----BEGIN OPENSSH PRIVATE KEY----- ... |
| `SSH_HOST` | Your VPS IP address | `123.45.67.89` |
| `SSH_USERNAME` | Deployment user | `deployer` |
| `SSH_PORT` | SSH port (default: 22) | `22` |
| `DEPLOY_PATH` | Application path on server | `/var/www/cms` |

### 2.2 Verify GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy.yml`

This workflow will:
1. ✓ Checkout code
2. ✓ Install dependencies
3. ✓ Run type checks
4. ✓ Build frontend
5. ✓ Deploy to VPS via SSH
6. ✓ Restart PM2 and Nginx
7. ✓ Run health checks

---

## Step 3: Configure Your Application

### 3.1 Update Backend Configuration

Make sure your backend `.env` file is configured on the server:

```bash
# On your VPS
cd /var/www/cms/backend
nano .env
```

Add your environment variables:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_PATH=/var/www/cms/backend/database.sqlite
```

### 3.2 Update Nginx Configuration

Check your Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/default
```

Example configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
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

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 4: First Deployment

### 4.1 Push Code to GitHub

```bash
# On your local machine
git add .
git commit -m "Setup CI/CD with GitHub Actions"
git push origin master
```

### 4.2 Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see a workflow running
4. Click on it to see detailed logs

### 4.3 Deployment Process

The deployment will go through these stages:

```
┌─────────────────────────────────────┐
│ 1. Checkout code                    │ ~10s
├─────────────────────────────────────┤
│ 2. Setup Node.js                    │ ~20s
├─────────────────────────────────────┤
│ 3. Install dependencies             │ ~2m
├─────────────────────────────────────┤
│ 4. Run tests & type check           │ ~30s
├─────────────────────────────────────┤
│ 5. Build frontend                   │ ~1m
├─────────────────────────────────────┤
│ 6. Create deployment package        │ ~10s
├─────────────────────────────────────┤
│ 7. Upload to VPS via SSH            │ ~30s
├─────────────────────────────────────┤
│ 8. Deploy on VPS                    │ ~1m
│    - Create backup                  │
│    - Install dependencies           │
│    - Restart PM2                    │
│    - Copy frontend files            │
│    - Reload Nginx                   │
│    - Run health checks              │
└─────────────────────────────────────┘
Total: ~5-7 minutes
```

---

## Step 5: Verify Deployment

### 5.1 Check Application Status

```bash
# SSH into your VPS
ssh deployer@your-vps-ip

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs cms-backend --lines 50

# Check Nginx status
sudo systemctl status nginx

# Check if backend is responding
curl http://localhost:3000/health
```

### 5.2 Access Your Application

Open your browser and navigate to:
- Frontend: `http://your-vps-ip` or `http://your-domain.com`
- Backend API: `http://your-vps-ip/api` or `http://your-domain.com/api`

---

## Daily Usage Workflow

### Simple Development → Deployment Process

```
1. Make changes in your local development environment
   $ npm run dev (in frontend or backend)

2. Test your changes locally
   $ npm run type-check (frontend)
   $ npm test (backend)

3. Commit and push to GitHub
   $ git add .
   $ git commit -m "Add new feature"
   $ git push origin master

4. GitHub Actions automatically:
   ✓ Runs tests
   ✓ Builds the application
   ✓ Deploys to your VPS
   ✓ Restarts services

5. Your changes are LIVE! 🚀
   No manual deployment needed!
```

### Monitoring Deployments

- **GitHub Actions Tab**: See all deployment history
- **PM2 Logs**: `pm2 logs cms-backend`
- **Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`

---

## Troubleshooting

### Deployment Failed

1. **Check GitHub Actions Logs**
   - Go to Actions tab in GitHub
   - Click on failed workflow
   - Read error messages

2. **Common Issues**

   **SSH Connection Failed**
   ```bash
   # Test SSH connection from GitHub Actions
   ssh -i ~/.ssh/github_deploy deployer@your-vps-ip

   # Check SSH key permissions
   chmod 600 ~/.ssh/github_deploy
   ```

   **PM2 Process Won't Start**
   ```bash
   # Check PM2 logs
   pm2 logs cms-backend --lines 100

   # Check Node.js version
   node --version  # Should be 22.x

   # Manually start with verbose logging
   pm2 start src/app.js --name cms-backend --log-date-format 'YYYY-MM-DD HH:mm:ss'
   ```

   **Nginx Not Serving Frontend**
   ```bash
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log

   # Check file permissions
   ls -la /var/www/html

   # Test Nginx configuration
   sudo nginx -t
   ```

   **Type Check Failed**
   ```bash
   # Run locally to see TypeScript errors
   cd frontend
   npm run type-check

   # Fix errors and push again
   ```

### Rollback Deployment

If a deployment fails, the system automatically rolls back to the previous version.

**Manual Rollback:**
```bash
# SSH to VPS
ssh deployer@your-vps-ip

# Go to backups directory
cd /var/www/cms/backups

# List available backups
ls -lt

# Restore backend
tar -xzf backend_YYYYMMDD_HHMMSS.tar.gz -C /var/www/cms
cd /var/www/cms/backend
npm ci --production
pm2 restart cms-backend

# Restore frontend
tar -xzf frontend_YYYYMMDD_HHMMSS.tar.gz -C /var/www/cms
sudo cp -r /var/www/cms/frontend/* /var/www/html/
sudo systemctl reload nginx
```

---

## Advanced Configuration

### Enable Email Notifications

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Send Email Notification
  if: always()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deployment ${{ job.status }}
    body: Deployment to VPS completed with status ${{ job.status }}
    to: your-email@example.com
    from: github-actions@example.com
```

### Enable Slack Notifications

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Deploy to Staging Environment

Create a separate workflow for staging:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy-staging:
    # Same as production but with different secrets
    # SSH_HOST_STAGING, DEPLOY_PATH_STAGING, etc.
```

---

## Security Best Practices

1. ✓ Never commit sensitive data (use `.gitignore`)
2. ✓ Use GitHub Secrets for all credentials
3. ✓ Keep SSH keys secure
4. ✓ Regularly update dependencies
5. ✓ Use HTTPS/SSL for production
6. ✓ Limit SSH access with firewall rules
7. ✓ Regular backups of database

---

## Maintenance

### Update Dependencies

```bash
# On your local machine
cd frontend
npm update
cd ../backend
npm update

# Commit and push - deployment happens automatically
git add .
git commit -m "Update dependencies"
git push origin master
```

### Clear PM2 Logs

```bash
pm2 flush
```

### Clear Old Backups

```bash
cd /var/www/cms/backups
find . -name "*.tar.gz" -mtime +30 -delete  # Delete backups older than 30 days
```

---

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Check PM2 logs: `pm2 logs cms-backend`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Review this documentation

---

## Summary

✓ Push to GitHub → Automatic deployment
✓ Automated testing and building
✓ Zero-downtime deployment
✓ Automatic rollback on failure
✓ Backup before every deployment
✓ Health checks after deployment

**You can now focus on coding - deployment is fully automated!** 🚀
