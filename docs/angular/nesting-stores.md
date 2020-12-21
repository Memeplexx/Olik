---
layout: default
title: Nesting stores
parent: Angular
nav_order: 4
---

# Nesting Stores
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---


You can create nested stores to manage and debug your component state. For the sake of portability, these nested stores do not reference the application store directly.

### Configuring your application store to host nested stores
```ts
import { make } from 'oulik-ng';

const get = make({ foo: '', bar: '' }, { containerForNestedStores: true })
```

### Creating and using a nested store
```ts
import { makeNested } from 'oulik-ng';

@Component({
  selector: 'app-component',
  template: `<button (click)="onClickButton()">Increment</button>`
})
export class MyComponent {
  get = makeNested({ num: 0 }, { name: 'MyComponent' });
  onClickButton() {
    this.get(s => s.num).replace(this.get(s => s.num).read() + 1)
  }
}
```
Note that, if your application store is not marked with `{ containerForNestedStores: true }` then a new store will be registered in the Devtools using the name you provided.