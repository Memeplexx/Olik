---
layout: default
title: Writing State
parent: Angular
nav_order: 3
---
# ✍️ Writing State

Let's first assume that a store has been initialized as follows:
```ts
const { select } = set({
  user: { firstName: '', lastName: '', age: 0 },
  todos: new Array<{ id: number, text: string, status: 'todo' | 'done' }>()
});
```
{% include writing_state.md %}
```ts
const { select } = setEnforceTags({ some: { value: '' } });
const tag = 'MyComponent';
select(s => s.some.value)                          // type: 'some.value.replace() [MyComponent]'
  .replace('new value', tag);                   // replacement: 'new value'
```
In the above example, we've used `'MyComponent'` as the tag. If you're using Webpack, it may be more convenient to use the `__filename` node global object as a tag. For Angular-CLI users, you can refer to ***[this guide](../../extras/angular-cli-filename){:target="_blank"}*** to make use of the `__filename` variable.

---

[< 🎨 Getting started](.../getting-started){: .btn .btn-outline } [📖 Reading state >](../reading-state){: .btn .btn-blue }
 