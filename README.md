# docs-guardian

Documentation quality and freshness enforcer — detect staleness, check accuracy, measure coverage, and auto-generate docs across any language and doc framework.

## What it does

Docs-guardian treats documentation like code: it drifts, goes stale, and needs continuous maintenance. This plugin detects when docs fall behind, measures how much of your API is actually documented, checks whether docs match the current code, and can auto-generate missing documentation in your project's chosen framework format.

- **5 specialized agents**: staleness-detector, accuracy-checker, coverage-scanner, quality-rater, doc-writer
- **4 commands**: init, audit (4 agents in parallel), coverage, generate
- **5 languages**: Python, TypeScript/JavaScript, Go, Rust, plus a generic fallback
- **5 doc frameworks**: Plain Markdown, MkDocs, VitePress, Docusaurus, Sphinx
- **Commit hook**: warns or blocks when code changes ship without doc updates
- **Extensible**: adding a new language or framework = one skill file, zero agent changes

Part of the [xiaolai plugin marketplace](https://github.com/xiaolai/claude-plugin-marketplace).

## Installation

Add the marketplace (once):

```
/plugin marketplace add xiaolai/claude-plugin-marketplace
```

Then install:

```
/plugin install docs-guardian@xiaolai
```

| Scope | Command | Effect |
|-------|---------|--------|
| **User** (default) | `/plugin install docs-guardian@xiaolai` | Available in all your projects |
| **Project** | `/plugin install docs-guardian@xiaolai --scope project` | Shared with team via `.claude/settings.json` |
| **Local** | `/plugin install docs-guardian@xiaolai --scope local` | Only you, only this repo |

## Quick start

```bash
# 1. Initialize — detects your language, doc framework, proposes mappings
/docs-guardian:init

# 2. Check how much of your API is documented
/docs-guardian:coverage

# 3. Full audit — staleness, accuracy, coverage, quality in parallel
/docs-guardian:audit

# 4. Auto-generate docs for undocumented code
/docs-guardian:generate
```

## Commands

| Command | Description |
|---------|-------------|
| `/docs-guardian:init` | Auto-detect language and doc framework, propose code-to-doc mappings, configure hook strictness |
| `/docs-guardian:audit` | Full audit — launch 4 agents in parallel, synthesize a report with prioritized fixing plan |
| `/docs-guardian:coverage` | Lightweight coverage check — find undocumented public APIs and report coverage % |
| `/docs-guardian:generate` | Auto-generate missing docs — scan for gaps, then write docs in framework format |

## How it works

1. **Init** — the `detection` skill scans for marker files (tsconfig.json, go.mod, mkdocs.yml, etc.) to identify your language and doc framework. The `mapping` skill resolves which source files map to which doc files.
2. **Audit** — 4 agents run in parallel, each analyzing a different dimension:
   - **Staleness**: are docs older than the code they describe?
   - **Accuracy**: do docs match current API signatures and behavior?
   - **Coverage**: which public symbols lack documentation?
   - **Quality**: are there empty sections, broken links, missing examples?
3. **Synthesis** — findings are deduplicated, scored, and combined into a single report with a phased fixing plan.
4. **Generate** — the `doc-writer` agent reads undocumented code, understands its API, and writes docs using the correct framework template.

## Agents

| Agent | Model | Focus |
|-------|-------|-------|
| `staleness-detector` | haiku | Git timestamp comparison between code and doc files |
| `accuracy-checker` | opus | Deep code-vs-doc mismatch analysis (signatures, examples, behavior) |
| `coverage-scanner` | sonnet | Find every undocumented public symbol, calculate coverage % |
| `quality-rater` | haiku | Empty sections, TODOs, broken links, formatting, readability |
| `doc-writer` | opus | Read code, generate/update docs in the project's framework format |

## Architecture

Three-layer design:

```
Detection Layer (skills)     → auto-detect language + doc framework
     ↓
Adapter Layer (skills)       → stack-specific knowledge (5 languages × 5 frameworks)
     ↓
Agent Layer (agents)         → stack-agnostic analysis and generation
```

Adding a new language = one skill file under `languages/`. Adding a new framework = one skill file under `frameworks/`. Zero agent or command changes needed.

## Configuration

After `/docs-guardian:init`, config lives at `.claude/docs-guardian/config.json`:

```json
{
  "language": "auto",
  "framework": "auto",
  "hookStrictness": "warn",
  "stalenessThresholdDays": 30,
  "mappings": [],
  "excludePatterns": ["node_modules/**", "dist/**", "build/**"]
}
```

| Field | Description | Default |
|-------|-------------|---------|
| `language` | Project language (`auto` for detection) | `auto` |
| `framework` | Doc framework (`auto` for detection) | `auto` |
| `hookStrictness` | `off` / `warn` / `block` on commit without doc updates | `warn` |
| `stalenessThresholdDays` | Days before a doc is considered stale | `30` |
| `mappings` | Explicit source-to-doc file mappings | `[]` |
| `excludePatterns` | Glob patterns to exclude from scanning | common defaults |

## Commit hook

When `hookStrictness` is `warn` or `block`, a PreToolUse hook intercepts `git commit` and `git push` commands. If staged files include code changes but no documentation changes, the hook:

- **warn**: prints a reminder, allows the commit
- **block**: prevents the commit until docs are updated
- **off**: no checks

## Severity tags

- `[CRITICAL]` — Documentation is dangerously wrong, will mislead users into bugs
- `[HIGH]` — Documentation is missing or significantly stale
- `[MEDIUM]` — Documentation is incomplete or outdated in non-critical ways
- `[LOW]` — Cosmetic or style issue
- `[INFO]` — Observation, not a problem

## License

ISC
