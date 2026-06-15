---
title: 把 SpacemiT K3 接入 OpenClaw 集群
date: 2026-06-15
tags: [openclaw, risc-v]
---

最近搭了个 [OpenClaw](https://github.com/izhouliren/openclaw) 集群，把家里几台机器接进来统一调度。本文记录在 SpacemiT K3 (RISC-V) 上接入的完整流程和踩过的坑。

## 整体架构

```
[pi4-server]  ← Gateway (192.168.6.202:18789)
   ├── macmini (Ubuntu 26.04, x86-64)
   ├── Pi5-ARM (Debian 13, aarch64)
   ├── K1-RISCV (Bianbu 4.0, riscv64) ← 旧的
   └── kyqn (Bianbu 4.0, riscv64)     ← 新的
```

## 步骤

### 1. 装 Node.js

RISC-V 上 Node 官方只有 v22+ 有预编译，**v26 还没 riscv64**。装 nvm 后手动下 v25.9.0 预编译：

```bash
# 走代理快 19 倍（27 KB/s → 1.16 MB/s）
curl -x http://192.168.6.22:7890 -L -o /tmp/node.tar.xz \
  "https://unofficial-builds.nodejs.org/download/release/v25.9.0/node-v25.9.0-linux-riscv64.tar.xz"
tar -xJf /tmp/node.tar.xz -C /opt/
export PATH=/opt/node-v25.9.0-linux-riscv64/bin:$PATH
node -v
```

### 2. 装 OpenClaw

```bash
npm install -g openclaw@2026.6.6 --unsafe-perm
```

> ⚠️ `tree-sitter-bash` 会在 RISC-V 上 build-from-source 卡死。如果遇到 5 分钟没动静，`pkill` 然后加 `--ignore-scripts` 跳过（会少 code-intel 功能，不影响 node）。

### 3. 配 node

```bash
openclaw node install --host 192.168.6.202 --port 18789
```

这一步生成：

- `~/.openclaw/identity/device.json` (Ed25519 keypair)
- `~/.openclaw/node.json` (nodeId, displayName, gateway 配置)
- `~/.openclaw/node.systemd.env` (含 `OPENCLAW_GATEWAY_TOKEN`)
- `~/.config/systemd/user/openclaw-node.service`

### 4. 触发 pairing

启服务：

```bash
systemctl --user enable --now openclaw-node.service
```

gateway 端会看到：

```
device pairing required (requestId: xxxxxxxx-xxxx-...)
```

去 gateway 批准：

```bash
openclaw devices pending
# 看 requestId
openclaw devices approve <requestId>
```

gateway 自动给节点签发 token，写回节点的 `device-auth.json`。

### 5. 验证

```bash
# 在 gateway 上
openclaw devices list     # 看到 kyqn 在 Paired
openclaw nodes status     # Connected: 4（多了 1）
openclaw nodes invoke --node kyqn --command system.which --params '{"bins":["node"]}'
```

## 踩过的坑

1. **SSH 走 key 认证**（`PasswordAuthentication no`），一次性配 `~/.ssh/authorized_keys`，之后 `ssh bianbu@kyqn` 直连
2. **systemd --user 需要 `XDG_RUNTIME_DIR`**（SSH 进去默认没有）：
   ```bash
   XDG_RUNTIME_DIR=/run/user/$(id -u) systemctl --user status openclaw-node
   ```
3. **tarball 升级会留半残**：用 `npm install -g` 升级已存在的 openclaw 报 `ENOTEMPTY`，要 `npm pack` + `tar -x` 绕过（详见 MEMORY 笔记）

## 用起来

接好后就可以在 gateway 上调度任务到 kyqn：

```bash
openclaw nodes invoke --node kyqn --command "bash.exec" \
  --params '{"command": "uname -a", "timeout": 10}'
```

或者 cron 任务里加 `node: "kyqn"` 让它跑在 RISC-V 上。
