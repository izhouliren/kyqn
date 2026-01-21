---
outline: deep
title: 龙芯固件 20251231 版本发布
description: 介绍龙芯固件 20251231 版本的新功能和改进
---

### 重磅更新

- 支持 MultiArchUefi

### 固件下载

打开下面的地址后，找到 `6000Series/PC` 目录，即可下载龙芯 6000 系列 PC 型号的固件。
- [龙芯固件 20251231 版本下载](https://github.com/loongson/Firmware/tree/main/6000Series/PC)

### 固件安装

1. 下载完成后，将固件文件 `.fd` 解压到一个 BIOS 自动挂载的分区的文件夹中（例如 `/home/username`）。
2. 重启电脑 + 按 F2， 进入 BIOS 设置。
3. 选择安全设置-更新固件-选择文件，找到你存放的 `.fd` 文件，选择它。
4. 回车，再输入 `Y` 确认更新。
5. 确认更新，等待更新完成。
