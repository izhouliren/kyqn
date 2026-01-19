---
outline: deep
title: EndeavourOS 安装初始化脚本
description: EndeavourOS安装初始化脚本的使用方法和注意事项
---
`ezendeavouros_post_install.sh` - 是一个用于配置 EndevaourOS 的脚本。EndevaourOS 是一个基于 Arch Linux 的发行版。在安装后还要花精力进行配置，才能使系统更加易用。脚本对这些配置进行了自动化处理，包括：

- 设置系统语言为中文
- 安装中文字体
- 安装和配置 Fcitx5 输入法框架

### 用法：
- 下载脚本：`wget https://gitcode.com/ozhouliren/mlga/blob/main/ezendeavouros_post_install.sh`
- 运行脚本：`bash ./ezendeavouros_post_install.sh`
