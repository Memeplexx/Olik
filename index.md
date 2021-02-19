---
layout: default
title: Home
nav_order: 1
description: "Just the Docs is a responsive Jekyll theme with built-in search that is easily customizable and hosted on GitHub Pages."
permalink: /
---

# Olik state management
{: .fs-9 }
Olik provides a minimal, but powerful, set of **state update abstractions** making for a crystal-clear state-management experience. 👌
{: .fs-6 .fw-300 }
```ts
const get = set({
  user: { name: '', age: 0 },
  hobbies: new Array<{ id: number, txt: string }>(),
  some: { deeply: { nested: { number: 0 } } },
});
```
```ts
get(s => s.user.name)
  .replace('James');
```
```ts
get(s => s.hobbies)
  .find(h => h.id).eq(3)
  .replace({ id: 3, txt: 'Baking' });
```
```ts
get(s => s.some.deeply.nested.number)
  .replace(1);
```
---

[Get started now](#getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 } [View it on GitHub](https://github.com/memeplexx/olik){: .btn .fs-5 .mb-4 .mb-md-0 }

---
