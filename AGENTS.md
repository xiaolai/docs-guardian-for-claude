# docs-guardian

Documentation quality and freshness enforcer for Claude Code, with a Codex CLI port in `codex/`. Detects stale docs, checks accuracy against code, measures coverage, and auto-generates missing documentation.

## Project structure

```
.claude-plugin/
  plugin.json               Plugin metadata
  marketplace.json           Per-repo marketplace entry
hooks/
  hooks.json                 Hook registration (PreToolUse on commit/push)
agents/
  staleness-detector.md      Git timestamp comparison (haiku, yellow)
  accuracy-checker.md        Code-vs-doc mismatch analysis (opus, red)
  coverage-scanner.md        Undocumented API finder (sonnet, cyan)
  quality-rater.md           Doc quality scoring (haiku, green)
  doc-writer.md              Documentation generator (opus, magenta)
commands/
  init.md                    /docs-guardian:init — detect stack, write config
  audit.md                   /docs-guardian:audit — full 4-agent parallel audit
  generate.md                /docs-guardian:generate — auto-generate missing docs
  coverage.md                /docs-guardian:coverage — lightweight coverage check
  shared/
    validate-config.md       Shared partial — config validation and error handling
config/
  config.json                Default configuration template
scripts/
  docs-guardian/
    commit-guard.js          PreToolUse hook — checks code commits have doc updates
    staleness-check.sh       Git date comparison, outputs TSV
skills/
  docs-guardian/
    standards/SKILL.md       Severity tags, finding format, metrics
    detection/SKILL.md       Language + framework auto-detection
    mapping/SKILL.md         Code-to-doc file mapping strategies
    languages/
      lang-python/SKILL.md      Python public API + docstring conventions
      lang-typescript/SKILL.md  TypeScript export + JSDoc conventions
      lang-go/SKILL.md          Go exported identifiers + godoc conventions
      lang-rust/SKILL.md        Rust pub items + doc comment conventions
      lang-generic/SKILL.md     Fallback heuristics for unknown languages
    frameworks/
      fw-plain-markdown/SKILL.md  Standard markdown docs layout
      fw-mkdocs/SKILL.md          MkDocs config + Material theme
      fw-vitepress/SKILL.md       VitePress sidebar config
      fw-docusaurus/SKILL.md      Docusaurus config + MDX
      fw-sphinx/SKILL.md          Sphinx conf.py + reStructuredText
.codex-plugin/plugin.json   Codex manifest: skills, hooks, `"commands": []`
codex-config.json           Interface overrides for the build-codex.mjs bootstrap
codex/
  AGENTS.md                 Codex-side notes: skill map, differences from Claude Code
  hooks.json                Codex hook registration (PreToolUse on commit/push)
  skills/                   22 hand-polished Codex skills, all prefixed docs-guardian-
```

## Architecture

Three-layer design:

1. **Detection layer** (skills) — auto-detect language and doc framework from filesystem markers
2. **Adapter layer** (skills) — stack-specific knowledge about public API surface and doc format
3. **Agent layer** (agents) — stack-agnostic analysis using adapter skills

Adding a new language = one new skill file under `languages/`. Adding a new framework = one new skill file under `frameworks/`. No agent or command logic changes — only the `skills:` lists below, and the Codex copy.

**Dynamic skill loading**: Agents that work with language/framework adapters (accuracy-checker, coverage-scanner, doc-writer) list ALL language and framework skills in their frontmatter `skills:` array. At runtime, they use only the one matching the detected stack. This ensures Claude Code loads all adapter skills so the agent can select the right one without knowing the project stack in advance.

## Conventions

### Config location

Per-project config lives at `.claude/docs-guardian/config.json`. The template is in `config/config.json`.

### Hook script

`commit-guard.js` reads hook input from stdin (JSON), checks if the Bash command is a git commit/push, and verifies that staged code files have corresponding doc file changes. Respects `hookStrictness` from config (`off`/`warn`/`block`). `block` denies the command; `warn` (and any unknown value) emits `systemMessage` + `additionalContext` with **no** `permissionDecision`. Never answer a warning with `permissionDecision: "allow"`: in Claude Code that bypasses the user's permission rules, so a reminder would silently pre-approve `git commit` and `git push`.

The same script serves Codex through `codex/hooks.json` (Codex passes the same stdin shape: `tool_name: "Bash"`, `tool_input.command` as a string, `cwd`).

Tests: `node --test scripts/docs-guardian/commit-guard.test.js`. Name the file — a bare `node --test scripts/` treats the directory as a test file and fails.

### Adding new languages

1. Create `skills/docs-guardian/languages/lang-<name>/SKILL.md` with:
   - `name: lang-<name>` in frontmatter
   - Public API detection rules for the language
   - Doc comment format recognition
   - Completeness check criteria
   - File patterns to match
2. Add `docs-guardian:lang-<name>` to the `skills:` array in `accuracy-checker.md`, `coverage-scanner.md`, and `doc-writer.md`
3. Add the language to the detection table in `detection/SKILL.md`
4. Codex: copy the skill to `codex/skills/docs-guardian-lang-<name>/` (name matching the directory, `agents/openai.yaml` with `allow_implicit_invocation: false`), add it to the adapter lists in the Codex accuracy-checker, coverage-scanner and doc-writer skills, and to the Codex detection skill

### Adding new frameworks

1. Create `skills/docs-guardian/frameworks/fw-<name>/SKILL.md` with:
   - `name: fw-<name>` in frontmatter
   - Detection markers (config file names)
   - Doc root determination
   - Code-to-doc mapping convention
   - Document template for generation
   - Framework-specific content that should not be flagged as issues
2. Add `docs-guardian:fw-<name>` to the `skills:` array in `doc-writer.md` and `quality-rater.md`
3. Add the framework to the detection table in `detection/SKILL.md`
4. Codex: copy the skill to `codex/skills/docs-guardian-fw-<name>/` the same way, and add it to the framework lists in the Codex doc-writer and quality-rater skills and the Codex detection skill

## Codex layout

`codex/` is hand-polished, not generated: do not re-run `build-codex.mjs --force` over it. When a command, agent or skill changes, make the matching edit under `codex/skills/`.

- Commands become user-facing skills (`docs-guardian-init`, `-audit`, `-coverage`, `-generate`). Agents and reference skills become skills hidden from auto-selection (`agents/openai.yaml`: `allow_implicit_invocation: false`); the command skills load them by `$name` or by reading `../<name>/SKILL.md`.
- The `validate-config` partial is inlined into the three command skills that use it.
- Codex sets no `${CLAUDE_PLUGIN_ROOT}` in a skill's shell. The staleness skill resolves the plugin root as three directories above its own `SKILL.md` and checks the script exists before running it. Hook commands do get `${PLUGIN_ROOT}`.
- `.codex-plugin/plugin.json` sets `"commands": []` (otherwise Codex auto-migrates `commands/*.md` into duplicate Claude-flavoured skills) and `"hooks": "./codex/hooks.json"` (otherwise Codex loads `hooks/hooks.json` by default).
- Check the port with `codex debug prompt-input` under a temporary `CODEX_HOME`: only the four command skills are listed, and no `source-command-*` entry.
