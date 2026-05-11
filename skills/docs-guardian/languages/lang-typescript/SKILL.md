---
name: lang-typescript
description: "Use when writing, auditing, or generating documentation for TypeScript projects — covers docstring conventions, API doc extraction, and TypeScript-specific patterns."
---

# TypeScript Language Adapter

## Public API Detection

A symbol is **public** if it uses the `export` keyword:

| Pattern | Public? |
|---------|---------|
| `export function name()` | Yes |
| `export class Name` | Yes |
| `export const name =` | Yes |
| `export type Name =` | Yes |
| `export interface Name` | Yes |
| `export default` | Yes |
| `export { name }` (re-export) | Yes |
| `function name()` (no export) | No |
| Barrel file `export * from` | Track origin |

### Index/Barrel Files

When a file like `index.ts` re-exports via `export { Foo } from './foo'` or `export * from './foo'`, the actual symbol is in `./foo.ts`. Document at the origin, not the barrel.

## Symbol Types to Document

| Type | Detection | Documentation Expected |
|------|-----------|----------------------|
| Functions | `export function` or `export const name =` (arrow) | JSDoc with `@param`, `@returns` |
| Classes | `export class` | JSDoc on class + constructor params |
| Interfaces | `export interface` | JSDoc on interface + property descriptions |
| Types | `export type` | JSDoc describing the type's purpose |
| Constants | `export const NAME =` (non-function) | JSDoc one-liner |
| React Components | `export function Name(props: Props)` or `export const Name: FC<Props>` | JSDoc + Props interface documented |
| Enums | `export enum` | JSDoc on enum + member descriptions |

## JSDoc / TSDoc Format

```typescript
/**
 * One-line summary.
 *
 * @param bar - Description of bar.
 * @param baz - Description of baz.
 * @returns True if successful.
 * @throws {ValueError} If bar is negative.
 *
 * @example
 * ```ts
 * const result = foo(1, "hello");
 * ```
 */
export function foo(bar: number, baz: string): boolean {
```

## React Component Documentation

A React component is **fully documented** when:

1. The component function has a JSDoc comment
2. The Props type/interface has JSDoc on each property
3. Default values are noted (via `defaultProps` or destructuring defaults)

```typescript
/** User profile card displaying avatar and name. */
export function UserCard({ name, avatarUrl = "/default.png" }: UserCardProps) {
```

## Documentation Completeness Check

A TypeScript symbol is **fully documented** when:

1. Has a JSDoc comment (not empty `/** */`)
2. All parameters have `@param` entries
3. Return value has `@returns` (if not `void`)
4. Thrown errors have `@throws` (if function contains `throw`)

## File Patterns

Source files: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
Exclude: `node_modules/`, `dist/`, `*.test.*`, `*.spec.*`, `*.d.ts`
