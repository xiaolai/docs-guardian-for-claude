---
name: lang-python
description: "Use when writing, auditing, or generating documentation for Python projects — covers docstring conventions, API doc extraction, and Python-specific patterns."
---

# Python Language Adapter

## Public API Detection

A symbol is **public** if:

1. It is listed in `__all__` (if `__all__` exists, only listed names are public)
2. Its name does not start with `_` (single underscore = internal convention)
3. It is defined at module level or is a method of a public class

### Priority

- If `__all__` exists → only those names are public
- If `__all__` does not exist → all non-underscore module-level names are public

## Symbol Types to Document

| Type | Detection | Documentation Expected |
|------|-----------|----------------------|
| Functions | `def name(` at module level | Docstring with params, returns, raises |
| Classes | `class Name:` or `class Name(Base):` | Class docstring + `__init__` params |
| Methods | `def name(self` inside class, not `_`-prefixed | Docstring with params, returns |
| Constants | `NAME = value` (UPPER_CASE at module level) | Inline comment or module docstring mention |
| Type aliases | `Name = TypeAlias` or `type Name = ...` | Docstring or inline comment |

## Docstring Formats

Recognize and parse these formats:

### Google Style
```python
def foo(bar: int, baz: str) -> bool:
    """One-line summary.

    Args:
        bar: Description of bar.
        baz: Description of baz.

    Returns:
        True if successful.

    Raises:
        ValueError: If bar is negative.
    """
```

### NumPy Style
```python
def foo(bar, baz):
    """One-line summary.

    Parameters
    ----------
    bar : int
        Description of bar.
    baz : str
        Description of baz.

    Returns
    -------
    bool
        True if successful.
    """
```

### Sphinx Style
```python
def foo(bar, baz):
    """One-line summary.

    :param bar: Description of bar.
    :type bar: int
    :param baz: Description of baz.
    :returns: True if successful.
    :raises ValueError: If bar is negative.
    """
```

## Documentation Completeness Check

A Python symbol is **fully documented** when:

1. Has a docstring (not empty)
2. All parameters are described
3. Return value is described (if not `None`)
4. Raised exceptions are listed (if any `raise` statements exist)

## File Patterns

Source files: `**/*.py` (exclude `__pycache__`, `*.pyc`, test files)
