---
name: fw-plain-markdown
description: Plain Markdown framework adapter — convention-based doc layout with standard headings and no build tool.
---

# Plain Markdown Framework Adapter

## Detection

Detected when:
- A `docs/` directory exists containing `.md` files, AND
- No framework config file is found (no mkdocs.yml, .vitepress/, etc.)
- OR only a `README.md` exists

## Doc Root

- `docs/` if it exists
- Project root (just `README.md`) otherwise

## Directory Conventions

```
docs/
├── README.md          # Main documentation entry point
├── getting-started.md # Setup / quickstart guide
├── api/               # API reference docs
│   ├── module-a.md
│   └── module-b.md
├── guides/            # How-to guides
│   └── deployment.md
└── architecture.md    # Architecture overview
```

## Code-to-Doc Mapping

| Source Path | Doc Path Candidates (try in order) |
|-------------|-----------------------------------|
| `src/auth/login.ts` | `docs/api/auth/login.md`, `docs/auth/login.md`, `docs/api/auth.md` |
| `src/utils.ts` | `docs/api/utils.md`, `docs/utils.md` |
| `lib/parser.py` | `docs/api/parser.md`, `docs/parser.md` |

## Document Template

When generating new docs, use this structure:

```markdown
# Module Name

Brief description of the module's purpose.

## Overview

What this module does and when to use it.

## API Reference

### `functionName(param1, param2)`

Description of the function.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| param1 | `string` | Description |
| param2 | `number` | Description |

**Returns:** `ReturnType` — Description of return value.

**Example:**

\`\`\`typescript
const result = functionName("hello", 42);
\`\`\`

## See Also

- [Related Module](./related.md)
```

## Nav / Sidebar

Plain Markdown has no built-in nav. The entry point is `docs/README.md` or `README.md`. Cross-linking is done via relative markdown links.
