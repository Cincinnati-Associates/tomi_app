# Start Ralph Loop

Initialize a new Ralph loop from GitHub issues.

## Arguments: $ARGUMENTS

Parse the arguments to extract filtering options:

- `--agent <name>` - Filter by agent (uses `agent:<name>` label + `ralph-ready` label)
- `--label <name>` - Filter by label (can appear multiple times)
- `--assignee <user>` - Filter by assignee
- `--issue <n,n,n>` - Specific issue numbers (comma-separated)
- `--max-iterations <n>` - Max iterations (default: 50)
- `--use-current-branch` - Skip branch creation, use current branch

## Your Task

1. **Run the init script** with the provided arguments:

   ```bash
   ./scripts/ralph-loop/init-loop.sh $ARGUMENTS
   ```

2. **Review the generated files**:
   - Read `prp.json` to understand the tasks
   - Check `PRPs/adr/` for ADR stubs created
   - Check `PRPs/implementation-details/` for implementation stubs

3. **Verify GitHub updates**:
   - Issues should have `ralph-in-progress` label
   - Issues should have initialization comment

4. **Report the initialization status**:
   - Loop ID
   - Branch name
   - Agent owner (if --agent was used)
   - Number of tasks
   - List of issues included

## After Initialization

Once the loop is initialized, you can:

- Run `/ralph-loop:continue` to start working on tasks
- Or exit and run `/ralph-loop:continue` in a new session

## Example Usage

```
/ralph-loop:start --agent schema-architect
/ralph-loop:start --agent pipeline-engineer --use-current-branch
/ralph-loop:start --issue 14,15 --max-iterations 30
/ralph-loop:start --label ralph-ready
```
