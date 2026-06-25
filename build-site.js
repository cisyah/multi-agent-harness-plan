const fs = require("fs");
const path = require("path");

const root = __dirname;
const files = [
  "00-background.md",
  "01-v0.md",
  "02-v1-tool-dispatch.md",
  "03-v2-permission.md",
  "04-v3-hooks.md",
  "05-v4-todo.md",
  "06-v5-skill.md",
  "07-v6-compact.md",
  "08-v7-memory.md",
  "09-v8-system-prompt.md",
  "10-v9-error-recovery.md",
  "11-v10-subagent.md",
  "12-appendix.md",
];

function stripOriginalToc(markdown) {
  return markdown.replace(/\n---\n\n## 目录[\s\S]*?\n---\n\n/, "\n\n");
}

function removeHorizontalRules(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.trim() !== "---")
    .join("\n");
}

function removeRoadmapReferenceColumn(markdown) {
  const lines = markdown.split("\n");
  let inRoadmapTable = false;

  return lines
    .map((line) => {
      if (line.startsWith("| 轮次 | 章节 | Harness 组件 | 对应参考资料 |")) {
        inRoadmapTable = true;
      }

      if (!inRoadmapTable || !line.startsWith("|")) {
        if (inRoadmapTable && !line.startsWith("|")) inRoadmapTable = false;
        return line;
      }

      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 7) return line;
      const next = [parts[1], parts[2], parts[3], parts[5]];
      return `| ${next.join(" | ")} |`;
    })
    .join("\n");
}

function convertAppendixDataFlow(markdown) {
  const original = [
    "**数据流说明**：",
    "",
    "```",
    "User → StockQuery(ticker, period, language)",
    "  → Orchestrator 调度",
    "    → [Fan-out] Data Collector  → CollectedData",
    "    → [Fan-out] Sentiment Agent → SentimentAnalysis",
    "    → [等待 Stage1 完成]",
    "    → [Pipeline] Market Analyst(CollectedData, SentimentAnalysis) → MarketAnalysis",
    "    → [Pipeline] Report Writer(CollectedData, SentimentAnalysis, MarketAnalysis) → InvestmentReport",
    "    → [Pipeline] Compliance Agent(InvestmentReport, CollectedData) → ComplianceReport",
    "    → FinalReport(report, compliance, data, sentiment, market)",
    "  → 输出报告 (PDF + Markdown + JSON)",
    "```",
  ].join("\n");

  const replacement = [
    "**数据流说明**：",
    "",
    "```mermaid",
    "flowchart TD",
    "    User[\"User\"] --> Query[\"StockQuery<br/>ticker / period / language\"]",
    "    Query --> Orchestrator[\"Orchestrator 调度\"]",
    "    Orchestrator --> Fanout{\"Stage 1<br/>Fan-out 并行\"}",
    "    Fanout --> DC[\"Data Collector<br/>CollectedData\"]",
    "    Fanout --> SA[\"Sentiment Agent<br/>SentimentAnalysis\"]",
    "    DC --> Wait[\"等待 Stage 1 完成\"]",
    "    SA --> Wait",
    "    Wait --> MA[\"Market Analyst<br/>MarketAnalysis\"]",
    "    MA --> RW[\"Report Writer<br/>InvestmentReport\"]",
    "    RW --> CA[\"Compliance Agent<br/>ComplianceReport\"]",
    "    CA --> Final[\"FinalReport<br/>report / compliance / data / sentiment / market\"]",
    "    Final --> Output[\"输出报告<br/>PDF + Markdown + JSON\"]",
    "```",
  ].join("\n");

  return markdown.replace(original, replacement);
}

function cleanChapter(file, markdown) {
  let cleaned = markdown.replace(/\r\n/g, "\n").trim();
  if (file === "00-background.md") {
    cleaned = stripOriginalToc(cleaned);
  }
  if (file === "08-v7-memory.md") {
    cleaned = cleaned
      .replace("按 filename/description 匹配", "按名称/描述匹配")
      .replace("选出相关的文件名，再读文件内容注入上下文", "选出相关记忆，再读取内容注入上下文");
  }
  if (file === "12-appendix.md") {
    cleaned = removeRoadmapReferenceColumn(cleaned);
    cleaned = convertAppendixDataFlow(cleaned);
    cleaned = cleaned.replace(
      "Kimi 的 JD 中点出了 Harness 需要解决的四个核心问题：",
      "Harness 工程需要解决的四个核心问题可以归纳为：",
    );
  }
  cleaned = removeHorizontalRules(cleaned);
  return cleaned;
}

const documentMarkdown = files
  .map((file) => cleanChapter(file, fs.readFileSync(path.join(root, file), "utf8")))
  .join("\n\n");

const escapedMarkdown = JSON.stringify(documentMarkdown).replace(/<\/script/gi, "<\\/script");
const pageTitle = "Multi-Agent股票研究助手的Harness迭代方案";
const pageDescription = "以 Multi-Agent 股票研究助手为主线，逐轮呈现 Harness 工程迭代方案。";

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <style>
    :root {
      color-scheme: light;
      --bg: #ffffff;
      --bg-soft: #f6f7f9;
      --bg-elevated: #ffffff;
      --text: #111114;
      --text-soft: #51525a;
      --text-muted: #777985;
      --border: #e4e6eb;
      --border-strong: #cfd3dc;
      --code-bg: #0e1525;
      --code-border: #263248;
      --code-text: #d8e4f2;
      --link: #2563eb;
      --link-underline: #93c5fd;
      --blue: #2563eb;
      --blue-soft: #eff6ff;
      --green: #059669;
      --green-soft: #ecfdf5;
      --amber: #d97706;
      --amber-soft: #fffbeb;
      --red: #dc2626;
      --red-soft: #fef2f2;
      --violet: #7c3aed;
      --violet-soft: #f5f3ff;
      --diagram-bg: #fafbfc;
      --diagram-panel: #f8fafc;
      --diagram-stroke: #94a3b8;
      --shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
      --radius: 5px;
      --header-h: 58px;
      --shell: 1240px;
      --sidebar: 282px;
      --article: 840px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 82px;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text-soft);
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      font-size: 16px;
      line-height: 1.72;
      overflow-x: hidden;
    }

    a {
      color: var(--link);
      text-decoration-color: var(--link-underline);
      text-underline-offset: 3px;
    }

    button {
      font: inherit;
    }

    .skip-link {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 200;
      transform: translateY(-140%);
      border-radius: 4px;
      background: var(--text);
      color: var(--bg);
      padding: 8px 12px;
      font-size: 13px;
    }

    .skip-link:focus {
      transform: translateY(0);
    }

    .progress {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 120;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, var(--blue), var(--green));
      transform: scaleX(0);
      transform-origin: left center;
    }

    .site-header {
      position: sticky;
      top: 0;
      z-index: 90;
      height: var(--header-h);
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: blur(14px);
    }

    .header-inner {
      display: flex;
      align-items: center;
      gap: 18px;
      max-width: var(--shell);
      height: 100%;
      margin: 0 auto;
      padding: 0 22px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 0 1 auto;
      min-width: 260px;
      overflow: hidden;
      color: var(--text);
      font-size: 15px;
      font-weight: 760;
      letter-spacing: 0;
    }

    .brand-mark {
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: var(--radius);
      background: var(--text);
      color: var(--bg);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      font-weight: 800;
      text-transform: lowercase;
    }

    .brand-text {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-wrap: anywhere;
    }

    .header-note {
      margin-left: auto;
      color: var(--text-muted);
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-button {
      display: none;
      align-items: center;
      justify-content: center;
      min-width: 54px;
      height: 32px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-elevated);
      color: var(--text-soft);
      cursor: pointer;
      font-size: 13px;
      font-weight: 650;
    }

    .shell {
      display: grid;
      grid-template-columns: minmax(248px, var(--sidebar)) minmax(0, var(--article));
      gap: 42px;
      max-width: var(--shell);
      margin: 0 auto;
      padding: 34px 22px 72px;
      align-items: start;
      justify-content: start;
    }

    .sidebar {
      position: sticky;
      top: calc(var(--header-h) + 24px);
      align-self: start;
      max-height: calc(100vh - var(--header-h) - 40px);
      overflow: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .sidebar::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .sidebar-group {
      margin-bottom: 22px;
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0 0 6px;
      color: var(--text-muted);
      font-size: 10.5px;
      font-weight: 750;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--blue);
    }

    .dot.green { background: var(--green); }
    .dot.amber { background: var(--amber); }
    .dot.red { background: var(--red); }
    .dot.violet { background: var(--violet); }

    .nav-list {
      display: grid;
      gap: 3px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .nav-list li {
      margin: 0;
    }

    .chapter-link {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      min-height: 32px;
      padding: 6px 6px;
      border-radius: var(--radius);
      color: var(--text-muted);
      font-size: 12.5px;
      line-height: 1.32;
      text-decoration: none;
      transition: background 0.16s ease, color 0.16s ease;
    }

    .chapter-link:hover,
    .chapter-link.active {
      background: var(--bg-soft);
      color: var(--text);
    }

    .nav-index {
      flex: 0 0 auto;
      color: var(--text-muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      font-weight: 650;
    }

    .chapter-title-link {
      flex: 1 1 auto;
      min-width: 0;
      color: inherit;
      font-weight: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      text-decoration: none;
      white-space: nowrap;
    }

    main {
      min-width: 0;
    }

    .content {
      min-width: 0;
    }

    .article-shell {
      width: 100%;
      max-width: var(--article);
    }

    .hero {
      margin-bottom: 34px;
      padding-bottom: 26px;
      border-bottom: 1px solid var(--border);
    }

    .overview {
      margin: 0 0 52px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--bg-soft);
      color: var(--text-soft);
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0;
    }

    .overview h1 {
      max-width: 760px;
      margin: 18px 0 12px;
      color: var(--text);
      font-size: clamp(30px, 3.4vw, 42px);
      line-height: 1.04;
      font-weight: 800;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }

    .dek {
      max-width: 760px;
      margin: 0;
      color: var(--text-soft);
      font-size: 18px;
      line-height: 1.72;
    }

    .page-overview {
      padding-top: 0;
    }

    .overview-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .overview-title-row h2 {
      margin: 0;
      color: var(--text);
      font-size: 24px;
      line-height: 1.22;
      font-weight: 800;
    }

    .overview-version {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      border-radius: var(--radius);
      background: var(--bg-soft);
      color: var(--text-soft);
      padding: 4px 9px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 13px;
      font-weight: 760;
      line-height: 1;
    }

    .overview-subtitle {
      max-width: 700px;
      margin: 0;
      color: var(--text-soft);
      font-size: 15px;
      line-height: 1.72;
    }

    .overview-quote {
      margin: 16px 0 0;
      border-left: 4px solid color-mix(in srgb, var(--blue) 58%, var(--green));
      padding: 0 0 0 14px;
      color: var(--text-soft);
    }

    .overview-quote p {
      margin: 0;
      font-size: 15px;
      line-height: 1.72;
    }

    .overview-quote em {
      color: var(--text);
      font-style: italic;
      font-weight: 650;
    }

    .overview-sections {
      display: grid;
      gap: 28px;
      margin-top: 30px;
    }

    .overview-block h3,
    .overview-map h3,
    .jump-index-title {
      margin: 0 0 10px;
      color: var(--text);
      font-size: 19px;
      line-height: 1.35;
      font-weight: 800;
    }

    .jump-index-title {
      font-size: 24px;
      line-height: 1.22;
    }

    .overview-block p {
      margin: 0;
      color: var(--text-soft);
      font-size: 15px;
      line-height: 1.72;
    }

    .insight-list {
      display: grid;
      gap: 8px;
      margin: 12px 0 0;
      padding-left: 22px;
      color: var(--text-soft);
      font-size: 15px;
      line-height: 1.72;
    }

    .insight-list li {
      padding-left: 0;
    }

    .overview-map {
      min-width: 0;
    }

    .jump-index-block {
      scroll-margin-top: calc(var(--header-h) + 22px);
    }

    .jump-index {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-soft);
      padding: 18px 20px 20px;
    }

    .toc-grid,
    .toc-chapter ul {
      display: grid;
      gap: 5px;
      margin: 0;
      padding: 0 0 0 4px;
      list-style: none;
    }

    .toc-chapter {
      margin: 0;
    }

    .jump-link {
      display: grid;
      grid-template-columns: 14px 34px minmax(0, 1fr);
      align-items: baseline;
      gap: 8px;
      padding: 1px 0;
      color: var(--text-soft);
      font-size: 15px;
      line-height: 1.5;
      text-decoration: none;
      transition: color 0.16s ease;
    }

    .jump-link::before {
      content: "";
      width: 6px;
      height: 6px;
      margin-top: 0.7em;
      border-radius: 999px;
      background: var(--text-muted);
      opacity: 0.76;
    }

    .jump-link:hover,
    .jump-link:hover .jump-no {
      color: var(--blue);
    }

    .jump-link:hover::before {
      background: var(--blue);
      opacity: 1;
    }

    .jump-no {
      color: var(--text-muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      font-weight: 760;
      transition: color 0.16s ease;
    }

    .toc-chapter ul {
      margin: 3px 0 10px 56px;
      padding: 0;
    }

    .toc-chapter ul .jump-link {
      grid-template-columns: 12px minmax(0, 1fr);
      font-size: 13px;
    }

    .toc-chapter ul .jump-no {
      display: none;
    }

    .article {
      max-width: var(--article);
      color: var(--text-soft);
      font-size: 15px;
      line-height: 1.72;
    }

    .article h1,
    .article h2,
    .article h3,
    .article h4 {
      color: var(--text);
      letter-spacing: 0;
      scroll-margin-top: calc(var(--header-h) + 22px);
    }

    .article h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 56px 0 16px;
      padding-top: 0;
      font-size: 24px;
      line-height: 1.22;
      font-weight: 800;
    }

    .article h1:first-child {
      margin-top: 0;
    }

    .section-no {
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      width: 42px;
      height: 34px;
      border-radius: var(--radius);
      background: var(--bg-soft);
      color: var(--text-soft);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      font-weight: 800;
    }

    .article h2 {
      margin: 32px 0 10px;
      font-size: 19px;
      line-height: 1.35;
      font-weight: 800;
    }

    .article h3 {
      margin: 28px 0 10px;
      font-size: 17px;
      line-height: 1.35;
      font-weight: 750;
    }

    .article p {
      margin: 10px 0;
      color: var(--text-soft);
    }

    .article .revision-note {
      margin: 6px 0 16px;
      border-left: 2px solid #c3c8d0;
      padding: 5px 0 5px 12px;
      color: #626b7a;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.55;
    }

    .article .revision-note strong {
      color: inherit;
      font-weight: 500;
    }

    .article blockquote {
      position: relative;
      margin: 20px 0;
      border: 0;
      border-radius: 6px;
      background: linear-gradient(105deg, #f1f7fd 0%, #f2fcf6 100%);
      padding: 24px 28px 24px 42px;
      overflow: hidden;
    }

    .article blockquote::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 3px;
      background: linear-gradient(180deg, #408cf4 0%, #13bfa8 100%);
    }

    .article blockquote p {
      margin: 0;
      color: #273fa9;
      font-size: 15px;
      font-weight: 650;
      line-height: 1.72;
    }

    .article hr {
      height: 1px;
      border: 0;
      margin: 28px 0;
      background: var(--border);
    }

    .article ul,
    .article ol {
      padding-left: 24px;
    }

    .article li + li {
      margin-top: 4px;
    }

    .article strong {
      color: var(--text);
      font-weight: 700;
    }

    .article code:not(pre code) {
      padding: 1px 5px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--bg-soft);
      color: color-mix(in srgb, var(--blue) 78%, var(--text));
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
      font-weight: 500;
      line-height: 1.7;
    }

    .code-shell {
      position: relative;
      margin: 16px 0;
    }

    .code-label {
      position: absolute;
      top: 9px;
      left: 12px;
      z-index: 1;
      color: #dbeafe;
      font-size: 10px;
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;
    }

    .copy-code {
      position: absolute;
      top: 9px;
      right: 9px;
      z-index: 2;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #dbeafe;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      padding: 5px 7px;
      transition: border-color 0.16s ease, background 0.16s ease;
    }

    .copy-code:hover {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.16);
    }

    pre {
      overflow: auto;
      margin: 0;
      padding: 36px 18px 18px;
      border: 1px solid var(--code-border);
      border-radius: var(--radius);
      background: var(--code-bg);
      color: var(--code-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 13px;
      line-height: 1.58;
    }

    pre code {
      padding: 0;
      background: transparent;
      font-family: inherit;
    }

    .table-wrap {
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    table {
      width: 100%;
      min-width: 620px;
      border-collapse: collapse;
      font-size: 13px;
      line-height: 1.55;
      background: #fff;
    }

    th,
    td {
      padding: 11px 13px;
      border-bottom: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
    }

    th {
      background: var(--bg-soft);
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 800;
    }

    td {
      color: var(--text-soft);
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .mermaid-wrap {
      margin: 20px 0;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--diagram-bg);
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
      overflow: hidden;
    }

    .diagram-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      background: var(--diagram-panel);
      padding: 10px 12px;
      color: #334155;
      font-size: 12px;
      font-weight: 750;
    }

    .diagram-scroll {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
    }

    .mermaid {
      width: 100%;
      min-width: 680px;
      padding: 22px;
      text-align: center;
      background: var(--diagram-bg);
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }

    .mermaid svg {
      display: inline-block;
      width: auto;
      max-width: 100% !important;
      height: auto;
    }

    .load-error {
      padding: 16px;
      border: 1px solid #fecaca;
      border-radius: var(--radius);
      background: #fef2f2;
      color: #991b1b;
    }

    .mobile-panel {
      position: fixed;
      inset: var(--header-h) 0 0 auto;
      z-index: 80;
      width: min(360px, 88vw);
      border-left: 1px solid var(--border);
      background: var(--bg);
      box-shadow: var(--shadow);
      transform: translateX(102%);
      transition: transform 0.18s ease;
      overflow: auto;
    }

    .mobile-panel.is-open {
      transform: translateX(0);
    }

    .mobile-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    .mobile-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-elevated);
      color: var(--text-soft);
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .mobile-nav {
      padding: 18px;
    }

    @media (max-width: 1180px) {
      .header-inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        padding: 0 20px;
      }

      .header-note {
        display: none;
      }

      .brand {
        min-width: 0;
        max-width: none;
      }

      .menu-button {
        display: inline-flex;
        margin-left: 0;
      }

      .shell {
        display: block;
        padding: 20px;
      }

      .sidebar {
        display: none;
      }

      .overview h1 {
        font-size: 26px;
        line-height: 1.12;
        word-break: break-word;
      }

      .dek {
        font-size: 16px;
        line-height: 1.62;
      }

      .mermaid {
        min-width: 620px;
      }
    }

    @media (max-width: 560px) {
      .shell {
        padding: 16px;
      }

      .header-inner {
        min-height: var(--header-h);
        padding: 0 16px;
      }

      .brand {
        white-space: nowrap;
      }

      .brand-mark {
        flex: 0 0 auto;
      }

      .jump-index {
        padding: 15px;
      }

      .jump-link {
        grid-template-columns: 12px 30px minmax(0, 1fr);
        font-size: 14px;
      }

      .toc-chapter ul {
        margin-left: 48px;
      }

      .article h1 {
        align-items: flex-start;
        font-size: 22px;
      }

      th,
      td {
        padding: 9px 10px;
      }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#content">跳到正文</a>
  <div class="progress" id="progress"></div>
  <header class="site-header">
    <div class="header-inner">
      <div class="brand"><span class="brand-mark" aria-hidden="true">hr</span><span class="brand-text">${pageTitle}</span></div>
      <div class="header-note">从基础 Agent 到完整 Harness 策略的渐进式迭代方案</div>
      <button class="menu-button" type="button" id="openMenu" aria-controls="mobilePanel" aria-expanded="false">目录</button>
    </div>
  </header>
  <aside class="mobile-panel" id="mobilePanel" aria-hidden="true">
    <div class="mobile-head">
      <strong>目录</strong>
      <button class="mobile-close" type="button" id="closeMenu" aria-label="关闭目录">×</button>
    </div>
    <nav class="mobile-nav" id="mobileNav" aria-label="移动端章节目录"></nav>
  </aside>
  <div class="shell">
    <aside class="sidebar" aria-label="章节目录">
      <nav class="nav-list" id="sideNav"></nav>
    </aside>
    <main class="content" id="content">
      <div class="article-shell">
      <section class="overview" id="overview">
        <header class="hero">
        <p class="eyebrow">Harness Iteration Plan</p>
        <h1>${pageTitle}</h1>
        </header>
        <div class="page-overview">
          <div class="overview-title-row">
            <h2>总览</h2>
            <span class="overview-version">overview</span>
          </div>
          <p class="overview-subtitle">从工程实现视角，把多 Agent 金融研究系统拆成目标、机制选择、上下文约束和稳定性策略。</p>
          <blockquote class="overview-quote">
            <p><em>“Harness 不是外壳，而是让 Agent 长流程可控的工程骨架。”</em></p>
          </blockquote>
        </div>
        <div class="overview-sections">
          <section class="overview-block" aria-labelledby="what-title">
            <h3 id="what-title">这是什么</h3>
            <p>这是一份从基础 Agent Loop 出发的工程化迭代方案。它用一个 A 股研究报告系统串起 10 轮 Harness 迭代，展示如何把“能跑”的多 Agent Demo，逐步改造成可控、可扩展、可恢复、可交接上下文的系统规格。</p>
          </section>
          <section class="overview-block" aria-labelledby="insights-title">
            <h3 id="insights-title">核心洞察</h3>
            <ul class="insight-list">
              <li>Harness 决定 Agent 能走多远：模型能力需要循环、工具、权限与状态系统承接。</li>
              <li>多 Agent 协作需要显式的上下文隔离，不能让执行细节污染调度上下文。</li>
              <li>工具不是越多越好，分发映射、沙箱、权限管线和 Hook 才让工具可控。</li>
              <li>长流程可靠性来自规划、压缩、记忆、运行时 Prompt 与错误恢复的组合。</li>
            </ul>
          </section>
          <section class="overview-map" aria-labelledby="map-title">
            <h3 id="map-title">演进主线</h3>
            <div class="mermaid-wrap">
              <div class="diagram-title">Harness 迭代路线</div>
              <div class="diagram-scroll">
              <div class="mermaid">
flowchart LR
    V0["v0 基础 Agent<br/>Loop / Tools / Pipeline"] --> V1["v1 工具分发<br/>安全沙箱"]
    V1 --> V2["v2 权限管线<br/>三道闸门"]
    V2 --> V3["v3 Hooks<br/>扩展机制"]
    V3 --> V4["v4 TodoManager<br/>规划与同步"]
    V4 --> V5["v5 Skill<br/>按需知识加载"]
    V5 --> V6["v6 Compact<br/>上下文压缩"]
    V6 --> V7["v7 Memory<br/>跨会话记忆"]
    V7 --> V8["v8 Prompt<br/>运行时组装"]
    V8 --> V9["v9 Recovery<br/>错误恢复"]
    V9 --> V10["v10 Subagent<br/>上下文隔离"]
              </div>
              </div>
            </div>
          </section>
          <section class="jump-index-block" aria-labelledby="toc-title">
            <h3 class="jump-index-title" id="toc-title">目录</h3>
            <div class="jump-index">
              <ol class="toc-grid" id="overviewToc"></ol>
            </div>
          </section>
        </div>
      </section>
      <article class="article" id="article"></article>
      </div>
    </main>
  </div>

  <script>
    window.__HARNESS_MARKDOWN__ = ${escapedMarkdown};
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js"></script>
  <script>
    const article = document.getElementById("article");
    const sideNav = document.getElementById("sideNav");
    const mobileNav = document.getElementById("mobileNav");
    const mobilePanel = document.getElementById("mobilePanel");
    const openMenu = document.getElementById("openMenu");
    const closeMenu = document.getElementById("closeMenu");
    const overviewToc = document.getElementById("overviewToc");
    const progress = document.getElementById("progress");
    const navGroups = [
      { title: "总览", dot: "", start: 0, end: 1 },
      { title: "Harness 基础", dot: "green", start: 2, end: 4 },
      { title: "协作与知识", dot: "amber", start: 5, end: 8 },
      { title: "运行韧性", dot: "red", start: 9, end: 11 },
      { title: "附录", dot: "violet", start: 12, end: 12 },
    ];
    let documentChapters = [];

    function slugify(text) {
      return text
        .trim()
        .toLowerCase()
        .replace(/[\\s\\u3000]+/g, "-")
        .replace(/[：:，,。.“”"()（）【】\\[\\]{}<>/\\\\|?！!、]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "section";
    }

    function assignHeadingIds() {
      const used = new Map();
      document.querySelectorAll("#article h1, #article h2, #article h3").forEach((heading) => {
        const base = slugify(heading.textContent);
        const count = used.get(base) || 0;
        used.set(base, count + 1);
        heading.id = count ? \`\${base}-\${count + 1}\` : base;
      });
    }

    function buildStructure() {
      const chapters = [];
      let current = null;
      document.querySelectorAll("#article h1, #article h2").forEach((heading) => {
        if (heading.tagName === "H1") {
          current = { id: heading.id, title: heading.textContent.trim(), children: [] };
          chapters.push(current);
        } else if (current) {
          current.children.push({ id: heading.id, title: heading.textContent.trim() });
        }
      });
      return chapters;
    }

    function createLink(item) {
      const link = document.createElement("a");
      link.href = "#" + item.id;
      link.textContent = item.title;
      link.dataset.target = item.id;
      return link;
    }

    function chapterNo(index) {
      return index < 12 ? String(index).padStart(2, "0") : "附";
    }

    function sidebarDisplayTitle(title, stripHarness) {
      return stripHarness
        ? title
            .replace(/^Harness\\s+/i, "")
            .replace(/^附录[：:]\\s*/, "")
            .replace(/\\s*[（(]v\\d+[）)]\\s*$/i, "")
        : title;
    }

    function renderChapterNav(chapters, target, options = {}) {
      const stripHarness = options.stripHarness === true;
      target.replaceChildren();
      navGroups.forEach((group) => {
        const groupChapters = chapters.slice(group.start, group.end + 1);
        if (!groupChapters.length) return;

        const groupEl = document.createElement("div");
        groupEl.className = "sidebar-group";

        const title = document.createElement("div");
        title.className = "sidebar-title";
        const dot = document.createElement("span");
        dot.className = group.dot ? "dot " + group.dot : "dot";
        dot.setAttribute("aria-hidden", "true");
        const titleText = document.createElement("span");
        titleText.textContent = sidebarDisplayTitle(group.title, stripHarness);
        title.append(dot, titleText);

        const list = document.createElement("ul");
        list.className = "nav-list";

        groupChapters.forEach((chapter, offset) => {
          const index = group.start + offset;
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.className = "chapter-link";
          link.href = "#" + chapter.id;
          link.dataset.target = chapter.id;
          link.addEventListener("click", () => {
            setActive(chapter.id);
          });

          const no = document.createElement("span");
          no.className = "nav-index";
          no.textContent = chapterNo(index);

          const titleText = document.createElement("span");
          titleText.className = "chapter-title-link";
          titleText.textContent = sidebarDisplayTitle(chapter.title, stripHarness);

          link.append(no, titleText);
          item.append(link);
          list.append(item);
        });

        groupEl.append(title, list);
        target.append(groupEl);
      });
    }

    function findChapterForId(chapters, id) {
      return chapters.find((chapter) => (
        chapter.id === id || chapter.children.some((child) => child.id === id)
      ));
    }

    function createJumpLink(item, no) {
      const link = createLink(item);
      link.className = "jump-link";
      link.textContent = "";
      const noEl = document.createElement("span");
      noEl.className = "jump-no";
      noEl.textContent = no;
      const text = document.createElement("span");
      text.textContent = item.title;
      link.append(noEl, text);
      return link;
    }

    function renderOverviewToc(chapters) {
      overviewToc.replaceChildren();
      chapters.forEach((chapter, index) => {
        const item = document.createElement("li");
        item.className = "toc-chapter";
        item.append(createJumpLink(chapter, chapterNo(index)));
        if (chapter.children.length) {
          const list = document.createElement("ul");
          chapter.children.forEach((child) => {
            const childItem = document.createElement("li");
            childItem.append(createJumpLink(child, ""));
            list.append(childItem);
          });
          item.append(list);
        }
        overviewToc.append(item);
      });
    }

    function enhanceArticleHeadings(chapters) {
      chapters.forEach((chapter, index) => {
        const heading = document.getElementById(chapter.id);
        if (!heading || heading.querySelector(".section-no")) return;
        const no = document.createElement("span");
        no.className = "section-no";
        no.textContent = chapterNo(index);
        no.setAttribute("aria-hidden", "true");
        heading.prepend(no);
      });
    }

    function enhanceRevisionNotes() {
      article.querySelectorAll("p").forEach((paragraph) => {
        const text = paragraph.textContent.trim();
        if (/^（在 v\\d+ 基础上新增\\/变更）$/.test(text)) {
          paragraph.classList.add("revision-note");
          paragraph.textContent = text.replace(/^（|）$/g, "");
        }
      });
    }

    function prepareMermaid() {
      article.querySelectorAll("pre code.language-mermaid").forEach((code) => {
        const wrap = document.createElement("div");
        wrap.className = "mermaid-wrap";
        const title = document.createElement("div");
        title.className = "diagram-title";
        title.textContent = "Mermaid 图表";
        const scroll = document.createElement("div");
        scroll.className = "diagram-scroll";
        const diagram = document.createElement("div");
        diagram.className = "mermaid";
        diagram.textContent = code.textContent;
        scroll.append(diagram);
        wrap.append(title, scroll);
        code.closest("pre").replaceWith(wrap);
      });
    }

    function enhanceTables() {
      article.querySelectorAll("table").forEach((table) => {
        if (table.parentElement.classList.contains("table-wrap")) return;
        const wrap = document.createElement("div");
        wrap.className = "table-wrap";
        table.parentNode.insertBefore(wrap, table);
        wrap.append(table);
      });
    }

    function enhanceCodeBlocks() {
      article.querySelectorAll("pre").forEach((pre, index) => {
        if (pre.parentElement.classList.contains("code-shell")) return;
        const code = pre.querySelector("code");
        const languageClass = [...(code?.classList || [])].find((name) => name.startsWith("language-"));
        const language = languageClass ? languageClass.replace("language-", "") : "text";
        const shell = document.createElement("div");
        shell.className = "code-shell";

        const label = document.createElement("div");
        label.className = "code-label";
        label.textContent = language;

        const copy = document.createElement("button");
        copy.className = "copy-code";
        copy.type = "button";
        copy.textContent = "复制";
        copy.addEventListener("click", async () => {
          await navigator.clipboard.writeText(code?.textContent || "");
          copy.textContent = "已复制";
          setTimeout(() => { copy.textContent = "复制"; }, 1200);
        });

        pre.parentNode.insertBefore(shell, pre);
        shell.append(label, copy, pre);
        pre.dataset.codeIndex = String(index);
      });
    }

    function highlightCode() {
      article.querySelectorAll("pre code").forEach((code) => {
        if (!code.classList.contains("language-mermaid")) {
          hljs.highlightElement(code);
        }
      });
    }

    function setActive(id) {
      const chapter = findChapterForId(documentChapters, id);
      const chapterId = chapter?.id || id;
      const activeIds = new Set([chapterId]);

      document.querySelectorAll("[data-target]").forEach((el) => {
        el.classList.toggle("active", activeIds.has(el.dataset.target));
      });
    }

    function initScrollSpy() {
      const headings = [...document.querySelectorAll("#overview, #article h1, #article h2")];
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target?.id && visible.target.id !== "overview") {
          setActive(visible.target.id);
        }
      }, { rootMargin: "-84px 0px -72% 0px", threshold: [0, 1] });
      headings.forEach((heading) => observer.observe(heading));
    }

    function updateProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = \`scaleX(\${Math.min(1, Math.max(0, ratio))})\`;
    }

    function bindControls() {
      openMenu.addEventListener("click", () => {
        mobilePanel.classList.add("is-open");
        mobilePanel.setAttribute("aria-hidden", "false");
        openMenu.setAttribute("aria-expanded", "true");
      });
      closeMenu.addEventListener("click", () => {
        mobilePanel.classList.remove("is-open");
        mobilePanel.setAttribute("aria-hidden", "true");
        openMenu.setAttribute("aria-expanded", "false");
      });
      mobileNav.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
          mobilePanel.classList.remove("is-open");
          mobilePanel.setAttribute("aria-hidden", "true");
          openMenu.setAttribute("aria-expanded", "false");
        }
      });
      window.addEventListener("scroll", updateProgress, { passive: true });
      window.addEventListener("resize", updateProgress);
    }

    async function render() {
      if (!window.marked || !window.hljs || !window.mermaid) {
        article.innerHTML = '<div class="load-error">页面依赖加载失败，请确认网络可访问后刷新。</div>';
        return;
      }
      marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
      article.innerHTML = marked.parse(window.__HARNESS_MARKDOWN__);
      assignHeadingIds();
      enhanceRevisionNotes();
      prepareMermaid();
      enhanceTables();
      highlightCode();
      enhanceCodeBlocks();
      const chapters = buildStructure();
      documentChapters = chapters;
      renderChapterNav(chapters, sideNav, { stripHarness: true });
      renderChapterNav(chapters, mobileNav);
      renderOverviewToc(chapters);
      enhanceArticleHeadings(chapters);
      bindControls();
      initScrollSpy();
      if (chapters[0]) setActive(chapters[0].id);
      updateProgress();

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "base",
        themeVariables: {
          fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif",
          primaryColor: "#ffffff",
          primaryTextColor: "#111114",
          primaryBorderColor: "#94a3b8",
          lineColor: "#64748b",
          secondaryColor: "#eff6ff",
          tertiaryColor: "#f6f7f9",
          noteBkgColor: "#fffbeb",
          noteTextColor: "#51525a"
        }
      });
      await mermaid.run();
    }

    render();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html);
console.log("Generated index.html");
