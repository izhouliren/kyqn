---
title: Linux Kernel 贡献数据可视化
date: 2026-06-14
tags: [viz, linux, vercel]
---

把 Linux 内核的 commit 贡献数据可视化了：[linux-kernel-viz.vercel.app](https://linux-kernel-viz.vercel.app/)

## 数据

- 18,064 行 CSV，112 个内核版本
- 远程仓库：[github.com/izhouliren/helloworld](https://github.com/izhouliren/helloworld)
- 数据来源：从 git log 抓 + 手动校对

## 技术栈

- Vite 8（不引 React/Vue）
- ECharts 5（图表）
- Web Worker 解析 CSV（不卡主线程）

## 主要设计

下拉框 → 横向版本标签栏（112 个版本，**不折迭**）。

```js
// 核心：版本标签栏 + 图表
function renderVersion(version, companyType) {
  const data = aggregateByCompany(commits[version], companyType);
  const chart = echarts.init(canvas);
  chart.setOption({
    grid: { left: 100, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map(d => d.name) },
    series: [{ type: 'bar', data: data.map(d => d.count), barWidth: 14 }],
  });
}
```

## Tab 切换：ALL vs CN

- `ALL` 显示全球前 30 家企业
- `CN` 显示中国前 10 家
- 切换时重置 input 的上下限

## 踩过的坑

1. **Vite HMR 不刷新组件** — `main.js` 改了必须 `Ctrl+Shift+R` 硬刷
2. **CSV 字段含逗号** — `"Rowland Institute, Harvard"` 这种必须按字符遍历处理引号状态
3. **ECharts 高度不自动重排** — 切高度时必须 `style.height='auto'` 再 `resize()` 再设
4. **Google Fonts 国内被墙** — fallback 链要备好（PingFang SC, Microsoft YaHei）

## Vercel 部署

零配置，Vite 是 Vercel 的预设框架。Import 仓库后自动 build + 部署，5 秒完成。

## 完整项目

[github.com/izhouliren/linux-kernel-viz](https://github.com/izhouliren/linux-kernel-viz)
