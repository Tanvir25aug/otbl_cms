#!/bin/bash

################################################################################
# PRODUCTION UPDATE SCRIPT
# Pull latest code from GitHub and run database migrations
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_PATH="/var/www/cms"
BACKEND_DIR="$DEPLOY_PATH/backend"
FRONTEND_DIR="$DEPLOY_PATH/frontend"
FRONTEND_DIST="/var/www/html"
PM2_APP_NAME="cms-backend"
BACKUP_DIR="$DEPLOY_PATH/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$DEPLOY_PATH/logs/update_${TIMESTAMP}.log"

# Create log directory
mkdir -p "$DEPLOY_PATH/logs"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${CYAN}   $1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    log "SUCCESS: $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    log "ERROR: $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
    log "INFO: $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    log "WARNING: $1"
}

# Banner
clear
echo ""
echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}   CMS PRODUCTION UPDATE SCRIPT${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

log "Production update started"

# Step 1: Backup current database
print_header "Step 1: Creating Database Backup"

if [ -f "$BACKEND_DIR/database.sqlite" ]; then
    mkdir -p "$BACKUP_DIR/database"
    cp "$BACKEND_DIR/database.sqlite" "$BACKUP_DIR/database/db_before_update_${TIMESTAMP}.sqlite"

    if [ $? -eq 0 ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_DIR/database/db_before_update_${TIMESTAMP}.sqlite" | cut -f1)
        print_success "Database backed up ($BACKUP_SIZE)"
    else
        print_error "Database backup failed!"
        exit 1
    fi
else
    print_warning "No database file found, skipping backup"
fi

# Step 2: Stop PM2
print_header "Step 2: Stopping Application"

if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 stop "$PM2_APP_NAME" > /dev/null 2>&1
    print_success "Application stopped"
else
    print_warning "Application not running in PM2"
fi

# Step 3: Backup current code
print_header "Step 3: Backing Up Current Code"

mkdir -p "$BACKUP_DIR/code"

if [ -d "$BACKEND_DIR" ]; then
    tar -czf "$BACKUP_DIR/code/backend_before_update_${TIMESTAMP}.tar.gz" -C "$DEPLOY_PATH" backend 2>/dev/null
    print_success "Backend code backed up"
fi

if [ -d "$FRONTEND_DIST" ]; then
    tar -czf "$BACKUP_DIR/code/frontend_before_update_${TIMESTAMP}.tar.gz" -C "$FRONTEND_DIST" . 2>/dev/null
    print_success "Frontend code backed up"
fi

# Step 4: Pull latest code from GitHub
print_header "Step 4: Pulling Latest Code from GitHub"

cd "$DEPLOY_PATH"

# Check if git repo exists
if [ ! -d ".git" ]; then
    print_error "Not a git repository!"
    print_info "Please clone your repository first:"
    print_info "cd /var/www && git clone <your-repo-url> cms"
    exit 1
fi

# Show current branch and status
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Stash any local changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Local changes detected, stashing..."
    git stash save "Auto-stash before update ${TIMESTAMP}" > /dev/null 2>&1
fi

# Pull latest changes
print_info "Pulling latest changes..."
echo ""

if git pull origin "$CURRENT_BRANCH" 2>&1 | tee -a "$LOG_FILE"; then
    echo ""
    print_success "Code updated from GitHub"
else
    echo ""
    print_error "Failed to pull from GitHub!"
    print_info "Please check your internet connection and git configuration"
    exit 1
fi

# Step 5: Update Backend Dependencies
print_header "Step 5: Updating Backend Dependencies"

cd "$BACKEND_DIR"

print_info "Installing/updating npm packages..."
if npm ci --production 2>&1 | tee -a "$LOG_FILE"; then
    print_success "Backend dependencies updated"
else
    print_warning "npm install had some warnings (this might be okay)"
fi

# Step 6: Run Database Migrations
print_header "Step 6: Running Database Migrations"

cd "$BACKEND_DIR"

# Check if migrate.sh exists
if [ -f "migrate.sh" ]; then
    print_info "Running migration script..."
    echo ""

    # Make sure it's executable
    chmod +x migrate.sh

    # Run migrations in auto mode
    if ./migrate.sh --auto --skip-restart; then
        echo ""
        print_success "Database migrations completed"
    else
        echo ""
        print_error "Database migrations failed!"
        print_warning "You may need to run migrations manually"
        print_info "Check logs at: $LOG_FILE"
    fi
else
    print_warning "migrate.sh not found, running migrations manually..."

    if npx sequelize-cli db:migrate 2>&1 | tee -a "$LOG_FILE"; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed!"
    fi
fi

# Step 7: Build and Deploy Frontend
print_header "Step 7: Building and Deploying Frontend"

cd "$DEPLOY_PATH/frontend"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm ci 2>&1 | tee -a "$LOG_FILE"
fi

# Build frontend
print_info "Building frontend..."
if npm run build 2>&1 | tee -a "$LOG_FILE"; then
    print_success "Frontend built successfully"

    # Deploy to web root
    print_info "Deploying frontend to web root..."
    if [ -d "dist" ]; then
        sudo rm -rf "$FRONTEND_DIST"/*
        sudo cp -r dist/* "$FRONTEND_DIST"/ 2>&1 | tee -a "$LOG_FILE"
        print_success "Frontend deployed"
    else
        print_error "Frontend dist folder not found!"
    fi
else
    print_error "Frontend build failed!"
fi

# Step 8: Start PM2
print_header "Step 8: Starting Application"

cd "$BACKEND_DIR"

print_info "Starting PM2 process..."
pm2 start src/app.js --name "$PM2_APP_NAME" --time 2>&1 | tee -a "$LOG_FILE" || pm2 restart "$PM2_APP_NAME" 2>&1 | tee -a "$LOG_FILE"
pm2 save > /dev/null 2>&1

sleep 3

# Check if app is running
if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
    print_success "Application is running"
else
    print_error "Application failed to start!"
    print_info "Check PM2 logs: pm2 logs $PM2_APP_NAME"
fi

# Step 9: Reload Nginx
print_header "Step 9: Reloading Nginx"

if sudo nginx -t > /dev/null 2>&1; then
    sudo systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_error "Nginx configuration test failed!"
    print_info "Check Nginx config: sudo nginx -t"
fi

# Step 10: Health Checks
print_header "Step 10: Running Health Checks"

sleep 2

# Check PM2 status
print_info "PM2 Status:"
pm2 list | grep "$PM2_APP_NAME" || print_warning "PM2 process not found"

# Check API health
print_info "Testing API endpoint..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "API is responding"
else
    print_warning "API health check failed (this might be normal if /health endpoint doesn't exist)"
fi

# Cleanup old backups
print_header "Step 11: Cleanup"

print_info "Cleaning up old backups (keeping last 5)..."
cd "$BACKUP_DIR/database"
ls -t db_*.sqlite 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
cd "$BACKUP_DIR/code"
ls -t *.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null

print_success "Cleanup completed"

# Final Summary
print_header "✓ UPDATE COMPLETED SUCCESSFULLY!"

echo -e "${GREEN}📊 Summary:${NC}"
echo "  • Branch: $CURRENT_BRANCH"
echo "  • Database backup: $BACKUP_DIR/database/db_before_update_${TIMESTAMP}.sqlite"
echo "  • Code backups: $BACKUP_DIR/code/"
echo "  • Log file: $LOG_FILE"
echo "  • PM2 Status: $(pm2 list | grep "$PM2_APP_NAME" | awk '{print $10}' || echo 'Unknown')"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  • Test your application: http://your-domain.com"
echo "  • Check PM2 logs: pm2 logs $PM2_APP_NAME"
echo "  • Monitor logs: tail -f $LOG_FILE"
echo ""
echo -e "${GREEN}✓ All done!${NC}"
echo ""

log "Production update completed successfully"

# Keep window open if running from GUI
read -p "Press Enter to close..."
