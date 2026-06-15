---
title: Samba 共享权限的 4 个常见坑
date: 2026-06-04
tags: [samba, linux]
---

为什么我传上去的文件用户看不到？为什么新建文件 owner 是 nobody？

正解：用 force user / force group + 正确的 SELinux 标签。

## 详细数据

完整测试方法、命令、原始数据放在脚本目录里。等有时间整理出来再补到正文。
