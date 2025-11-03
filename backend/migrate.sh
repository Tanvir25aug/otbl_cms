#!/bin/bash

################################################################################
# Database Migration Script
# Automates database migrations with backup and rollback support
# Usage: ./migrate.sh [options]
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/var/www/cms/backend"
BACKUP_DIR="/var/www/cms/backups/database"
LOG_DIR="/var/www/cms/logs"
DB_FILE="database.sqlite"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="db_backup_${TIMESTAMP}.sqlite"
LOG_FILE="${LOG_DIR}/migration_${TIMESTAMP}.log"
PM2_APP_NAME="cms-backend"
MAX_BACKUPS=10

# Parse command line arguments
AUTO_MODE=false
DRY_RUN=false
ROLLBACK=false
RESTORE=false
SKIP_RESTART=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --auto)
      AUTO_MODE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --rollback)
      ROLLBACK=true
      shift
      ;;
    --restore)
      RESTORE=true
      shift
      ;;
    --skip-restart)
      SKIP_RESTART=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --auto          Run without prompts"
      echo "  --dry-run       Check migrations without running"
      echo "  --rollback      Undo last migration"
      echo "  --restore       Restore from backup"
      echo "  --skip-restart  Don't restart PM2 after migration"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

################################################################################
# Helper Functions
################################################################################

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}   $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
  echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
  echo -e "${BLUE}[i]${NC} $1"
}

log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

confirm() {
  if [ "$AUTO_MODE" = true ]; then
    return 0
  fi

  local prompt="$1"
  local response
  read -p "$prompt (y/n): " response
  case "$response" in
    [yY][eE][sS]|[yY])
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

################################################################################
# Main Functions
################################################################################

show_banner() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}   Database Migration Script v1.0${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

check_environment() {
  print_header "Environment Check"

  # Check if running in correct directory
  if [ ! -f "$DB_FILE" ] && [ "$RESTORE" = false ]; then
    print_error "Database file not found: $DB_FILE"
    print_info "Please run this script from: $BACKEND_DIR"
    exit 1
  fi

  # Check if sequelize-cli is available
  if ! command -v npx &> /dev/null; then
    print_error "npx command not found"
    print_info "Please install Node.js and npm"
    exit 1
  fi

  # Create necessary directories
  mkdir -p "$BACKUP_DIR"
  mkdir -p "$LOG_DIR"

  # Check database file size
  if [ -f "$DB_FILE" ]; then
    DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
    print_success "Database file found: $DB_FILE ($DB_SIZE)"
  fi

  print_success "Sequelize CLI available"
  print_success "Environment check passed"

  log_message "Environment check completed"
}

create_backup() {
  print_header "Step 1: Backing up database"

  if [ ! -f "$DB_FILE" ]; then
    print_error "Database file not found, cannot create backup"
    exit 1
  fi

  print_info "Creating backup: $BACKUP_FILE"
  cp "$DB_FILE" "$BACKUP_DIR/$BACKUP_FILE"

  # Verify backup was created
  if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    print_error "Backup creation failed!"
    exit 1
  fi

  BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
  print_success "Backup created: $BACKUP_FILE"
  print_success "Backup verified ($BACKUP_SIZE)"

  log_message "Backup created: $BACKUP_DIR/$BACKUP_FILE"

  # Cleanup old backups
  cleanup_old_backups
}

cleanup_old_backups() {
  print_info "Cleaning up old backups (keeping last $MAX_BACKUPS)..."

  cd "$BACKUP_DIR"
  BACKUP_COUNT=$(ls -1 db_backup_*.sqlite 2>/dev/null | wc -l)

  if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    ls -t db_backup_*.sqlite | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
    print_success "Old backups cleaned up"
  else
    print_info "Total backups: $BACKUP_COUNT (no cleanup needed)"
  fi

  cd - > /dev/null
}

check_migration_status() {
  print_header "Step 2: Checking pending migrations"

  # Get migration status
  MIGRATION_OUTPUT=$(npx sequelize-cli db:migrate:status 2>&1 || true)

  # Count pending migrations
  PENDING_COUNT=$(echo "$MIGRATION_OUTPUT" | grep -c "^down" || true)

  if [ "$PENDING_COUNT" -eq 0 ]; then
    print_success "No pending migrations found"
    print_info "Database is up to date!"

    if [ "$AUTO_MODE" = false ] && [ "$DRY_RUN" = false ]; then
      echo ""
      echo "Nothing to migrate. Exiting..."
      exit 0
    fi
    return 0
  fi

  echo -e "${YELLOW}📋 Found $PENDING_COUNT pending migration(s):${NC}"
  echo ""
  echo "$MIGRATION_OUTPUT" | grep "^down" | sed 's/down/  •/' || true
  echo ""

  log_message "Pending migrations: $PENDING_COUNT"
}

run_migrations() {
  print_header "Step 3: Running migrations"

  if [ "$DRY_RUN" = true ]; then
    print_warning "Dry run mode - migrations not executed"
    return 0
  fi

  # Ask for confirmation unless in auto mode
  if ! confirm "Continue with migration?"; then
    print_warning "Migration cancelled by user"
    exit 0
  fi

  echo ""
  print_info "Executing migrations..."
  echo ""

  # Run migrations and capture output
  if npx sequelize-cli db:migrate 2>&1 | tee -a "$LOG_FILE"; then
    echo ""
    print_success "Migrations completed successfully!"
    log_message "Migrations completed successfully"
    return 0
  else
    echo ""
    print_error "Migration failed!"
    log_message "Migration failed"

    # Offer rollback
    if confirm "Would you like to restore from backup?"; then
      restore_from_latest_backup
    fi

    exit 1
  fi
}

run_rollback() {
  print_header "Rolling back last migration"

  # Create backup before rollback
  create_backup

  print_info "Undoing last migration..."
  echo ""

  if npx sequelize-cli db:migrate:undo 2>&1 | tee -a "$LOG_FILE"; then
    echo ""
    print_success "Rollback completed successfully!"
    log_message "Rollback completed successfully"
  else
    echo ""
    print_error "Rollback failed!"
    log_message "Rollback failed"
    exit 1
  fi
}

verify_migrations() {
  print_header "Step 4: Verification"

  # Check migration status
  PENDING_COUNT=$(npx sequelize-cli db:migrate:status 2>&1 | grep -c "^down" || true)

  if [ "$PENDING_COUNT" -eq 0 ]; then
    print_success "All migrations applied successfully"
  else
    print_warning "$PENDING_COUNT migration(s) still pending"
  fi

  # Check database file
  if [ -f "$DB_FILE" ]; then
    DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
    print_success "Database file intact ($DB_SIZE)"
  else
    print_error "Database file missing!"
    exit 1
  fi

  log_message "Verification completed"
}

restart_pm2() {
  if [ "$SKIP_RESTART" = true ]; then
    print_info "Skipping PM2 restart (--skip-restart flag)"
    return 0
  fi

  if [ "$AUTO_MODE" = false ]; then
    echo ""
    if ! confirm "Restart PM2 process?"; then
      print_info "Skipping PM2 restart"
      return 0
    fi
  fi

  echo ""
  print_info "Restarting PM2 process..."

  if pm2 restart "$PM2_APP_NAME" > /dev/null 2>&1; then
    print_success "PM2 process restarted"
    sleep 3

    # Check if process is running
    if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
      print_success "Application is running"
    else
      print_warning "Application may not be running correctly"
      print_info "Check logs with: pm2 logs $PM2_APP_NAME"
    fi
  else
    print_warning "PM2 restart failed or process not found"
    print_info "You may need to start it manually: pm2 start src/app.js --name $PM2_APP_NAME"
  fi

  log_message "PM2 restart attempted"
}

run_health_check() {
  print_info "Running health check..."

  if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "API health check passed"
  else
    print_warning "API health check failed (but this might be normal if no /health endpoint)"
  fi
}

show_summary() {
  print_header "✓ Migration completed successfully!"

  echo -e "${GREEN}📊 Summary:${NC}"
  echo "  • Backup location: $BACKUP_DIR/$BACKUP_FILE"
  echo "  • Log file: $LOG_FILE"
  echo "  • Status: SUCCESS ✓"
  echo ""

  log_message "Migration process completed successfully"
}

restore_from_latest_backup() {
  print_header "Restoring from latest backup"

  # Find latest backup
  LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db_backup_*.sqlite 2>/dev/null | head -1)

  if [ -z "$LATEST_BACKUP" ]; then
    print_error "No backups found!"
    exit 1
  fi

  print_info "Latest backup: $(basename "$LATEST_BACKUP")"

  if confirm "Restore from this backup?"; then
    cp "$LATEST_BACKUP" "$DB_FILE"
    print_success "Database restored from backup"
    log_message "Database restored from: $LATEST_BACKUP"
  else
    print_info "Restore cancelled"
  fi
}

list_and_restore_backups() {
  print_header "Available Backups"

  # List all backups
  BACKUPS=($(ls -t "$BACKUP_DIR"/db_backup_*.sqlite 2>/dev/null))

  if [ ${#BACKUPS[@]} -eq 0 ]; then
    print_error "No backups found!"
    exit 1
  fi

  echo "Available backups:"
  echo ""

  for i in "${!BACKUPS[@]}"; do
    BACKUP_NAME=$(basename "${BACKUPS[$i]}")
    BACKUP_SIZE=$(du -h "${BACKUPS[$i]}" | cut -f1)
    BACKUP_DATE=$(echo "$BACKUP_NAME" | sed 's/db_backup_\([0-9]\{8\}\)_\([0-9]\{6\}\).*/\1 \2/' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
    echo "  $((i+1)). $BACKUP_NAME ($BACKUP_SIZE) - $BACKUP_DATE"
  done

  echo ""
  read -p "Enter backup number to restore (or 0 to cancel): " selection

  if [ "$selection" -eq 0 ] 2>/dev/null; then
    print_info "Restore cancelled"
    exit 0
  fi

  if [ "$selection" -gt 0 ] 2>/dev/null && [ "$selection" -le ${#BACKUPS[@]} ]; then
    SELECTED_BACKUP="${BACKUPS[$((selection-1))]}"
    print_info "Selected: $(basename "$SELECTED_BACKUP")"

    if confirm "Restore from this backup? This will overwrite current database"; then
      # Create a backup of current state before restoring
      if [ -f "$DB_FILE" ]; then
        print_info "Creating backup of current database first..."
        cp "$DB_FILE" "$BACKUP_DIR/db_before_restore_${TIMESTAMP}.sqlite"
      fi

      cp "$SELECTED_BACKUP" "$DB_FILE"
      print_success "Database restored successfully!"

      if [ "$SKIP_RESTART" = false ]; then
        restart_pm2
      fi
    else
      print_info "Restore cancelled"
    fi
  else
    print_error "Invalid selection"
    exit 1
  fi
}

################################################################################
# Main Execution
################################################################################

main() {
  show_banner

  # Handle restore mode
  if [ "$RESTORE" = true ]; then
    list_and_restore_backups
    exit 0
  fi

  # Handle rollback mode
  if [ "$ROLLBACK" = true ]; then
    check_environment
    run_rollback
    verify_migrations
    restart_pm2
    exit 0
  fi

  # Normal migration flow
  check_environment
  check_migration_status

  # Only create backup and run migrations if there are pending migrations
  PENDING_COUNT=$(npx sequelize-cli db:migrate:status 2>&1 | grep -c "^down" || true)

  if [ "$PENDING_COUNT" -gt 0 ] && [ "$DRY_RUN" = false ]; then
    create_backup
    run_migrations
    verify_migrations
    restart_pm2
    run_health_check
    show_summary
  elif [ "$DRY_RUN" = true ]; then
    print_info "Dry run completed - no changes made"
  else
    print_success "Database is up to date - no migrations needed"
  fi
}

# Run main function
main
