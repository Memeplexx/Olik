---
layout: default
title: Creating a store
nav_order: 3
has_children: false
permalink: /docs/creating-a-store
---

# 🐹 Creating a store
{: .no_toc }

## Creating an **app store**
The following will create an application-wide store. Your initial state can be any serializable object.
```ts
import { createAppStore } from /* whichever version of olik you've installed */

export const { select, read } = createAppStore({
  user: { name: '', age: '' },
  todos: new Array<{ id: number, title: string }>()
})
```
## Normalizing your state
Keep your state tree as flat as possible. If you aren't already familiar with Redux-like state-management libraries, we suggest that you read [**this**](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape) guide explaining the benefits of normalizing your state tree.

## Nested store creation
If you have already covered [**selecting**](./selecting-state), [**updating**](./updating-state), & [**reading**](./reading-state) state, you may be interested in [Creating **nested stores**](/docs/advanced/nested-stores) to manage your component state

## Next section
{: .no_toc }
[**Selecting state**](/docs/selecting-state)