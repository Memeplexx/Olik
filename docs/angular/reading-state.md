---
layout: default
title: Reading State
parent: Angular
nav_order: 4
---

# 📖 Reading State
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---



Let's first assume that a store has been initialized as follows:
```ts
import { make } from 'oulik-ng';

const get = make({ todos: new Array<string>() }); 
```
---

### Reading **synchronously**
```ts
import { get } from './store';

const todos = get(s => s.todos).read();
```

### **Listening** to state updates
```ts
@Component({ ... })
export class MyComponent {
  private listener = get(s => s.todos).onChange(todos => console.log(todos));
  ngOnDestroy() {
    this.listener.unsubscribe(); // Please unsubscribe to avoid a memory leak
  }
}
```  

### **Consuming state** in your template
```html
<div *ngFor="let todo of todos$ | async">{% raw %}{{todo}}{% endraw %}</div>
```
```ts
import { observe } from 'oulik-ng';
import { get } from './store';
// some imports omitted for brevity

@Component({...})
export class MyComponent {
  todos$ = observe(get(s => s.todos));
}
```

### **Consuming derived state** in your template

While this library exposes a `deriveFrom()` function (to memoize a single output from multiple inputs), Angular users enjoy the benefits of RXJS (which can combine, and memoize, multiple data streams into a single output data stream):

```html
<div>{% raw %}data$ | async{% endraw %}</div>
```
```ts
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { observe } from 'oulik-ng';
import { get } from './store';
// some imports omitted for brevity

@Component({...})
export class MyComponent {
  data$ = combineLatest([
    observe(get(s => s.todos)),
    observe(get(s => s.some.other.value)),
  ]).pipe(
    map(([todos, someOtherValue]) => /* some fancy calculation */ )
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
```
