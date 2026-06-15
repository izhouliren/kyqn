---
title: Cron 任务卡死的根因排查（deep dive）
date: 2026-06-06
tags: [openclaw, cron, debug]
---

上次的 lessons learned 文章写得太短。这篇把 cron 任务卡死的完整时序图、syscall trace、模型上下文累积机制都讲一遍。

## 详细数据

完整测试方法、命令、原始数据放在脚本目录里。等有时间整理出来再补到正文。
