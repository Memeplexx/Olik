---
---

TEST

{% assign date = '2020-04-13T10:20:00Z' %}

- Original date - {{ date }}
- With timeago filter - {{ date | timeago }}


menus:
  header:
    title: Home
    weight: 1
