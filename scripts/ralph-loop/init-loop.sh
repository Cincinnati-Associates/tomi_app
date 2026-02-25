#!/bin/bash
#
# init-loop.sh - Initialize a new Ralph loop from GitHub issues
#
# Usage:
#   ./scripts/ralph-loop/init-loop.sh --label ralph-ready
#   ./scripts/ralph-loop/init-loop.sh --issue 168,182 --max-iterations 30
#   ./scripts/ralph-loop/init-loop.sh --agent schema-architect
#   ./scripts/ralph-loop/init-loop.sh --agent pipeline-engineer --use-current-branch
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Default values
LABELS=""
ASSIGNEE=""
ISSUES=""
AGENT=""
MODE="feature"
MAX_ITERATIONS=50
BASE_BRANCH="main"
USE_CURRENT_BRANCH=false
OUTPUT="prp.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  RALPH LOOP INITIALIZATION${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

usage() {
    cat << EOF
Usage: $(basename "$0") [options]

Initialize a new Ralph loop from GitHub issues.

Options:
  --label <name>          Filter issues by label (can use multiple times)
  --assignee <user>       Filter issues by assignee
  --issue <n,n,n>         Specific issue numbers (comma-separated)
  --agent <name>          Agent name (filters by agent:<name> + ralph-ready labels)
  --mode <type>           'feature' or 'backlog' (default: feature)
  --max-iterations <n>    Max Ralph loop iterations (default: 50)
  --base-branch <name>    Base branch to create feature from (default: main)
  --use-current-branch    Skip branch creation; use current branch
  --help                  Show this help message

Examples:
  $(basename "$0") --label ralph-ready
  $(basename "$0") --issue 14,15 --mode backlog
  $(basename "$0") --agent schema-architect
  $(basename "$0") --agent pipeline-engineer --use-current-branch
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --label)
            LABELS="$LABELS --label $2"
            shift 2
            ;;
        --assignee)
            ASSIGNEE="--assignee $2"
            shift 2
            ;;
        --issue)
            ISSUES="--issue $2"
            shift 2
            ;;
        --agent)
            AGENT="$2"
            shift 2
            ;;
        --mode)
            MODE="$2"
            shift 2
            ;;
        --max-iterations)
            MAX_ITERATIONS="$2"
            shift 2
            ;;
        --base-branch)
            BASE_BRANCH="$2"
            shift 2
            ;;
        --use-current-branch)
            USE_CURRENT_BRANCH=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate we have some selection criteria
if [[ -z "$LABELS" && -z "$ASSIGNEE" && -z "$ISSUES" && -z "$AGENT" ]]; then
    print_error "Must specify at least one of: --label, --assignee, --issue, or --agent"
    usage
    exit 1
fi

print_header
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check for existing active loop
if [[ -f "prp.json" ]]; then
    EXISTING_STATUS=$(jq -r '.status' prp.json 2>/dev/null || echo "unknown")
    if [[ "$EXISTING_STATUS" == "active" ]]; then
        print_warning "An active Ralph loop already exists!"
        echo ""
        echo "  Loop ID: $(jq -r '.id' prp.json)"
        echo "  Issues:  $(jq -r '.github.issues | map("#\(.)") | join(", ")' prp.json)"
        echo ""
        read -p "Do you want to replace it? [y/N] " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 0
        fi
    fi
fi

# Build gh-to-prp.ts arguments
AGENT_FLAG=""
if [[ -n "$AGENT" ]]; then
    AGENT_FLAG="--agent $AGENT"
fi

# Step 1: Generate prp.json using gh-to-prp.ts
echo "Step 1: Extracting GitHub issues..."
npx tsx "$SCRIPT_DIR/gh-to-prp.ts" \
    $LABELS \
    $ASSIGNEE \
    $ISSUES \
    $AGENT_FLAG \
    --mode "$MODE" \
    --max-iterations "$MAX_ITERATIONS" \
    --base-branch "$BASE_BRANCH" \
    --output "$OUTPUT"

if [[ ! -f "$OUTPUT" ]]; then
    print_error "Failed to create prp.json"
    exit 1
fi

print_success "Created prp.json"

# Extract info from prp.json
LOOP_ID=$(jq -r '.id' prp.json)
BRANCH_NAME=$(jq -r '.branch' prp.json)
ISSUE_NUMBERS=$(jq -r '.github.issues[]' prp.json)

# Step 2: Create progress.txt
echo ""
echo "Step 2: Creating progress.txt..."
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ISSUES_DISPLAY=$(jq -r '.github.issues | map("#\(.)") | join(", ")' prp.json)

cat > progress.txt << EOF
================================================================================
RALPH LOOP: $LOOP_ID | Branch: $BRANCH_NAME
Started: $TIMESTAMP
GitHub Issues: $ISSUES_DISPLAY
$(if [[ -n "$AGENT" ]]; then echo "Agent: $AGENT"; fi)
================================================================================

EOF

print_success "Created progress.txt"

# Step 3: Create git branch (unless --use-current-branch)
echo ""
echo "Step 3: Setting up git branch..."

if [[ "$USE_CURRENT_BRANCH" == true ]]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    print_success "Using current branch: $CURRENT_BRANCH"
    # Update branch name in prp.json to match
    TMP=$(mktemp)
    jq --arg branch "$CURRENT_BRANCH" '.branch = $branch' prp.json > "$TMP" && mv "$TMP" prp.json
else
    # Ensure we're on the base branch and up to date
    git fetch origin "$BASE_BRANCH" 2>/dev/null || true

    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" 2>/dev/null; then
        print_warning "Branch $BRANCH_NAME already exists"
        read -p "Switch to existing branch? [Y/n] " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            echo "Aborted."
            exit 0
        fi
        git checkout "$BRANCH_NAME"
    else
        # Create new branch from base
        git checkout "$BASE_BRANCH" 2>/dev/null || git checkout -b "$BASE_BRANCH"
        git pull origin "$BASE_BRANCH" 2>/dev/null || true
        git checkout -b "$BRANCH_NAME"
    fi

    print_success "On branch: $BRANCH_NAME"
fi

# Step 4: Update GitHub issue labels
echo ""
echo "Step 4: Updating GitHub issue labels..."

for ISSUE in $ISSUE_NUMBERS; do
    # Add ralph-in-progress label
    gh issue edit "$ISSUE" --add-label "ralph-in-progress" 2>/dev/null || true

    # Remove ralph-ready label if it exists
    gh issue edit "$ISSUE" --remove-label "ralph-ready" 2>/dev/null || true

    # Add comment
    gh issue comment "$ISSUE" --body "🤖 **Ralph Loop Started**

Loop ID: \`$LOOP_ID\`
Branch: \`$BRANCH_NAME\`
$(if [[ -n "$AGENT" ]]; then echo "Agent: \`$AGENT\`"; fi)

This issue is now being processed by an automated Ralph loop." 2>/dev/null || true

    print_success "Updated issue #$ISSUE"
done

# Step 5: Initial commit
echo ""
echo "Step 5: Creating initial commit..."

git add prp.json progress.txt PRPs/adr/ PRPs/implementation-details/
git commit -m "ralph: initialize loop $LOOP_ID

Issues: $ISSUES_DISPLAY
Branch: $BRANCH_NAME
$(if [[ -n "$AGENT" ]]; then echo "Agent: $AGENT"; fi)

Co-Authored-By: Ralph Loop <noreply@anthropic.com>" 2>/dev/null || print_warning "Nothing to commit"

print_success "Initial commit created"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  RALPH LOOP READY${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Loop ID:     $LOOP_ID"
echo "  Branch:      $(git rev-parse --abbrev-ref HEAD)"
echo "  Issues:      $ISSUES_DISPLAY"
echo "  Max Iters:   $MAX_ITERATIONS"
if [[ -n "$AGENT" ]]; then
    echo "  Agent:       $AGENT"
fi
echo ""
echo "Next steps:"
echo "  1. Start a new Claude Code session"
echo "  2. Run: /ralph-loop:continue"
echo ""
