<div align="center">
  <img style="width: 128px; height: 128px;" src="https://raw.githubusercontent.com/OpenListTeam/Logo/main/logo.svg" alt="logo" />

  <p><em>OpenList 是一个有韧性、长期治理、社区驱动的 AList 分支，旨在防御基于信任的开源攻击。</em></p>

  <img src="https://goreportcard.com/badge/github.com/OpenListTeam/OpenList/v3" alt="latest version" />
  <a href="https://github.com/OpenListTeam/OpenList/blob/main/LICENSE"><img src="https://img.shields.io/github/license/OpenListTeam/OpenList" alt="License" /></a>
  <a href="https://github.com/OpenListTeam/OpenList/actions?query=workflow%3ABuild"><img src="https://img.shields.io/github/actions/workflow/status/OpenListTeam/OpenList/build.yml?branch=main" alt="Build status" /></a>
  <a href="https://github.com/OpenListTeam/OpenList/releases"><img src="https://img.shields.io/github/release/OpenListTeam/OpenList" alt="latest version" /></a>

  <a href="https://github.com/OpenListTeam/OpenList/discussions"><img src="https://img.shields.io/github/discussions/OpenListTeam/OpenList?color=%23ED8936" alt="discussions" /></a>
  <a href="https://github.com/OpenListTeam/OpenList/releases"><img src="https://img.shields.io/github/downloads/OpenListTeam/OpenList/total?color=%239F7AEA&logo=github" alt="Downloads" /></a>
</div>

---
# OpenList-CAS

基于 [OpenList](https://github.com/OpenListTeam/OpenList) 的增强分支，围绕 `.cas` 秒传元数据工作流进行优化，实现**低存储占用 + 快速恢复文件**的高效方案。

---

## ✨ TL;DR

* 📦 上传文件 → 自动生成 `.cas` 元数据
* 🗑️ 可删除原文件，仅保留 `.cas` 节省空间
* ⚡ 通过 `.cas` 可秒传恢复原文件

---

## 🧠 核心理念

> 用“文件特征”代替“文件本体”存储，通过 `.cas` 元数据实现：

* 删除原始大文件
* 保留恢复能力
* 极限压缩存储占用

---

## 🔄 工作流程


> 上传 → 提取特征 → 删除原文件 → 需要时秒传恢复

```mermaid
graph LR
    A[上传原文件] --> B(生成 CAS)
    B --> C[.cas 元数据]
    B --> D[删除原文件]
    C --> E((节省空间))
    C --恢复--> F[触发秒传]
    F --> G[文件恢复]
```

---

## 🚀 使用场景

* 📉 **低存储环境（VPS / NAS）**
  仅保存 `.cas`，极大减少空间占用

* ☁️ **网盘秒传优化**
  利用哈希直接恢复文件，避免重复上传

* 🎬 **媒体库归档**
  平时只存元数据，需要时恢复原文件

* 🔁 **自动化工作流**
  监控 `.cas` 文件并自动恢复

---

## 🔧 核心特性

* 自动生成 `.cas` 元数据文件
* 支持生成后删除原文件（极限节省空间）
* 支持通过 `.cas` 秒传恢复文件
* 支持重命名 `.cas` 后恢复
* 支持自动监听并恢复 `.cas`

---

## 📦 支持驱动

| 驱动         | 支持情况 | 推荐    | 说明       |
|:-----------:|:--------:|:--------:|:--------------:|
| 189Cloud/189CloudPC  | ✅ | ⭐⭐⭐⭐⭐ | 完整支持     |
| 189Cloud/189CloudPC | ✅ | ⭐⭐⭐⭐⭐ | 完整支持     |
| Local | ⚠️ | ⭐⭐ | 仅生成 / 删除 |

---

## ⚙️ 配置说明

| 配置项                             | 默认值 | 适用驱动     | 说明             |
| :-----------------------------: | :-: | :-------------------: |:------------:|
|           Generate cas          |  ❌  |          All          | 上传后生成 `.cas` |
|          Delete source          |  ❌  |          All          | 生成后删除原文件     |
|     Restore source from cas     |  ❌  | 189Cloud / 189CloudPC | 通过 `.cas` 恢复 |
| Restore source use current name |  ❌  | 189Cloud / 189CloudPC | 使用当前文件名      |
|     Delete CAS after restore    |  ❌  | 189Cloud / 189CloudPC | 恢复后删除 `.cas` |
|    Auto restore existing cas    |  ❌  | 189Cloud / 189CloudPC | 自动监听恢复       |
| Auto restore existing cas paths |  -  | 189Cloud / 189CloudPC | 指定监听目录       |

---

### 👉 推荐配置（低存储模式）

开启：

* ✅ Generate cas
* ✅ Delete source

效果：

```text
movie.mp4 → movie.mp4.cas
（原文件删除，仅保留 .cas）
```

---

## 🏷️ 命名规则

开启 **使用当前文件名恢复**：

| 操作        | 结果             |
| :-------: | :-----: |
| a.mp4.cas | → a.mp4        |
| a.cas     | → a.mp4（自动补后缀） |

关闭该选项：

* 使用 `.cas` 内记录的原始文件名

---

## 🖥️ 存储驱动说明

### ☁️ 189Cloud / 189CloudPC

支持：

* 生成 `.cas`
* 删除原文件
* 通过 `.cas` 秒传恢复文件
* 自动监听并恢复 `.cas`
* 恢复后自动清理 `.cas`（可选）

说明：

* 依赖云盘的 **哈希秒传能力**
* 恢复速度取决于云端是否已存在相同文件
* 不会上传 `.cas` 内容本身，而是触发秒传机制

---

### 💻 Local（本地存储）

支持：

* 生成 `.cas`
* 删除原文件

不支持：

* 秒传恢复

说明：

* 本地磁盘不具备“哈希秒传”能力
* `.cas` 仅用于节省存储空间，不能用于恢复文件

---

## 🐳 部署指南

💡 默认端口：5244
💡 数据目录：/opt/openlist/data
💡 首次启动需获取管理员密码

---

### Docker

```bash
docker run -d --restart=unless-stopped \
  -v /etc/openlist:/opt/openlist/data \
  -p 5244:5244 \
  -e PUID=0 \
  -e PGID=0 \
  -e UMASK=022 \
  --name="openlist-cas" \
  freeyua/openlist-cas:latest
```

---

### Docker Compose

```yaml
services:
  openlist-cas:
    image: freeyua/openlist-cas:latest
    container_name: openlist-cas
    restart: unless-stopped
    ports:
      - "5244:5244"
    volumes:
      - ./data:/opt/openlist/data
    environment:
      - PUID=0
      - PGID=0
      - UMASK=022
```

---

## 🌐 访问

```
http://localhost:5244
```

---

## ⚠️ 重要认知（必读）

### ❗ `.cas` ≠ 数据备份

`.cas` 只是文件的“特征索引”，并不包含实际数据：

* ✔ 可恢复：云盘仍存在该文件（可命中秒传）
* ❌ 不可恢复：云盘文件被删除 / 失效 / 风控

👉 **请勿将 `.cas` 作为唯一备份方案**

---

## ⚠️ 风险提示

* 强依赖云盘秒传能力
* 云盘策略变化可能影响恢复
* 不适用于长期数据唯一存储

---

## ❓ 常见问题

### ❗ 上传 `.cas` 没反应

未开启 `Restore source from cas`

### ❗ 无法恢复文件

驱动不支持或云端无匹配文件

### ❗ 文件名不正确

检查 `Restore source use current name`

### ❗ `.cas` 是备份吗？

不是，仅为索引

---

## 🔗 与上游项目

* 上游：OpenList
* 基线版本：v4.2.1
* 本项目为非官方增强分支

---

## 📜 免责声明

1. 本项目仅用于学习与技术研究，请遵守相关法律法规，请勿用于商业用途。
2. 本项目所涉及的任何脚本、程序或资源，仅用于测试和研究目的。
3. 使用者应在下载后的24小时内删除相关文件。
4. 使用者需自行承担使用本项目可能产生的一切法律后果和风险，作者不承担任何责任。
5. 如果您不能接受本声明的任何条款，请立即停止使用本项目。

---

## 📜 致谢 & 声明

* 感谢原项目 [OpenList](https://github.com/OpenListTeam/OpenList) 提供的基础能力。
* 本项目为非官方增强分支

⚠️ **仅供学习研究，请遵守法律法规**

---

## ⭐ Star History

如果这个项目帮到了你，欢迎点个 ⭐ 支持！

