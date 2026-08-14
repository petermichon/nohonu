# Agent Instructions

## Git workflow

Commit to the nohonu repo using **GitHub Flow**:

1. Create a short-lived branch off `main`: `git checkout -b <type>/<description>`
   (types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `design`)
2. Commit and push the branch.
3. Open a PR with `gh pr create`; CI (`check.yml`) runs lint, typecheck, tests, and build.
4. Merge to `main` only when CI is green, using **squash merge**.

Never commit directly to `main`.

The repo is private, so `main` has no branch protection. When it goes public, enable protection on `main`: require a PR, require checks to pass, and require signed commits.
