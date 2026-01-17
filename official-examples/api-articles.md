---
outline: deep
---

# 运行时API文稿

本页面演示了VitePress提供的一些运行时API的用法。

主要的`useData()` API可用于访问当前页面的站点、主题和页面数据。它可以在`.md`和`.vue`文件中使用：

```md
<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
</script>

## 结果

### 主题数据
<pre>{{ theme }}</pre>

### 页面数据
<pre>{{ page }}</pre>

### 页面前置元数据
<pre>{{ frontmatter }}</pre>
```

<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter } = useData()
</script>

## 结果

### 主题数据
<pre>{{ theme }}</pre>

### 页面数据
<pre>{{ page }}</pre>

### 页面前置元数据
<pre>{{ frontmatter }}</pre>

## 更多

查看[完整的运行时API列表](https://vitepress.dev/reference/runtime-api#usedata)文档。
