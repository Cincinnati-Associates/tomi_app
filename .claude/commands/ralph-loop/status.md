# Ralph Loop Status

Check the current status of the Ralph loop.

## Your Task

1. **Check if a loop is active**:

   ```bash
   ./scripts/ralph-loop/check-completion.sh
   ```

2. **Read and summarize the current state** from `prp.json`:
   - Loop ID
   - Current iteration
   - Status (active/completed/cancelled)
   - Branch name
   - Agent owner (if set)

3. **Count progress**:
   - Total tasks
   - Completed tasks
   - Total acceptance criteria
   - Met acceptance criteria

4. **Show recent progress** from `progress.txt`:
   - Last iteration summary
   - Recent blockers
   - Next steps

5. **Report recommendations**:
   - If incomplete: suggest running `/ralph-loop:continue`
   - If complete: suggest running `/ralph-loop:sync-github`
   - If max iterations reached: suggest manual review

## Output Format

```
═══════════════════════════════════════════════════════════
  RALPH LOOP STATUS
═══════════════════════════════════════════════════════════

  Loop ID:     {id}
  Branch:      {branch}
  Agent:       {agent_owner or "all"}
  Status:      {status}
  Iteration:   {current} of {max}

  Progress:
    Tasks:     {completed}/{total} complete
    Criteria:  {met}/{total} met

  Next Steps:
    - {recommendation}

═══════════════════════════════════════════════════════════
```
