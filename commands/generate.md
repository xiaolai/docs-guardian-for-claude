---
description: "Auto-generate missing documentation — scan for coverage gaps, then write docs in the project's framework format"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
argument-hint: "[file or directory to document]"
---

Generate documentation for undocumented code by first scanning for coverage gaps, then writing docs in the project's documentation framework format.

Use skills:
- `docs-guardian:standards`
- `docs-guardian:detection`
- `docs-guardian:mapping`

## Process

### Step 1: Validate Config

Follow `commands/shared/validate-config.md` to read and validate the config. Stop if config is missing or invalid.

### Step 2: Determine Scope

If `$ARGUMENTS` is provided, scope generation to that file or directory only.
If no arguments, generate docs for all undocumented public APIs.

### Step 3: Find Coverage Gaps

Launch the **coverage-scanner** agent using the Task tool to identify all undocumented public symbols. Wait for results.

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

Use AskUserQuestion to let the user confirm or select a subset.

If the user selects none, output: "No symbols selected. Nothing to generate." and stop.
If the coverage-scanner found zero undocumented symbols, output: "All public symbols are already documented. Nothing to generate." and stop.

### Step 5: Generate Documentation

Launch the **doc-writer** agent using the Task tool with:
- The list of files/symbols to document
- The detected language and framework
- Instructions to use the appropriate framework template

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

Run /docs-guardian:audit to verify the generated docs.
```
