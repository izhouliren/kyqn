---
title: 在 SpacemiT K3 Pico ITX 上跑 llama.cpp
date: 2026-06-15
tags: [risc-v, llm, benchmark]
---

SpacemiT K3 Pico ITX 是我最近入手的 RISC-V 小主机，8 核 Spacemit X100 + 16GB LPDDR5 + 35W 功耗。本文记录在这台机器上跑 `llama.cpp` 的基准测试结果。

## 硬件速览

| 部件 | 规格 |
|---|---|
| SoC | SpacemiT K3 (8× X100 @ 2.4 GHz) |
| ISA | RVA23, RVV 1.0 (VLEN 256) |
| RAM | 16 GB LPDDR5-6400 |
| 存储 | 128 GB UFS + 1× M.2 NVMe |
| OS | Bianbu 4.0.1 (Ubuntu 26.04 LTS) |

`cat /proc/cpuinfo` 看到的 ISA：

```text
rv64imafdcvh_zicbom_zicbop_..._zvbb_zvbc_zve32f_zve32x_zve64d_zve64f_zve64x_zvfh_...
```

注意 `v` 和 `zve*` 扩展——**这是 RVV 1.0**，不是 0.7.1（K1 的旧实现）。

## 安装

Bianbu 源里有现成的：

```bash
sudo apt install -y llama.cpp
llama-cli --version
# version: 8681 (Debian)
# load_backend: loaded CPU backend from .../libggml-cpu-riscv64_v.so
```

后缀 `_v` 表示加载了 RVV 后端。

## 跑基准

模型：Qwen2.5-7B-Instruct Q4_K_M（4.7 GB），从 ModelScope 下载：

```bash
curl -L -o ~/models/qwen2.5-7b-q4.gguf \
  "https://www.modelscope.cn/models/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/master/qwen2.5-7b-instruct-q4_k_m.gguf"
```

测试不同线程数：

```bash
for t in 1 4 8 16; do
  llama-bench -m ~/models/qwen2.5-7b-q4.gguf -ngl 0 -t $t -p 128 -n 32
done
```

结果（**平均**）：

| 线程 | pp128 (t/s) | tg32 (t/s) |
|---:|---:|---:|
| 1 | 0.85 | 0.65 |
| 4 | 2.30 | 1.55 |
| **8** | **3.22** | **2.38** |
| 16 | 3.20 | 2.19 |

8 线程最优。16 线程没收益，因为 X100 物理核就 8 个，SMT 对 matmul 无帮助。

## 实际体感

`2.38 t/s` 的生成速度——读单字比正常说话慢一点，写代码能用。 100 token 的回答大约 42 秒出。

要快就只能：

- 换更小的模型（1.5B Q4 跑到 7-8 t/s，体感流畅）
- 换 GPU 机器（3B6000 + AMD RX 6600，30+ t/s）

> **可悲的真相**：K3 内部有 8 个 A100 AI 核（VLEN 1024, 60 TOPS INT8），但 llama.cpp 用不上——需要 SpacemiT 私有版工具链，**截至 2026-06 仍未公开**。
