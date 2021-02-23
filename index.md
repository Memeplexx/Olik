---
layout: default
title: Home
nav_order: 1
description: "Just the Docs is a responsive Jekyll theme with built-in search that is easily customizable and hosted on GitHub Pages."
permalink: /
---
{: .fs-9 }
# Olik

### *Declarative* state-management. *Free* of innacurate *actions* & convoluted reducers. *All* in-line.
{: .fs-6 .fw-300 }
### 🎨 **WHY CHOOSE OLIK?**
Olik is designed to make your state management as **transparent** and semantically **consistent** as possible. Its fluent, typesafe API allows it to describe your actions in perfect detail (within the Redux Devtools) and perform efficient immutable updates.  

It can be used with ***[![](/assets/images/javascript.png)&nbsp;Vanilla-JS](./docs/vanilla-js)***, and has minimal bindings for ***[![](/assets/images/react.png)&nbsp;React](./docs/react)***, and ***[![](/assets/images/angular.png)&nbsp;Angular](./docs/angular)***.  


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
