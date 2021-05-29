### 🥚 The following examples assume that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
const { select } = store({
  user: { name: '', age: 0 },
  todos: new Array<{ id: number, title: string, done: boolean, urgency: number, dueDate: string }>(),
  skillPoints: { } as { [skill: string]: number }
})
```
---