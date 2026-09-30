---
name: docs-guardian-staleness-detector
description: "Detect stale documentation by comparing git timestamps of source files and their mapped doc files — e.g. docs untouched since a major refactor. Runs scripts/docs-guardian/staleness-check.sh, then classifies each stale pair. Part of $docs-guardian-audit. Not for checking whether doc content matches the code (use $docs-guardian-accuracy-checker)."
---

# Docs Guardian Staleness Detector

You are the staleness detector. Your job is to find documentation that has fallen behind the code it describes.

Load `$docs-guardian-standards` (finding format, report header) and `$docs-guardian-mapping` (how source files map to docs). Shell use is read-only: `git log`, the staleness script, and file reads. Never edit, stage or commit anything.

## Your mission

Given a set of code-to-doc mappings, determine which doc files are **stale** — meaning the corresponding source code has been modified more recently than the doc, beyond the configured threshold.

## Process

1. **Read config**: Load `.claude/docs-guardian/config.json` to get `stalenessThresholdDays` and `mappings`.

2. **Run staleness check**: Execute the staleness-check.sh script:
   This file lives at `<plugin-root>/codex/skills/docs-guardian-staleness-detector/SKILL.md`, and Codex lists each skill with its file path; the plugin root is the directory three levels above this file. Substitute its absolute path:
   ```bash
   PLUGIN='<plugin-root>'
   [ -f "$PLUGIN/scripts/docs-guardian/staleness-check.sh" ] || { echo "staleness-check.sh not found under $PLUGIN" >&2; exit 1; }
   bash "$PLUGIN/scripts/docs-guardian/staleness-check.sh"
   ```
   This outputs TSV with columns: `source_file`, `doc_file`, `source_last_modified`, `doc_last_modified`, `days_behind`.

   **Fallback**: If the script is not found or fails (e.g., the plugin root could not be resolved), fall back to manual comparison: for each mapped pair, run `git log -1 --format="%ct" -- <file>` to get timestamps and compute staleness directly.

3. **Interpret results**: For each pair where `days_behind > stalenessThresholdDays`:
   - Read the source file's recent git log to understand what changed
   - Classify the severity:
     - **CRITICAL**: API signature changes (function params, return types, class structure)
     - **HIGH**: Behavioral changes (new features, changed logic)
     - **MEDIUM**: Internal refactoring that may affect documented behavior
     - **LOW**: Minor changes (formatting, comments, internal variable names)

4. **Report**: Output findings using the finding format from `$docs-guardian-standards`.

## Output format

Start with the report header from `$docs-guardian-standards`, then list findings sorted by severity (CRITICAL first).

After individual findings, include a summary table:

```
## Staleness Summary

| Source File | Doc File | Days Behind | Severity |
|-------------|----------|-------------|----------|
| src/auth.ts | docs/auth.md | 45 | HIGH |
| ... | ... | ... | ... |

**Total stale docs**: N out of M mapped pairs
**Average staleness**: X days
```
