---
title: Cron 任务必须用 isolated 模式
date: 2026-06-12
tags: [openclaw, cron, lesson]
---

OpenClaw 的 cron 任务有 `sessionTarget` 字段：`main` / `current` / `isolated` / `session:<id>`。

**结论：所有 cron 任务都用 `isolated`，别用其他三个。**

## 坑

同一个 cron 任务用 `sessionTarget: "session:<fixed>"` 反复跑几轮后：

1. 上下文累积到 99% 缓存命中
2. 模型开始偷懒，**凭上轮记忆回答**（"脚本不存在"，但实际脚本就在那）
3. 不再实际执行命令
4. 最终 session 卡死 → `isolated agent setup timed out`

## 解法

```json
{
  "name": "bilibili-daily",
  "schedule": { "kind": "cron", "expr": "0 22 * * *", "tz": "Asia/Shanghai" },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "跑 python3 scripts/bilibili_monitor.py ...",
    "model": "minimax-portal/MiniMax-M3",
    "timeoutSeconds": 120
  }
}
```

## 配套经验

- **显式指定 `model`**，不要用默认 deepseek（见下条）
- **payload 里禁止模型猜测**，强制要求先 exec 拿数据再汇报
- 配 `failureAlert`（失败 N 次后通知）
