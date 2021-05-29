---
layout: default
title: Without a framework
parent: Getting started
nav_order: 1
---

# 🐤 Getting started <b>without a framework</b>
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

## Installation
```bash
npm install olik
```

## Initializing your store
```ts
import { store } from 'olik'

export const select = store({
  user: { firstName: '', lastName: '' },
  todos: new Array<{ id: number, title: string, status: 'todo' | 'done' }>(),
});
```
