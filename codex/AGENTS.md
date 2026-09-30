# docs-guardian (Codex)

Documentation quality and freshness enforcer for Codex CLI. Detects stale docs, checks accuracy
against code, measures coverage, and generates missing documentation in the project's framework
format.

## Skills

User-facing (auto-selected by description, or invoked with `$`):

| Skill | Purpose |
|---|---|
| `$docs-guardian-init` | Detect language and doc framework, propose code-to-doc mappings, set hook strictness, write `.claude/docs-guardian/config.json`. |
| `$docs-guardian-audit` | Run the four analysis skills, then write `.claude/docs-guardian/audit-report.md` with a fixing plan. |
| `$docs-guardian-coverage` | Run the coverage scanner and relay its report. |
| `$docs-guardian-generate` | Find coverage gaps, confirm with the user, then write docs. |

Internal (hidden from auto-selection; the skills above load them):

| Skill | Purpose |
|---|---|
| `$docs-guardian-staleness-detector` | Git-timestamp staleness via `scripts/docs-guardian/staleness-check.sh`. Read-only. |
| `$docs-guardian-accuracy-checker` | Code-vs-doc mismatches. Read-only. |
| `$docs-guardian-coverage-scanner` | Undocumented public APIs and coverage percentages. Read-only. |
| `$docs-guardian-quality-rater` | Structural doc quality. Read-only. |
| `$docs-guardian-doc-writer` | Writes the doc files the user approved. |
| `$docs-guardian-standards`, `-detection`, `-mapping` | Finding format, stack detection, code-to-doc mapping. |
| `$docs-guardian-lang-*` (5), `$docs-guardian-fw-*` (5) | Language and doc-framework adapters. |

## Commit hook

`codex/hooks.json` registers `scripts/docs-guardian/commit-guard.js` on `PreToolUse` for shell
commands (`Bash`). On a `git commit` or `git push` whose staged files include code but no docs:

- `hookStrictness: "block"` — the command is denied, and the model sees the file list.
- `hookStrictness: "warn"` — a reminder is shown and added to the model's context; the command
  goes through your normal approval rules.
- `hookStrictness: "off"`, or no config — the hook stays silent.

Codex runs plugin hooks only after you approve them in its hook trust review (`/hooks`). Until
then the commit check is inactive; the skills work either way.

## How it differs from the Claude Code plugin

- **Same scripts, same config.** Both tools run the scripts under `scripts/docs-guardian/` and
  read `.claude/docs-guardian/config.json`, so one `init` configures both.
- **No model pinning.** Claude Code runs the analysis agents on Haiku, Sonnet or Opus. Codex
  runs every skill on the session model.
- **Parallelism is optional.** The audit runs the four analysis skills in parallel subagents
  when Codex offers them, and sequentially otherwise. The report is the same.
- **No tool restriction.** Claude Code limits each analysis agent to read-only tools. In Codex
  the limit is an instruction in each skill; only the doc writer writes, and only doc files.
- **Adapters load on demand.** Claude Code preloads every language and framework adapter into
  an agent. Codex skills load only the adapter that matches the detected stack.
- **Plugin root.** Codex sets no `${CLAUDE_PLUGIN_ROOT}` in a skill's shell. The staleness skill
  resolves the plugin root as three directories above its own `SKILL.md`; the hook command uses
  `${PLUGIN_ROOT}`, which Codex does set for hooks.

## Prerequisites

`git` and Node.js 18+ on `PATH`.
