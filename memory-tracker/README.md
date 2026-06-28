# Memory Dependency Tracker

Visualizes memory sharing patterns in your codebase.

## Usage

Open `index.html` in your browser:

```bash
# From project root
open tools/memory-tracker/index.html
# or
xdg-open tools/memory-tracker/index.html
```

## Features

- **Module Exports (Red)**: Current pattern - module-level mutable state
- **Constructor Injection (Blue)**: Future pattern - dependency injection
- **Interactive Graph**: Drag nodes, click for details
- **Filter Controls**: Toggle between patterns

## Data Structure

```typescript
{
  nodes: [{
    id: string;
    file: string;
    name: string;
    type: "module-export" | "constructor-param" | "variable";
    isMutable: boolean;
    line: number;
  }];
  edges: [{
    from: string;
    to: string;
    type: "import" | "constructor-injection" | "variable-reference";
    file: string;
    line: number;
  }];
}
```

## Next Steps

- [ ] Build AST parser for real backend code
- [ ] Integrate parser with visualization
- [ ] Add file upload for custom analysis
