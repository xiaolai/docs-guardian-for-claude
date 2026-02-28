---
name: detection
description: Auto-detect project language and documentation framework from filesystem markers.
---

# Stack Detection

## Language Detection

Scan the project root for these marker files. First match wins; if multiple match, use the one with the highest priority.

| Priority | Marker File | Language |
|----------|-------------|----------|
| 1 | `Cargo.toml` | Rust |
| 2 | `go.mod` | Go |
| 3 | `pyproject.toml`, `setup.py`, `setup.cfg`, `Pipfile` | Python |
| 4 | `tsconfig.json` | TypeScript |
| 5 | `package.json` (without tsconfig) | JavaScript |
| 6 | `*.csproj`, `*.sln` | C# |
| 7 | `pom.xml`, `build.gradle`, `build.gradle.kts` | Java/Kotlin |
| 8 | None of the above | Generic |

When `config.language` is not `"auto"`, skip detection and use the configured value.

## Framework Detection

Scan for documentation framework config files. First match wins.

| Priority | Marker File | Framework | Doc Root |
|----------|-------------|-----------|----------|
| 1 | `mkdocs.yml` or `mkdocs.yaml` | MkDocs | `docs/` (or per mkdocs.yml `docs_dir`) |
| 2 | `.vitepress/config.ts` or `.vitepress/config.js` or `.vitepress/config.mts` | VitePress | directory containing `.vitepress/` |
| 3 | `docusaurus.config.js` or `docusaurus.config.ts` | Docusaurus | `docs/` (or per config `docsDir`) |
| 4 | `conf.py` (with `extensions` containing `sphinx`) | Sphinx | `source/` or directory containing `conf.py` |
| 5 | `docs/` directory exists with `.md` files | Plain Markdown | `docs/` |
| 6 | `README.md` only | Plain Markdown | project root |

When `config.framework` is not `"auto"`, skip detection and use the configured value.

## Detection Output

Return a JSON object:

```json
{
  "language": "typescript",
  "languageConfidence": "high",
  "framework": "vitepress",
  "frameworkConfidence": "high",
  "docRoot": "docs/",
  "markers": ["tsconfig.json", ".vitepress/config.ts"]
}
```

Confidence levels:
- `high`: marker file found and unambiguous
- `medium`: marker found but could be misidentified (e.g., JS project with stale tsconfig)
- `low`: fallback / guessing
