# Sync GitHub

Sync Ralph loop completion status back to GitHub.

## What This Does

1. **Updates GitHub issue labels** - Removes `ralph-in-progress`, adds `ralph-complete` for completed tasks
2. **Adds completion comments** - Documents the loop completion on each issue
3. **Creates a Pull Request** - With "Closes #X" references for auto-closing

## Usage

Run the sync script:

```bash
./scripts/ralph-loop/sync-github.sh
```

Or skip PR creation:

```bash
./scripts/ralph-loop/sync-github.sh --no-pr
```

Or specify a different base branch:

```bash
./scripts/ralph-loop/sync-github.sh --base main
```

## When to Use

- After the Ralph loop completes (all acceptance criteria met)
- When you output `<promise>TASK_COMPLETE</promise>`
- If you need to manually end a loop early

## PR Structure

The created PR will include:

- Summary of loop completion status
- List of tasks and their status
- Links to ADR and implementation-details files
- "Closes #X" references for completed issues
- Reference to progress.txt for detailed history

## After Sync

1. Review the created PR
2. Request review if needed
3. Merge to integrate changes
4. GitHub will auto-close referenced issues on merge

## Manual Cleanup

If issues weren't closed automatically:

```bash
gh issue close {number} --comment "Completed in PR #{pr_number}"
```
