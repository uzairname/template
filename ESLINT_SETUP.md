# ESLint Configuration Setup

This document describes the ESLint setup implemented across the monorepo.

## Overview

A consistent ESLint configuration has been established across all apps and packages in the monorepo using a shared configuration package.

## Structure

### New Package: `@repo/eslint-config`

Located in `packages/eslint-config/`, this package provides three shared configurations:

1. **`base.js`** - Base TypeScript configuration for all packages
   - TypeScript strict checking
   - Import ordering and organization
   - Console statement warnings
   - Unused variable detection
   - Promise handling rules

2. **`react.js`** - Configuration for React/Next.js applications
   - Extends base configuration
   - React-specific rules
   - React Hooks rules
   - JSX validation

3. **`node.js`** - Configuration for Node.js/Cloudflare Workers
   - Extends base configuration
   - Allows console statements (appropriate for server-side)
   - Server-specific linting rules

## Configuration Applied To

### Apps

- ✅ `apps/admin` - Uses `react.js` config
- ✅ `apps/landing` - Uses `react.js` config
- ✅ `apps/backend` - Uses `node.js` config

### Packages

- ✅ `packages/api` - Uses `node.js` config
- ✅ `packages/db` - Uses `node.js` config
- ✅ `packages/ui` - Uses `react.js` config
- ✅ `packages/utils` - Uses `base.js` config

## Key Rules Enforced

### TypeScript

- ✅ No unused variables (with `_` prefix exception)
- ✅ Consistent type imports (`import type`)
- ✅ No floating promises (must be awaited or explicitly ignored)
- ✅ No explicit `any` (warns)
- ✅ Proper async/await usage

### Code Quality

- ✅ Use `===` instead of `==`
- ✅ Prefer `const` over `let`
- ✅ No `var` declarations
- ✅ Console statements limited to `warn`, `error`, `info`

### Import Organization

- ✅ Automatic import sorting
- ✅ Alphabetical ordering
- ✅ Grouped by: builtin → external → internal → parent → sibling → index
- ✅ No empty lines between import groups

### React-Specific

- ✅ React Hooks rules enforced
- ✅ JSX key validation
- ✅ No target="\_blank" without rel="noopener"

## Usage

### Running Linting

```bash
# Lint all packages
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Lint specific package
cd apps/admin && pnpm lint
```

### Scripts Added

All apps and packages now have a `lint` script in their `package.json`:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

Root package.json has monorepo-wide commands:

```json
{
  "scripts": {
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint -- --fix"
  }
}
```

## Code Fixes Applied

During setup, the following issues were automatically fixed:

1. Import ordering across all files
2. Type-only imports converted to `import type`
3. Console.log statements changed to console.info/error
4. Strict equality operators (`===` instead of `==`)
5. Unused variables removed or prefixed with `_`
6. Floating promises properly handled with `void` operator
7. Unnecessary `async` keywords removed

## Benefits

✅ **Consistency**: All code follows the same style guidelines
✅ **Type Safety**: TypeScript rules catch errors early
✅ **Maintainability**: Clean, organized imports and code structure
✅ **CI/CD Ready**: Can be integrated into GitHub Actions workflows
✅ **Developer Experience**: Auto-fix resolves most issues automatically

## Next Steps

### Recommended Enhancements

1. **Pre-commit Hooks**: Add Husky + lint-staged to run linting before commits
2. **CI Integration**: Add linting step to GitHub Actions workflows
3. **IDE Integration**: Configure VSCode to auto-fix on save
4. **Custom Rules**: Add project-specific rules as needed

### IDE Configuration

Add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

## Migration Guide

For new apps/packages:

1. Add ESLint dependency:

   ```json
   {
     "devDependencies": {
       "@repo/eslint-config": "workspace:*",
       "eslint": "^9"
     }
   }
   ```

2. Create `eslint.config.mjs`:

   ```js
   // For React apps
   import reactConfig from '@repo/eslint-config/react'
   export default reactConfig

   // For Node.js/Workers
   import nodeConfig from '@repo/eslint-config/node'
   export default nodeConfig

   // For packages
   import baseConfig from '@repo/eslint-config/base'
   export default baseConfig
   ```

3. Add lint script to `package.json`:
   ```json
   {
     "scripts": {
       "lint": "eslint ."
     }
   }
   ```

## Troubleshooting

### "Module type not specified" warning

Fixed by adding `"type": "module"` to `packages/eslint-config/package.json`

### Import order conflicts with Prettier

Prettier plugin `prettier-plugin-organize-imports` handles imports; ESLint validates the order

### False positives

Use ESLint disable comments sparingly:

```typescript
// eslint-disable-next-line rule-name
const code = something()
```

## Resources

- [ESLint Documentation](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ESLint Plugin React](https://github.com/jsx-eslint/eslint-plugin-react)
