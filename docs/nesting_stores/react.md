---
layout: default
title: React
nav_order: 1
has_children: false
permalink: /docs/nesting-stores/react
parent: Nesting stores
---

# <img src="/assets/images/react_large.png" width="40" style="margin-bottom: -8px;"> Nested stores with React
{: .no_toc }

### 🥚 The below code example assumes that an app store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-react'

const { select, read } = createAppStore({ /* initial application state */ })
```

## **Creating** a nested store
For this purpose, we have the `useNestedStore()` hook
```tsx
const TodoComponent = () => {
  const { select, useSelector } = useNestedStore({
    /* initial component state */
  }, {
    componentName: 'TodoComponent'
  })
}
```

## **Distinguishing component instances** in the app store
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
const TodoComponent: React.FunctionComponent<{ id: number, title: string }> = (props) => {
  const { select, useSelector } = useNestedStore({
    /* initial component state */
  }, {
    componentName: 'TodoComponent',
    instanceName: props.id.toString(), // <-- Here is the important bit
  })
};
```
It's worth noting that the `instanceName` should remain constant throughout the existence of the component.

## **Receiving props** from the parent component
When receiving props from the parent component, simply set them directly as follows:
```tsx
const TodoComponent: React.FunctionComponent<{ id: number, title: string }> = (props) => {
  const { select } = useNestedStore({
    /* initial component state */
  }, {
    componentName: 'TodoComponent'
  });
  // here we are receiving the prop 'title' and setting it onto the component state
  React.useEffect(() => select(s => s.title).replace(props.title), [props.title])
}
```