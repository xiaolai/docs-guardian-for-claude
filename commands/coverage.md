---
description: "Check documentation coverage — find undocumented public APIs and report coverage percentage"
allowed-tools: Read, Glob, Grep, Bash, Task
argument-hint: ""
---

Lightweight documentation coverage check. Launches the coverage-scanner agent and relays its output directly.

## Reference Skills

Before starting, read these skill files for guidance (use the Read tool, NOT the Skill tool):
- `skills/docs-guardian/standards/SKILL.md` — severity tags, finding format, metrics
- `skills/docs-guardian/detection/SKILL.md` — language + framework auto-detection rules

## Process

### Step 1: Validate Config

Follow `commands/shared/validate-config.md` to read and validate the config. Stop if config is missing or invalid.

### Step 2: Run Coverage Scanner

Launch the **coverage-scanner** agent using the Task tool with:
- The project config (language, framework, exclude patterns)
- Instructions to output the full coverage report

### Step 3: Relay Results

Present the coverage-scanner's output directly to the user. No synthesis needed — this is a single-agent command.

The output will include:
- Coverage percentage per file
- List of undocumented public symbols with severity
- Overall coverage summary

If coverage is below 50%, suggest running `/docs-guardian:generate` to fill gaps.
If coverage is above 80%, congratulate the user.

**Edge cases**:
- If no source files are found, report: "No source files detected. Check that `language` and `excludePatterns` in config are correct." and stop.
- If source files are found but zero public symbols are detected, report: "No public symbols found. The language adapter may not match this project's conventions. Consider setting `language` explicitly in config."
- If the coverage-scanner agent fails, report the error and suggest running `/docs-guardian:init` to verify the config.
