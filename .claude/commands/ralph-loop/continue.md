# Continue Ralph Loop

Continue working on an active Ralph loop session.

## Initial Context Loading

Before doing any implementation work, you MUST read these files to understand the current state:

1. **Read `prp.json`** - Contains task definitions, acceptance criteria, and iteration state
2. **Read `progress.txt`** - Contains history of previous iterations and what was done
3. **Read relevant ADR files** in `PRPs/adr/GH-{N}-adr.md` - Architectural decisions
4. **Read relevant implementation files** in `PRPs/implementation-details/GH-{N}-implementation.md`

## Your Mission

Work on the next incomplete acceptance criterion from the tasks in `prp.json`.

### Task Priority

1. Focus on tasks with `status: "in_progress"` first
2. Then tasks with `status: "pending"` ordered by priority (lower number = higher priority)
3. Within each task, work on acceptance criteria that have `met: false`

### Implementation Process

For each piece of work:

1. **Understand the context** from ADR and implementation-details files
2. **Implement the change** following project patterns (see CLAUDE.md)
3. **Run validation**:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```
4. **Update documentation**:
   - Add any architectural decisions to the ADR file
   - Document implementation approach in the implementation-details file
5. **Commit changes** with descriptive message including iteration number

## Before Ending This Session

You MUST complete these steps before the session ends:

### 1. Update `progress.txt`

Append a new iteration block:

```
--- ITERATION {N} | {timestamp} ---
STATUS: in_progress|completed

WORK COMPLETED:
- [List what you accomplished]

BLOCKERS:
- [Any blockers, or "None"]

COMMITS:
- {hash}: {message}

ACCEPTANCE CRITERIA:
- [x] GH-{N} ac-{N}: {text} (if completed)
- [ ] GH-{N} ac-{N}: {text} (if pending)

NEXT SESSION FOCUS:
- [What to work on next]
```

### 2. Update `prp.json`

Use the Edit tool to update:

- `acceptance_criteria[].met = true` for any criteria you completed
- `iteration.current` - increment by 1
- `tasks[].status = "completed"` if ALL criteria for that task are met
- `status = "completed"` if ALL tasks are completed

### 3. Update ADR and Implementation Files

- Add any architectural decisions made to `PRPs/adr/GH-{N}-adr.md`
- Add implementation details to `PRPs/implementation-details/GH-{N}-implementation.md`
- Append to the Iteration Log section

### 4. Commit All Changes

```bash
git add prp.json progress.txt PRPs/
git commit -m "ralph: iteration {N} - {brief description}

- [What was done]
- [Criteria completed]

Loop: {loop_id}
Co-Authored-By: Ralph Loop <noreply@anthropic.com>"
```

## Completion

When ALL acceptance criteria across ALL tasks are met:

1. Set `prp.json` status to `"completed"`
2. Mark all tasks as `"completed"`
3. Output the completion promise:

```
<promise>TASK_COMPLETE</promise>
```

This signals the loop is done. Then run:

```bash
./scripts/ralph-loop/sync-github.sh
```

## Important Notes

- Always read existing files before making changes
- Follow project patterns from CLAUDE.md
- Run validation commands after each significant change
- Commit frequently with clear messages
- Update documentation as you work, not just at the end
