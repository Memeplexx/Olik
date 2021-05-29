---
layout: default
title: Integrating with React
parent: Getting started
nav_order: 2
---

# 🐤 Getting started with <b>Olik-React</b>


## Installation
```bash
npm install olik-react
```

## Initializing your store
```ts
import { store } from 'olik-react'

export const { select, useSelector, useDerivation, useFetcher, mapStateToProps } = store({
  user: { firstName: '', lastName: '' },
  todos: new Array<{ id: number, title: string, status: 'todo' | 'done' }>(),
})
```
