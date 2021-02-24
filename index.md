---
layout: default
title: Home
nav_order: 1
description: "Just the Docs is a responsive Jekyll theme with built-in search that is easily customizable and hosted on GitHub Pages."
permalink: /
---
{: .fs-9 }
# Olik

##### *Declarative* state-management. *Free* of inaccurate *actions* & convoluted reducers. *All* in-line.
{: .fs-6 .fw-300 }
### 🐤 **WHY?**
Olik's fluent, typesafe API allows it to describe your actions in perfect detail while performing efficient immutable updates, for unparalleled **consistency**, **transparency**, and **debuggability**.

---

### 🎨 **GIST**
```ts
const select = set({
  user: { name: '', age: 0 },
  hobbies: new Array<{ id: number, txt: string }>(),
  some: { deeply: { nested: { number: 0 } } },
});
```
```ts
select(s => s.username)            // type: 'username.replace()'
  .replace('Terence');             // replacement: 'Terence'
```
```ts
select(s => s.favorite.foods)      // type: 'favorite.foods.insert()'
  .insert(['Indian', 'Sushi']);    // insertion: ['Indian', 'Sushi']
```
```ts
select(s => s.favorite.hobbies)    // type: 'favorite.hobbies.whereOne().patch()'
  .whereOne(s => s.id).eq(3)       // query: 'id === 3',
  .patch({ name: 'coding' });      // patch: { name: 'coding' }
```

---

### 🚀 **GET STARTED**
* ***[![](/assets/images/javascript.png)&nbsp;Vanilla-JS](./docs/vanilla-js)***
* ***[![](/assets/images/react.png)&nbsp;React](./docs/react)***
* ***[![](/assets/images/angular.png)&nbsp;Angular](./docs/angular)***.  