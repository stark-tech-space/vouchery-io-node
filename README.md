# api-package-template

API package template

[Design Document](https://google.com)

> This package is meant to help create api packages

## Setup

```
npm install

npm test
```

## File Structure

- src
- test
- lib (js output)
  - cjs
  - esm
- tsconfig.json (esmodules build settings)
- tsconfig-cjs.json (commonjs build settings)
- .env (environment variables)

## Notes

Use tree shaking esmodules exports
