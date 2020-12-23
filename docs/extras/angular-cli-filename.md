---
layout: default
title: Using the __filename variable within Angular CLI
parent: Extras
nav_order: 1
---

# Using the `__filename` variable within Angular CLI

### Install [angular-builders](https://github.com/just-jeb/angular-builders) (and don't forget to star the repo!)

```bash
npm i -D @angular-builders/custom-webpack
```

### Create a custom Webpack config `custom-webpack.config.js` in your project root:
```js
module.exports = {
  context: __dirname,
  node: {
    __filename: true
  }
};
```
### Configure your `angular.json`

```json
"architect": {
  "build": {
    "builder": "@angular-builders/custom-webpack:browser",
    "options": {
      "customWebpackConfig": {
        "path": "./custom-webpack.config.js"
      }
    }
  },
  "serve": {
    "builder": "@angular-builders/custom-webpack:dev-server",
    "options": {
      "customWebpackConfig": {
        "path": "./custom-webpack.config.js"
      }
    }
  }
}
```

### Create a new type-definition file `src/index.d.ts`
```ts
declare var __filename: string;
```

### Restart your project and start making use of the `__filename` variable
```ts
get(s => s.user.name).replace('John', __filename);
```
