---
layout: default
title: Updating State
nav_order: 5
has_children: false
permalink: /docs/updating-state
---
# 🐼 Updating State
{: .no_toc }

### After [**selecting**](/docs/selecting-state) a node of your state tree, that node can be updated.  
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
---

## **Object & primitive** updates

```ts
select(s => s.user)                       // replace() completely replaces an object
  .replace({ name: 'Jeff', age: 29 })
```
```ts
select(s => s.user)                       // patch() partially updates an object setting some, but
  .patch({ name: 'Jeff' })                // not all, of its properties
```
```ts
select(s => s.user)                       // reset() reverts state to how it was when the store was
  .reset()                                // first initialized
```
```ts
select(s => s.skillPoints)                // insert() adds properties to an object of type
  .insert({ wizardry: 3, strength: 2 })   // { [key: string]: any }
```
```ts
select(s => s.skillPoints)                // remove() removes a key from an object of type
  .remove('wizardry')                     // { [key: string]: any }
```

## **Array** updates
```ts
select(s => s.todos)                      // replaceAll() replaces all elements in the existing array
  .replaceAll(arrayOfTodos)                
```
```ts
select(s => s.todos)                      // removeAll() completely clears the existing array
  .removeAll()                            
```

## **Array element** updates
```ts
select(s => s.todos)                      // insert() inserts element(s) into the existing array
  .insert(oneTodoOrAnArrayOfTodos)        
```
```ts
select(s => s.todos)                      // remove() removes the selected element(s)
  .findWhere(s => s.id).isEq(3)
  .remove()                               
```
```ts
select(s => s.todos)                      // patch() partially updates the selected element(s)
  .findWhere(s => s.id).isEq(3)           
  .patch({ done: true })                  
```
```ts
select(s => s.todos)                      // upsertMatching() inserts element(s) into the store array (if
  .upsertMatching(s => s.id)              // they do not already exist) or updates them (if they do)
  .with(oneTodoOrAnArrayOfTodos)          // in this example, we are comparing elements using their 'id'.
```

## Performing **many updates** at once
We can perform many updates at once using the `transact()` function
```ts
import { transact } from /* whichever version of olik you've installed */

transact(
  () => select(s => s.user)
    .replace({ name: 'Jeff'. age: 29 }),
  () => select(s => s.todos)
    .removeAll(),
)
```

## Tagging state updates
You can add additional labels or 'tags' to your state updates to help you track the origin of your state updates in the Devtools extension. See [**this guide**](/docs/advanced/tagging-updates) for further information

## Next section
{: .no_toc }
[**Reading state**](/docs/reading-state)