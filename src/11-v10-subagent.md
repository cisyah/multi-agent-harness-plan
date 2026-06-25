# Harness 迭代 10：子 Agent 与上下文隔离（v10）

## 11.1 可优化点

Agent 工作越久，messages 数组越臃肿。Data Collector 读了 20 份财报、执行了 50 次工具调用，每次读文件、跑命令的输出都永久留在上下文里。Report Writer 根本不需要这些详细的执行记录——它只需要采集结果的摘要。

在金融研究多 Agent 场景中，这个问题更加严重：
- **Data Collector 的详细上下文污染 Orchestrator**：Orchestrator 的上下文里塞满了财报原文、网页 HTML、Shell 输出，挤占了调度和决策的空间
- **Report Writer 被无关信息干扰**：写作 Agent 需要专注分析逻辑，但上下文里残留着数据采集的原始数据
- **不同研究主题之间的上下文串扰**：上次研究茅台的上下文残留，影响本次宁德时代的分析
- **子 Agent 的失败影响父 Agent**：Data Collector 执行了 30 轮后失败，Orchestrator 的上下文被污染且无法恢复

**子 Agent 应该用独立的 messages[] 启动，不污染父对话。**

## 11.2 Harness 策略

| 策略 | 说明 |
|------|------|
| **子 Agent 封装** | Orchestrator 有一个 `task` 工具，Subagent 拥有除 `task` 外的所有基础工具（禁止递归生成） |
| **独立上下文** | Subagent 以 `messages=[]` 启动，运行自己的循环。只有最终文本返回给 Orchestrator |
| **结果摘要** | Subagent 可能跑了 30+ 次工具调用，但整个消息历史直接丢弃。Orchestrator 收到的只是一段摘要文本 |

## 11.3 迭代后的描述（v10）

**【金融研究多 Agent 系统 v10 — 子 Agent 与上下文隔离】**

**（在 v9 基础上新增/变更）**

**子 Agent 封装**：

```python
PARENT_TOOLS = CHILD_TOOLS + [
    {"name": "task",
     "description": "Spawn a subagent with fresh context.",
     "input_schema": {
         "type": "object",
         "properties": {
             "prompt": {"type": "string"},
             "agent_role": {"type": "string", "enum": ["collector", "sentiment", "analyst", "writer", "compliance"]},
         },
         "required": ["prompt", "agent_role"],
     }},
]
```

**独立上下文**：

```python
def run_subagent(prompt: str, agent_role: str) -> str:
    # 每个子 Agent 独立的 System Prompt
    system = get_system_prompt(agent_role, context)
    sub_messages = [{"role": "user", "content": prompt}]


    for _ in range(30):  # safety limit
        response = client.messages.create(
            model=MODEL, system=system,
            messages=sub_messages,
            tools=CHILD_TOOLS, max_tokens=8000,
        )
        sub_messages.append({"role": "assistant",
                             "content": response.content})
        if response.stop_reason != "tool_use":
            break
        results = []
        for block in response.content:
            if block.type == "tool_use":
                handler = TOOL_HANDLERS.get(block.name)
                output = handler(**block.input)
                results.append({"type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(output)[:50000]})
        sub_messages.append({"role": "user", "content": results})


    # 只返回摘要文本，整个消息历史丢弃
    return "".join(
        b.text for b in response.content if hasattr(b, "text")
    ) or "(no summary)"
```

**金融研究场景的上下文隔离策略**：

| Agent | 上下文内容 | 隔离策略 |
|-------|-----------|---------|
| Orchestrator | 任务调度、子 Agent 结果摘要、全局状态 | 核心，保持精简 |
| Data Collector | 财报原文、AKShare 返回、Shell 输出 | 隔离为子 Agent，只返回摘要 |
| Sentiment Agent | 新闻原文、Tavily 返回、情感分析 | 隔离为子 Agent，只返回摘要 |
| Market Analyst | 技术指标、分析推理、LLM 输出 | 隔离为子 Agent，只返回摘要 |
| Report Writer | 报告草稿、编辑历史、write_file 输出 | 隔离为子 Agent，只返回摘要 |
| Compliance Agent | 合规检查、问题列表、LLM 输出 | 隔离为子 Agent，只返回摘要 |

**结果摘要格式**：

```
[Subagent: Data Collector]
任务：采集 600519 (茅台) 的财务数据
结果：
- 公司：贵州茅台酒股份有限公司
- 市值：¥2.5万亿
- PE：28.5
- PB：8.3
- 营收(2024Q1)：¥458亿 (同比+18%)
- 净利润(2024Q1)：¥220亿 (同比+15%)
- 数据来源：AKShare
- 数据完整性：已校验，无缺失
```

---

## 11.4 子 Agent 与上下文隔离架构

```mermaid
sequenceDiagram
    participant U as 用户
    participant O as Orchestrator (干净上下文)
    participant DC as Data Collector (独立上下文)
    participant SA as Sentiment Agent (独立上下文)
    participant MA as Market Analyst (独立上下文)
    participant RW as Report Writer (独立上下文)
    participant CA as Compliance Agent (独立上下文)

    U->>O: 提交股票代码
    O->>O: 推理决策

    Note over O: Orchestrator 上下文：<br/>- 用户输入的股票代码<br/>- 任务状态摘要<br/>- 子 Agent 进度摘要

    O->>DC: task("采集 600519 财务数据", agent_role="collector")
    Note over DC: Data Collector 独立上下文：<br/>- akshare_tool 返回<br/>- read_file 内容<br/>- bash 输出
    DC->>DC: 执行 30+ 轮工具调用
    DC-->>O: 返回摘要：<br/>"市值 ¥2.5万亿，<br/>营收 ¥458亿，<br/>净利润 ¥220亿"
    Note over DC: 完整消息历史丢弃

    O->>SA: task("分析 600519 舆情", agent_role="sentiment")
    Note over SA: Sentiment Agent 独立上下文：<br/>- tavily_search 返回<br/>- LLM 情感分析<br/>- 新闻原文
    SA->>SA: 执行多轮搜索和分析
    SA-->>O: 返回摘要：<br/>"情感评分 0.6，<br/>关键话题： earnings, growth"
    Note over SA: 完整消息历史丢弃

    O->>MA: task("综合分析 600519", agent_role="analyst")<br/>+ CollectedData + SentimentAnalysis
    Note over MA: Market Analyst 独立上下文：<br/>- 技术指标计算<br/>- LLM 综合分析<br/>- 投资建议
    MA->>MA: 执行分析和推理
    MA-->>O: 返回摘要：<br/>"建议：买入，<br/>目标价：¥1800，<br/>风险等级：中等"
    Note over MA: 完整消息历史丢弃

    O->>RW: task("撰写 600519 报告", agent_role="writer")<br/>+ 全部上游数据
    Note over RW: Report Writer 独立上下文：<br/>- 报告草稿<br/>- 编辑历史<br/>- write_file 输出
    RW->>RW: 执行多轮写作
    RW-->>O: 返回报告片段
    Note over RW: 完整消息历史丢弃

    O->>CA: task("审查 600519 报告合规性", agent_role="compliance")<br/>+ InvestmentReport
    Note over CA: Compliance Agent 独立上下文：<br/>- 合规检查<br/>- 问题列表<br/>- LLM 输出
    CA->>CA: 执行合规审查
    CA-->>O: 返回合规结果：<br/>"合规评分：92/100，<br/>通过"
    Note over CA: 完整消息历史丢弃

    O->>O: 整合 FinalReport
    O-->>U: 输出最终研究报告
```
