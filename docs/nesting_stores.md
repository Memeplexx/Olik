---
layout: default
title: Nesting stores
nav_order: 8
has_children: true
permalink: /docs/nesting-stores
has_toc: false
---

# 🐱 Nested stores
{: .no_toc }

## Olik allows you to manage & debug your component state with or without your application state.
{: .no_toc }

## The basic idea
You can build your components independently from your application while using Olik to manage their internal state. 
When you include those components in your application, their stores are automatically 'nested' inside your application-level store resulting in a state tree which looks something like:
```ts
{
  /* application level state */
  nested: {
    MyComponent: {
      0: { /* State of 1st instance of MyComponent */ },
      1: { /* State of 2nd instance of MyComponent */ },
    },
    MyOtherComponent: {
      0: { /* State of 1st instance of MyOtherComponent */ },
    }
  }
}
```

## Framework-specific nesting of stores
* [**No framework**](./no-framework)
* [**React**](./react)
* [**Angular**](./angular)

