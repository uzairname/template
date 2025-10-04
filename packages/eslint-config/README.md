# @repo/eslint-config

Shared ESLint configurations for the monorepo.

## Configurations

- **base**: Base TypeScript configuration for all packages
- **react**: Configuration for React/Next.js applications
- **node**: Configuration for Node.js/Cloudflare Workers applications

## Usage

### For React/Next.js apps

```js
// eslint.config.mjs
import reactConfig from '@repo/eslint-config/react'

export default reactConfig
```

### For Node.js/Cloudflare Workers

```js
// eslint.config.mjs
import nodeConfig from '@repo/eslint-config/node'

export default nodeConfig
```

### For packages (base TypeScript)

```js
// eslint.config.mjs
import baseConfig from '@repo/eslint-config/base'

export default baseConfig
```
