## 魔改功能说明

本仓库是基于 **OpenList** 的魔改分支，专门针对 `.cas` 秒传文件工作流进行了深度优化。

### 🛠 操作与配置指南

| 配置项 (UI 选项) | 功能说明 |
| :--- | :--- |
| **Generate cas** | 上传文件后，在同目录自动生成一个同名的 `.cas` 元数据文件。 |
| **Delete source** | 开启后，上传文件成功生成 `.cas` 文件后，系统将自动删除原始源文件。 |
| **Restore source from cas** | 上传 `.cas` 文件时，尝试根据其中的哈希信息秒传还原源文件，而不是直接上传 `.cas` 文件本身。 |
| **Restore source use current name** | 从 `.cas` 还原时，使用当前 `.cas` 的文件名（去掉.cas后缀）；如果没有扩展名，会尽量补上原始扩展名。 |
| **Delete CAS after restore** | 从已有 `.cas` 成功还原出源文件后，自动删除该 `.cas` 文件；如果源文件已存在，也会清理该 `.cas` 文件以保持整洁。 |
| **Auto restore existing cas** | 自动监视已配置目录中的 `.cas` 文件，检测到变化时立即在后台尝试还原源文件。 |
| **Auto restore existing cas paths** | 配合上一项使用。填写要监视的目录路径（每行一个，相对于当前存储根目录），会自动包含其下所有子目录。 |

### 🌟 核心工作流特性

- **驱动深度集成**：在 `189Cloud`（天翼云盘）、`189CloudPC`、`Local`（本地存储）驱动中支持以上所有自动化流程。
- **极致空间置换**：通过开启 `Generate cas` + `Delete source`，可实现“上传即转码并释放空间”的流程。
- **全自动异地还原**：配合 `Auto restore` 规则与 `Delete CAS after restore`，可构建低成本的“全自动监控 -> 秒传还原 -> 清理垃圾”同步链条。
- **Docker 构建提醒**：从源码构建镜像时，请务必使用包含 `.git` 元数据的仓库目录进行构建，以便 `build.sh` 正确读取并注入版本信息。
