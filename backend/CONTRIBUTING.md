# Contributing

## Code Conventions

These conventions are **syntax-focused only** — they do not cover naming, file structure, or type annotation style.
Linter rules (`deno lint`) take priority. The conventions below cover what the linter does not enforce.

### Banned Syntax

These constructs are never used; treat them as if they don't exist in the language:

- Never use arrow functions for function declarations (`const foo = () => {}`) — always use the `function` keyword for
  named functions; arrow functions are only for anonymous callbacks
- Never use promise chaining (`.then()`/`.catch()`) — use `async/await` with `try/catch`
- Never use single-line `if` without braces — always use `{}` strictly, even for early returns and logging
- Never use the non-null assertion operator (`!`); if a value might be missing, use optional chaining (`?.`) or an
  explicit `if` check
- Never declare a variable in an inner scope that has the same name as a variable in an outer scope (variable shadowing)

### Restricted Patterns

These constructs exist but are restricted to specific use cases:

- Do not use ternary operators (`? :`) for anything other than a simple value assignment — both branches must be
  literals or single identifiers, the condition must be a single boolean expression, and nesting is never allowed; use
  `if/else` for anything more complex
- The `++` and `--` operators are only allowed as standalone statements (e.g., `count++;`) and within `for` loop
  declarations; they are banned inline within complex expressions
- Do not nest function calls or constructor calls inside function arguments (e.g., `foo(bar())`); the only exceptions
  are built-in type casts (`Number()`, `String()`, `Boolean()`) and property accessors. For all other operations, assign
  intermediate results to named variables first
- Function definitions inside call arguments are only allowed if they are single-line arrow functions with an implicit
  return (e.g., `.map(x => x.id)`); multi-line functions or those requiring braces and explicit `return` statements must
  be defined separately before the call
- Do not use `||` for fallback values — use `??`; if you need `||` behavior (treating `0`, `""`, `false`, `NaN` as
  missing), use an explicit `if` check
- Avoid using `null` in your own code — use `undefined` instead. You may use `null` when it is strictly required by
  external APIs, third-party libraries, or databases
- A `try` block must contain exactly one operation that can throw. You may `return` directly from the `try` block. If
  you need the result of the operation later in the function, you must declare a `let` variable outside the `try` and
  assign it inside. Do not wrap multiple operations that can throw (e.g., `fetch()` and `.json()`) in the same `try`
  block
- Do not use type assertions (`as Type`) to bypass the compiler. Either type the variable explicitly
  (`const x: Type = {}`) or use type guards/validation. The only allowed use of `as` is `as const` for literal inference
- Never access an array by index (`arr[0]`) without bounds checking or handling `undefined`. Prefer `.find()`, `.at()`,
  or array destructuring with defaults. (Ensure `noUncheckedIndexedAccess` is enabled in your Deno/TypeScript config)
- Do not combine more than two boolean conditions in a single `if` statement; extract complex logic into well-named
  boolean variables first

## Examples

**Banned: Promise chaining (use `async/await`)**

```ts
// bad
fetch(url)
  .then((r) => r.json())
  .catch(() => new Error('Failed'));

// good
let res: Response;
try {
  res = await fetch(url);
} catch {
  return new Error('Network failed');
}

try {
  return await res.json();
} catch {
  return new Error('Parse failed');
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

**Restricted: One throwing operation per `try/catch`**

```ts
// bad — mixes file read error with email send error
try {
  const data = await readFile(path);
  await sendEmail(data);
} catch {
  return new Error('Failed');
}

// bad — declaring const inside try makes it unavailable outside
try {
  const data = await readFile(path);
} catch {
  return new Error('Read failed');
}
await sendEmail(data); // Error: data is not defined

// good — exact failure isolation, variables declared outside
let data: string;
try {
  data = await readFile(path);
} catch {
  return new Error('Failed to read file');
}

try {
  await sendEmail(data);
} catch {
  return new Error('Failed to send email');
}
```

**Restricted: No complex nested calls in function arguments**

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

// bad — complex function call inside object literal passed as argument
return json({ domain, visitors: getVisitors(domain, { active: true }) });

// good — split into separate lines
const visitors = getVisitors(domain, { active: true });
return json({ domain, visitors });

// good — built-in type casts are allowed
await save(Number(id));
```

**Restricted: Function definitions inside call arguments**

```ts
// bad — multi-line function expression inside find()
const route = GET_ROUTES.find((route) => {
  const isMatch = route.action === compareAction;
  return isMatch && isValid;
});

// good — multi-line function defined separately
function matchesAction(route: Route): boolean {
  const isMatch = route.action === compareAction;
  return isMatch && isValid;
}
const route = GET_ROUTES.find(matchesAction);

// good — single-line arrow function with implicit return is allowed
const ids = items.map((x) => x.id);
const active = users.filter((u) => u.isActive);
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

**Restricted: Avoid `null` (use `undefined`)**

```ts
// bad — never define null yourself if not required
let result: string | null = null;
return null;

// good — use undefined for your own code
let result: string | undefined;
return undefined; // or just: return;

// good — using null is allowed when required by external APIs
const param = url.searchParams.get('key'); // external API returns string | null
```

**Restricted: The `++` and `--` operators**

```ts
// bad — inline within a complex expression
const nextId = currentId++;
const value = array[--index];

// good — standalone statement
let count = 0;
count++;

// good — in for loop declarations
for (let i = 0; i < n; i++) {
  /* ... */
}
```

**Banned: Non-null assertions (`!`)**

```ts
// bad
const url = req.url!;
const name = user!.name;

// good
if (!req.url) return new Error('Missing URL');
const url = req.url;
const name = user?.name;
```

**Banned: Variable shadowing**

```ts
// bad
const route = getRoute();
const active = users.filter((route) => route.isActive); // shadows outer 'route'

// good
const active = users.filter((user) => user.isActive);
```

**Restricted: Type assertions (`as`)**

```ts
// bad — suppresses missing properties
const user = { name: 'Alice' } as User;

// good — compiler enforces shape
const user: User = { name: 'Alice', id: 1 };

// good — literal inference is allowed
const method = 'GET' as const;
```

**Restricted: Array index access**

```ts
// bad — crashes if records is empty
const first = records[0];
return first.value;

// good — explicitly handle the potential undefined
const first = records.at(0);
if (!first) return new Error('empty records');
return first.value;
```

**Restricted: Complex boolean conditions**

```ts
// bad
if (user.isActive && !user.isBanned && (user.role === 'admin' || user.role === 'editor')) {
  /* ... */
}

// good
const isEligible = user.isActive && !user.isBanned;
const hasPrivileges = user.role === 'admin' || user.role === 'editor';
if (isEligible && hasPrivileges) {
  /* ... */
}
```

**Banned: The `throw` keyword (return `Error` objects instead)**

```ts
// bad — throwing in your own code
function parseData(input: string): Data {
  if (!valid(input)) throw new Error('invalid format'); // never throw
  return {
    /* ... */
  };
}

// good — return Data | Error, let caller handle it
function parseData(input: string): Data | Error {
  if (!valid(input)) return new Error('invalid format');
  return {
    /* ... */
  };
}

const data = parseData(input);
if (data instanceof Error) {
  return data; // bubble up the error
}
use(data);

// good — try/catch is OK for external APIs that may throw
let content: string;
try {
  content = await Deno.readTextFile(path); // external API
} catch (e) {
  return new Error('Failed to read text file');
}
```
