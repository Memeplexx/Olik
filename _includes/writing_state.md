### Step 1 of 2: **Selecting state to update**
All state updates start by **selecting** a node to update, for example:
```ts
select(s => s.user)                             // Select node
```
```ts
select(s => s.todos)                            // Select one array element
  .whereOne(s => s.id).eq(3)
```
```ts
select(s => s.todos)                            // Select many array elements
  .whereMany(s => s.status).eq('todo')
```
```ts
select(s => s.todos)                            // Select one array element using custom query
  .find(t => /* some custom query */)  
```
```ts
select(s => s.todos)                            // Select many array elements using custom query
  .filter(t => /* some custom query */)  
```

### Step 2 of 2: **Updating selected state**
Once you have selected a node, you can perform some **update** on it, for example:
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
