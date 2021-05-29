
---
<b class="text-purple-000">.select(...)</b> selects an object, array or primitive
```ts
select(s => s.user)
```

<b class="text-purple-000">.select(...).eq(...)</b> selects array element(s) whose property is <b>equal to</b> a value
```ts
select(s => s.todos)
  .findWhere(s => s.id).eq(3)               // OR:   .filterWhere(s => s.id).eq(3)
```

<b class="text-purple-000">.select(...).ne(...)</b> selects array element(s) whose property is <b>not equal to</b> a value
```ts
select(s => s.todos)
  .findWhere(s => s.id).ne(3)               // OR:   .filterWhere(s => s.id).nes(3)
```

<b class="text-purple-000">.select(...).in(...)</b> selects array element(s) whose property is <b>inside</b> an array
```ts
select(s => s.todos)
  .findWhere(s => s.id).in([1, 2, 3])       // OR:   .filterWhere(s => s.id).in([1, 2, 3])
```

<b class="text-purple-000">.select(...).ni(...)</b> selects array element(s) whose property is <b>not inside</b> an array
```ts
select(s => s.todos)
  .findWhere(s => s.id).ni([1, 2, 3])       // OR:   .filterWhere(s => s.id).ni([1, 2, 3])
```

<b class="text-purple-000">.select(...).gt(...)</b> selects array element(s) whose property is <b>greater than</b> a number
```ts
select(s => s.todos)
  .findWhere(s => s.id).gt(3)               // OR:   .filterWhere(s => s.id).gt(3)
```

<b class="text-purple-000">.select(...).gte(...)</b> selects array element(s) whose property is <b>greater than or equal to</b> a number
```ts
select(s => s.todos)
  .findWhere(s => s.id).gte(3)              // OR:   .filterWhere(s => s.id).gte(3)
```

<b class="text-purple-000">.select(...).lt(...)</b> selects array element(s) whose property is <b>less than</b> a number
```ts
select(s => s.todos)
  .findWhere(s => s.id).lt(3)               // OR:   .filterWhere(s => s.id).lt(3)
```

<b class="text-purple-000">.select(...).lte(...)</b> selects array element(s) whose property is <b>less than or equal to</b> a number
```ts
select(s => s.todos)
  .findWhere(s => s.id).lte(3)              // OR:   .filterWhere(s => s.id).lte(3)
```

<b class="text-purple-000">.select(...).match(...)</b> selects array element(s) whose property <b>matches</b> a regular expression
```ts
select(s => s.todos)
  .findWhere(s => s.id).lte(3)              // OR:   .filterWhere(s => s.id).lte(3)
```
