# OpenList-CAS

基于 [OpenList](https://github.com/OpenListTeam/OpenList) 的定制分支，围绕 `.cas` 元数据文件提供生成、恢复、自动恢复与预览辅助能力。

当前这版主要针对以下驱动：

- `189Cloud`
- `189CloudPC`
- `Local`

## 功能概览

### 1. 生成 `.cas`

上传普通文件后，可自动生成对应的 `.cas` 文件。

示例：

- 原文件：`movie.mkv`
- 生成后：`movie.mkv.cas`

`.cas` 文件只保存恢复所需的元数据，不保存原始文件内容。

### 2. 生成后删除源文件

可在生成 `.cas` 后删除原始文件，只保留 `.cas`。

这适合“节省存储空间”的场景，但不应把 `.cas` 当作唯一备份。

### 3. 从 `.cas` 恢复源文件

`189Cloud` 和 `189CloudPC` 支持通过 `.cas` 恢复源文件。

`Local` 不支持恢复，只支持生成和删除源文件。

### 4. 自动恢复已有 `.cas`

`189Cloud` 和 `189CloudPC` 支持：

- 启动后扫描监控目录
- 周期性扫描监控目录
- 手动刷新监控目录时触发恢复

### 5. `.cas` 预览辅助

`189Cloud` 和 `189CloudPC` 支持点击 `.cas` 进行视频预览辅助：

- 点击 `.cas`
- 先恢复预览临时文件
- 获取真实视频直链
- 再删除预览临时文件

说明：

- 预览临时文件统一恢复到根目录下的 `/TEMP`
- 文件名形如 `preview__movie.mkv`
- `189CloudPC` 可配置把预览临时文件恢复到指定家庭空间的 `/TEMP`

## 驱动支持

| 驱动 | 生成 `.cas` | 删除源文件 | 从 `.cas` 恢复 | 自动恢复 | `.cas` 预览辅助 |
| --- | --- | --- | --- | --- | --- |
| `189Cloud` | 支持 | 支持 | 支持 | 支持 | 支持 |
| `189CloudPC` | 支持 | 支持 | 支持 | 支持 | 支持 |
| `Local` | 支持 | 支持 | 不支持 | 不支持 | 不支持 |

## 配置项说明

### 通用 CAS 配置

以下配置适用于 `189Cloud`、`189CloudPC`，其中 `Local` 只保留前两项：

| 配置项 | 说明 |
| --- | --- |
| `Generate cas` | 上传普通文件后自动生成 `.cas` |
| `Delete source` | 生成 `.cas` 后删除原始文件 |
| `Restore source from cas` | 处理 `.cas` 文件时自动恢复源文件 |
| `Restore source use current name` | 恢复时使用当前 `.cas` 文件名作为基础文件名，并保留原始扩展名 |
| `Delete cas after restore` | 恢复成功后删除 `.cas` |
| `Auto restore existing cas` | 自动扫描监控目录中的 `.cas` 并尝试恢复 |
| `Auto restore existing cas paths` | 自动恢复监控目录，一行一个路径；留空表示不监控任何目录 |

### `189CloudPC` 额外配置

| 配置项 | 说明 |
| --- | --- |
| `Preview restore family id` | 留空时，预览临时文件恢复到个人空间 `/TEMP`；填写家庭 ID 时，恢复到该家庭空间 `/TEMP` |

## 命名规则

### 生成 `.cas`

生成规则：

```text
原文件名 + .cas
```

示例：

```text
movie.mkv -> movie.mkv.cas
```

### 恢复源文件

默认情况下，恢复文件名使用 `.cas` 内记录的原始文件名。

开启 `Restore source use current name` 后：

- 先取当前 `.cas` 文件名去掉 `.cas`
- 再去掉这个名字本身已有的扩展名
- 最后统一拼回原始文件扩展名

示例：

- `.cas` 内原始文件名：`movie.mkv`
- 当前 `.cas` 文件名：`abc.mp4.cas`
- 恢复结果：`abc.mkv`

### 预览临时文件

预览链恢复出来的临时文件名格式：

```text
preview__<恢复文件名>
```

示例：

```text
preview__movie.mkv
```

## 自动恢复机制

仅 `189Cloud` 和 `189CloudPC` 支持。

自动恢复生效条件：

1. 开启 `Auto restore existing cas`
2. `Auto restore existing cas paths` 填写了监控目录

行为如下：

- 服务启动后先扫描一次监控目录
- 后续按存储缓存周期继续扫描
- 手动刷新监控目录时，也会立即检查该目录中的 `.cas`

说明：

- 留空不监控任何目录
- 不会默认监控根目录

## 预览行为说明

仅 `189Cloud` 和 `189CloudPC` 支持。

点击 `.cas` 预览视频时：

1. 读取 `.cas`
2. 恢复预览临时文件到 `/TEMP`
3. 获取恢复文件的真实视频直链
4. 删除该预览临时文件

说明：

- 现在目录列表不会为了识别视频类型而提前逐个解析 `.cas`
- 重活放在点击预览时执行，目录打开更轻

## 重要说明

### `.cas` 不是原文件

`.cas` 只保存元数据，不保存真实文件内容。

这意味着：

- 能否恢复，取决于目标云盘是否还能命中对应数据
- `.cas` 不是完整备份
- 不建议把 `.cas` 作为唯一数据保留方式

### `Local` 为什么不能恢复

本地存储没有云盘那种基于文件特征直接恢复内容的能力。

所以 `Local` 仅支持：

- 生成 `.cas`
- 删除源文件

不支持：

- 从 `.cas` 恢复
- 自动恢复
- `.cas` 预览辅助

## 推荐用法

### 节省空间

适合：

- `Generate cas = 开`
- `Delete source = 开`

### 手动恢复

适合：

- `Restore source from cas = 开`

然后手动上传或处理 `.cas` 文件。

### 自动恢复

适合：

- `Restore source from cas = 开`
- `Auto restore existing cas = 开`
- `Auto restore existing cas paths = 填写具体目录`

### 预览走家庭空间

仅 `189CloudPC`：

- 设置 `Preview restore family id`

这样预览临时文件会恢复到对应家庭空间的 `/TEMP`。

## 部署

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

默认访问地址：

```text
http://localhost:5244
```

## 常见问题

### 上传 `.cas` 没有恢复

检查：

- 是否开启 `Restore source from cas`
- 当前驱动是否支持恢复

`Local` 不支持恢复。

### 自动恢复没有生效

检查：

- 是否开启 `Auto restore existing cas`
- 是否填写了 `Auto restore existing cas paths`

留空表示不监控任何目录。

### 恢复后的名字不对

检查：

- 是否开启 `Restore source use current name`

开启后，会按当前 `.cas` 文件名恢复，但始终保留原始文件扩展名。

### 为什么只保留 `.cas` 还有风险

因为 `.cas` 本身不含文件数据。

如果目标云盘不再能命中该文件对应的数据，恢复就会失败。

## 说明

本项目为基于 OpenList 的非官方定制分支。
