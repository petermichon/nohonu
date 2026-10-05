# Agent Instructions

## Git workflow

Work in **batches** on a single short-lived branch off `main`:

1. Create a branch off `main`: `git checkout -b <type>/<description>`
   (types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `design`)
2. Commit locally as you go (signed commits). Do **not** push per commit.
3. When asked to push, push once and open a PR with `gh pr create`; CI
   (`check.yml`) runs lint, typecheck, tests, and build.
4. Rebase on `main` before merging if it has moved.
5. Merge to `main` when CI is green, using **squash merge**.

The maintainer may commit directly to `main` for short-lived work; branches and
PRs remain the convention for anything non-trivial. Contributors without write
access work from a fork and open a PR.

`main` is branch-protected: signed commits are required, force-pushes and
branch deletion are blocked, and `enforce_admins` is on. There is no required
pull request or review approval, since the project is maintained solo and
GitHub does not allow self-approval. CI (`check.yml`) runs on every push and PR.