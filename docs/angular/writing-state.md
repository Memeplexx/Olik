---
layout: default
title: Writing State
parent: Angular
nav_order: 3
---

{% include writing_state.md %}
```ts
const get = setEnforceTags({ some: { value: '' } });
const tag = 'MyComponent';
get(s => s.some.value)                          // type: 'some.value [MyComponent]'
  .replace('new value', tag);                   // replacement: 'new value'
```
In the above example, we've used `'MyComponent'` as the tag. If you're using Webpack, it may be more convenient to use the `__filename` node global object as a tag. For Angular-CLI users, you can refer to ***[this guide](../../extras/angular-cli-filename){:target="_blank"}*** to make use of the `__filename` variable.
 