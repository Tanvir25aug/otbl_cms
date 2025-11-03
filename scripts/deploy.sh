#!/bin/bash

# CMS Application Deployment Script
# This script is executed on the VPS server by GitHub Actions

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (these can be overridden by environment variables)
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/cms}"
PM2_APP_NAME="${PM2_APP_NAME:-cms-backend}"
NGINX_ROOT="${NGINX_ROOT:-/var/www/html}"
BACKEND_PORT="${BACKEND_PORT:-3000}"

echo "============================================"
echo "CMS Application Deployment Script"
echo "============================================"
echo "Deploy Path: $DEPLOY_PATH"
echo "PM2 App Name: $PM2_APP_NAME"
echo "Nginx Root: $NGINX_ROOT"
echo "============================================"

# Function to print success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info message
info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Create backup
create_backup() {
    info "Creating backup..."
    BACKUP_DIR="$DEPLOY_PATH/backups"
    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)

    if [ -d "$DEPLOY_PATH/backend" ]; then
        tar -czf $BACKUP_DIR/backend_$TIMESTAMP.tar.gz -C $DEPLOY_PATH backend
        success "Backend backed up"
    fi

    if [ -d "$DEPLOY_PATH/frontend" ]; then
        tar -czf $BACKUP_DIR/frontend_$TIMESTAMP.tar.gz -C $DEPLOY_PATH frontend
        success "Frontend backed up"
    fi

    # Keep only last 5 backups
    cd $BACKUP_DIR
    ls -t backend_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    ls -t frontend_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    success "Old backups cleaned"
}

# Deploy backend
deploy_backend() {
    info "Deploying backend..."

    cd $DEPLOY_PATH/backend

    # Install dependencies
    info "Installing production dependencies..."
    npm ci --production
    success "Dependencies installed"

    # Stop PM2 process
    info "Stopping PM2 process: $PM2_APP_NAME"
    pm2 stop $PM2_APP_NAME 2>/dev/null || info "Process was not running"

    # Start PM2 process with ecosystem file if exists, otherwise use direct command
    if [ -f "ecosystem.config.js" ]; then
        info "Starting PM2 with ecosystem config..."
        pm2 start ecosystem.config.js
    else
        info "Starting PM2 process: $PM2_APP_NAME"
        pm2 start src/app.js --name $PM2_APP_NAME --time
    fi

    pm2 save
    success "Backend deployed and PM2 process started"
}

# Deploy frontend
deploy_frontend() {
    info "Deploying frontend..."

    if [ -d "$DEPLOY_PATH/frontend" ]; then
        # Copy frontend files to Nginx root
        sudo cp -r $DEPLOY_PATH/frontend/* $NGINX_ROOT/
        sudo chown -R www-data:www-data $NGINX_ROOT
        success "Frontend files copied to $NGINX_ROOT"

        # Test and reload Nginx
        info "Testing Nginx configuration..."
        sudo nginx -t

        info "Reloading Nginx..."
        sudo systemctl reload nginx
        success "Nginx reloaded"
    else
        error "Frontend directory not found at $DEPLOY_PATH/frontend"
        exit 1
    fi
}

# Health check
health_check() {
    info "Running health checks..."

    # Check PM2 status
    sleep 3
    if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
        success "PM2 process is running"
    else
        error "PM2 process failed to start!"
        info "PM2 logs:"
        pm2 logs $PM2_APP_NAME --lines 20 --nostream
        return 1
    fi

    # Check backend API
    sleep 2
    if curl -f http://localhost:$BACKEND_PORT/health 2>/dev/null; then
        success "Backend API is responding"
    elif curl -f http://localhost:$BACKEND_PORT 2>/dev/null; then
        success "Backend is responding (no health endpoint)"
    else
        error "Backend API health check failed"
        info "Checking if backend is listening..."
        netstat -tlnp | grep $BACKEND_PORT || true
        return 1
    fi

    # Check Nginx
    if systemctl is-active --quiet nginx; then
        success "Nginx is running"
    else
        error "Nginx is not running"
        return 1
    fi

    return 0
}

# Rollback function
rollback() {
    error "Deployment failed! Rolling back..."

    BACKUP_DIR="$DEPLOY_PATH/backups"
    cd $BACKUP_DIR

    # Get latest backup
    LATEST_BACKEND=$(ls -t backend_*.tar.gz 2>/dev/null | head -1)
    LATEST_FRONTEND=$(ls -t frontend_*.tar.gz 2>/dev/null | head -1)

    if [ -n "$LATEST_BACKEND" ]; then
        info "Rolling back backend from $LATEST_BACKEND"
        pm2 stop $PM2_APP_NAME
        tar -xzf $LATEST_BACKEND -C $DEPLOY_PATH
        cd $DEPLOY_PATH/backend
        npm ci --production
        pm2 start src/app.js --name $PM2_APP_NAME
        success "Backend rolled back"
    fi

    if [ -n "$LATEST_FRONTEND" ]; then
        info "Rolling back frontend from $LATEST_FRONTEND"
        tar -xzf $LATEST_FRONTEND -C $DEPLOY_PATH
        sudo cp -r $DEPLOY_PATH/frontend/* $NGINX_ROOT/
        sudo systemctl reload nginx
        success "Frontend rolled back"
    fi
}

# Main deployment flow
main() {
    # Create backup
    create_backup

    # Deploy backend
    if deploy_backend; then
        success "Backend deployment successful"
    else
        error "Backend deployment failed"
        rollback
        exit 1
    fi

    # Deploy frontend
    if deploy_frontend; then
        success "Frontend deployment successful"
    else
        error "Frontend deployment failed"
        rollback
        exit 1
    fi

    # Health check
    if health_check; then
        success "All health checks passed"
    else
        error "Health checks failed"
        rollback
        exit 1
    fi

    echo ""
    echo "============================================"
    success "Deployment completed successfully!"
    echo "============================================"
    echo ""

    # Show PM2 status
    pm2 status

    # Show last 10 lines of PM2 logs
    echo ""
    info "Recent logs:"
    pm2 logs $PM2_APP_NAME --lines 10 --nostream
}

# Run main function
main
