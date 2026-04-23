---
name: validate-config
user-invocable: false
description: Shared config validation step — reads and validates docs-guardian config, stops with init instructions if missing.
---

# Validate Config

Read `.claude/docs-guardian/config.json`.

- If the file does not exist, tell the user: "docs-guardian is not initialized for this project. Run `/docs-guardian:init` first." and **stop** — do not proceed with the command.
- If the file exists but is invalid JSON, tell the user: "Config file is corrupted. Run `/docs-guardian:init` to regenerate it." and **stop**.
- If the file is valid, parse and use its values (`language`, `framework`, `hookStrictness`, `stalenessThresholdDays`, `mappings`, `excludePatterns`).
