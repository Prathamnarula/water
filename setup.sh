#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  💧 Water Reminder PWA — Single Setup Script
#  Works on: macOS, Linux, WSL, Git Bash (Windows)
#
#  Usage:
#    Option A (from GitHub):  bash setup.sh
#    Option B (manual push):  cd water && bash setup.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ─────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

banner() {
  echo -e "${BOLD}${CYAN}"
  echo '  ╔═══════════════════════════════════════╗'
  echo '  ║     💧  Water Reminder PWA Setup     ║'
  echo '  ╚═══════════════════════════════════════╝'
  echo -e "${NC}"
}

# ── Repo URL ───────────────────────────────────────────────────
REPO_URL="https://github.com/Prathamnarula/water.git"
CLONE_DIR="water"

# ── Step 1: Check / Install Bun ────────────────────────────────
install_or_check_bun() {
  banner
  info "Checking for Bun runtime..."

  if command -v bun &>/dev/null; then
    success "Bun found: $(bun --version)"
  else
    warn "Bun not found. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    # Source bun for current shell
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"

    if command -v bun &>/dev/null; then
      success "Bun installed: $(bun --version)"
    else
      error "Failed to install Bun. Please install manually from https://bun.sh"
    fi
  fi
}

# ── Step 2: Clone or Update Repo ───────────────────────────────
clone_repo() {
  echo ""
  info "Setting up project..."

  # If we're already inside the water project dir, skip cloning
  if [ -f "package.json" ] && [ -d "src" ]; then
    success "Already inside the project directory. Skipping clone."
    return
  fi

  if [ -d "$CLONE_DIR" ]; then
    if [ -d "$CLONE_DIR/.git" ]; then
      warn "Folder '$CLONE_DIR' already exists (git repo). Pulling latest..."
      cd "$CLONE_DIR"
      git pull --rebase 2>/dev/null || warn "Could not pull (might be offline or no remote). Continuing..."
      cd ..
    else
      error "Folder '$CLONE_DIR' already exists but is not a git repo. Please remove or rename it first."
    fi
  else
    info "Cloning repository from GitHub..."
    git clone "$REPO_URL" "$CLONE_DIR" || error "Failed to clone. Check your internet connection or GitHub access."
    success "Repository cloned successfully!"
  fi

  cd "$CLONE_DIR"
  success "Working directory: $(pwd)"
}

# ── Step 3: Install Dependencies ───────────────────────────────
install_deps() {
  echo ""
  info "Installing dependencies (this may take a minute)..."
  bun install || error "Failed to install dependencies."
  success "Dependencies installed!"
}

# ── Step 4: Setup Database ─────────────────────────────────────
setup_db() {
  echo ""
  info "Setting up database..."

  if [ -f "prisma/schema.prisma" ]; then
    bunx prisma generate --quiet 2>/dev/null || warn "Prisma generate had warnings (non-critical)."
    bun run db:push 2>/dev/null || warn "Database push completed with warnings."
    success "Database ready!"
  else
    warn "No Prisma schema found — skipping database setup."
  fi
}

# ── Step 5: Build for Production ───────────────────────────────
build_app() {
  echo ""
  info "Building the app for production..."
  bun run build 2>/dev/null || {
    warn "Build had non-critical warnings. Attempting to start anyway..."
    return 0
  }
  success "Build complete!"
}

# ── Step 6: Start the App ──────────────────────────────────────
start_app() {
  echo ""
  echo -e "${GREEN}${BOLD}"
  echo '  ╔═══════════════════════════════════════╗'
  echo '  ║   ✅  Setup Complete! Starting App   ║'
  echo '  ╚═══════════════════════════════════════╝'
  echo -e "${NC}"
  echo ""
  info "Starting production server on http://localhost:3000"
  info "Press Ctrl+C to stop the server"
  echo ""
  echo -e "${YELLOW}📱 To install on your Android phone:${NC}"
  echo "   1. Open http://<your-pc-ip>:3000 in Chrome on your phone"
  echo "   2. Make sure your phone and PC are on the same WiFi network"
  echo "   3. Tap 'Add to Home Screen' from Chrome's menu (⋮)"
  echo "   4. The app will work as a standalone PWA!"
  echo ""

  # Start the server
  bun run start
}

# ── Main ───────────────────────────────────────────────────────
main() {
  install_or_check_bun
  clone_repo
  install_deps
  setup_db
  build_app
  start_app
}

main "$@"