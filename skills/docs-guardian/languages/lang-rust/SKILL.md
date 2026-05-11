---
name: lang-rust
description: "Use when writing, auditing, or generating documentation for Rust projects — covers docstring conventions, API doc extraction, and Rust-specific patterns."
---

# Rust Language Adapter

## Public API Detection

A symbol is **public** if it has the `pub` visibility modifier:

| Pattern | Public? |
|---------|---------|
| `pub fn name(` | Yes |
| `pub struct Name` | Yes |
| `pub enum Name` | Yes |
| `pub trait Name` | Yes |
| `pub type Name =` | Yes |
| `pub const NAME:` | Yes |
| `pub(crate) fn name(` | Crate-internal, exclude from external docs |
| `pub(super) fn name(` | Module-internal, exclude |
| `fn name(` (no pub) | No |

Only `pub` (fully public) items require documentation. `pub(crate)` and `pub(super)` are internal.

## Symbol Types to Document

| Type | Detection | Documentation Expected |
|------|-----------|----------------------|
| Functions | `pub fn` | `///` doc comment with params, returns, errors |
| Structs | `pub struct` | `///` on struct + `///` on each pub field |
| Enums | `pub enum` | `///` on enum + `///` on each variant |
| Traits | `pub trait` | `///` on trait + `///` on each method |
| Impl blocks | `impl Name` | `///` on each pub method |
| Type aliases | `pub type` | `///` describing the alias |
| Constants | `pub const` | `///` one-liner |
| Modules | `pub mod` | `//!` module doc or `///` on mod declaration |

## Doc Comment Format

### Outer doc comments (`///`)

```rust
/// Processes the input data and returns results.
///
/// # Arguments
///
/// * `input` - The raw input data to process.
/// * `config` - Processing configuration.
///
/// # Returns
///
/// A vector of processed results.
///
/// # Errors
///
/// Returns `ProcessError` if the input is malformed.
///
/// # Examples
///
/// ```
/// let results = process_data(&input, &config)?;
/// assert!(!results.is_empty());
/// ```
pub fn process_data(input: &[u8], config: &Config) -> Result<Vec<Result>, ProcessError> {
```

### Inner doc comments (`//!`)

Used for module/crate-level documentation:

```rust
//! # Auth Module
//!
//! Provides user authentication and session management.
```

## Documentation Completeness Check

A Rust symbol is **fully documented** when:

1. Has `///` doc comment (not empty)
2. `# Arguments` section lists all parameters (for functions with params)
3. `# Returns` section describes return value (if not `()`)
4. `# Errors` section lists error conditions (if returns `Result`)
5. `# Examples` section with working code block (recommended)

## Special Cases

- `#[doc(hidden)]`: exclude from documentation coverage
- `#[cfg(test)]` modules: exclude
- Derive macros: no docs needed on derived implementations
- Re-exports (`pub use`): document at origin, not re-export site

## File Patterns

Source files: `**/*.rs`
Exclude: `target/`, `**/tests.rs`, `**/test_*.rs`, files in `#[cfg(test)]` modules
