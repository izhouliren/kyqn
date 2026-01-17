# Markdown扩展文稿

本页面演示了VitePress提供的一些内置Markdown扩展功能。

## 语法高亮

VitePress提供由[Shiki](https://github.com/shikijs/shiki)驱动的语法高亮功能，带有行高亮等附加功能：

**输入**

````md
```js{4}
export default {
  data () {
    return {
      msg: '高亮显示！'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: '高亮显示！'
    }
  }
}
```

## 自定义容器

**输入**

```md
::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险警告。
:::

::: details
这是一个详情块。
:::
```

**输出**

::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险警告。
:::

::: details
这是一个详情块。
:::

## 更多

查看[完整的Markdown扩展列表](https://vitepress.dev/guide/markdown)文档。
