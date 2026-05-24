#!/usr/bin/env bash
# =============================================================================
# NEBULA Multiverse Studio — Auto Push Script | Architect: KNOCKS
# Initializes git, commits all files, creates main branch, pushes to GitHub.
# Credentials are NEVER stored. You will be prompted for your PAT at push time.
# Usage: chmod +x deploy/auto_push.sh && ./deploy/auto_push.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[NEBULA]${RESET} $*"; }
success() { echo -e "${GREEN}[✓]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[!]${RESET} $*"; }
error()   { echo -e "${RED}[✗]${RESET} $*" >&2; }

echo -e "${BOLD}${CYAN}  NEBULA Multiverse Studio — Git Auto-Push [KNOCKS]${RESET}"
echo ""

command -v git &>/dev/null || { error "git not found. Install git and retry."; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
info "Project root: ${BOLD}$PROJECT_ROOT${RESET}"
cd "$PROJECT_ROOT"

echo ""
echo -e "${BOLD}Enter your GitHub repository URL.${RESET}"
echo "  Format:  https://github.com/YOUR_USERNAME/YOUR_REPO.git"
read -rp "  GitHub repo URL: " REPO_URL
[[ -z "$REPO_URL" ]] && { error "No repo URL provided. Exiting."; exit 1; }

read -rp "  Git author name  [KNOCKS]: " GIT_NAME
GIT_NAME="${GIT_NAME:-KNOCKS}"
read -rp "  Git author email [architect@nebula-multiverse.studio]: " GIT_EMAIL
GIT_EMAIL="${GIT_EMAIL:-architect@nebula-multiverse.studio}"

echo ""
info "Initialising git repository..."
if [ -d ".git" ]; then
  warn ".git already exists — skipping git init."
else
  git init && success "Initialised empty git repository."
fi

git config user.name  "$GIT_NAME"
git config user.email "$GIT_EMAIL"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  git checkout -B main && success "Switched to branch 'main'."
fi

if [ ! -f ".gitignore" ]; then
  info "Creating default .gitignore..."
  cat > .gitignore <<'GITIGNORE'
node_modules/
dist/
build/
.vite/
.env
.env.*
!.env.example
.DS_Store
*.log
logs/
deploy/k8s/secret.yml
GITIGNORE
  success ".gitignore created."
fi

info "Staging all files..."
git add -A
success "All files staged."

echo ""
info "Files to be committed:"
git status --short | head -60

COMMIT_MSG="feat: initial NEBULA Multiverse Studio scaffold [KNOCKS]

- Dockerfiles: frontend (Vite/React/Nginx), backend (Node/Express)
- K8s manifests: namespace, deployments, services, configmap, secrets, ingress
- Auto-push script and deploy NOTES"

git commit -m "$COMMIT_MSG"
success "Committed."

if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REPO_URL"
  warn "Remote 'origin' updated to: $REPO_URL"
else
  git remote add origin "$REPO_URL"
  success "Remote 'origin' set to: $REPO_URL"
fi

echo ""
echo -e "${BOLD}${YELLOW}══════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  PUSH — You will be prompted for credentials${RESET}"
echo -e "${YELLOW}  Username: your GitHub username${RESET}"
echo -e "${YELLOW}  Password: paste your PAT (NOT your account password)${RESET}"
echo -e "${YELLOW}  Generate PAT: GitHub → Settings → Developer settings${RESET}"
echo -e "${YELLOW}             → Personal access tokens → repo scope${RESET}"
echo -e "${BOLD}  ⚠️  Your PAT is never stored by this script.${RESET}"
echo -e "${BOLD}${YELLOW}══════════════════════════════════════════════════════${RESET}"
echo ""

read -rp "  Ready to push? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  warn "Push cancelled. Run manually: git push -u origin main"
  exit 0
fi

info "Pushing to origin/main..."
if git push -u origin main; then
  echo ""
  success "Pushed to ${REPO_URL}"
  info "Next: build images → push to registry → kubectl apply -f deploy/k8s/"
else
  echo ""
  error "Push failed. Check PAT scope, repo URL, and that the repo exists on GitHub."
  echo "  Manual retry: git push -u origin main"
  exit 1
fi
