---
layout: default
title: Advanced async options
nav_order: 3
has_children: false
permalink: /docs/advanced/advanced-async-options
parent: Advanced
---

# 🐤 Advanced async optiions
{: .no_toc }

## **Caching** data by bypassing promise invocations
Unnecessary API calls can be skipped for a specified number of milliseconds  
```ts
select(s => s.todos)
  .replaceAll(() => fetchTodosFromAPI(), { bypassPromiseFor: 1000 * 60 })
```

## **Cache invalidation**
The following code will invalidate the above `bypassPromiseFor` setting. This ensures that fresh data will be retrieved the next time this node of the state tree is populated with a promise result.
```ts
select(s => s.todos)
  .stopBypassingPromises();
```

## **Optimistic** updates
You can make immediate store updates, which will automatically be rolled back should the API return an error
```ts
select(s => s.user.isAdmin)
  .replace(() => setUserAsAdminOnAPI(), { optimisticallyUpdateWith: true })
```