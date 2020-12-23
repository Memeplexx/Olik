---
layout: default
title: Fetching State
parent: Angular
nav_order: 5
---

# 🐕‍🦺 Fetching State
{: .no_toc }

Using *Fetchers* allows you to track the status of a request (loading / success / error), cache data, and de-duplicate simultaneous requests.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


---
👉 Let's first assume that a store has been initialized as follows:
```ts
import { make } from 'oulik-ng';

const get = make({ todos: new Array<string>() }); 
```
---

### **Defining** a fetcher
```ts
import { get } from './my-store';
import { createFetcher } from 'oulik-ng';
// some imports omitted for brevity

@Injectable()
export class ApiService {
  constructor(private httpClient: HttpClient) { }
  fetchTodos = createFetcher({
    onStore: get(s => s.todos),
    getData: () => this.httpClient.get<string[]>('https://www.example.com/todos'),
    cacheFor: 1000 * 60, // Here we are defining a cache which lasts 60 seconds
  });
}
```

### Option A: Using our fetcher within a **Component**
The `observeFetch` function allows you to respond to status changes (loading / error / success states).
Once the fetch has resolved, you get a 'live link' to the underlying store data. This means that any further updates to the store will also be observed.
```html
<ng-container *ngIf="todos$ | async; let todos">
  <div *ngIf="todos.loading">loading...</div>
  <div *ngIf="todos.error">Sorry! Could not fetch todos</div>
  <div *ngFor="let todo of todos.value">{% raw %}{{todo}}{% endraw %}</div>
</ng-container>
```
```ts
import { observeFetch } from 'oulik-ng';
// some imports omitted for brevity

@Component({...})
export class AppComponent {
  todos$ = observeFetch(() => this.apiService.fetchTodos());
  constructor(private apiService: ApiService) { }
}
```

### Option B: Using our fetcher within a **Resolver**
[Resolvers](https://angular.io/api/router/Resolve){:target="_blank"} allow you to pre-fetch data before your component is instantiated. This simplifies your component code considerably because all the state you need is immediately at hand once your component is loaded, and you do not need to cater for displaying loading / error / success states
```ts
import { resolve } from 'oulik-ng';
import { get } from './store';
// some imports omitted for brevity

@Injectable()
export class TodosResolver implements Resolve<any> {
  constructor(private apiService: ApiService) { }
  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return resolve(() => this.apiService.fetchTodos());
  }
}
```
```html
<div *ngFor="let todo of todos$ | async">{% raw %}{{todo}}{% endraw %}</div>
```
```ts
@Component({...})
export class TodosComponent {
  todos$ = observe(get(s => s.todos));
}
```

### Fetching with **arguments**
Fetchers can accept 1 argument. The following example illustrates a server-side paginated query
```ts
fetchTodos = createFetcher({
  onStore: get(s => s.todos),
  getData: (params: { pageOffset: number, pageSize: number }) =>
    this.httpClient.get<string[]>('https://www.example.com/todos', { params }),
  cacheFor: 1000 * 60,
});
```
```ts
todos$ = observeFetch(() => this.apiService.fetchTodos({ pageOffset: 0, pageSize: 10 }));
```
