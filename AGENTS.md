# docs-guardian

Documentation quality and freshness enforcer for Claude Code. Detects stale docs, checks accuracy against code, measures coverage, and auto-generates missing documentation.

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
      python/SKILL.md        Python public API + docstring conventions
      typescript/SKILL.md    TypeScript export + JSDoc conventions
      go/SKILL.md            Go exported identifiers + godoc conventions
      rust/SKILL.md          Rust pub items + doc comment conventions
      generic/SKILL.md       Fallback heuristics for unknown languages
    frameworks/
      plain-markdown/SKILL.md  Standard markdown docs layout
      mkdocs/SKILL.md          MkDocs config + Material theme
      vitepress/SKILL.md       VitePress sidebar config
      docusaurus/SKILL.md      Docusaurus config + MDX
      sphinx/SKILL.md          Sphinx conf.py + reStructuredText
```

## Architecture

Three-layer design:

1. **Detection layer** (skills) — auto-detect language and doc framework from filesystem markers
2. **Adapter layer** (skills) — stack-specific knowledge about public API surface and doc format
3. **Agent layer** (agents) — stack-agnostic analysis using adapter skills

Adding a new language = one new skill file under `languages/`. Adding a new framework = one new skill file under `frameworks/`. Zero agent or command changes needed.

**Dynamic skill loading**: Agents that work with language/framework adapters (accuracy-checker, coverage-scanner, doc-writer) list ALL language and framework skills in their frontmatter `skills:` array. At runtime, they use only the one matching the detected stack. This ensures Claude Code loads all adapter skills so the agent can select the right one without knowing the project stack in advance.

## Conventions

### Config location

Per-project config lives at `.claude/docs-guardian/config.json`. The template is in `config/config.json`.

### Hook script

`commit-guard.js` reads hook input from stdin (JSON), checks if the Bash command is a git commit/push, and verifies that staged code files have corresponding doc file changes. Respects `hookStrictness` from config (`off`/`warn`/`block`).

### Adding new languages

1. Create `skills/docs-guardian/languages/<name>/SKILL.md` with:
   - `name: lang-<name>` in frontmatter
   - Public API detection rules for the language
   - Doc comment format recognition
   - Completeness check criteria
   - File patterns to match
2. Add `docs-guardian:lang-<name>` to the `skills:` array in `accuracy-checker.md`, `coverage-scanner.md`, and `doc-writer.md`
3. Add the language to the detection table in `detection/SKILL.md`

### Adding new frameworks

1. Create `skills/docs-guardian/frameworks/<name>/SKILL.md` with:
   - `name: fw-<name>` in frontmatter
   - Detection markers (config file names)
   - Doc root determination
   - Code-to-doc mapping convention
   - Document template for generation
   - Framework-specific content that should not be flagged as issues
2. Add `docs-guardian:fw-<name>` to the `skills:` array in `doc-writer.md`
3. Add the framework to the detection table in `detection/SKILL.md`
