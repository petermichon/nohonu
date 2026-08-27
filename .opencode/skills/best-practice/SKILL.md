---
name: best-practice
description: Use when planning, designing, implementing, refactoring, or changing any code in this repo — before committing to an approach. Makes the model verify its solution is the modern, idiomatic best practice for the framework/language (React 19, Express 5, Prisma, Node, TypeScript), not just the first thing that works or the path that fits the current setup.
---

# Best-Practice / Modern Approach

Before committing to an approach, check whether it is the modern, best-practice
way a disciplined developer would do it today — not the first approach that
comes to mind.

## The default failure mode

AIs often pick the quickest path and rationalize it:

- "This is simpler with the current setup"
- "Just follow what the existing code does"
- "This works, good enough"
- "That API is old/deprecated, but I'm used to it"

That is how tech debt gets added. Challenge it.

## Required before implementing

1. **Name the alternative.** State at least one modern/idiomatic approach
   different from your first instinct — the framework's recommended pattern,
   stdlib/utility over hand-rolled code, current major-version APIs.
2. **Compare honestly.** Write one short trade-off: best-practice approach vs
   quick approach — cost now vs cost of changing later.
3. **Verify, don't guess.** If you are unsure of the idiomatic way in the
   current framework/language version, use webfetch against the *current*
   official docs before choosing. Never guess a deprecated or removed API just
   because it is familiar. This repo runs current majors — React 19, Express 5,
   Prisma, Node 20+ — so APIs from older majors may be wrong.
4. **Surface the decision to the user.** If best-practice differs from quick,
   do not silently pick either. Recommend the best-practice approach, note the
   extra cost, and let the user decide.

## Tech-debt flags to watch for

- Copying non-idiomatic code from elsewhere in the repo just because it
  already exists.
- "Simplest with the current setup" when the setup itself is the legacy part.
- Deprecated APIs, deprecated lifecycle methods, old config formats,
  version-specific hacks that newer versions replaced. E.g.:
  - React: legacy patterns (default-exported components, `React.FC` without
    need, class components where hooks fit, `useEffect` when TanStack Query or
    Router already manages the state) instead of React 19 idioms.
  - Express: request handlers returning `void` instead of `await`, old
    middleware/body-parser patterns replaced by Express 5 built-ins.
  - Prisma: raw SQL or queries when the generated client + relations do it.
- Re-inventing what the language/framework stdlib or a widely-used, maintained
  library already provides (e.g. hand-rolled fetch caching instead of TanStack
  Query).
- Adding to a broken/legacy pattern instead of fixing or replacing it.

## Escalation rule

If the modern approach is a large refactor, still recommend it but frame the
migration: do not let "too big right now" mean silently doing the legacy thing.
Make the cost explicit so the user chooses knowingly.
