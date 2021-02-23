---
layout: default
title: Getting started
parent: Angular
nav_order: 2
---

# 🎨 Getting started
{: .no_toc }

---

## Install Olik-NG
**Olik-NG** wraps the core *Olik* library to provide better interoperability with Angular applications.
```bash
npm install olik-ng
```
---

## Install the [Redux Devtools Extension](https://github.com/zalmoxisus/redux-devtools-extension)
This extension improves the debugging experience substantially. Olik integrates with it automatically.
 * **[Download for Google Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)**  
 * **[Download for Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)**  

---

## Initialize your store
The `set()` function accepts your initial state and returns 3 other functions which we will explore shortly.
```ts
export const { get, observe, observeFetch } = set({ /* your initial state */ });
```

---

[✍️ Writing state >](../writing-state){: .btn .btn-blue }