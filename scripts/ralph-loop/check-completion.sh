#!/bin/bash
#
# check-completion.sh - Check if Ralph loop should continue or is complete
#
# Exit codes:
#   0 - Loop is complete (all criteria met or max iterations reached)
#   1 - Loop should continue
#   2 - Error (no loop found, invalid state)
#
# Usage:
#   ./scripts/ralph-loop/check-completion.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Check for active loop
if [[ ! -f "prp.json" ]]; then
    echo "ERROR: No prp.json found" >&2
    exit 2
fi

# Read loop state
LOOP_ID=$(jq -r '.id' prp.json)
STATUS=$(jq -r '.status' prp.json)
CURRENT_ITER=$(jq -r '.iteration.current' prp.json)
MAX_ITER=$(jq -r '.iteration.max' prp.json)

# Check if already completed
if [[ "$STATUS" == "completed" ]]; then
    echo "✓ Loop $LOOP_ID is COMPLETE"
    exit 0
fi

# Check if cancelled
if [[ "$STATUS" == "cancelled" ]]; then
    echo "✗ Loop $LOOP_ID was CANCELLED"
    exit 0
fi

# Check iteration limit
if [[ "$CURRENT_ITER" -gt "$MAX_ITER" ]]; then
    echo "! Loop $LOOP_ID reached MAX ITERATIONS ($MAX_ITER)"
    echo "  Consider increasing --max-iterations or completing manually"
    exit 0
fi

# Count incomplete criteria
TOTAL_CRITERIA=$(jq '[.tasks[].acceptance_criteria[]] | length' prp.json)
MET_CRITERIA=$(jq '[.tasks[].acceptance_criteria[] | select(.met == true)] | length' prp.json)
REMAINING=$((TOTAL_CRITERIA - MET_CRITERIA))

# Check if all criteria are met
if [[ "$REMAINING" -eq 0 ]] && [[ "$TOTAL_CRITERIA" -gt 0 ]]; then
    echo "✓ All acceptance criteria met!"
    echo "  Loop should be marked as completed"
    exit 0
fi

# Loop should continue
echo "○ Loop $LOOP_ID - Iteration $CURRENT_ITER of $MAX_ITER"
echo "  Progress: $MET_CRITERIA / $TOTAL_CRITERIA criteria met"
echo "  Remaining: $REMAINING criteria"
echo ""
echo "  Run: ./scripts/ralph-loop/continue-loop.sh"

exit 1
