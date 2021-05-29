## <b>Synchronous</b> reads
Reading a value is straightforward
```ts
const user = select(s => s.user).read();
```
```ts
const todo = select(s => s.todos.find(s => s.id === 1)).read();
```

## <b>onChange()</b> listeners
You can listen to updates to a particular node of your state tree as follows
```ts
const subscription = select(s => s.user)
  .onChange(user => console.log('User changed', user));

// Do not forget to unsubscribe to avoid memory leaks
subscription.unsubscribe();
```
