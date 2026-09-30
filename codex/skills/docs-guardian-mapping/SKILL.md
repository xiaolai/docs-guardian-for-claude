---
name: docs-guardian-mapping
description: "Map source files to their docs: which docs cover which code, gaps, doc-to-code links."
---

# Code-to-Doc Mapping

## Overview

A **mapping** is a pair: `(source_file, doc_file)`. The audit pipeline resolves all mappings before running the analysis skills. Four strategies are applied in priority order.

## Strategy 1: Config-Based (Highest Priority)

User-defined mappings in `.claude/docs-guardian/config.json`:

```json
{
  "mappings": [
    { "source": "src/auth/**/*.ts", "doc": "docs/api/auth.md" },
    { "source": "src/db/models/*.py", "doc": "docs/models/${name}.md" }
  ]
}
```

The `${name}` placeholder expands to the source file's basename without extension.

Glob patterns are supported in `source`. The `doc` field can be a literal path or use `${name}`.

## Strategy 2: Framework-Derived

Each framework adapter knows its own mapping convention:

| Framework | Convention |
|-----------|-----------|
| MkDocs | `mkdocs.yml` nav entries → doc paths under `docs_dir` |
| VitePress | `.vitepress/config` sidebar entries → doc paths |
| Docusaurus | `sidebars.js` entries → doc paths under `docs/` |
| Sphinx | `toctree` directives → `.rst` files under `source/` |
| Plain Markdown | Convention-based (see Strategy 3) |

## Strategy 3: Convention-Based

When no config or framework mapping exists, use naming conventions:

| Source Path | Doc Path |
|-------------|----------|
| `src/foo/bar.ts` | `docs/foo/bar.md` |
| `src/foo/bar.ts` | `docs/api/foo/bar.md` |
| `lib/foo.py` | `docs/foo.md` |
| `pkg/foo/bar.go` | `docs/foo/bar.md` |
| `src/foo/mod.rs` | `docs/foo.md` |

Try each candidate in order. First existing file wins.

If no doc file exists for a source file, record it as **unmapped** (potential coverage gap).

## Strategy 4: Inline-Doc (Lowest Priority)

A source file whose symbols carry docstrings, JSDoc or godoc comments but which has no external doc file is documented inline. When a source file has no external doc mapping but contains inline documentation:

- Still count the inline docs toward coverage
- Flag as `INFO` that docs are inline-only (not necessarily a problem)
- If the framework expects external docs, flag as `MEDIUM` coverage gap

## Mapping Output

Return an array of resolved mappings:

```json
[
  {
    "source": "src/auth/login.ts",
    "doc": "docs/api/auth.md",
    "strategy": "config",
    "confidence": "high"
  },
  {
    "source": "src/utils/hash.ts",
    "doc": null,
    "strategy": "unmapped",
    "confidence": "none"
  }
]
```

## Scope

Covers resolving which doc file documents which source file, and recording unmapped files as coverage gaps. Language and framework selection happens earlier, in `$docs-guardian-detection`; severity tags, finding format and quality scoring live in `$docs-guardian-standards`.
