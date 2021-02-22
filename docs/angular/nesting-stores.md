---
layout: default
title: Nesting stores
parent: Angular
nav_order: 6
---

# 🥚 Nesting Stores
{: .no_toc }

**Nested stores** help you manage the internal state of your components in a way that is loosely coupled from your **application store**. Configuring your application store with the `containerForNestedStores` flag allows you to debug your nested stores in tandem with your application store within the Devtools.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

### Configuring your application-level store to host nested stores
```ts
import { set } from 'olik-ng';

set({ /* initial global state */ }, { isContainerForNestedStores: true })
```

### Creating and using a nested store
```html
<input #input placeholder="Please enter a value">
<button (click)="onClickButton(input.value)">Submit value</button>
<div>Submitted: {% raw %}{{val$ | async}}{% endraw %}</div>
```
```ts
@Component({ /* ... */ })
export class MyComponent {
  store = setNested({ val: '' }, { name: 'MyComponent' });
  val$ = this.store.observe(s => s.val);
  onClickButton(val: string) {
    this.store.get(s => s.val).replace(val);
  }
}
```
💡 Note that if your application store is **not** marked with `isContainerForNestedStores: true` then your nested store will be registered as a **new** store within the Redux Devtools.