---
layout: default
title: Fetching State
parent: Angular
nav_order: 3
---

# Reading State
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Using *Fetchers* allows you to track the status of a request (loading / success / error) as well as cache request responses.

---
Let's first assume that a store has been initialized as follows:
```ts
import { make } from 'oulik-ng';

const get = make({
  todos: new Array<string>(),
}); 
```
---

### **Defining** a fetcher
```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { get } from './my-store';
import { createFetcher } from 'oulik-ng';

@Injectable()
export class ApiService {
  constructor(
    private httpClient: HttpClient,
  ) { }
  fetchTodos = createFetcher({
    onStore: get(s => s.todos),
    getData: () => this.httpClient.get<string[]>('https://www.example.com/todos'),
    cacheFor: 1000 * 60,
  });
}
```

### Using our fetcher within a **Component**

```ts
import { resolve } from 'oulik-ng';

@Component({
  selector: 'app-component',
  template: `
  <ng-container *ngIf="todos$ | async; let todos">
    <div *ngIf="todos.loading">loading...</div>
    <div *ngIf="todos.error">Sorry! Could not fetch todos</div>
    <div *ngFor="let todo of todos.value">{{todo}}</div>
  </ng-container>
  `
})
export class AppComponent {
  todos$ = observeFetch(() => this.apiService.fetchTodos());
  constructor(
    private apiService: ApiService,
  ) { }
}
```

### Using our fetcher within a **Resolver**
[Resolvers](https://angular.io/api/router/Resolve){:target="_blank"} allow you to asynchronously fetch data before your component is instantiated. This simplifies your component code considerably.
```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { resolve } from 'oulik-ng';

@Injectable()
export class InviteResolver implements Resolve<any> {
  constructor(
    private apiService: ApiService,
  ) { }
  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return resolve(() => this.apiService.fetchTodos());
  }
}
```
```ts
@Component({
  selector: 'app-component',
  template: `<div *ngFor="let todo of todos$ | async">{{todo}}</div>`
})
export class AppComponent {
  todos$ = observe(get(s => s.todos));
}
```
