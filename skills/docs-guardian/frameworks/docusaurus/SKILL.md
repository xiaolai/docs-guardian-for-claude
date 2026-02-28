---
name: fw-docusaurus
description: Docusaurus framework adapter — config and sidebar parsing, MDX awareness, and doc generation templates.
---

# Docusaurus Framework Adapter

## Detection

Detected when `docusaurus.config.js` or `docusaurus.config.ts` exists in project root.

## Configuration Parsing

Key fields to extract:

```javascript
// docusaurus.config.js
module.exports = {
  title: 'My Project',
  presets: [
    ['@docusaurus/preset-classic', {
      docs: {
        sidebarPath: require.resolve('./sidebars.js'),
        routeBasePath: 'docs',
      },
    }],
  ],
};
```

```javascript
// sidebars.js
module.exports = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'API Reference',
      items: ['api/auth', 'api/users'],
    },
  ],
};
```

- `docs.sidebarPath`: path to sidebar configuration
- Sidebar items are doc IDs (filename without `.md`, relative to `docs/`)
- `docs.routeBasePath`: URL prefix (default `docs`)

## Doc Root

`docs/` directory (or configured via `docs.path` in presets).

## Code-to-Doc Mapping

### From Sidebars

Parse `sidebars.js` entries. Each string item maps to `docs/<item>.md`. Categories organize items hierarchically.

### Convention-Based

| Source | Doc Candidate |
|--------|--------------|
| `src/auth/login.ts` | `docs/api/auth.md` or `docs/api/auth/login.md` |
| `src/hooks/useAuth.ts` | `docs/api/hooks/useAuth.md` |

## Document Template

Docusaurus supports Markdown and MDX with YAML frontmatter:

```markdown
---
id: auth
title: Auth Module
sidebar_label: Authentication
sidebar_position: 1
---

# Auth Module

Brief description.

## API Reference

### `login(username, password)`

Authenticates a user and returns a session token.

| Name | Type | Description |
|------|------|-------------|
| `username` | `string` | The user's login name |
| `password` | `string` | The user's password |

**Returns:** `Session` — An authenticated session object.

:::tip
Use environment variables for credentials in production.
:::

```tsx
const session = await login("admin", "secret");
```
```

## Docusaurus-Specific Content

Valid Docusaurus content — do not flag as quality issues:
- `:::note/tip/info/caution/danger` admonitions
- MDX components and JSX in markdown (e.g., `<Tabs>`, `<CodeBlock>`)
- `import` statements at the top of `.mdx` files
- YAML frontmatter with Docusaurus fields (`id`, `sidebar_label`, `sidebar_position`, `slug`)
- `{@link}` and `{@see}` JSDoc references in MDX
