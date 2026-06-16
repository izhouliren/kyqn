---
title: 调试 SpacemiT K3 的 IME2 加速：从 Bob Johansson 30B 视频到 /dev/tcm_sync_mem 失踪案
date: 2026-06-16
tags: [risc-v, llm, debug, kernel, spacemit-k3]
---

上个月发了一篇 [在 K3 上跑 llama.cpp 基准测试](spacemit-k3-llama-cpp-benchmark)，结论是 7B Q4 大概 3.2 t/s 上下，结尾我说"60 TOPS 的 A100 核用不上，因为 SpacemiT 没公开 IME2 工具链"。

**打脸了。** 几天前 Bob Johansson 在 YouTube 上发了 *Running a 30 Billion Parameter AI on a Tiny RISC-V Board*，我看完——他在 Bianbu 上跑同一个包（`llama.cpp-tools-spacemit`），同样命令，跑 30B 模型出 10+ t/s。**他用上了 A100 的 IME2 加速。**

这就尴尬了。我上个月结论写早了。问题来了：为什么他能跑出来，我跑不出来？

## 复现的第一步：抓启动日志

照他视频里那个命令跑 7B，开头 stderr 有这么一段：

```text
CPU_RISCV64_SPACEMIT: tcm is available, blk_size: 393216, blk_num: 8, is_fake_tcm: 0
CPU_RISCV64_SPACEMIT: num_cores: 16, num_perfer_cores: 8, perfer_core_arch_id: a064,
  exclude_main_thread: 0, use_ime1: 0, use_ime2: 1, mem_backend: HPAGE,
  cpu_mask: ff00, aicpu_id_offset: 8
CPU_RISCV64_SPACEMIT: alloc_chunk: open(/dev/tcm_sync_mem) failed, errno=2
```

**重点在最后一行。** 上面那两段是好的：binary 认到了 K3 拓扑、开了 IME2、把 A100 cluster（CPU 8-15，`cpu_mask: 0xff00`）绑成 AI worker pool。**但接着 `/dev/tcm_sync_mem` 打不开（`ENOENT`），它就静悄悄 fallback 到只用 X100 8 核了。**

> pp128 = 7.46 t/s, tg32 = 2.4 t/s。这跟 Bob 那个 10+ t/s 差了一个数量级。

## 我自己排查过的 6 件事

按"是不是我环境配错了"这个角度，一项项排除：

1. **`/dev/tcm` 是有的** —— 老的 V1 API 设备，`crw-rw-rw- 1 root root 10, 260`。✅
2. **`/dev/tcm_sync_mem` 没有** —— IME2 后端要的是 V2 设备，没建出来。❌
3. **Platform driver 绑了** —— `/sys/bus/platform/drivers/tcm/0.tcm` 在，`OF_COMPATIBLE_0=spacemit,k1-tcm`。✅
4. **Devicetree 有 8 个 TCM 节点** —— `cluster0_tcm@c0000`、`cluster1_tcm@2xxxxxx` 这些都在。✅
5. **`libspine_tcm` 库里有 V2 路径** —— `strings` 一下能看到 `/dev/tcm_sync_mem`、`MakeDriverBuffer (v2)`、`tcm_sync_mode_t` 这些符号。✅
6. **`libggml-cpu.so.0.11.1` 里 IME2 的所有 GEMM kernel 都编进去了** —— `gemm_kernel_i8i4`、`moe_m2_gemm_kernel`、`gemm_kernel_i8mxfp4` 一堆符号都在。✅

> 所以**不是** binary 版本不对、不是 libspine_tcm 版本不对、不是 driver 没加载、不是 devicetree 不对。就是内核这块没把 `/dev/tcm_sync_mem` 这个字符设备注册出来。

## 跟 Bob 视频的差异在哪里

我和他用的硬件一样、安装命令一样、跑的模型都在 Qwen 系。**唯一不一样的是内核版本**：

| | 我的 Bianbu 4.0.1 | Bob 的 pre-release 系统 |
|---|---|---|
| 内核 | `6.18.3-generic` | `6.12.16-generic` |
| IME2 路径 | `alloc_chunk: open(/dev/tcm_sync_mem) failed` | 跑通 |
| 7B pp128 | 7.46 t/s | (没具体报这个数) |
| 30B 30B-A3B | 跑得动但慢 | 10+ t/s |

所以结论很明确：**V2 TCM driver 没合到 Bianbu 4.0.1 的 6.18 内核**。Bob 那个 pre-release 镜像里带了，stable 还没。

## 提了个 issue 出去

事情没完，我把整个排查过程、6 项证据、4 个问题写成 issue 提到 `spacemit-com/linux-k3`：

> 🔗 [Issue #6: 在 Bianbu 4.0.1 (kernel 6.18.3-generic) 上 llama.cpp-tools-spacemit 跑不出 A100 加速：缺少 /dev/tcm_sync_mem](https://github.com/spacemit-com/linux-k3/issues/6)

提的 4 个问题：

1. V2 TCM driver 计划在哪个内核版本 / Bianbu release 合入？4.0.1 这条线还会收吗？
2. 有没有一个 Kconfig 选项（比如 `CONFIG_SPACEMIT_TCM_SYNC_MEM`）能手动开？我翻了 `/boot/config-$(uname -r)` 没找到。
3. 如果 patch 只在 `spacemit-com/linux-k3` 的某个分支上、没合到 6.18，告诉我是哪个 branch / commit，我愿意自己 cherry-pick build。
4. `libspine_tcm` 字符串里看到 `posix-shm`、`mmap sync`、`devsync` 几种 sync mode 像是 fallback，有没有什么 env 变量能切到这些模式绕开 `tcm_sync_mem`？我试过 `SPACEMIT_TCM_SYNC_MODE` 和 `SPACEMIT_MEM_BACKEND` 都没动静，可能这俩 env 在缺 `tcm_sync_mem` 的时候根本不生效。

## 临时 workaround

我现在就 `-t 8` 只用 X100 跑——7B Q4 大概 2.4 t/s tg32，比 6 月初测的 3.22 还略快一点（应该是包升级的副作用）。30B-A3B 用 16 GB 内存也跑得动，就是慢。

> 写到最后想说一句：我上个月那篇 benchmark 的结尾写"K3 内部有 8 个 A100 AI 核但 llama.cpp 用不上，因为 SpacemiT 工具链未公开"——这个结论**部分错误**。IME2 的工具链其实是开源的（就在 `spacemit-com/linux-k3` 里），但 Bianbu stable 那条线的内核没把 V2 TCM 驱动合进来，**所以不是"工具链没公开"，而是"内核 driver 没齐"**。这是个有意义的差别。前者遥不可及，后者等一个 patch 就行。

接下来等 SpacemiT 那边回 issue。如果他们给 Kconfig 名字或 commit hash，我会自己 build kernel 试，成功了再回来 update 这篇博客。

