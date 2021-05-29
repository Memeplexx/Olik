---
layout: default
title: Angular
nav_order: 2
has_children: false
permalink: /docs/fetching-state/angular
parent: Fetching state
---

# <img src="/assets/images/angular_large.png" width="40" style="margin-bottom: -8px;"> Fetching state with Angular
{: .no_toc }

### 🥚 The below code examples assume that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-ng'

const { select, observeFetch } = createAppStore({
  todos: new Array<{ id: number, title: string }>(),
})
```
---

## **Tracking** the status of **async data fetches**
You can track the status of a request by using the `observeFetch()` function
```html
<ng-container *ngIf="todos$ | async; let todos;">
  <div *ngIf="todos.isLoading">Fetching todos...</div>
  <div *ngIf="todos.wasRejected">Failed to fetch todos with error {% raw %}{{todos.error}}{% endraw %}</div>
  <ng-container *ngIf="todos.wasResolved">
    <div *ngFor="let todo of todos.storeValue">{% raw %}{{todo.title}}{% endraw %}</div>
  </ng-container>
</ng-container>
```
```ts
@Component({...})
class MyComponent {

  constructor(
    private readonly httpClient: HttpClient,
  ) { }

  readonly todos$ = observeFetch(() => select(s => s.todos)
    .replaceAll(() => this.httpClient.get('http://example.com/todos').toPromise()));
}
```

## **Resolving data** in a route resolver
It may be better to pre-fetch all component data using an [Angular route resolver](https://angular.io/api/router/Resolve).
```ts
import { from } from 'rxjs';

@Injectable()
export class MyRouteResolver implements Resolve<any> {

  constructor(
    private readonly httpClient: HttpClient,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return from(select(s => s.todos)
      .replaceAll(() => this.httpClient.get('http://example.com/todos').toPromise()));
  }
}
```

## Next section
{: .no_toc }
[**Nesting stores**](/docs/nesting-stores)