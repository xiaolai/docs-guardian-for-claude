---
name: lang-generic
description: "Use when writing, auditing, or generating documentation for projects in unsupported languages — covers docstring conventions, API doc extraction, and generic heuristic patterns."
---

# Generic Language Adapter

Used when the project language is not recognized or not in the supported set. Applies best-effort heuristics.

## Public API Detection Heuristics

Since we don't know the language's visibility rules, use these signals:

| Signal | Likely Public | Confidence |
|--------|--------------|------------|
| `export` keyword present | Yes | High |
| `public` keyword present | Yes | High |
| `pub` keyword present | Yes | High |
| Uppercase first letter (Go-like) | Maybe | Medium |
| No underscore prefix | Maybe | Low |
| Defined at top-level / module scope | Likely | Medium |

## Symbol Detection

Look for common patterns across languages:

| Pattern | Likely Symbol Type |
|---------|-------------------|
| `function name(` or `func name(` or `def name(` or `fn name(` | Function |
| `class Name` | Class |
| `struct Name` | Struct |
| `interface Name` | Interface |
| `type Name` | Type definition |
| `enum Name` | Enum |
| `const NAME` or `val NAME` or `let NAME` (UPPER_CASE) | Constant |

## Documentation Detection

Look for common doc comment patterns:

| Pattern | Format |
|---------|--------|
| `/** ... */` | JSDoc / JavaDoc |
| `/// ...` | Rust-style / C# XML doc |
| `# ...` after `"""` | Python docstring |
| `// Name ...` (comment starting with symbol name) | Godoc-style |
| `""" ... """` or `''' ... '''` | Python docstring |

## Completeness Check

Since we can't parse language-specific documentation format, use a simpler check:

1. **Has any comment**: Symbol has a documentation comment directly above it
2. **Non-trivial**: Comment is more than 5 words
3. **Mentions parameters**: If function-like, comment mentions parameter names

## Recommendations

When using the generic adapter, the agent should:

1. Flag that detection is heuristic-based (confidence: low)
2. Suggest the user configure `language` explicitly in config
3. Still attempt mapping and coverage analysis using available signals
4. Note any language-specific patterns it recognizes but can't fully parse

## File Patterns

Source files: all files not matching known binary/config extensions
Exclude: common non-source directories (`node_modules/`, `vendor/`, `dist/`, `.git/`)
