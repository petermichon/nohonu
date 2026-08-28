# Agent Instructions

## Git workflow

Work in **batches** on a single short-lived branch off `main`:

1. Create a branch off `main`: `git checkout -b <type>/<description>`
   (types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `design`)
2. Commit locally as you go (signed commits). Do **not** push per commit.
3. When asked to push, push once and open a PR with `gh pr create`; CI
   (`check.yml`) runs lint, typecheck, tests, and build.
4. Rebase on `main` before merging if it has moved.
5. Merge to `main` only when CI is green, using **squash merge**.

Never commit directly to `main`.

`main` is branch-protected: it requires a pull request, required checks
(`check.yml`), and signed commits. There is no required review approval, since
the project is maintained solo and GitHub does not allow self-approval.