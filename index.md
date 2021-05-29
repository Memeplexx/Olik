---
layout: default
title: Home
nav_order: 1
description: "Just the Docs is a responsive Jekyll theme with built-in search that is easily customizable and hosted on GitHub Pages."
permalink: /
---
{: .fs-9 }
# Olik

##### Axiomatic, self-describing, in-line state-management
{: .fs-6 .fw-300 }
### 🐤 **WHY?**
Olik allows you to comprehensively grok your state updates without ever leaving your component code. 

---

### 🎨 **THE GIST**
```ts
const select = store({
  username: '',
  favorite: {
    foods: new Array<string>(),
    movies: new Array<{ id: number, name: string, rating: number }>(),
  },
});
```
```ts
select(s => s.username)               // type: 'username.replace()'
  .replace('Terence');                // replacement: 'Terence'
```

```ts
select(s => s.favorite.foods)         // type: 'favorite.foods.insert()'
  .insert(['Indian', 'Sushi']);       // insertion: ['Indian', 'Sushi']
```

```ts
select(s => s.favorite.movies)        // type: 'favorite.movies.filter().remove()'
  .filterWhere(s => s.rating).lte(2)  // where: 'rating <= 2'
  .remove();                          // toRemove: [{ id: 2, name: 'Click', rating: 1 }, ...]
```

---

### 🚀 **GET STARTED**
* ***[![](/assets/images/javascript.png)&nbsp;Vanilla-JS](./docs/vanilla-js)***
* ***[![](/assets/images/react.png)&nbsp;React](./docs/react)***
* ***[![](/assets/images/angular.png)&nbsp;Angular](./docs/angular)***.  