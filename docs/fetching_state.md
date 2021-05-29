---
layout: default
title: Fetching state
nav_order: 7
has_children: true
permalink: /docs/fetching-state
has_toc: false
---
# 🐶 Fetching state
{: .no_toc }

## The basic idea
Instead of passing a **value** to update your state with, you can pass a **function returning a promise**:
```ts
select(s => s.todos)
  .replaceAll(() => fetch('http://example.com/todos').then(res => res.json()))
  .catch(error => alert(error))      // optionally catch error or chain another promise
```

## Framework-specific fetching:
* [**React**](./react)
* [**Angular**](./angular)

## Next section
{: .no_toc }
[**Nesting stores**](/docs/nesting-stores)