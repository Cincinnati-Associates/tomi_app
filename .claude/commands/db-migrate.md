# Database Migration Command

Execute a safe Drizzle ORM migration workflow for the Supabase + Vercel + GitHub stack.

## Order of Operations

Follow these steps IN ORDER. Stop and report if any step fails.

### Step 1: Pre-flight Checks
1. Verify `DATABASE_URL` is set in `.env.local`
2. Run TypeScript check on schema files: `npx tsc --noEmit src/db/**/*.ts`
3. Check for uncommitted changes: `git status --porcelain`

### Step 2: Generate Migration
1. Run `npm run db:generate` to create SQL migration files from schema changes
2. Review the generated migration in `src/db/migrations/`
3. Report what tables/columns will be affected

### Step 3: Validate Migration (Dry Run)
1. If there are destructive changes (DROP, ALTER column type), STOP and ask for confirmation
2. Show the user the SQL that will be executed

### Step 4: Apply Migration
1. Run `npm run db:migrate` to apply pending migrations to the database
2. Verify migration succeeded by checking table structure

### Step 5: Verify Schema Sync
1. Run `npm run db:pull` to pull the live schema
2. Compare pulled schema with local schema to ensure they match
3. Report any discrepancies

### Step 6: Post-Migration
1. Run TypeScript check: `npx tsc --noEmit`
2. Run build to verify no runtime issues: `npm run build`
3. Stage the migration files: `git add src/db/migrations/`
4. Report success and suggest committing with message format:
   `chore(db): [description of schema change]`

## Safety Rules

- NEVER run migrations with `--force` unless explicitly requested
- ALWAYS show destructive changes before executing
- STOP if migration would delete data or drop columns
- For production deploys, remind user to:
  1. Run migration on Supabase staging first
  2. Test the app against staging
  3. Then apply to production

## Arguments

- `--dry-run`: Only generate and show migration, don't apply
- `--force`: Skip confirmations (use with caution)
- `--studio`: Open Drizzle Studio after migration to inspect results

## Example Usage

```
/db-migrate              # Full migration workflow
/db-migrate --dry-run    # Preview changes only
/db-migrate --studio     # Migrate then open studio
```
