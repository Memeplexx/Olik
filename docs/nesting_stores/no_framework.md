---
layout: default
title: No framework
nav_order: 0
has_children: false
permalink: /docs/nesting-stores/no-framework
parent: Nesting stores
---

# <img src="/assets/images/javascript_large.png" width="40" style="margin-bottom: -8px;"> Nested stores with no framework
{: .no_toc }

### 🥚 The below code example assumes that an app store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-react'

const { select, read } = createAppStore({ /* initial application state */ })
```

## **Creating** a nested store
```tsx
const { select, useSelector } = createNestedStore({
  /* initial component state */
}, {
  componentName: 'TodoComponent'
})
```

## **Distinguishing nested store instances** in the app store
You will notice that, by default, each component instance is given an auto-incrementing key in the store.
```json
{
  /* application level state */
  nested: {
    TodoComponent: {
      0: { /* State of 1st instance of TodoComponent */ },
      1: { /* State of 2nd instance of TodoComponent */ },
    },
  }
}
```
This can be overridden by providing an `instanceName` for each component instance.
```tsx
const { select, useSelector } = createNestedStore({
  /* initial component state */
}, {
  componentName: 'TodoComponent',
  instanceName: todoId.toString(), // <-- Here is the important bit
})
```
It's worth noting that the `instanceName` should remain constant throughout the existence of the component.
