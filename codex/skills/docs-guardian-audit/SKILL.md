---
name: docs-guardian-audit
description: "Full documentation audit — runs the staleness, accuracy, coverage and quality checks (in parallel subagents when available), then writes one report with a fixing plan to .claude/docs-guardian/audit-report.md."
---

# Docs Guardian Audit

Run a comprehensive documentation audit with four analysis skills, then synthesize their findings into a single actionable report.

## Reference Skills

Load `$docs-guardian-standards`, `$docs-guardian-detection`, `$docs-guardian-mapping` before starting. Every docs-guardian skill's instructions are at `../<skill-name>/SKILL.md` relative to this file.

## Process

### Step 1: Validate Config

Read `.claude/docs-guardian/config.json` (shared with the Claude Code plugin).

- If the file does not exist, tell the user: "docs-guardian is not initialized for this project. Run `$docs-guardian-init` first." and **stop**.
- If the file exists but is invalid JSON, tell the user: "Config file is corrupted. Run `$docs-guardian-init` to regenerate it." and **stop**.
- If it is valid, use its values (`language`, `framework`, `hookStrictness`, `stalenessThresholdDays`, `mappings`, `excludePatterns`).

### Step 2: Resolve Mappings

Before running the analysis skills, resolve all code-to-doc mappings upfront:
1. Follow the `$docs-guardian-detection` rules to confirm language and framework
2. Follow the `$docs-guardian-mapping` strategies to build the complete mapping table
3. This pre-computed mapping list is passed to each analysis skill to avoid redundant detection

### Step 3: Run the Four Analysis Skills

1. `$docs-guardian-staleness-detector` — compare git timestamps for all mapped pairs
2. `$docs-guardian-accuracy-checker` — deep code-vs-doc mismatch analysis on mapped pairs
3. `$docs-guardian-coverage-scanner` — find undocumented public APIs across all source files
4. `$docs-guardian-quality-rater` — check doc files for structural quality issues

If Codex subagents are available, run the four in parallel, one subagent each, giving each the path of its `SKILL.md`. Otherwise run them sequentially in the order listed; the findings are the same, only wall time differs. All four are read-only.

Each one receives:
- The resolved mappings from Step 2 (included as a JSON list in the prompt)
- The config values (language, framework, thresholds)
- Instructions to use the finding format from `$docs-guardian-standards`

**Failure handling**: If any analysis skill errors or returns empty results, include a note in the final report: "Skill `<name>` failed: <error>". Continue synthesizing results from the others. Do not block the entire audit because one failed.

### Step 4: Synthesize Results

After all four complete, combine their findings into a single report:

```markdown
# Documentation Audit Report

**Project**: <project name>
**Date**: <ISO date>
**Language**: <detected language>
**Framework**: <detected framework>

## Executive Summary

| Dimension | Score | Status |
|-----------|-------|--------|
| Freshness | X/100 | 🟢/🟡/🔴 |
| Accuracy  | X/100 | 🟢/🟡/🔴 |
| Coverage  | X%    | 🟢/🟡/🔴 |
| Quality   | X/100 | 🟢/🟡/🔴 |

**Overall health**: X/100

## Critical Findings (fix immediately)

[CRITICAL and HIGH findings from all four, deduplicated]

## Medium Findings (fix soon)

[MEDIUM findings]

## Low Findings (nice to have)

[LOW findings, summarized]

## Fixing Plan

Priority-ordered list of actions:
1. [Most critical fix first]
2. [Next priority]
...

## Full Reports

<details>
<summary>Staleness Report</summary>
[Full staleness-detector output]
</details>

<details>
<summary>Accuracy Report</summary>
[Full accuracy-checker output]
</details>

<details>
<summary>Coverage Report</summary>
[Full coverage-scanner output]
</details>

<details>
<summary>Quality Report</summary>
[Full quality-rater output]
</details>
```

### Step 5: Save Report

Write the report to `.claude/docs-guardian/audit-report.md` .

Tell the user where the report was saved and highlight the top 3 most critical findings.
