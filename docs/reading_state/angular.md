---
layout: default
title: Angular
nav_order: 3
has_children: false
permalink: /docs/reading-state/angular
parent: Reading state
---

# <img src="/assets/images/angular_large.png" width="40" style="margin-bottom: -8px;"> Reading state with Angular

### 🥚 The below example code assumes that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-ng'

const { observe } = createAppStore({
  todos: new Array<{ id: number, title: string }>(),
})
```
## Displaying state **in your template**
You can observe a particular node of your state tree as follows
```html
<div *ngFor="let todo of todos$ | async">{{todo.title}}</div>
```
```ts
@Component({...})
class MyComponent {
  todos$ = observe(s => s.todos)
}
```

## Next section
{: .no_toc }
[**Fetching state**](/docs/fetching-state)