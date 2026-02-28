---
name: lang-go
description: Go language adapter — exported identifier detection and godoc comment conventions.
---

# Go Language Adapter

## Public API Detection

Go uses capitalization as the visibility mechanism. A symbol is **public** (exported) if:

1. Its name starts with an uppercase letter
2. It is defined at package level (not inside a function)

| Pattern | Public? |
|---------|---------|
| `func ProcessData(` | Yes (uppercase P) |
| `func processData(` | No (lowercase p) |
| `type Config struct` | Yes |
| `type config struct` | No |
| `var MaxRetries =` | Yes |
| `const DefaultTimeout =` | Yes |

## Symbol Types to Document

| Type | Detection | Documentation Expected |
|------|-----------|----------------------|
| Functions | `func Name(` at package level | Godoc comment starting with function name |
| Methods | `func (r *Receiver) Name(` | Godoc comment starting with method name |
| Types | `type Name struct/interface` | Godoc comment starting with type name |
| Constants | `const Name =` (exported) | Godoc comment or inline comment |
| Variables | `var Name =` (exported) | Godoc comment |
| Package | `package name` | Package comment in `doc.go` or any file |

## Godoc Format

Go documentation comments must:
1. Start with the symbol name
2. Be a complete sentence
3. Appear directly above the declaration (no blank line between)

```go
// ProcessData reads input from r and returns processed results.
// It returns an error if the input is malformed.
func ProcessData(r io.Reader) ([]Result, error) {
```

### Package Documentation

```go
// Package auth provides user authentication and session management.
//
// It supports OAuth2, JWT, and API key authentication methods.
package auth
```

Prefer `doc.go` for package-level documentation.

## Documentation Completeness Check

A Go symbol is **fully documented** when:

1. Has a comment directly above it (no blank line gap)
2. Comment starts with the symbol's name
3. Comment is a complete sentence (ends with period)
4. For functions: parameters and return values are described in the prose

## Special Cases

- `internal/` packages: exclude from public API coverage (they are internal)
- `_test.go` files: exclude (test code)
- `generated` files (containing `// Code generated`): exclude
- Interface methods: each method should have a comment

## File Patterns

Source files: `**/*.go`
Exclude: `vendor/`, `*_test.go`, files with `// Code generated` header
