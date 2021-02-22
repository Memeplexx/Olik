# ✍️ Writing State
{: .no_toc }

All state updates require a **selection** of state followed by some **action** to perform on that selection.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Let's first assume that a store has been initialized as follows:
```ts
const get = set({
  user: { firstName: '', lastName: '', age: 0 },
  todos: new Array<{ id: number, text: string, status: 'todo' | 'done' }>()
});
```
---

### Step 1 of 2: **Selecting state to update**
```ts
get(s => s.user)                                // Select node
```
```ts
get(s => s.todos)                               // Select one array element
  .find(s => s.id).eq(3)
```
```ts
get(s => s.todos)                               // Select many array elements
  .filter(s => s.status).eq('todo')
```
```ts
get(s => s.todos)                               // Select one array element using custom query
  .findCustom(t => /* some custom query */)  
```
```ts
get(s => s.todos)                               // Select many array elements using custom query
  .filterCustom(t => /* some custom query */)  
```

### Step 2 of 2: **Updating selected state**
```ts
.reset()                                        // Revert node state
```
```ts
.replace(25)                                    // Replace node
```
```ts
.patch({ firstName: 'Sam', age: 25 })           // Partially some object properties
```
```ts
.insert(todos);                                 // Insert one or more array elements
```
```ts
.replaceAll(todos)                              // Replace all selected array elements
```
```ts
.removeAll()                                    // Remove all selected array elements
```
```ts
.match(s => s.id)                               // Attempt to replace todo(s) matching id, else insert
.replaceElseInsert(todos, s => s.id)
```


### Locating state updates using **tags** ###
By default, all state-updates accept an optional **tag** as their last argument. This identifies the origin of a state-update within the Redux Devtools. We can make this tag **obligatory** by initializing the store using `setEnforceTags()` instead of `set()`
