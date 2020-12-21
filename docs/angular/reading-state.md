---
layout: default
title: Reading State
parent: Angular
nav_order: 2
---

# Reading State
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---



Let's first assume that a store has been initialized as follows:
```ts
import { make } from 'oulik-ng';

const get = make({
  todos: new Array<string>(),
}); 
```
---

### **Synchronous** reads
```ts
const todos = get(s => s.todos).read();
```

### **Asynchronous** reads
```ts
@Component({ ... })
export class MyComponent {
  private listener = get(s => s.todos).onChange(todos => console.log(todos));
  ngOnDestroy() {
    listener.unsubscribe(); // Please unsubscribe to avoid a memory leak
  }
}
```  

### **Consuming state** in your template
```ts
import { observe } from 'oulik-ng';
import { get } from './store';

@Component({
  selector: 'app-component',
  template: `<div *ngFor="let todo of todos$ | async">{{todo}}</div>`
})
export class MyComponent {
  todos$ = observe(get(s => s.todos));
}
```

### **Consuming derived state** in your template

While this library exposes a `deriveFrom()` function (to memoize a single output from multiple inputs), Angular users enjoy the benefits of RXJS (which can combine, and memoize, multiple data streams into a single output data stream):

```ts
import { combineLatest } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { observe } from 'oulik-ng';
import { get } from './store';

@Component({
  selector: 'app-component',
  template: '<div>{{data$ | async}}</div>'
})
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
