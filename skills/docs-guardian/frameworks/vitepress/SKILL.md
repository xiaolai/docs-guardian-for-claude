---
name: fw-vitepress
description: VitePress framework adapter — sidebar config parsing, Vue component awareness, and doc generation templates.
---

# VitePress Framework Adapter

## Detection

Detected when any of these exist:
- `.vitepress/config.ts`
- `.vitepress/config.js`
- `.vitepress/config.mts`

## Configuration Parsing

Key fields to extract from the VitePress config:

```typescript
export default defineConfig({
  title: 'My Project',
  themeConfig: {
    sidebar: [
      {
        text: 'API Reference',
        items: [
          { text: 'Auth', link: '/api/auth' },
          { text: 'Users', link: '/api/users' }
        ]
      }
    ],
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ]
  }
})
```

- `themeConfig.sidebar`: primary navigation structure
- Links are relative to doc root, without `.md` extension
- Actual files are at `<link>.md` relative to the VitePress root

## Doc Root

The directory containing `.vitepress/`. Common patterns:
- Project root (`.vitepress/` at root, docs alongside)
- `docs/` subdirectory (`docs/.vitepress/`)

## Code-to-Doc Mapping

### From Sidebar

Parse sidebar items to find existing doc pages. Convert links to file paths: `/api/auth` → `api/auth.md` relative to doc root.

### Convention-Based

| Source | Doc Candidate |
|--------|--------------|
| `src/auth/login.ts` | `api/auth.md` or `reference/auth/login.md` |
| `src/composables/useAuth.ts` | `api/composables/useAuth.md` |
| `src/components/Button.vue` | `components/Button.md` |

## Document Template

VitePress supports standard Markdown plus Vue components and YAML frontmatter:

```markdown
---
outline: deep
---

# Auth Module

Brief description.

## API Reference

### `login(username, password)` {#login}

Authenticates a user and returns a session token.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `username` | `string` | The user's login name |
| `password` | `string` | The user's password |

**Returns:** `Session` — An authenticated session object.

::: tip
Use environment variables for credentials in production.
:::

::: code-group
```ts [TypeScript]
const session = await login("admin", "secret");
```
```js [JavaScript]
const session = await login("admin", "secret");
```
:::
```

## VitePress-Specific Content

Valid VitePress content — do not flag as quality issues:
- `::: tip/warning/danger/details` containers
- `{{ expression }}` Vue template syntax
- `<script setup>` blocks in markdown
- Custom Vue components (e.g., `<Badge type="warning" />`)
- YAML frontmatter with VitePress-specific fields (`outline`, `layout`, `hero`)
