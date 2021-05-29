---
layout: default
title: Reading state
nav_order: 6
has_children: true
permalink: /docs/reading-state
has_toc: false
---

# 🐭 Reading state
{: .no_toc }

### 🥚 The below code examples assume that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from /* whichever version of olik you've installed */

const { read, select } = createAppStore({
  user: { name: '' },
  todos: new Array<{ id: number, title: string }>(),
})
```
## **Basic** reads
```ts
const user = read().user;
const todo = read().todos.find(s => s.id === 1);
```

## **Listening** to updates
```ts
const subscription = select(s => s.user)
  .onChange(user => console.log('User changed', user));

subscription.unsubscribe();
```
Do not forget to unsubscribe to avoid memory leaks as demonstrated above

## **Framework-specific** reads:
* [**React**](./react)
* [**Angular**](./angular)

## Next section
{: .no_toc }
[**Fetching state**](/docs/fetching-state)