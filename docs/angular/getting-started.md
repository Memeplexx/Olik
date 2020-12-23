---
layout: default
title: Getting started
parent: Angular
nav_order: 2
---

# 🎨 Getting started
{: .no_toc }

*Oulik-NG* wraps the core *Oulik* library in order to provide a convenient API to use within your Angular applications.

---

### Install the **Library**
```bash
npm install oulik-ng
```
### Install the **Redux Devtools extension** within your browser
 * **[Google Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)**  
 * **[Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)**  

### Initialize your **store**
```ts
export const get = make({ hello: '', world: 0 });
```