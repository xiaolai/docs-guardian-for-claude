---
name: standards
description: Shared output format, severity tags, and finding structure used by all docs-guardian agents.
---

# Documentation Guardian Standards

## Severity Tags

| Tag | Meaning | When to use |
|-----|---------|-------------|
| `CRITICAL` | Documentation is dangerously wrong — will mislead users into bugs or security issues | API signature changed but docs show old signature; security-relevant parameter undocumented |
| `HIGH` | Documentation is missing or significantly stale — users will struggle | Public function has no docs; doc references deleted parameter |
| `MEDIUM` | Documentation exists but is incomplete or outdated in non-critical ways | Missing examples; parameter description vague; minor version drift |
| `LOW` | Documentation quality issue — cosmetic or style | Typos; inconsistent heading levels; missing period at end of sentence |
| `INFO` | Observation, not a problem | Unusually thorough docs; suggestion for improvement |

## Finding Format

Every finding reported by an agent MUST use this structure:

```
### [SEVERITY] Short title

- **File**: `path/to/file`
- **Line**: 42 (if applicable)
- **Related doc**: `docs/path/to/doc.md` (if applicable)
- **Detail**: One-paragraph explanation of the issue.
- **Suggestion**: Concrete action to fix it.
```

## Agent Output Header

Every agent output MUST begin with:

```
## <Agent Name> Report

**Scanned**: <number> files
**Findings**: <number> (Critical: N, High: N, Medium: N, Low: N, Info: N)
**Timestamp**: <ISO 8601>
```

## Coverage Metrics

Coverage is reported as a percentage:

```
coverage% = (documented_public_symbols / total_public_symbols) × 100
```

A "documented" symbol has at minimum:
1. A description of what it does
2. Parameter/argument documentation (if callable)
3. Return value documentation (if applicable)

## Staleness Metrics

Staleness is measured by comparing:
- `code_last_modified`: last git commit touching the source file
- `doc_last_modified`: last git commit touching the corresponding doc file

A doc is **stale** when `code_last_modified - doc_last_modified > stalenessThresholdDays` (from config).

## Quality Score

Quality is rated 0–100 based on:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Completeness | 30% | All public APIs documented |
| Accuracy | 30% | Docs match current code |
| Freshness | 20% | No stale docs beyond threshold |
| Readability | 10% | Clear language, good structure |
| Examples | 10% | Working code examples present |
