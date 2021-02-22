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
  .find(t => t.id).eq(3)
```
```ts
get(s => s.todos)                               // Select many array elements
  .filter(t => t.status).eq('todo')
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
```ts
.replace(25)                                    // Replace non-array node
```
```ts
.patch({ firstName: 'Sam', age: 25 });          // Partially update non-array node
```
```ts
.insert(arrayOfNewTodos);                       // Insert one or more array elements
```
```ts
.replaceAll()                                   // Replace all selected array elements
```
```ts
.removeAll()                                    // Remove all selected array elements
```


### **Tagged** updates ###
We can require that all updates be supplemented with a *tag* in order to help to identify the origin of a state update within the Devtools.  
```ts
const get = makeEnforceTags({ some: { value: '' } });
get(s => s.some.value).replaceWith('new value', 'MyComponent');
```
In the above example, we've used 'MyComponent' as the tag but any user-defined string is acceptable.  
For Webpack users, it may be more convenient to use the `__filename` node global object as a tag.  
