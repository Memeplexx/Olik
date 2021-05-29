---
layout: default
title: Tagging updates
nav_order: 1
has_children: false
permalink: /docs/advanced/tagging-updates
parent: Advanced
---

# 🐤 Tagging state updates
{: .no_toc }

### Using a **tag** can help you track the origin of your state updates in the Devtools extension
{: .no_toc }

## **Basics** of tagging
All state updates *also* accept an options object which, among other things, allows you to set your `tag`.
```ts
select(s => s.todos)
  .replaceAll(todos, { tag: 'MyComponent' });
```
This will result in an action that will appear in the Devtools as:
```ts
type: 'todos.replaceAll()',
tag: 'MyComponent'
...
```

## **Auto-generating** tags
It may be easier to auto-generate your tag strings. Webpack users can use the `__filename` as a tag
```ts
select(s => s.todos)
  .replaceAll(todos, { tag: __filename });
```
This will result in an action that will appear in the Devtools as:
```ts
type: 'todos.replaceAll()',
tag: 'src/components/todos.ts'
...
```

## **Suffixing action types** with a tag
As seen previously, by default, your tag appears as another property in your action object. An alternative is to display your tag as a suffix to your action type. When creating your store, you can pass `tagsToAppearInType: true` in the options object as follows
```ts
import { createAppStore } from /* whichever version of olik you've installed */

export const { select } = createAppStore({ /* initial state */ }, { tagsToAppearInType: true })
```
This will result in an action that will look as follows:
```ts
type: 'todos.replaceAll() [src/components/todos.ts]',
replacement: ...
```

## Ensuring that **all updates are tagged**
We can ensure that all state updates are supplemented with a tag by initializing your store using the `createAppStoreEnforcingTags()` function instead of the `createAppStore()` function. Typescript users will then see an error if state updates are not supplemented with a tag.
```ts
import { createAppStoreEnforcingTags } from /* whichever version of olik you've installed */

export const { select } = createAppStoreEnforcingTags({ /* initial state */ })
```
