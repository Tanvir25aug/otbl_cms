# Quick Start - Double-Click Deployment

## 🎯 What You Get

Two simple double-click scripts:

1. **dev-deploy.bat** (DEV) → Push code to GitHub
2. **prod-update.sh** (PROD) → Pull code + migrate database

---

## ⚡ Quick Setup (5 Minutes)

### On Your Windows PC (DEV)

```
✓ Already done! Just double-click: dev-deploy.bat
```

### On Your Production Server (PROD)

#### If Server is Linux:

**Step 1: Transfer files via WinSCP**
```
1. Open WinSCP → Connect to server
2. Go to: /var/www/cms
3. Upload: prod-update.sh
4. Upload: backend/migrate.sh
```

**Step 2: Fix and make executable**
```bash
# Open Terminal in Remote Desktop
cd /var/www/cms
sed -i 's/\r$//' prod-update.sh
sed -i 's/\r$//' backend/migrate.sh
chmod +x prod-update.sh backend/migrate.sh
```

**Step 3: Test it**
```bash
./prod-update.sh
```

Done! ✓

---

## 🚀 How to Use (Daily)

### Simple 2-Step Process

```
┌─────────────────────────────────────┐
│         ON YOUR PC (DEV)            │
└─────────────────────────────────────┘

1. Edit your code
2. Double-click: dev-deploy.bat
3. Type commit message
4. Wait for "SUCCESS!"

        ↓ (Code now on GitHub) ↓

┌─────────────────────────────────────┐
│    ON SERVER (PROD) via RDP         │
└─────────────────────────────────────┘

5. Open Terminal
6. Type: cd /var/www/cms
7. Type: ./prod-update.sh
8. Wait 2-3 minutes
9. Done! ✓
```

---

## 📊 What Happens Automatically

### dev-deploy.bat
```
✓ Commits your changes
✓ Pushes to GitHub
```

### prod-update.sh
```
✓ Backs up database (automatic)
✓ Pulls latest code from GitHub
✓ Installs dependencies
✓ Runs database migrations
✓ Builds frontend
✓ Restarts application
✓ Everything ready!
```

---

## 🎬 First Time? Watch This Flow

### STEP 1: Make Changes on DEV

```
D:\Back up AI_CMS\V3\cms-main\
├── Edit some files in VS Code
└── Save
```

### STEP 2: Deploy from DEV

```
Double-click: dev-deploy.bat

Output:
  [1/5] Checking git status...
  [2/5] Showing changes...
  Enter commit message: Added new feature
  [3/5] Adding all changes to git...
  [4/5] Committing changes...
  [5/5] Pushing to GitHub...

  SUCCESS! Code pushed to GitHub ✓
```

### STEP 3: Update PROD

```
Remote Desktop → Terminal

$ cd /var/www/cms
$ ./prod-update.sh

Output:
  ============================================================================
     CMS PRODUCTION UPDATE SCRIPT
  ============================================================================

  [1/10] Creating Database Backup...
  [✓] Database backed up (2.4M)

  [2/10] Stopping Application...
  [✓] Application stopped

  [3/10] Backing Up Current Code...
  [✓] Backend code backed up
  [✓] Frontend code backed up

  [4/10] Pulling Latest Code from GitHub...
  [✓] Code updated from GitHub

  [5/10] Updating Backend Dependencies...
  [✓] Backend dependencies updated

  [6/10] Running Database Migrations...
  [✓] Database migrations completed

  [7/10] Building and Deploying Frontend...
  [✓] Frontend built successfully
  [✓] Frontend deployed

  [8/10] Starting Application...
  [✓] Application is running

  [9/10] Reloading Nginx...
  [✓] Nginx reloaded

  [10/10] Running Health Checks...
  [✓] API is responding

  ============================================================================
     ✓ UPDATE COMPLETED SUCCESSFULLY!
  ============================================================================

  📊 Summary:
    • Branch: main
    • Database backup: /var/www/cms/backups/database/db_before_update_...
    • Log file: /var/www/cms/logs/update_...
    • PM2 Status: online

  ✓ All done!
```

### STEP 4: Test

```
Open browser → your-website.com → Test your changes ✓
```

---

## 🔥 Pro Tips

### Create Desktop Shortcuts

**On DEV (Windows):**
```
1. Right-click dev-deploy.bat
2. Send to → Desktop (create shortcut)
3. Rename to "🚀 Deploy to GitHub"
```

**On PROD (Linux with GUI):**
```bash
# Create clickable desktop icon
cat > ~/Desktop/update-cms.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Update CMS
Exec=gnome-terminal -- /var/www/cms/prod-update.sh
Icon=system-software-update
Terminal=true
EOF

chmod +x ~/Desktop/update-cms.desktop
```

Now you can double-click icons on both DEV and PROD!

---

## ⚠️ Common Issues

### Issue 1: "bad interpreter" error

**Cause:** Windows line endings (CRLF) instead of Linux (LF)

**Fix:**
```bash
sed -i 's/\r$//' prod-update.sh
sed -i 's/\r$//' backend/migrate.sh
```

### Issue 2: "Permission denied"

**Fix:**
```bash
chmod +x prod-update.sh
chmod +x backend/migrate.sh
```

### Issue 3: "Not a git repository"

**Fix:**
```bash
# Your prod must be a git clone, not a file copy
cd /var/www
git clone https://github.com/your-username/your-repo.git cms
```

---

## 📁 File Locations

### Files You Created

```
D:\Back up AI_CMS\V3\cms-main\
├── dev-deploy.bat              ← Double-click on DEV
├── prod-update.sh              ← Upload to PROD
├── prod-update.bat             ← If PROD is Windows
└── backend/
    └── migrate.sh              ← Upload to PROD
```

### After Transfer to PROD

```
/var/www/cms/
├── prod-update.sh              ← Double-click on PROD
└── backend/
    └── migrate.sh              ← Called automatically
```

---

## ✅ Success Checklist

After setup, verify these work:

**DEV:**
- [ ] Can double-click dev-deploy.bat
- [ ] Code pushes to GitHub successfully
- [ ] No errors shown

**PROD:**
- [ ] Can run ./prod-update.sh
- [ ] Script completes without errors
- [ ] Website shows latest changes
- [ ] PM2 shows "online"

---

## 🆘 Need Help?

### Check Logs
```bash
# Update log
tail -f /var/www/cms/logs/update_*.log

# PM2 log
pm2 logs cms-backend

# Nginx log
sudo tail -f /var/log/nginx/error.log
```

### Restore Backup
```bash
cd /var/www/cms/backend
./migrate.sh --restore
```

### Manual Fix
```bash
# If all else fails, restart everything
cd /var/www/cms/backend
pm2 restart cms-backend
sudo systemctl reload nginx
```

---

## 🎉 You're Done!

Now you have:
- ✓ Simple double-click deployment
- ✓ Automatic database migrations
- ✓ Automatic backups
- ✓ Full logging
- ✓ Easy rollback

**Deployment is now as simple as:**
1. Click on DEV
2. Click on PROD
3. Done! 🚀

Read the full guide: `DEPLOYMENT_WORKFLOW.md`
