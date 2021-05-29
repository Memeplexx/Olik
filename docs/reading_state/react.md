---
layout: default
title: React
nav_order: 2
has_children: false
permalink: /docs/reading-state/react
parent: Reading state
---

# <img src="/assets/images/react_large.png" width="40" style="margin-bottom: -8px;"> Reading state with React

### 🥚 The following examples assume that a store has been initialized as follows:
{: .fw-300 }
{: .no_toc }
```ts
import { createAppStore } from 'olik-react'

const { select, useSelector, useDerivation, mapStateToProps } = createAppStore({
  todos: new Array<{ id: number, title: string, done: boolean, urgency: number, dueDate: string }>(),
  filters: { showCompleted: false },
})
```
## Hook to **read state**
The `useSelector()` hook allows basic reads from the store
```tsx
const Component = () => {
  const todos = useSelector(s => s.todos)
  return (
    <>
      {todos.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </>
  )
}
```

## Hook to **read derived state**
The `useDerivation()` hook allows you avoid unnecessary complex calculations
```tsx
const Component = () => {
  const completedTodos = useDerivation(
    s => s.todos,
    s => s.filters.showCompleted,
  ).usingExpensiveCalc(([todos, showCompleted]) => todos.filter(todo => todo.done === showCompleted));
  return (
    <>
      {completedTodos.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </>
  )
}
```

## **Class-based component** integration
The `mapStateToProps()` function allows you to map store state to component props
```tsx
class MyComponentClass extends React.Component<{ todoTitle: string, todoId: number }> {
  ...
}

const MyComponent = mapStateToProps((state, ownProps: { todoId: number }) => ({
  todoTitle: state.todos.find(s => s.id === ownProps.todoId).title,
  todoId: ownProps.todoId,
}))(MyComponentClass);

class App extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { num: 0 }
  }
  render() {
    return (<MyComponent someProp={num} />);
  }
}
```

## Next section
{: .no_toc }
[**Fetching state**](/docs/fetching-state)