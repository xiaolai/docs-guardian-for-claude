---
name: docs-guardian-generate
description: "Generate missing documentation — find coverage gaps, confirm the symbols with the user, then write docs in the project's framework format. Optional argument: a file or directory to scope to."
---

# Docs Guardian Generate

Generate documentation for undocumented code by first scanning for coverage gaps, then writing docs in the project's documentation framework format.

## Reference Skills

Load `$docs-guardian-standards`, `$docs-guardian-detection`, `$docs-guardian-mapping` before starting. Every docs-guardian skill's instructions are at `../<skill-name>/SKILL.md` relative to this file.

## Process

### Step 1: Validate Config

Read `.claude/docs-guardian/config.json` (shared with the Claude Code plugin).

- If the file does not exist, tell the user: "docs-guardian is not initialized for this project. Run `$docs-guardian-init` first." and **stop**.
- If the file exists but is invalid JSON, tell the user: "Config file is corrupted. Run `$docs-guardian-init` to regenerate it." and **stop**.
- If it is valid, use its values (`language`, `framework`, `hookStrictness`, `stalenessThresholdDays`, `mappings`, `excludePatterns`).

### Step 2: Determine Scope

If the user gave a file or directory, scope generation to that file or directory only.
If no arguments, generate docs for all undocumented public APIs.

### Step 3: Find Coverage Gaps

Run `$docs-guardian-coverage-scanner` (in a subagent if available, otherwise inline) to identify all undocumented public symbols. Wait for results.

### Step 4: Confirm with User

Present the list of undocumented symbols to the user:

```
Found N undocumented public symbols across M files:

  src/auth/login.ts (3 symbols)
    - login(username, password)
    - logout(sessionId)
    - refreshToken(token)

  src/utils/hash.ts (2 symbols)
    - hashPassword(password)
    - verifyHash(password, hash)

Generate documentation for all of them?
```

Ask the user to confirm or select a subset, and wait for the answer.

If the user selects none, output: "No symbols selected. Nothing to generate." and stop.
If the coverage-scanner found zero undocumented symbols, output: "All public symbols are already documented. Nothing to generate." and stop.

### Step 5: Generate Documentation

Run `$docs-guardian-doc-writer` (inline, or in a subagent if available) with:
- The list of files/symbols to document
- The detected language and framework
- Instructions to use the template for the `framework` value in the loaded config

The doc-writer will:
1. Read each source file
2. Understand the public API
3. Generate doc files in the framework's format
4. Write or update the doc files

### Step 6: Report Results

After the doc-writer completes, summarize:

```
Documentation generated:

  Created:
    - docs/api/auth.md (3 symbols)
    - docs/api/hash.md (2 symbols)

  Updated:
    - docs/api/utils.md (1 symbol added)

Total: N new files, M updated files, K symbols documented

Run $docs-guardian-audit to verify the generated docs.
```
