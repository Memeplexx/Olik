---
layout: default
title: React
nav_order: 1
has_children: false
permalink: /docs/fetching-state/react
parent: Fetching state
---

# <img src="/assets/images/react_large.png" width="40" style="margin-bottom: -8px;"> Fetching state with React
{: .no_toc }

### 🥚 The below code example assumes that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-react'

const { select, useFetcher } = createAppStore({
  todos: new Array<{ id: number, title: string }>(),
})
```
---

## **Observing** fetches
We can track the status and results of a request via the `useFetcher()` hook
```tsx
const Component = () => {
  const { wasResolved, wasRejected, isLoading, storeValue, error } = useFetcher(() => select(s => s.todos)
    .replaceAll(() => fetch('http://example.com/todos').then(res => res.json())));
  return (
    <>
      {isLoading && <div>loading todos...</div>}
      {wasRejected && <div>error loading todos: {error}</div>}
      {wasResolved && storeValue.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </>
  )
}
```

## Next section
{: .no_toc }
[**Nesting stores**](/docs/nesting-stores)