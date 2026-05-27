# Contributing

## Code Conventions

These conventions are **syntax-focused only** — they do not cover naming, file structure, or type annotation style.
Linter rules (`deno lint`) take priority. The conventions below cover what the linter does not enforce.

### Banned Syntax

These constructs are never used; treat them as if they don't exist in the language:

- Never use arrow functions for function declarations (`const foo = () => {}`) — always use the `function` keyword for
  named functions; arrow functions are only for anonymous callbacks
- Never use promise chaining (`.then()`/`.catch()`) — use `async/await` with `try/catch`
- Never use single-line `if` without braces — always use `{}`
- Never use the `throw` keyword in your own code — return `undefined` to indicate failure; `try/catch` is only for
  external APIs; callers must always check the return value for `undefined` before using it
- Never use the `++` and `--` operators — use `+= 1` and `-= 1` instead; they have confusing pre/post increment behavior

### Restricted Patterns

These constructs exist but are restricted to specific use cases:

- Do not use ternary operators (`? :`) for anything other than a simple value assignment — both branches must be
  literals or single identifiers, the condition must be a single boolean expression, and nesting is never allowed; use
  `if/else` for anything more complex
- Arrow functions for anonymous callbacks are allowed but must have braces (e.g.,
  `arr.find((x) => { return x.id === 1; })`); never use the `function` keyword for anonymous callbacks
- Do not nest **any** function calls or constructor calls inside function arguments — this includes calling a method and
  passing its result as an argument to another call (e.g., `foo(bar())`), and calling functions inside object literals
  that are passed as arguments (e.g., `foo({ x: bar() })`); assign intermediate results to named variables first
- Do not define function declarations or expressions inside function call arguments; define them separately before the
  call
- Do not use `||` for fallback values — use `??`; if you need `||` behavior (treating `0`, `""`, `false`, `NaN` as
  missing), use an explicit `if` check
- **Never use `null`** — never assign `null`, never return `null`, never accept `null` as a parameter; use `undefined`
  instead. You may check for `null` from external APIs, but never assign it in your own code
- Use a separate `try/catch` for each operation that can fail independently; avoid wrapping unrelated operations in a
  single `try/catch`. Operations that cannot fail (e.g., simple value construction, variable assignments, returns) may
  appear inside `try` blocks if they are part of the same logical operation, but should otherwise stay outside; `catch`
  blocks may contain any code including assignments and returns
- A `return` statement must fit on a single line; this applies strictly — including inline object literals and
  multi-line constructor calls; if the value does not fit on one line, assign it to a variable first and return that

## Examples

**Banned: Promise chaining (use `async/await`)**

```ts
// bad
fetch(url)
  .then((r) => r.json())
  .catch(() => null);

// good
try {
  const res = await fetch(url);
  return await res.json();
} catch {
  return null;
}
```

**Banned: Arrow functions for function declarations**

```ts
// bad — arrow as declaration
const greet = (name: string) => `Hello ${name}`;

// good — function declaration
function greet(name: string): string {
  return `Hello ${name}`;
}
```

**Restricted: Arrow functions for anonymous callbacks must have braces**

```ts
// bad — arrow callback without braces
const route = GET_ROUTES.find(([action]) => action === compareAction);

// good — arrow callback with braces
const route = GET_ROUTES.find(([action]) => {
  return action === compareAction;
});
const doubled = numbers.map((n) => {
  return n * 2;
});
```

**Banned: Single-line `if` without braces**

```ts
// bad
if (error) return error;

// good
if (error) {
  return error;
}
```

**Restricted: Ternary operators**

```ts
// good — simple value assignment, literal branches, trivial condition
const label = enabled ? 'on' : 'off';

// bad — branch is a function call, not a literal or identifier
const label = enabled ? getLabel() : 'off';

// bad — nested ternary
const label = a ? 'x' : b ? 'y' : 'z';

// bad — used as a function argument (also caught by no-nested-calls rule)
log(enabled ? 'on' : 'off');

// good — complex case uses if/else
let label: string;
if (enabled) {
  label = getLabel();
} else {
  label = 'off';
}
```

**Restricted: Separate `try/catch` per operation**

```ts
// bad
try {
  const data = await readFile(path);
  await sendEmail(data);
} catch {
  // unclear which operation failed
}

// good
let data: string;
try {
  data = await readFile(path);
} catch {
  return error('Failed to read file');
}
try {
  await sendEmail(data);
} catch {
  return error('Failed to send email');
}
```

**Restricted: No nested calls in function arguments**

```ts
// bad — nested call inside function argument
await save(new Uint8Array(await file.arrayBuffer()));

// bad — method call passed as argument to another call
const sites = await Promise.all(entries.map(buildEntry));

// good — split into separate lines
const buffer = await file.arrayBuffer();
await save(new Uint8Array(buffer));

// good — split the Promise.all case
const sitePromises = entries.map(buildEntry);
const sites = await Promise.all(sitePromises);

// bad — function call inside object literal passed as argument
return json({ domain, visitors: getVisitors(domain) });

// good — split into separate lines
const visitors = getVisitors(domain);
return json({ domain, visitors });
```

**Restricted: No function definitions inside call arguments**

```ts
// bad — named function expression inside find()
const route = GET_ROUTES.find(function matchesAction([routeAction]): boolean {
  return routeAction === compareAction;
});

// good — arrow function callback with braces
const route = GET_ROUTES.find(([routeAction]) => {
  return routeAction === compareAction;
});

// good — named function defined separately, referenced by name
function matchesAction(route: Route): boolean {
  return route.action === compareAction;
}
const route = GET_ROUTES.find(matchesAction);
```

**Restricted: No chained operations**

```ts
// bad (also: chained operations)
const host = (url.searchParams.get('domain') ?? '').replace(/\.example\.com$/, '');

// good
const rawDomain = url.searchParams.get('domain') ?? '';
const host = rawDomain.replace(/\.example\.com$/, '');
```

**Restricted: Use `??` not `||` for fallbacks**

```ts
// bad
const count = data.count || 0; // wrong: suppresses valid 0 values
const timeout = config.timeout || 5000; // wrong: implicit behavior

// good
const count = data.count ?? 0; // only falls back when null/undefined

// when you need to treat 0 as missing, use explicit check
let timeout: number;
if (config.timeout !== undefined && config.timeout !== 0) {
  timeout = config.timeout;
} else {
  timeout = 5000;
}
```

**Restricted: Use `undefined` not `null`**

```ts
// bad — never define null yourself
let result: string | null = null;
return null;

// good — use undefined
let result: string | undefined;
return undefined; // or just: return;

// accept null from boundaries, convert to undefined
const param = url.searchParams.get('key'); // returns string | null
const value = param ?? undefined; // normalize before using internally
```

**Restricted: Single-line returns**

```ts
// bad — multi-line computation in return
return Array.from({ length: count }, (_, i) => {
  const slot = now - (count - 1 - i);
  let up: boolean | undefined;
  if (d?.has(slot)) {
    up = d.get(slot) ?? false;
  } else {
    up = undefined;
  }
  return { slot, up };
});

// good — extract to separate function
function buildUptimeSlot(...): { slot: number; up: boolean | undefined } {
  // ...computation...
  return { slot, up };
}
return Array.from({ length: count }, (_, i) => {
  return buildUptimeSlot(d, now, count, i);
});

// good — compute before returning
const total = computeTotal();
return total;
```

**Banned: Use `+= 1` not `++`**

```ts
// bad — confusing pre/post increment behavior
for (let i = 0; i < n; i++) {
  /* ... */
}
count++;

// good — explicit addition
for (let i = 0; i < n; i += 1) {
  /* ... */
}
count += 1;

// note: `++x` (pre-increment) is a drop-in replacement with `+= 1`
// but `x++` (post-increment) requires code adaptation because it
// returns the old value, not the new one
```

**Banned: The `throw` keyword (return values instead)**

```ts
// bad — throwing in your own code
function parseData(input: string): Data {
  if (!valid(input)) throw new Error('invalid');  // never throw
  return { ... };
}

// good — return undefined, let caller handle it
function parseData(input: string): Data | undefined {
  if (!valid(input)) return undefined;
  return { ... };
}
const data = parseData(input);
if (data === undefined) {
  return error('Parse failed');
}
use(data);

// good — try/catch is OK for external APIs that may throw
let content: string;
try {
  content = await Deno.readTextFile(path);  // external API
} catch {
  return undefined;
}
```
