---
name: fw-sphinx
description: "Use when generating or auditing documentation in Sphinx format — covers config, directory structure, frontmatter conventions, and build commands."
---

# Sphinx Framework Adapter

## Detection

Detected when `conf.py` exists and contains Sphinx-related configuration (e.g., `extensions` list, `master_doc`, or `project` variable).

## Configuration Parsing

Key fields to extract from `conf.py`:

```python
# conf.py
project = 'My Project'
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
]
master_doc = 'index'        # default: 'index'
source_suffix = '.rst'      # or ['.rst', '.md'] with MyST
```

- `extensions`: active Sphinx extensions (especially `autodoc`, `napoleon`)
- `source_suffix`: determines if docs are `.rst`, `.md` (MyST), or both
- `master_doc`: root document (default `index`)

## Doc Root

Directory containing `conf.py`. Common patterns:
- `docs/source/` (with `docs/build/` for output)
- `docs/` (flat layout)

## Navigation: toctree

Sphinx uses `toctree` directives for navigation:

```rst
.. toctree::
   :maxdepth: 2
   :caption: Contents

   getting-started
   api/index
   guides/deployment
```

Each entry is a document name (without extension) relative to the doc root.

## Code-to-Doc Mapping

### From toctree

Parse `toctree` entries in `index.rst` and sub-indexes. Each entry maps to a file in the doc root.

### From autodoc

If `sphinx.ext.autodoc` is enabled, check for:
```rst
.. automodule:: mypackage.auth
   :members:
```
This auto-generates docs from Python docstrings. The source module `mypackage.auth` maps to `mypackage/auth.py`.

### Convention-Based

| Source | Doc Candidate |
|--------|--------------|
| `src/auth/login.py` | `docs/source/api/auth.rst` |
| `mypackage/utils.py` | `docs/source/api/utils.rst` |

## Document Template (reStructuredText)

```rst
Auth Module
===========

Brief description of the module.

.. module:: mypackage.auth

API Reference
-------------

.. function:: login(username, password)

   Authenticates a user and returns a session token.

   :param str username: The user's login name.
   :param str password: The user's password.
   :returns: An authenticated session object.
   :rtype: Session
   :raises AuthError: If credentials are invalid.

   Example::

      session = login("admin", "secret")

.. class:: Session

   Represents an authenticated user session.

   .. attribute:: token
      :type: str

      The session JWT token.
```

## Document Template (MyST Markdown)

If MyST parser is enabled (`myst_parser` in extensions):

```markdown
# Auth Module

Brief description.

```{automodule} mypackage.auth
:members:
```

## API Reference

### `login(username, password)`

Authenticates a user.

```{note}
Use environment variables for credentials.
```
```

## Sphinx-Specific Content

Valid Sphinx content — do not flag as quality issues:
- `.. directive::` syntax (reStructuredText directives)
- `:role:` inline roles (e.g., `:func:`, `:class:`, `:ref:`)
- `.. code-block::` with language specifiers
- `.. note::`, `.. warning::`, `.. deprecated::` admonitions
- Cross-references like `` :func:`mypackage.auth.login` ``
- MyST `{directive}` syntax in `.md` files
