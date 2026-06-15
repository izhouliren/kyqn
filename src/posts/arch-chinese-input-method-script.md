---
title: 一键配好 Arch Linux 的中文输入法
date: 2026-06-15
tags: [linux, arch, fcitx5, 脚本]
---

装 Arch 系发行版（Arch / Manjaro / EndeavourOS / CachyOS）有一个绕不开的坎：

**怎么让系统从「全英文 + 没法输入中文」变成「能显示中文 + 能用拼音/双拼/五笔」？**

每次新装系统，我都在 locale、字体、fcitx5、环境变量这几个坑里来回摔。摔够了以后，我把整套流程写成了一个脚本，一行命令跑完。

## 痛点拆解

装完 Arch 默认是不能愉快打中文的，至少要解决三件事：

1. **locale**：默认 `en_US.UTF-8`，要开启 `zh_CN.UTF-8` 并设置 `LANG`，否则终端报错、tty 显示方块
2. **字体**：很多程序不带中文字体（Qt 应用、部分终端），要装 CJK 字体包
3. **输入法**：fcitx5 装好后还要设四个环境变量（`GTK_IM_MODULE` / `QT_IM_MODULE` / `XMODIFIERS` / `INPUT_METHOD` / `SDL_IM_MODULE`），不设就调不出来

尤其是第三条，新手最大的坑。**装完 fcitx5 重启发现按 Ctrl+Space 没反应**——99% 是环境变量没设对。

## 解决方案

我把上面三件事打包成一个脚本：[`language_ime_setup_arch.sh`](https://github.com/izhouliren/mkarkezuz/blob/main/language_ime_setup_arch.sh)

**用法：**

```bash
git clone https://github.com/izhouliren/mkarkezuz.git
cd mkarkezuz
sudo bash language_ime_setup_arch.sh
```

跑完会提示「重启 KDE 会话或注销登录后生效」。重新登录就能用 `Ctrl+Space` 切出 fcitx5。

## 脚本做了什么

```bash
#!/bin/bash

# arch wiki 简体中文本地化文档：https://wiki.archlinuxcn.org/wiki/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%E6%9C%AC%E5%9C%B0%E5%8C%96
# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then
    echo "请以 root 权限运行此脚本。"
    exit 1
fi

# 获取当前登录用户的用户名
CURRENT_USER=$(logname)
# 获取当前登录用户的主目录
USER_HOME=$(eval echo "~$CURRENT_USER")

# 配置 locale.gen
if ! sed -i 's/#zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen; then
    echo "修改 locale.gen 文件失败。"
    exit 1
fi

# 生成 locale
if ! locale-gen; then
    echo "生成 locale 失败。"
    exit 1
fi

# 设置系统语言
if ! echo "LANG=zh_CN.UTF-8" > /etc/locale.conf; then
    echo "写入 /etc/locale.conf 文件失败。"
    exit 1
fi
export LANG=zh_CN.UTF-8

# 定义中文字体包列表
chinese_font_packages=(noto-fonts-cjk adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts wqy-microhei wqy-microhei-lite wqy-bitmapfont wqy-zenhei ttf-arphic-ukai ttf-arphic-uming)

# 逐个安装中文字体包
for font_pkg in "${chinese_font_packages[@]}"; do
    if ! pacman -S --noconfirm "$font_pkg"; then
        echo "安装中文字体包 $font_pkg 失败。"
        exit 1
    fi
done

# 安装 Fcitx5 及相关官方仓库软件包
fcitx_packages=(fcitx5 fcitx5-chinese-addons fcitx5-qt fcitx5-gtk fcitx5-configtool fcitx5-lua)
for pkg in "${fcitx_packages[@]}"; do
    if ! pacman -S --noconfirm "$pkg"; then
        echo "安装官方仓库软件包 $pkg 失败。"
        exit 1
    fi
done

# 创建环境配置目录（如果不存在）
mkdir -p "$USER_HOME/.config/environment.d"

# 写入环境变量到配置文件
cat > "$USER_HOME/.config/environment.d/im.conf" <<EOF
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
INPUT_METHOD=fcitx
SDL_IM_MODULE=fcitx
EOF

echo "环境变量已成功写入 $USER_HOME/.config/environment.d/im.conf"
echo "请注意：需要重新启动KDE会话或注销登录后生效！"
echo "系统语言已成功修改为中文，中文字体、Fcitx5 中文输入法及相关工具已安装。"
```

## 逐段解释

### 1. 检查 root + 拿到当前用户

```bash
if [ "$EUID" -ne 0 ]; then
    echo "请以 root 权限运行此脚本。"
    exit 1
fi

CURRENT_USER=$(logname)
USER_HOME=$(eval echo "~$CURRENT_USER")
```

`logname` 拿到的是**实际登录的用户名**（不是 `whoami`——`whoami` 在 `sudo` 下会返回 root），这样后面写 `~/.config/...` 才知道写哪个用户的主目录。

### 2. Locale 三连

```bash
sed -i 's/#zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen
locale-gen
echo "LANG=zh_CN.UTF-8" > /etc/locale.conf
```

- `sed` 把 `/etc/locale.gen` 里注释掉的 `zh_CN.UTF-8` 行打开
- `locale-gen` 生成 locale 二进制
- 写 `/etc/locale.conf` 让系统级生效

### 3. 9 个中文字体包

```bash
chinese_font_packages=(noto-fonts-cjk adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts
    wqy-microhei wqy-microhei-lite wqy-bitmapfont wqy-zenhei
    ttf-arphic-ukai ttf-arphic-uming)
```

覆盖了**无衬线 / 衬线 / 像素 / 港台繁体** 4 大场景。装多一点不亏，反正 Arch 字体包加起来也就 ~150MB。

> 如果你磁盘紧张，最少只装 `noto-fonts-cjk`（Google+Adobe 联合）+ `wqy-microhei`（文泉驿微米黑）就够了。

### 4. Fcitx5 全家桶

```bash
fcitx_packages=(fcitx5 fcitx5-chinese-addons fcitx5-qt fcitx5-gtk fcitx5-configtool fcitx5-lua)
```

- `fcitx5` — 主程序
- `fcitx5-chinese-addons` — **拼音/双拼/五笔等中文输入方案**（必装）
- `fcitx5-qt` / `fcitx5-gtk` — Qt / GTK 程序支持
- `fcitx5-configtool` — 图形化配置（`fcitx5-configtool` 命令）
- `fcitx5-lua` — Lua 扩展（rime 等需要）

### 5. 环境变量（最关键的坑）

```bash
cat > "$USER_HOME/.config/environment.d/im.conf" <<EOF
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
INPUT_METHOD=fcitx
SDL_IM_MODULE=fcitx
EOF
```

**写 `~/.config/environment.d/` 而不是 `~/.bashrc`**，因为：

- environment.d 是 **systemd 用户级环境变量**，所有 GUI 程序启动时都会读
- 写 `~/.bashrc` 只对 bash 终端有效，GUI 应用读不到
- KDE / GNOME 都认这个目录

> ⚠️ 写完必须**重新登录**或**重启 KDE 会话**才生效。注销一次就行。

## 适用与不适用

✅ **适用**：
- Arch Linux
- Manjaro
- EndeavourOS
- CachyOS
- 其他 Arch 衍生版（用 `pacman` 的）

❌ **不适用**：
- Debian / Ubuntu（用 apt，命令不同）
- Fedora / RHEL（用 dnf）
- NixOS（声明式配置，思路不一样）

其他发行版的版本以后再写。

## 仓库地址

[github.com/izhouliren/mkarkezuz](https://github.com/izhouliren/mkarkezuz)

只有一个 commit，一个文件，100 来行。觉得有用就点个 star。
