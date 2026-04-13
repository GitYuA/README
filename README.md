<div align="center">
  <img style="width: 128px; height: 128px;" src="https://raw.githubusercontent.com/OpenListTeam/Logo/main/logo.svg" alt="logo" />
  
  <br/>

  <p><em>基于 OpenList 增强，专为 <strong>.cas 秒传元数据</strong> 工作流打造的高效云盘方案。</em></p>

  <p>
    <a href="https://github.com/OpenListTeam/OpenList/releases"><img src="https://img.shields.io/github/release/OpenListTeam/OpenList?style=flat-square" alt="latest version" /></a>
    <a href="https://goreportcard.com/report/github.com/OpenListTeam/OpenList/v3"><img src="https://goreportcard.com/badge/github.com/OpenListTeam/OpenList/v3?style=flat-square" alt="Go Report Card" /></a>
    <a href="https://github.com/OpenListTeam/OpenList/actions?query=workflow%3ABuild"><img src="https://img.shields.io/github/actions/workflow/status/OpenListTeam/OpenList/build.yml?branch=main&style=flat-square" alt="Build status" /></a>
    <a href="https://github.com/OpenListTeam/OpenList/blob/main/LICENSE"><img src="https://img.shields.io/github/license/OpenListTeam/OpenList?style=flat-square" alt="License" /></a>
    <a href="https://github.com/OpenListTeam/OpenList/releases"><img src="https://img.shields.io/github/downloads/OpenListTeam/OpenList/total?color=%239F7AEA&logo=github&style=flat-square" alt="Downloads" /></a>
  </p>
</div>

---

**OpenList-CAS** 是一个旨在实现 **“极低存储占用 + 快速无损恢复”** 的开源网盘分支。它通过提取文件的特征哈希（.cas），让你可以在删除庞大原文件的情况下，随时利用网盘的“秒传”特性将其瞬间复活。

## ✨ TL;DR (核心亮点)

- 📦 **自动生成：** 上传视频/大文件后，自动剥离并生成极小的 `.cas` 元数据。
- 🗑️ **极致瘦身：** 放心删除几十GB的原文件，仅保留 KB 级别的 `.cas` 文件节省硬盘。
- ⚡ **瞬间满血：** 需要原文件时，通过 `.cas` 触发秒传，无需重新上传即可瞬间恢复！

---

## 📑 目录
- [🔄 工作流程](#-工作流程)
- [🚀 使用场景](#-使用场景)
- [📦 支持驱动](#-支持驱动)
- [⚙️ 配置说明](#️-配置说明)
- [🐳 部署指南](#-部署指南)
- [⚠️ 常见问题](#️-常见问题)

---

## 🔄 工作流程

```mermaid
graph LR
    A[上传原文件] --> B(触发转换)
    B --> C[.cas 元数据]
    B --> D[删除原文件]
    C --> E((节省海量空间))
    C --需要时点击恢复--> F[触发网盘秒传]
    F --> G[原文件瞬间恢复]
    
    style A fill:#4285f4,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#34a853,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#ea4335,stroke:#333,stroke-width:2px,color:#fff
