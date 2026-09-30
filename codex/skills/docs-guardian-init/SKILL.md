---
name: docs-guardian-init
description: "Initialize docs-guardian for this project — detect language and doc framework, propose code-to-doc mappings, set commit-hook strictness, and write .claude/docs-guardian/config.json. Optional arguments: language and framework."
---

# Docs Guardian Init

Initialize docs-guardian for the current project by detecting the tech stack and writing configuration.

## Reference Skills

Load `$docs-guardian-detection`, `$docs-guardian-mapping`, `$docs-guardian-standards` before starting. Every docs-guardian skill's instructions are at `../<skill-name>/SKILL.md` relative to this file.

## Process

### Step 1: Detect Stack

Use `$docs-guardian-detection` to identify:
- **Language**: Scan for marker files (package.json, go.mod, Cargo.toml, etc.)
- **Framework**: Scan for doc framework configs (mkdocs.yml, .vitepress/, docusaurus.config.js, etc.)

If the user's arguments contain explicit language or framework names, use those instead of auto-detection.

If the arguments name a language that is not in the detection skill's Language Detection table, or a framework that is not in its Framework Detection table, respond "Unsupported language or framework: {name}. Supported languages: Rust, Go, Python, TypeScript, JavaScript, C#, Java/Kotlin, Generic. Supported frameworks: MkDocs, VitePress, Docusaurus, Sphinx, Plain Markdown." and STOP. Do not fall back to auto-detection silently.

Report what was detected:
```
Detected:
  Language:  TypeScript (tsconfig.json found)
  Framework: VitePress (.vitepress/config.ts found)
  Doc root:  docs/
```

### Step 2: Propose Mappings

Use `$docs-guardian-mapping` to analyze the project structure and propose code-to-doc mappings:

1. Scan source directories for code files
2. Scan doc root for existing doc files
3. Match them using the 4 mapping strategies (config → framework → convention → inline)
4. Show the proposed mappings to the user

### Step 3: Ask Configuration Preferences

Ask the user about hook strictness, and wait for the answer:

- **off**: No commit/push checks (documentation is advisory)
- **warn**: Show a warning when committing code without doc updates (recommended)
- **block**: Block commits that change code without updating docs (strict)

Also ask about staleness threshold (default: 30 days).

In Codex the commit hook is a plugin hook: it runs only after the user approves it in Codex's hook trust review (`/hooks`). Mention this when the user picks `warn` or `block`. The same config drives the Claude Code hook.

### Step 4: Write Config

If `.claude/docs-guardian/config.json` already exists, ask the user whether to overwrite it, showing its current `language`, `framework` and `hookStrictness`. If the user declines, respond "Kept existing config: .claude/docs-guardian/config.json" and STOP without writing anything.

Create `.claude/docs-guardian/config.json` with:
- Detected or user-specified language and framework
- Hook strictness preference
- Staleness threshold
- Resolved mappings (if user confirmed)
- Exclude patterns (sensible defaults)

```bash
mkdir -p .claude/docs-guardian
```

Write the config file.

If `mkdir` or the write fails, show the error verbatim, respond "Failed to write .claude/docs-guardian/config.json", and STOP. Do not continue to Step 5.

### Step 5: Update .gitignore

Append the following to `.gitignore` (skip lines already present):

```
# docs-guardian generated artifacts
.claude/docs-guardian/audit-report.md
```

If the `.gitignore` write fails, show the error verbatim and tell the user to add the line by hand. The config is already written, so continue to Step 6 but list the `.gitignore` failure in the confirmation output.

### Step 6: Confirm

Print the final configuration and suggest next steps:

```
docs-guardian initialized!

Config: .claude/docs-guardian/config.json
  Language:   typescript
  Framework:  vitepress
  Strictness: warn
  Staleness:  30 days

Next steps:
  $docs-guardian-coverage  — see current doc coverage
  $docs-guardian-audit     — full documentation audit
  $docs-guardian-generate  — auto-generate missing docs
```
