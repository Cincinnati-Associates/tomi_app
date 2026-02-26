#!/bin/bash
#
# sync-github.sh - Sync completion status back to GitHub
#
# This script:
#   1. Updates issue labels based on task status
#   2. Adds completion/progress comments to issues
#   3. Pushes branch and creates a PR with "Closes #X" references
#
# Usage:
#   ./scripts/ralph-loop/sync-github.sh
#   ./scripts/ralph-loop/sync-github.sh --no-pr
#   ./scripts/ralph-loop/sync-github.sh --base main
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Options
CREATE_PR=true
BASE_BRANCH="main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}!${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-pr)
            CREATE_PR=false
            shift
            ;;
        --base)
            BASE_BRANCH="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $(basename "$0") [--no-pr] [--base <branch>]"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

# Check for prp.json
if [[ ! -f "prp.json" ]]; then
    print_error "No prp.json found"
    exit 1
fi

# Read loop state
LOOP_ID=$(jq -r '.id' prp.json)
STATUS=$(jq -r '.status' prp.json)
BRANCH=$(jq -r '.branch' prp.json)
REPO=$(jq -r '.github.repo' prp.json)

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  RALPH LOOP - GITHUB SYNC${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Loop ID: $LOOP_ID"
echo "  Status:  $STATUS"
echo "  Branch:  $BRANCH"
echo ""

# Get completed and all issues
COMPLETED_ISSUES=$(jq -r '.tasks[] | select(.status == "completed") | .github_issue' prp.json)
ALL_ISSUES=$(jq -r '.tasks[].github_issue' prp.json)

# Step 1: Update issue labels and add completion comments
echo "Step 1: Updating GitHub issues..."

for ISSUE in $ALL_ISSUES; do
    TASK_STATUS=$(jq -r --arg num "$ISSUE" '.tasks[] | select(.github_issue == ($num | tonumber)) | .status' prp.json)

    if [[ "$TASK_STATUS" == "completed" ]]; then
        # Update labels: remove ralph-in-progress and ralph-ready, add ralph-complete
        # Note: agent:* labels are kept intact
        gh issue edit "$ISSUE" \
            --remove-label "ralph-in-progress" \
            --remove-label "ralph-ready" \
            --add-label "ralph-complete" 2>/dev/null || true

        # Add completion comment
        gh issue comment "$ISSUE" --body "🎉 **Ralph Loop Completed**

Loop ID: \`$LOOP_ID\`
Branch: \`$BRANCH\`

All acceptance criteria have been met. This issue will be closed when the PR is merged.

**Files created:**
- \`PRPs/adr/GH-${ISSUE}-adr.md\` - Architectural Decision Record
- \`PRPs/implementation-details/GH-${ISSUE}-implementation.md\` - Implementation Details" 2>/dev/null || true

        print_success "Issue #$ISSUE marked complete (ralph-complete label added)"
    else
        # Partial completion: remove ralph-in-progress
        gh issue edit "$ISSUE" \
            --remove-label "ralph-in-progress" 2>/dev/null || true

        # Add partial completion comment
        gh issue comment "$ISSUE" --body "⚠️ **Ralph Loop Ended - Partial Completion**

Loop ID: \`$LOOP_ID\`
Branch: \`$BRANCH\`

The Ralph loop ended but not all acceptance criteria were met for this issue.
Please review the implementation and continue manually if needed.

See \`progress.txt\` for details." 2>/dev/null || true

        print_warning "Issue #$ISSUE partially complete"
    fi
done

# Step 2: Push branch
echo ""
echo "Step 2: Pushing branch..."

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if ! git push -u origin "$CURRENT_BRANCH" 2>/dev/null; then
    print_warning "Branch may already be pushed or push failed"
fi

# Step 3: Create PR if requested
if [[ "$CREATE_PR" == true ]]; then
    echo ""
    echo "Step 3: Creating Pull Request..."

    # Check if PR already exists
    EXISTING_PR=$(gh pr list --head "$CURRENT_BRANCH" --json number -q '.[0].number' 2>/dev/null || echo "")

    if [[ -n "$EXISTING_PR" ]]; then
        print_warning "PR #$EXISTING_PR already exists for this branch"
        echo "  URL: https://github.com/$REPO/pull/$EXISTING_PR"
    else
        # Build PR body
        COMPLETED_COUNT=$(echo "$COMPLETED_ISSUES" | grep -c . || echo "0")
        TOTAL_COUNT=$(echo "$ALL_ISSUES" | grep -c . || echo "0")

        # Build closes references
        CLOSES_REFS=""
        for ISSUE in $COMPLETED_ISSUES; do
            CLOSES_REFS="${CLOSES_REFS}Closes #${ISSUE}
"
        done

        # Get task summaries
        TASK_SUMMARIES=$(jq -r '.tasks[] | "- **#\(.github_issue)**: \(.title) (\(.status))"' prp.json)

        # Create PR
        PR_URL=$(gh pr create \
            --base "$BASE_BRANCH" \
            --title "Ralph: $LOOP_ID - $COMPLETED_COUNT/$TOTAL_COUNT tasks complete" \
            --body "$(cat << EOF
## Ralph Loop Summary

**Loop ID:** \`$LOOP_ID\`
**Branch:** \`$CURRENT_BRANCH\`
**Status:** $STATUS

## Tasks

$TASK_SUMMARIES

## Documentation

$(for ISSUE in $ALL_ISSUES; do
    echo "### Issue #$ISSUE"
    echo "- [\`PRPs/adr/GH-${ISSUE}-adr.md\`](PRPs/adr/GH-${ISSUE}-adr.md) - Architectural Decision Record"
    echo "- [\`PRPs/implementation-details/GH-${ISSUE}-implementation.md\`](PRPs/implementation-details/GH-${ISSUE}-implementation.md) - Implementation Details"
    echo ""
done)

## Progress Log

See \`progress.txt\` for detailed iteration history.

---

$CLOSES_REFS

🤖 Generated by Ralph Loop
EOF
)")

        print_success "Created PR: $PR_URL"
    fi
else
    echo ""
    echo "Step 3: Skipped PR creation (--no-pr)"
fi

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  SYNC COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
COMPLETED_COUNT=$(echo "$COMPLETED_ISSUES" | grep -c . || echo "0")
TOTAL_COUNT=$(echo "$ALL_ISSUES" | grep -c . || echo "0")
echo "  Completed issues: $COMPLETED_COUNT"
echo "  Total issues:     $TOTAL_COUNT"
echo ""

if [[ "$STATUS" == "completed" ]]; then
    echo "  Loop completed successfully!"
else
    echo "  Loop ended with status: $STATUS"
    echo "  Some tasks may need manual attention."
fi
