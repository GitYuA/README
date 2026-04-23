# OpenList-CAS

基于 [OpenList](https://github.com/OpenListTeam/OpenList) 的非官方魔改版本，围绕 `.cas` 元数据文件提供生成、恢复、自动恢复与预览播放能力。

这版当前主要面向：

- `189CloudPC`
- `Local`

## 这是什么

`.cas` 文件本身不是原文件数据，而是用于恢复原文件的一份元数据描述。  
它通常包含：

- 原始文件名
- 文件大小
- `md5`
- `slice_md5`
- `create_time`

这意味着：

- 保留 `.cas` 可以显著减少存储占用
- 恢复是否成功，取决于目标驱动是否支持对应的秒传/快速恢复能力
- `.cas` 不能替代真正的完整备份

## 当前功能

### 189CloudPC

支持：

- 上传普通文件后生成 `.cas`
- 生成 `.cas` 后删除原始源文件
- 处理 `.cas` 文件时恢复源文件
- 恢复成功后删除对应 `.cas`
- 自动扫描监控目录并恢复已有 `.cas`
- 点击 `.cas` 时恢复临时文件并用于视频预览播放
- 删除源文件、`.cas` 文件、预览临时文件时同步清理回收站

附加行为：

- 恢复命名默认按当前 `.cas` 文件名处理
- 预览恢复文件统一落到 `/TEMP`
- 预览临时文件名格式为 `TEMP_随机5位_原文件名.ext`
- 普通下载 `.cas` 时下载的是 `.cas` 本体
- 播放 `.cas` 时才走恢复预览链

### Local

支持：

- 上传普通文件后生成 `.cas`
- 生成 `.cas` 后删除原始源文件

不支持：

- 从 `.cas` 恢复源文件
- 自动恢复
- `.cas` 预览播放

## 典型流程

### 普通生成流程

1. 上传普通文件
2. 生成对应 `.cas`
3. 如果开启 `Delete source`，删除原始源文件

### 恢复流程

1. 上传或处理 `.cas`
2. 解析 `.cas` 元数据
3. 调用驱动恢复原始文件
4. 如果开启 `Delete cas after restore`，删除 `.cas`

### 自动恢复流程

1. 开启 `Auto restore existing cas`
2. 配置 `Auto restore existing cas paths`
3. 启动时先扫描一次
4. 后续按缓存过期周期轮询
5. 手动刷新监控目录时也会触发当前目录恢复

## 配置项说明

### 189CloudPC

`Generate cas`

- 上传普通文件后自动生成对应 `.cas` 文件

`Delete source`

- 生成 `.cas` 成功后自动删除原始源文件
- 删除时会同步清理回收站中的对应文件

`Restore source from cas`

- 处理 `.cas` 文件时自动恢复原始源文件

`Delete cas after restore`

- 恢复成功后自动删除对应 `.cas`
- 删除时会同步清理回收站中的对应 `.cas`

`Auto restore existing cas`

- 自动扫描监控目录中的 `.cas` 并尝试恢复

`Auto restore existing cas paths`

- 每行一个路径
- 只监控这些目录及其子目录
- 留空时不监控

### Local

`Generate cas`

- 上传普通文件后自动生成对应 `.cas`

`Delete source`

- 生成 `.cas` 成功后自动删除原始源文件

## 关于家庭传输

`FamilyTransfer` 是 `189CloudPC` 原版已有功能，不是 CAS 新增功能。

它的作用是：

- 上传普通文件时，先上传到家庭空间中转
- 再按逻辑转存到个人空间目标目录

在这版魔改里，CAS 会复用这条能力：

- 开启家庭传输时，可以通过家庭空间中转来规避个人空间上传流量限制
- 在 `Generate cas + Delete source` 组合下，可只在个人空间保留 `.cas`
- 预览恢复也会跟随家庭传输逻辑走家庭侧中转

## 预览播放说明

`189CloudPC` 支持把 `.cas` 当作“可播放代理文件”使用，但它不是直接播放 `.cas` 内容本身。

实际流程是：

1. 点击 `.cas`
2. 恢复临时源文件到 `/TEMP`
3. 获取真实视频链接
4. 播放
5. 删除临时恢复文件，并清理回收站中的对应临时文件

注意：

- 下载 `.cas` 和播放 `.cas` 是两条不同链路
- 下载拿到的是 `.cas`
- 播放时才会恢复真实文件

## 文件命名规则

### 生成 `.cas`

默认规则：

```text
原文件名 + .cas
```

例如：

```text
movie.mkv -> movie.mkv.cas
```

### 从 `.cas` 恢复

恢复命名默认开启“使用当前 `.cas` 文件名”规则：

- 先取当前 `.cas` 文件名
- 去掉 `.cas`
- 去掉当前文件名自带扩展名
- 再补回原始文件扩展名

例如：

```text
abc.mp4.cas -> abc.mkv
test.cas -> test.mkv
```

### 预览临时文件

格式为：

```text
TEMP_12345_movie.mkv
```

## `.cas` 格式说明

当前生成的 `.cas` 内容为 Base64(JSON)。

其中 `create_time` 使用 Unix 时间戳字符串，例如：

```json
"create_time":"1776430151"
```

## 驱动支持矩阵

| 驱动 | 生成 `.cas` | 删源文件 | 从 `.cas` 恢复 | 自动恢复 | `.cas` 播放 |
| --- | --- | --- | --- | --- | --- |
| `189CloudPC` | 支持 | 支持 | 支持 | 支持 | 支持 |
| `Local` | 支持 | 支持 | 不支持 | 不支持 | 不支持 |

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

## 前端构建

如果你使用单独前端仓库，需要先构建前端 `dist`：

```bash
pnpm install
pnpm build
```

然后将生成的 `dist` 或 `dist.tar.gz` 提供给后端构建流程使用。

## 风险与限制

- `.cas` 不是完整备份
- 恢复能力依赖驱动自身能力
- 云盘策略变化可能影响恢复或预览
- 不建议把 `.cas` 作为唯一长期数据保留方案

## 免责声明

本项目为非官方修改版本，仅供学习与研究使用。  
请在遵守当地法律法规和服务条款的前提下使用，由此产生的风险由使用者自行承担。

## 致谢

- 上游项目：[OpenList](https://github.com/OpenListTeam/OpenList)
