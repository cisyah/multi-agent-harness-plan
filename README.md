# Harness Engineering Iterations: 10 Steps from a Multi-Agent Demo to Production

> Starting from a working multi-agent demo, this project uses 10 rounds of Harness engineering iterations to systematically break down the path to "controllable, scalable, recoverable" production systems.

## 🎯 What Is This

A systematic exploration of Harness engineering — using a multi-agent financial research system as a case study, answering at each iteration:

- What can a basic Agent Loop do, and where does it fall short
- What problem does each iteration solve, and what new constraints does it introduce
- How many engineering steps lie between "it runs" and "it works"

## 📐 Content Structure

| Iteration | Topic | Core Question |
|-----------|-------|---------------|
| v0 | Baseline Agent Configuration | What does the simplest form look like without any Harness? |
| v1 | Tool Dispatch & Security Sandbox | How do you safely integrate and scale tools? |
| v2 | Permission Pipeline | How do you enforce tiered access control for sensitive financial data? |
| v3 | Hooks Extension Mechanism | How do you handle unbounded loop growth? |
| v4 | Planning & Task Management | How do multiple Agents synchronize state? |
| v5 | Skill On-Demand Knowledge Loading | With limited context windows, how do you inject knowledge on demand? |
| v6 | Context Compression | How do you prevent overflow in long-running workflows? |
| v7 | Memory System | How do you persist user preferences across sessions? |
| v8 | System Prompt Runtime Assembly | How do 5 Agents share a single framework? |
| v9 | Error Recovery & Resilience | How do you handle API timeouts and cascading failures? |
| v10 | Sub-Agent & Context Isolation | How do you prevent execution details from polluting the orchestration layer? |

## 🛠 Tech Stack

- Pure static HTML, zero build dependencies
- [Marked.js](https://github.com/markedjs/marked) — Markdown rendering
- [Mermaid](https://mermaid.js.org/) — Architecture and sequence diagrams
- [Prism.js](https://prismjs.com/) — Code syntax highlighting
- Responsive layout with dark mode support

## 🔗 Live Demo

[View Online →](https://your-demo-url.vercel.app)

## 📸 Screenshots

![Overview](screenshot-overview.png)

---
