---
layout: default
title: Nesting stores
parent: Angular
nav_order: 6
---

# 🥚 Nesting Stores
{: .no_toc }

Use **nested stores** to manage the internal state of your components, independantly from your **application store**. Configuring your application store as a container for nested stores will allow you to debug your nested stores in tandem with your application store within the Redux Devtools.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

### Configuring your application store to host nested stores
```ts
import { make } from 'oulik-ng';

const get = make({ foo: '', bar: '' }, { containerForNestedStores: true })
```

### Creating and using a nested store
```html
<button (click)="onClickButton()">Click to increment</button>
<div>The number is: {% raw %}{{num$ | async}}{% endraw %}</div>
```
```ts
import { makeNested } from 'oulik-ng';
// some imports omitted for brevity

@Component({...})
export class IncrementorComponent {
  get = makeNested({ num: 0 }, { name: 'Incrementor' });
  num$ = observe(get(s => s.num));
  onClickButton = () => this.get(s => s.num).replace(this.get(s => s.num).read() + 1);
}
```
💡 Note that if your application store is **not** marked with `{ containerForNestedStores: true }` then your nested store will be registered as a **new** store within the Redux Devtools.