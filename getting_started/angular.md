---
layout: default
title: Integrating with Angular
parent: Getting started
nav_order: 3
---

# 🐤 Getting started with <b>Olik-NG</b>


## Installation
```bash
npm install olik-ng
```

## Initializing your store
```ts
import { store } from 'olik-ng'

export const { select, observe, fetch } = store({
  user: { firstName: '', lastName: '' },
  todos: new Array<{ id: number, title: string, status: 'todo' | 'done' }>(),
});
```
