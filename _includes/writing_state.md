---

Let's first assume that a store has been initialized as follows:
```ts
const get = set({
  user: { firstName: '', lastName: '', age: 0 },
  todos: new Array<{ id: number, text: string, status: 'todo' | 'done' }>()
});
```
---
### **Basic** updates
```ts
get(s => s.user.age)
  .replace(25);
```
```ts
get(s => s.user)
  .patch({ firstName: 'Sam', age: 25 }); // patch() allows a partial update of a node
```
```ts
get(s => s.todos)
  .insert(arrayOfNewTodos);
```
```ts
get(s => s.todos)
  .removeAll();
```
```ts
get(s => s.todos)
  .replaceAll(arrayOfNewTodos);
```


### **Array element** updates
```ts
get(s => s.todos)
  .find(t => t.id).eq(5)
  .replace({ id: 5, text: 'bake cookies', status: 'todo' });
```
```ts
get(s => s.todos)
  .find(t => t.status).eq('done')
  .patch({ status: 'todo' });
```
```ts
get(s => s.todos)
  .find(t => t.status.eq('done')
  .remove();
```
```ts
get(s => s.todos)
  .upsertWhere(t => t.id === 5).with({ id: 5, text: 'bake cookies', status: 'todo' });
```
```ts
get(s => s.todos)
  .mergeWhere((currentTodo, newTodo) => currentTodo.id === newTodo.id).with(arrayOfNewTodos);
```
```ts
get(s => s.todos
  .find(t => t.id === 2)!.text).replaceWith('something else');
```

### **Tagged** updates ###
We can require that all updates be supplemented with a *tag* in order to help to identify the origin of a state update within the Devtools.  
```ts
const get = makeEnforceTags({ some: { value: '' } });
get(s => s.some.value).replaceWith('new value', 'MyComponent');
```
In the above example, we've used 'MyComponent' as the tag but any user-defined string is acceptable.  
For Webpack users, it may be more convenient to use the `__filename` node global object as a tag.  
