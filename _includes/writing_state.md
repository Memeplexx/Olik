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
.replace(25)                                    // Replace node
```
```ts
.patch({ firstName: 'Sam', age: 25 })           // Partially update some object properties
```
```ts
.insert(todos);                                 // Insert one or more array elements
```
```ts
.replaceAll(todos)                              // Replace all from selected array
```
```ts
.removeAll()                                    // Remove all from selected array
```
```ts
.remove()                                       // Remove all selected array elements
```
```ts
.match(s => s.id)                               // Attempt to replace todo(s) matching id, else insert
.replaceElseInsert(todos, s => s.id)
```
```ts
.reset()                                        // Revert node state
```

### Locating state updates using **tags** ###
By default, all state-updates accept an optional **tag** as their last argument. This identifies the origin of a state-update within the Redux Devtools. We can make this tag **obligatory** by initializing the store using `setEnforceTags()` instead of `set()`
