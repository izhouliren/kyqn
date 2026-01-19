---
outline: deep
title: CachyOS 安装初始化脚本
description: CachyOS安装初始化脚本的使用方法和注意事项
---

`ezcachyos_install.sh` - 是一个用于配置 CachyOS 的脚本。CachyOS 是一个基于 Arch Linux 的发行版，它的特点就是极致的优化。但是对于中国用户来说，CachyOS的安装体验并不好，CachyOS 的安装程序存在一些问题：

- `cachyos-rate-mirrors` 这个脚本用于获取 CachyOS 的镜像站，但是它的评分算法存在问题，导致获取 Arch Linux 的镜像站时，无法正确获得中国镜像站点的地址，导致安装极慢，甚至无法安装。
- `cachyos-hello` 安装程序在安装时无法绕过`cachyos-rate-mirrors` ,导致系统安装时无法选择中国镜像站，导致安装极慢，甚至无法安装。
- `ezcachyos_install.sh` 通过手动设置 `mirrorlist` 来解决上面提到的这两个问题。

### 用法

- 下载脚本：`wget https://gitcode.com/ozhouliren/mlga/ezcachyos_install.sh`
- 运行脚本：`bash ./ezcachyos_install.sh`
- 适用于 CachyOS 251129 版本。
