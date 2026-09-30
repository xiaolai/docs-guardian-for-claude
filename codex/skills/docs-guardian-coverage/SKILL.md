---
name: docs-guardian-coverage
description: "Check documentation coverage — find undocumented public APIs and report per-file and overall coverage percentage."
---

# Docs Guardian Coverage

Lightweight documentation coverage check. Runs `$docs-guardian-coverage-scanner` and relays its output directly.

## Reference Skills

Load `$docs-guardian-standards`, `$docs-guardian-detection` before starting. Every docs-guardian skill's instructions are at `../<skill-name>/SKILL.md` relative to this file.

## Process

### Step 1: Validate Config

Read `.claude/docs-guardian/config.json` (shared with the Claude Code plugin).

- If the file does not exist, tell the user: "docs-guardian is not initialized for this project. Run `$docs-guardian-init` first." and **stop**.
- If the file exists but is invalid JSON, tell the user: "Config file is corrupted. Run `$docs-guardian-init` to regenerate it." and **stop**.
- If it is valid, use its values (`language`, `framework`, `hookStrictness`, `stalenessThresholdDays`, `mappings`, `excludePatterns`).

### Step 2: Run Coverage Scanner

Run `$docs-guardian-coverage-scanner` (in a subagent if available, otherwise inline) with:
- The project config (language, framework, exclude patterns)
- Instructions to output the full coverage report

### Step 3: Relay Results

Present the coverage-scanner's output directly to the user. No synthesis needed.

The output will include:
- Coverage percentage per file
- List of undocumented public symbols with severity
- Overall coverage summary

If coverage is below 50%, suggest running `$docs-guardian-generate` to fill gaps.
If coverage is above 80%, congratulate the user.

**Edge cases**:
- If no source files are found, report: "No source files detected. Check that `language` and `excludePatterns` in config are correct." and stop.
- If source files are found but zero public symbols are detected, report: "No public symbols found. The language adapter may not match this project's conventions. Consider setting `language` explicitly in config."
- If the coverage scanner fails, report the error and suggest running `$docs-guardian-init` to verify the config.
