
---
### WRITING OBJECT OR PRIMITIVE NODES

<b class="text-purple-000">.replace()</b> <span class="text-grey-dk-000">substitutes any node which is not an array element</span>
```ts
.replace({ firstName: 'Jeff', lastName: 'White', age: 29 })
```

<b class="text-purple-000">.patch()</b> <span class="text-grey-dk-000">partially updates an object node</span>
```ts
.patch({ firstName: 'Jeff', lastName: 'White' })
```

<b class="text-purple-000">.reset()</b> <span class="text-grey-dk-000">reverts state to how it was when the store was initialized</span>
```ts
.reset()
```

<b class="text-purple-000">.insert() *</b> <span class="text-grey-dk-000">add one or more properties to an object.</span>
```ts
.insert({ wizardry: 3, sourcery: 4, strength: 2 })
```

<b class="text-purple-000">.remove() *</b> <span class="text-grey-dk-000">removes the specified key from an object.</span>
```ts
.remove('wizardry')
```

<b class="text-purple-000">*</b>
<small>WARNING: invoking this has the potential to contradict the type-system.</small>
<small>Only use this to add properties to an object of type of `{ [key: string]: any }` and NOT to add properties with statically defined properties eg `{ str: '', num: 0 }`</small>

---

### WRITING ARRAYS
<b class="text-purple-000">.replaceAll()</b> <span class="text-grey-dk-000">substitutes all array elements</span>
```ts
.replaceAll([{ id: 1, text: 'Make money', status: 'todo' }, { id: 2, text: 'Build fort', status: 'todo' }])
```
<b class="text-purple-000">.removeAll()</b> <span class="text-grey-dk-000">removes all array elements</span>
```ts
.removeAll()
```
<b class="text-purple-000">.upsertMatching()</b> <span class="text-grey-dk-000">inserts array element(s) if they do not already exist, or updates them if they do</span>
```ts
.upsertMatching(s => s.id)
.with([{ id: 1, text: 'Make money', status: 'todo' }, { id: 2, text: 'Build fort', status: 'todo' }])
```

---

### WRITING ARRAY ELEMENT(S)
<b class="text-purple-000">.findWhere().eq()</b> or <b class="text-purple-000">filterWhere().eq()</b> <span class="text-grey-dk-000">search for element(s) which <b>equal</b> a value</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).eq(3)
  // update statement
```

<b class="text-purple-000">.findWhere().ne()</b> or <b class="text-purple-000">filterWhere().ne()</b> <span class="text-grey-dk-000">search for element(s) which do <b>not equal</b> a value</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).ne(3)
  // update statement
```

<b class="text-purple-000">.findWhere().in()</b> or <b class="text-purple-000">filterWhere().in()</b> <span class="text-grey-dk-000">search for element(s) which are <b>in</b> the supplied array</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).in([2, 3, 4])
  // update statement
```

<b class="text-purple-000">.findWhere().ni()</b> or <b class="text-purple-000">filterWhere().ni()</b> <span class="text-grey-dk-000">search for element(s) which are <b>not in</b> the supplied array</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).ni([2, 3, 4])
  // update statement
```

<b class="text-purple-000">.findWhere().gt()</b> or <b class="text-purple-000">filterWhere().gt()</b> <span class="text-grey-dk-000">search for element(s) which are <b>greater than</b> the supplied value</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).gt(2)
  // update statement
```

<b class="text-purple-000">.findWhere().gte()</b> or <b class="text-purple-000">filterWhere().gte()</b> <span class="text-grey-dk-000">search for element(s) which are <b>greater than or equal to</b> the supplied value</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).gte(2)
  // update statement
```

<b class="text-purple-000">.findWhere().lt()</b> or <b class="text-purple-000">filterWhere().lt()</b> <span class="text-grey-dk-000">search for element(s) which are <b>less than</b> the supplied value</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).lt(2)
  // update statement
```

<b class="text-purple-000">.findWhere().lte()</b> or <b class="text-purple-000">filterWhere().lte()</b> <span class="text-grey-dk-000">search for element(s) which are <b>less than or equal to</b> the supplied value</span>
```ts
select(s => s.todos)
  .findWhere(s => s.id).lte(2)
  // update statement
```

<b class="text-purple-000">.findWhere().match()</b> or <b class="text-purple-000">filterWhere().match()</b> <span class="text-grey-dk-000">searches for element(s) which <b>match the supplied regular expression</b></span>
```ts
select(s => s.todos)
  .findWhere(s => s.text).match(/^test/)
  // update statement
```

---

### Locating state updates using **tags** ###
By default, all state-updates accept an optional **tag** as their last argument. This identifies the origin of a state-update within the Redux Devtools. We can make this tag **obligatory** by initializing the store using `setEnforceTags()` instead of `set()`
