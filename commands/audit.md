---
description: "Full documentation audit — launch staleness, accuracy, coverage, and quality agents in parallel, then synthesize a report with a fixing plan"
allowed-tools: Read, Write, Glob, Grep, Bash, Task, AskUserQuestion
argument-hint: ""
---

Run a comprehensive documentation audit by launching 4 specialized agents in parallel, then synthesize their findings into a single actionable report.

## Reference Skills

Before starting, read these skill files for guidance on standards, detection, and mapping:
- `skills/docs-guardian/standards/SKILL.md` — severity tags, finding format, metrics
- `skills/docs-guardian/detection/SKILL.md` — language + framework auto-detection rules
- `skills/docs-guardian/mapping/SKILL.md` — code-to-doc file mapping strategies

Use the Read tool to load these files from the plugin install directory. Do NOT use the Skill tool — these are reference skills, not invocable commands.

## Process

### Step 1: Validate Config

Follow `commands/shared/validate-config.md` to read and validate the config. Stop if config is missing or invalid.

### Step 2: Resolve Mappings

Before dispatching agents, resolve all code-to-doc mappings upfront:
1. Follow the detection skill rules to confirm language and framework
2. Follow the mapping skill strategies to build the complete mapping table
3. This pre-computed mapping list is passed to agents to avoid redundant detection

### Step 3: Launch 4 Agents in Parallel

Use the Task tool to launch ALL FOUR agents concurrently in a single message:

1. **staleness-detector** (haiku) — compare git timestamps for all mapped pairs
2. **accuracy-checker** (opus) — deep code-vs-doc mismatch analysis on mapped pairs
3. **coverage-scanner** (sonnet) — find undocumented public APIs across all source files
4. **quality-rater** (haiku) — check doc files for structural quality issues

Each agent receives in its Task prompt:
- The resolved mappings from Step 2 (included as a JSON list in the prompt)
- The config values (language, framework, thresholds)
- Instructions to use the standard finding format from the `standards` skill

**Agent failure handling**: If any agent returns an error or empty results, include a note in the final report: "Agent `<name>` failed: <error>". Continue synthesizing results from the remaining agents. Do not block the entire audit because one agent failed.

### Step 4: Synthesize Results

After all 4 agents complete, combine their findings into a single report:

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

[CRITICAL and HIGH findings from all agents, deduplicated]

## Medium Findings (fix soon)

[MEDIUM findings]

## Low Findings (nice to have)

[LOW findings, summarized]

## Fixing Plan

Priority-ordered list of actions:
1. [Most critical fix first]
2. [Next priority]
...

## Full Agent Reports

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

Write the report to `.claude/docs-guardian/audit-report.md` using the Write tool.

Tell the user where the report was saved and highlight the top 3 most critical findings.
