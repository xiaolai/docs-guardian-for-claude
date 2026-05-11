---
name: fw-mkdocs
description: "Use when generating or auditing documentation in MkDocs format — covers config, directory structure, frontmatter conventions, and build commands."
---

# MkDocs Framework Adapter

## Detection

Detected when `mkdocs.yml` or `mkdocs.yaml` exists in project root.

## Configuration Parsing

Key fields to extract from `mkdocs.yml`:

```yaml
site_name: My Project
docs_dir: docs        # default: docs/
nav:
  - Home: index.md
  - API Reference:
    - Auth: api/auth.md
    - Users: api/users.md
  - Guides:
    - Getting Started: guides/getting-started.md
theme:
  name: material       # most common theme
```

- `docs_dir`: the documentation root (default `docs/`)
- `nav`: ordered navigation structure mapping titles to file paths
- All paths in `nav` are relative to `docs_dir`

## Doc Root

Value of `docs_dir` in `mkdocs.yml`, defaults to `docs/`.

## Code-to-Doc Mapping

### From Nav

Parse `nav` entries to find existing doc pages. Match source files to doc pages by:
1. Module name matches page filename
2. Directory structure mirrors source structure under `api/` or `reference/`

### Convention-Based

| Source | Doc Candidate |
|--------|--------------|
| `src/auth/login.ts` | `docs/api/auth.md` or `docs/reference/auth/login.md` |
| `src/models/user.py` | `docs/api/models/user.md` or `docs/reference/user.md` |

## Document Template

MkDocs pages use standard Markdown with optional Material theme admonitions:

```markdown
# Auth Module

Brief description.

## API Reference

### `login(username, password)`

Authenticates a user and returns a session token.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `username` | `str` | The user's login name |
| `password` | `str` | The user's password |

**Returns:** `Session` — An authenticated session object.

!!! warning
    Passwords are transmitted in plaintext unless TLS is configured.

!!! example
    ```python
    session = login("admin", "secret")
    ```
```

## Material Theme Extensions

If using Material theme, docs may include:
- `!!! note/warning/tip/example` admonitions
- `::: details` collapsible sections
- `{{ var }}` Jinja template variables (from `mkdocs-macros-plugin`)

These are valid MkDocs content — do not flag as quality issues.
