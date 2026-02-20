# Contributing to Vändtians Game

## How to Revert Commits

### Revert a single commit (safe, non-destructive)

Use `git revert` to create a new commit that undoes the changes from an existing
commit. This preserves full history and is safe to use on shared branches.

```bash
# Revert the most recent commit
git revert HEAD

# Revert a specific commit by its SHA
git revert <commit-sha>

# Revert without immediately opening an editor (uses default message)
git revert --no-edit <commit-sha>

# Stage the revert without committing (review before committing)
git revert --no-commit <commit-sha>
git revert --no-commit HEAD~3..HEAD  # revert a range
git commit -m "Revert changes from <description>"
```

### Revert multiple consecutive commits

```bash
# Revert commits from HEAD back three commits (newest first)
git revert HEAD~3..HEAD
```

### Find the commit SHA to revert

```bash
# View recent commits with their SHAs
git log --oneline -20
```

### Supabase migrations

Migration files under `supabase/migrations/` are **append-only** — do not delete
or modify existing migration files. To undo a database change, add a new migration
that reverses it:

```bash
# Example: create a revert migration
supabase migration new revert_<description>
# Then write the inverse SQL in the generated file
```

For example, to revert the DELETE policy added in
`20260220132037_bd1d3d7a-42e4-405c-ab93-db1441c36146.sql`:

```sql
-- supabase/migrations/<timestamp>_revert_delete_profile_policy.sql
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
```

### Undo a revert (re-apply the reverted commit)

```bash
git revert <revert-commit-sha>
```

## Development Setup

```bash
npm install
npm run dev
```

## Running Tests

```bash
npm run test
```

## Linting

```bash
npm run lint
```
