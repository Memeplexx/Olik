---
layout: default
title: Angular
nav_order: 2
has_children: false
permalink: /docs/nesting-stores/angular
parent: Nesting stores
---

# <img src="/assets/images/angular_large.png" width="40" style="margin-bottom: -8px;"> Nested stores with Angular
{: .no_toc }

### 🥚 The below code example assumes that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-ng'

const store = createAppStore({ /* initial application state */ })
```

## **Creating** a nested store
```html
<ng-container *ngIf="state$ | async; let state;">
  <div>Title: {% raw %}{{state.title}}{% endraw %}</div>
  <input type="checkbox" [checked]="state.isDone" (change)="onChangeIsDone($event)">done
</ng-container>
```
```ts
@Component({ ... })
export class TodoComponent {
  store = createNestedStore({ title: '', isDone: false }, { componentName: 'TodoComponent' });
  state$ = this.store.observe();
  ngOnDestroy = () => this.store.detachFromAppStore(); // removes this store from the application store
  onChangeIsDone = (event: InputEvent) => this.store.select(s => s.isDone)
      .replace((e.target as HTMLInputElement).checked);
}
```

## **Distinguishing component instances** in the app store
You will notice that, by default, each component instance is given an auto-incrementing key in the store.
```ts
{
  /* application level state */
  nested: {
    TodoComponent: {
      0: { /* State of 1st instance of TodoComponent */ },
      1: { /* State of 2nd instance of TodoComponent */ },
    },
  }
}
```
This can be overridden by providing an `instanceName` for each component instance.
```ts
@Component({ ... })
export class TodoComponent {
  @Input() set (id: number) { this.store.setInstanceName(id); }
  store = createNestedStore({ /* initial component state */ }, { componentName: 'TodoComponent' });
}
```
