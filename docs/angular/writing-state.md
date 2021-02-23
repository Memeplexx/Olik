---
layout: default
title: Writing State
parent: Angular
nav_order: 3
---
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
const { get } = set({
  user: { firstName: '', lastName: '', age: 0 },
  todos: new Array<{ id: number, text: string, status: 'todo' | 'done' }>()
});
```
---

{% include writing_state.md %}
```ts
const { get } = setEnforceTags({ some: { value: '' } });
const tag = 'MyComponent';
get(s => s.some.value)                          // type: 'some.value [MyComponent]'
  .replace('new value', tag);                   // replacement: 'new value'
```
In the above example, we've used `'MyComponent'` as the tag. If you're using Webpack, it may be more convenient to use the `__filename` node global object as a tag. For Angular-CLI users, you can refer to ***[this guide](../../extras/angular-cli-filename){:target="_blank"}*** to make use of the `__filename` variable.
 