---
layout: default
title: Selecting State
nav_order: 4
has_children: false
permalink: /docs/selecting-state
---

# 🦔 Selecting State
{: .no_toc }

### Before [**updating**](/docs/updating-state) your state, you must first select a node to change.  
{: .no_toc }

### 🥚 The following examples assume that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from /* whichever version of olik you've installed */

const { select } = createAppStore({
  user: { name: '', age: 0 },
  todos: new Array<{ id: number, title: string, done: boolean, urgency: number, dueDate: string }>(),
  skillPoints: { } as { [skill: string]: number }
})
```
## **Object & property** selections

```ts
select()                                          // select the root node of your state tree
```
```ts
select(s => s.user.age)                           // select the 'user's 'age'
```

## **Array element** selections

Note that, in the below examples, the following invocations are interchangeable:  
* `findWhere()`, which selects **1 array element**, and
* `filterWhere()`, which selects **zero or more array elements**

```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.id).isEq(3)                   // .. where 'id' is EQUAL to 3
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.id).isNotEq(3)                // ... where 'id' is NOT EQUAL to 3
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.id).isIn([1, 2, 3])           // ... where 'id' is IN [1, 2, 3]
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.id).isNotIn([1, 2, 3])        // ... where 'id' is NOT IN [1, 2, 3]
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.urgency).isMoreThan(3)        // ... where 'urgency' is MORE THAN 3
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.urgency).isMoreThanOrEq(3)    // ... where 'urgency' is MORE THAN OR EQUAL TO 3
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.urgency).isLessThan(3)        // ... where 'urgency' is LESS THAN 3
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.urgency).isLessThanOrEq(3)    // ... where 'urgency' is LESS THAN OR EQUAL TO 3
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.title).isMatching(/^test/)    // ... where 'title' MATCHES A REGULAR EXPRESSION
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => /* expression */)               // ... where some very complex expression...
  .returnsTrue()                                  // ... returns true
```
```ts
select(s => s.todos)                              // select todo(s)...
  .filterWhere(s => s.dueDate)                    // ... where 'dueDate' string...
  .whenConvertedTo(s => new Date(s).getTime())    // ... when converted to milliseconds...
  .isMoreThan(Date.now())                         // ... is more than now.
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.done).isEq(true)              // ... where 'done' is true
  .andWhere(s => s.title).isEq('Meditate')        // ... AND WHERE title equals 'Meditate'
```
```ts
select(s => s.todos)                              // select todo(s)...
  .findWhere(s => s.done).isEq(true)              // ... where 'done' is true
  .orWhere(s => s.title).isEq('Meditate')         // ... OR WHERE title equals 'Meditate'
```
## Next section
{: .no_toc }
[**Updating state**](/docs/updating-state)