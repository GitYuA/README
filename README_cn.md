## 魔改说明

本仓库是基于 OpenList 的魔改分支，主要面向 `.cas` 秒传文件工作流。

当前额外功能：

- 在 189Cloud、189CloudPC、Local 存储驱动中，上传文件后可自动生成同名 `.cas` 文件。
- 可通过 Delete source 开关在 `.cas` 生成完成后自动删除源文件。
- 适合将资源上传到天翼云盘或本机存储后，保留 `.cas` 秒传文件用于后续分发、导入或秒传流程。
- 从源码构建 Docker 镜像时，建议使用带 `.git` 元数据的 Git 仓库目录，而不是纯源码压缩包，因为 `build.sh` 会读取 Git 版本信息。

---
这是一段普通的文字，<mark>这里的文字会有背景色</mark>。
<span style="background-color: #f0f0f0;">这是一段浅灰色背景的文字</span>
