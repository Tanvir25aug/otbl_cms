# Simple Double-Click Deployment Workflow

This guide explains the complete deployment workflow using simple double-click scripts.

---

## 🎯 Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  DEVELOPMENT    │         │     GITHUB      │         │   PRODUCTION    │
│  (Your PC)      │         │                 │         │   (VPS Server)  │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│                 │         │                 │         │                 │
│ 1. Edit code    │         │                 │         │                 │
│ 2. Double-click │  Push   │  Code stored    │  Pull   │ 1. Double-click │
│    dev-deploy   │ ──────> │  in GitHub      │ <────── │    prod-update  │
│                 │         │                 │         │ 2. Auto migrate │
│                 │         │                 │         │    database     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 📦 Files You Have

| File | Location | Purpose |
|------|----------|---------|
| `dev-deploy.bat` | DEV (Windows) | Push code to GitHub |
| `prod-update.sh` | PROD (Linux) | Pull code + migrate DB |
| `prod-update.bat` | PROD (Windows) | Pull code + migrate DB |
| `migrate.sh` | PROD (Linux) | Database migrations only |

---

## 🖥️ STEP 1: Setup on DEV (Your Local PC)

### First Time Setup

1. **No setup needed!** The script is already in your project root:
   ```
   D:\Back up AI_CMS\V3\cms-main\dev-deploy.bat
   ```

2. **Create a desktop shortcut (Optional):**
   - Right-click `dev-deploy.bat`
   - Send to → Desktop (create shortcut)
   - Rename to "Deploy CMS to GitHub"

### How to Use (DEV)

```
1. Make changes to your code
2. Double-click: dev-deploy.bat
3. Enter commit message (or press Enter for default)
4. Wait for it to push to GitHub
5. Done! ✓
```

**What It Does:**
- Shows you what changed
- Commits all changes
- Pushes to GitHub
- Tells you to run prod script next

---

## 🌐 STEP 2: Setup on PROD (Production Server)

### First Time Setup (One Time Only)

#### Option A: Your Server Runs Linux (Ubuntu/CentOS)

**1. Transfer files via WinSCP:**

```
WinSCP Steps:
1. Connect to your server
2. Navigate to: /var/www/cms
3. Upload these files from your local:
   - prod-update.sh
   - backend/migrate.sh

4. Right-click each file → Properties → Set permissions: 755
```

**2. Fix line endings (Important!):**

```bash
# Connect via Remote Desktop → Open Terminal
cd /var/www/cms
sed -i 's/\r$//' prod-update.sh
sed -i 's/\r$//' backend/migrate.sh
chmod +x prod-update.sh
chmod +x backend/migrate.sh
```

**3. Create desktop shortcut (for double-click):**

```bash
# Create desktop entry
cat > ~/Desktop/update-cms.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Update CMS
Comment=Pull latest code and migrate database
Exec=gnome-terminal -- /var/www/cms/prod-update.sh
Icon=system-software-update
Terminal=true
EOF

chmod +x ~/Desktop/update-cms.desktop
```

#### Option B: Your Server Runs Windows

**1. Transfer files via WinSCP or Remote Desktop:**

```
1. Copy prod-update.bat to: C:\inetpub\wwwroot\cms\
2. Edit the file and change paths to match your setup:
   - DEPLOY_PATH
   - FRONTEND_DIST
   etc.
```

**2. Create desktop shortcut:**

```
1. Right-click prod-update.bat
2. Send to → Desktop (create shortcut)
3. Rename to "Update CMS"
```

---

## 🚀 Daily Workflow

### Complete Deployment Process

```
┌─────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT                             │
└─────────────────────────────────────────────────────────────┘

1. Edit code in VS Code
2. Test locally: npm run dev
3. Double-click: dev-deploy.bat
4. Enter commit message
5. Wait for "SUCCESS! Code pushed to GitHub"

        ↓ (2-3 minutes) ↓

┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION                              │
└─────────────────────────────────────────────────────────────┘

6. Remote Desktop to your server
7. Double-click: Update CMS (icon on desktop)
   OR
   Open Terminal → cd /var/www/cms → ./prod-update.sh

8. Script automatically:
   ✓ Backs up database
   ✓ Pulls latest code
   ✓ Installs dependencies
   ✓ Runs migrations
   ✓ Builds frontend
   ✓ Restarts application

9. Done! Your production is updated ✓
```

---

## 📋 What Each Script Does

### dev-deploy.bat (Development)

```
[✓] Shows git status
[✓] Shows changes
[✓] Asks for commit message
[✓] Adds all files
[✓] Commits changes
[✓] Pushes to GitHub
[✓] Shows success message
```

### prod-update.sh (Production)

```
[✓] Backs up database
[✓] Stops PM2 application
[✓] Backs up current code
[✓] Pulls from GitHub
[✓] Installs backend dependencies
[✓] Runs database migrations (via migrate.sh)
[✓] Installs frontend dependencies
[✓] Builds frontend
[✓] Deploys frontend files
[✓] Starts PM2 application
[✓] Reloads Nginx
[✓] Runs health checks
[✓] Cleans old backups
[✓] Shows summary
```

---

## 🎬 Video Tutorial Style Guide

### FIRST TIME: How to Set Up

**On DEV (Windows):**
```
1. Open folder: D:\Back up AI_CMS\V3\cms-main
2. You'll see: dev-deploy.bat
3. Right-click → Send to Desktop (shortcut)
4. Done! ✓
```

**On PROD (Linux Server via Remote Desktop):**
```
1. Open WinSCP
2. Connect to server
3. Go to: /var/www/cms
4. Drag these files from local to remote:
   - prod-update.sh
   - backend/migrate.sh
5. Right-click each → Properties → Set 755
6. Close WinSCP

7. Open Remote Desktop
8. Open Terminal
9. Type: cd /var/www/cms
10. Type: sed -i 's/\r$//' prod-update.sh
11. Type: sed -i 's/\r$//' backend/migrate.sh
12. Type: chmod +x *.sh

13. Create desktop shortcut (see above)
14. Done! ✓
```

### DAILY USE: How to Deploy

**On DEV:**
```
1. Make changes to code
2. Double-click: dev-deploy.bat (on desktop)
3. Type commit message: "Added new feature"
4. Press Enter
5. Wait for "SUCCESS!"
6. Done! ✓
```

**On PROD:**
```
1. Open Remote Desktop
2. Double-click: Update CMS (on desktop)
3. Watch it run (2-3 minutes)
4. Wait for "UPDATE COMPLETED SUCCESSFULLY!"
5. Test your website
6. Done! ✓
```

---

## 🔧 Configuration

### DEV Script (dev-deploy.bat)

No configuration needed! Just use it.

### PROD Script (prod-update.sh) - Linux

Edit these lines if your paths are different:

```bash
# Line 15-20
DEPLOY_PATH="/var/www/cms"              # Your app location
BACKEND_DIR="$DEPLOY_PATH/backend"      # Backend folder
FRONTEND_DIR="$DEPLOY_PATH/frontend"    # Frontend folder
FRONTEND_DIST="/var/www/html"           # Where Nginx serves files
PM2_APP_NAME="cms-backend"              # Your PM2 app name
```

### PROD Script (prod-update.bat) - Windows

Edit these lines:

```batch
# Line 8-13
set DEPLOY_PATH=C:\inetpub\wwwroot\cms
set BACKEND_DIR=%DEPLOY_PATH%\backend
set FRONTEND_DIR=%DEPLOY_PATH%\frontend
set FRONTEND_DIST=C:\inetpub\wwwroot
set PM2_APP_NAME=cms-backend
```

---

## 🛡️ Safety Features

### Automatic Backups

Every time you run `prod-update.sh`, it automatically backs up:

```
/var/www/cms/backups/
├── database/
│   ├── db_before_update_20250103_143052.sqlite
│   ├── db_before_update_20250103_150023.sqlite
│   └── ... (keeps last 5)
└── code/
    ├── backend_before_update_20250103_143052.tar.gz
    ├── frontend_before_update_20250103_143052.tar.gz
    └── ... (keeps last 5)
```

### Logs

Every update is logged:

```
/var/www/cms/logs/
├── update_20250103_143052.log
├── update_20250103_150023.log
└── migration_20250103_143052.log
```

---

## ⚠️ Troubleshooting

### Problem: dev-deploy.bat says "Permission denied"

**Solution:**
```
1. Open Git Bash (not Command Prompt)
2. Run: git config --global credential.helper wincred
3. Try pushing again
```

### Problem: prod-update.sh says "bad interpreter"

**Solution:**
```bash
# Fix line endings
cd /var/www/cms
sed -i 's/\r$//' prod-update.sh
sed -i 's/\r$//' backend/migrate.sh
```

### Problem: Script says "Not a git repository"

**Solution:**
```bash
# Your production needs to be a git clone, not a copy
cd /var/www
rm -rf cms
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git cms
```

### Problem: Migration fails

**Solution:**
```bash
# Run migration manually
cd /var/www/cms/backend
./migrate.sh

# Or restore from backup
./migrate.sh --restore
```

### Problem: PM2 not found

**Solution:**
```bash
# Install PM2 globally
npm install -g pm2

# Or skip PM2 restart
./prod-update.sh  # Edit script and remove PM2 lines
```

---

## 🎯 Quick Reference

### Commands You'll Use

**DEV (Windows):**
```
Double-click: dev-deploy.bat
```

**PROD (Linux Terminal):**
```bash
# Update everything
./prod-update.sh

# Just migrate database
./backend/migrate.sh

# View logs
tail -f logs/update_*.log

# Check PM2
pm2 status
pm2 logs cms-backend

# Restore database
./backend/migrate.sh --restore
```

---

## ✅ Checklist

### First Time Setup

- [ ] Dev: dev-deploy.bat exists in project root
- [ ] Dev: Can double-click and it works
- [ ] Prod: Transferred prod-update.sh to server
- [ ] Prod: Transferred migrate.sh to server
- [ ] Prod: Fixed line endings (sed -i 's/\r$//')
- [ ] Prod: Set permissions (chmod +x)
- [ ] Prod: Created desktop shortcut
- [ ] Prod: Tested double-click works

### Before Each Deployment

- [ ] Code changes tested locally
- [ ] No errors in console
- [ ] Ready to deploy

### After Each Deployment

- [ ] dev-deploy.bat completed successfully
- [ ] prod-update.sh completed successfully
- [ ] Website loads correctly
- [ ] No errors in PM2 logs
- [ ] Database migrations applied

---

## 📞 Support

If something goes wrong:

1. **Check logs:**
   ```bash
   tail -f /var/www/cms/logs/update_*.log
   pm2 logs cms-backend
   ```

2. **Restore from backup:**
   ```bash
   cd /var/www/cms/backend
   ./migrate.sh --restore
   ```

3. **Manual recovery:**
   ```bash
   cd /var/www/cms/backups/database
   ls -lt  # Find latest backup
   cp db_before_update_XXXXXXX.sqlite ../../backend/database.sqlite
   pm2 restart cms-backend
   ```

---

## 🎉 Summary

You now have a **complete double-click deployment workflow**:

1. **DEV**: Edit → Double-click → Push to GitHub ✓
2. **PROD**: Double-click → Everything updates automatically ✓

No manual commands, no SSH typing, just simple double-clicks!

**Happy Deploying! 🚀**
