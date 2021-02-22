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

### Step 1: **Selecting state to update**
All state updates start with a selection from the state tree
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
  .findCustom(t => /* some complex query */)  
```
```ts
get(s => s.todos)                               // Select many array elements using custom query
  .filterCustom(t => /* some complex query */)  
```

### Step 2: **Updating selected state**
Here is a sub-set of all state-update options.
```ts
.reset()                                        // Revert node state
```
```ts
.replace(25)                                    // Replace node
```
```ts
.patch({ firstName: 'Sam', age: 25 });          // Partially some object properties
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
.replaceElseInsert(todos, s => s.id)            // Attempt to replace todo(s) matching id, else insert
```


### Locating state updates using **tags** ###
By default, all state-updates accept an optional **tag** which helps to identify the origin of a state-update within the Redux Devtools. We can make this tag obligatory by initializing the store using `setEnforceTags()` instead of `set()`
```ts
const get = setEnforceTags({ some: { value: '' } });
const tag = 'MyComponent';
get(s => s.some.value)                          // type: 'some.value [MyComponent]'
  .replace('new value', tag);                   // replacement: 'new value'
```
In the above example, we've used `'MyComponent'` as the tag. If you're using Webpack, it may be more convenient to use the `__filename` node global object as a tag.
