# Harness 工程迭代：多 Agent 系统从 Demo 到生产的 10 轮进化

> 从一个能跑的多 Agent Demo 出发，用 10 轮 Harness 迭代，逐步拆解「可控、可扩展、可恢复」的工程路径。

## 🎯 这是什么

一份关于 Harness 工程的系统性思考——以多 Agent 金融研究系统为案例，逐轮回答：

- 一个基础 Agent Loop 能做什么、不能做什么
- 每一轮迭代解决了什么问题、引入了什么新约束
- 从「能跑」到「能用」之间，工程上到底需要走多少步

## 📐 内容结构

| 章节 | 主题 | 核心问题 |
|------|------|---------|
| v0 | 基础 Agent 出厂配置 | 没有 Harness 的最朴素形态是什么？ |
| v1 | 工具分发与安全沙箱 | 工具怎么安全地接入和扩展？ |
| v2 | 权限管线 | 金融数据敏感，怎么分级管控？ |
| v3 | Hooks 扩展机制 | 循环膨胀怎么办？ |
| v4 | 规划与待办管理 | 多 Agent 怎么同步状态？ |
| v5 | Skill 按需知识加载 | 上下文窗口有限，知识怎么按需注入？ |
| v6 | 上下文压缩 | 长流程怎么不溢出？ |
| v7 | 记忆系统 | 用户偏好怎么跨会话保留？ |
| v8 | System Prompt 运行时组装 | 5 个 Agent 怎么共用一套框架？ |
| v9 | 错误恢复与韧性 | API 超时、级联故障怎么处理？ |
| v10 | 子 Agent 与上下文隔离 | 执行细节怎么不污染调度层？ |

## 🛠 技术栈

- 纯静态 HTML，零构建依赖
- [Marked.js](https://github.com/markedjs/marked) — Markdown 渲染
- [Mermaid](https://mermaid.js.org/) — 架构图与时序图
- [Prism.js](https://prismjs.com/) — 代码高亮
- 响应式布局，支持深色模式

## 🔗 Live Demo

[在线访问 →](https://your-demo-url.vercel.app)

## 📸 截图

![总览页](screenshot-overview.png)

---
