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
get(s => s.username)               // type: 'username.replace()'
  .replace('Terence');             // replacement: 'Terence'
```
```ts
get(s => s.favorite.foods)         // type: 'favorite.foods.insert()'
  .insert(['Indian', 'Sushi']);    // insertion: ['Indian', 'Sushi']
```
```ts
get(s => s.favorite.hobbies)       // type: 'favorite.hobbies.find().patch()'
  .find(s => s.id).eq(3)           // query: 'id === 3',
  .patch({ name: 'coding' });      // patch: { name: 'coding' }
```
---

[Get started now](#getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 } [View it on GitHub](https://github.com/memeplexx/olik){: .btn .fs-5 .mb-4 .mb-md-0 }

---
