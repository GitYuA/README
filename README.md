<div align="center">

# Emby Users Panel

轻量、完整的 Emby 用户生命周期管理面板

单二进制部署 · 多服务器管理 · Docker 支持 · 用户自助查询 · 到期自动化

![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Pure_Go-003B57?logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 目录

- [功能概览](#功能概览)
- [快速开始](#快速开始)
- [首次配置](#首次配置)
- [配置与数据](#配置与数据)
- [API 参考](#api-参考)
- [安全机制](#安全机制)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [License](#license)

## 功能概览

### 管理面板

- 媒体库统计：电影、剧集、单集等内容概览。
- 运营数据概览：用户数、播放次数、播放时长、最近入库、最近播放。
- 在线会话监控：当前播放用户、进度、设备和播放内容。
- 播放趋势与影视榜单：支持按 30 天、12 周、12 月切换统计范围。

### 用户管理

- 创建、编辑、充值、续费、启用、禁用、删除 Emby 用户。
- 支持批量充值、批量修改、批量启用、批量禁用、批量删除。
- 支持从模板用户复制权限和配置。
- 支持用户分组、备注、表格列显示偏好和排序偏好。

### 多服务器

- 在同一个面板内管理多台 Emby 服务器。
- 每台服务器拥有独立数据库、用户缓存和日志。
- 支持按服务器覆盖定时任务、SMTP、到期策略、模板用户等配置。

### 自动化任务

- 定时检查用户到期状态。
- 可选择自动禁用或删除过期用户。
- 支持到期前 N 天邮件提醒。
- 支持充值、启用、禁用、删除等操作通知邮件。
- 支持向管理员发送服务器状态邮件。

### 播放统计

- 优先读取 Emby Playback Reporting 插件的详细播放记录。
- 插件不可用时可回退到 Emby Items API。
- 支持按剧集名称聚合和榜单展示。

### 用户自助查询

- 独立用户查询端口，用户可自行查看账号到期时间。
- 可开启访问 Token 验证。
- 内置 per-IP 和 per-username 限流。

### 数据管理

- 支持 JSON 备份导出和恢复。
- 备份恢复上传大小限制为 10MB。
- 支持操作日志查看和下载。
- 配置文件、用户数据、日志自动持久化到数据目录。

## 快速开始

### 方式一：Docker Compose

```bash
docker compose up -d
```

默认 `docker-compose.yml` 会构建镜像、映射端口、挂载 `./data` 到容器内 `/data`，并启用健康检查。

### 方式二：Docker 手动运行

```bash
docker build -t emby-users-panel:latest .

docker run -d \
  --name embyuserspanel \
  --restart always \
  -p 8086:8086 \
  -p 8085:8085 \
  -v ./data:/data \
  -e TZ=Asia/Shanghai \
  -e APP_DATA_DIR=/data \
  emby-users-panel:latest
```

### 方式三：本地运行

```bash
go mod tidy
go run .
```

构建本地二进制：

```bash
go build -trimpath -o build/emby-users-panel .
```

Windows 下可以改成：

```powershell
go build -trimpath -o build/emby-users-panel.exe .
```

### 访问地址

| 服务 | 地址 | 说明 |
|:-----|:-----|:-----|
| 管理面板 | `http://<host>:8086` | 管理员后台 |
| 用户查询 | `http://<host>:8085` | 用户自助查询页 |
| 健康检查 | `http://<host>:8086/health` | 返回 `status` 和 `version` |

## 首次配置

1. 打开管理面板：`http://<host>:8086`。
2. 首次进入时设置管理密码。
3. 进入系统设置中的服务器管理，添加 Emby 服务器。
4. 填写 Emby 服务器地址，例如 `http://192.168.1.100:8096`。
5. 填写 Emby API Key。API Key 可在 Emby 后台的 API 密钥页面生成。
6. 根据需要配置模板用户、到期策略、邮件通知和用户查询 Token。

所有设置会持久化到 `APP_DATA_DIR` 指定的数据目录，Docker 部署时默认为容器内 `/data`。

## 配置与数据

### 环境变量

| 变量 | 默认值 | 说明 |
|:-----|:-------|:-----|
| `APP_DATA_DIR` | `/data` | 运行时数据目录，保存配置、数据库、日志和缓存 |
| `TZ` | `Asia/Shanghai` | 时区，影响定时任务和日期显示 |

### 数据目录

运行后会在数据目录中生成以下内容：

```text
data/
├── config.json
├── log/
└── users/
```

建议备份和迁移时保留整个 `data` 目录。Docker Compose 部署时，该目录对应项目下的 `./data`。

### 每服务器独立配置

每台 Emby 服务器可单独覆盖以下设置；未覆盖的项目会继承全局配置：

- 定时检查时间和自动任务开关。
- 过期处理策略：禁用或删除。
- SMTP 邮件配置。
- 操作日志保留天数。
- 恢复模板用户和默认模板用户。
- 到期提醒天数和操作通知开关。

## API 参考

### 管理端，端口 8086

| 方法 | 路径 | 说明 |
|:-----|:-----|:-----|
| `GET` | `/` | 管理面板，未登录时显示登录页 |
| `POST` | `/` | 登录认证和 AJAX action 分发 |
| `GET` | `/index.php` | 兼容路径，等同 `/` |
| `GET` | `/emby_image` | Emby 图片代理，避免前端暴露 API Key |
| `GET` | `/assets/*` | 静态资源 |
| `GET` | `/health` | 健康检查 |

管理端写操作通过 `POST /` 的 `action` 字段分发，已登录请求需要携带 `X-CSRF-Token`。

| Action | 说明 |
|:-------|:-----|
| `login` | 管理员登录或首次设置密码 |
| `charge` | 单用户充值 |
| `create` | 创建用户 |
| `save_edit` | 保存用户编辑 |
| `delete` | 删除用户 |
| `batch` | 批量操作 |
| `refresh_cache` | 刷新用户缓存 |
| `refresh_dashboard` | 刷新仪表盘缓存 |
| `server_op` | 服务器保存、删除、切换、状态检查 |
| `settings_op` | 保存系统设置 |
| `test_email` | 发送测试邮件 |
| `admin_status_email` | 发送管理员状态邮件 |
| `restore` | 导入备份 |
| `get_users` | 获取用户列表 JSON |
| `get_dashboard_heavy` | 获取仪表盘重数据 |
| `get_dashboard_realtime` | 获取仪表盘实时数据 |
| `get_logs` | 获取操作日志 |
| `run_auto_check` | 手动触发到期检查 |

备份导出和日志下载通过 `backup`、`download_log` action 处理。

### 查询端，端口 8085

| 方法 | 路径 | 说明 |
|:-----|:-----|:-----|
| `GET` | `/` | 用户查询页面 |
| `GET` | `/user/user.html` | 用户查询页面 |
| `POST` | `/query.php` | 用户查询接口 |
| `POST` | `/user/query.php` | 兼容查询接口 |
| `GET` | `/emby_image` | Emby 图片代理 |
| `GET` | `/assets/*` | 静态资源 |
| `GET` | `/health` | 健康检查 |

## 安全机制

| 防护项 | 实现方式 |
|:-------|:---------|
| 密码存储 | 使用 bcrypt 哈希，不保存明文密码 |
| 会话管理 | 内存 Session，Cookie 使用 HttpOnly、Secure、SameSite |
| CSRF 防护 | 每个 Session 拥有随机 Token，写操作校验 `X-CSRF-Token` |
| 安全响应头 | 设置 `X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy` 等 |
| API Key 保护 | 图片通过后端代理，服务器配置响应中会脱敏 API Key |
| 速率限制 | 内置 per-IP 限流，查询端额外限制 per-username 请求 |
| 登录防护 | 登录失败次数窗口和锁定机制 |
| Token 验证 | 用户查询页可开启独立访问令牌 |
| 输入校验 | 用户名长度限制、表单参数清理、邮件 HTML 转义 |
| 备份恢复 | 上传大小限制，降低异常大文件风险 |

## 项目结构

```text
.
├── main.go
├── internal/
│   └── panel/
│       ├── app.go
│       ├── admin*.go
│       ├── config.go
│       ├── db.go
│       ├── emby.go
│       ├── email.go
│       ├── query.go
│       ├── scheduler.go
│       └── users.go
├── public/
│   └── assets/
│       ├── css/
│       └── js/
├── templates/
│   ├── admin/
│   └── user/
├── Dockerfile
├── docker-compose.yml
├── go.mod
└── README.md
```

## 开发指南

安装依赖：

```bash
go mod tidy
```

运行：

```bash
go run .
```

测试：

```bash
go test ./...
```

构建：

```bash
go build -trimpath -o build/emby-users-panel .
```

Docker 构建时会通过 `-ldflags` 注入版本号：

```bash
go build -ldflags="-s -w -X main.version=$(date +%Y%m%d)" -o build/emby-users-panel .
```

### 技术选型

| 层级 | 选型 | 说明 |
|:-----|:-----|:-----|
| 后端 | Go 1.24 | 基于标准库 `net/http` |
| 数据库 | SQLite | 使用 `modernc.org/sqlite` 纯 Go 驱动 |
| 认证 | bcrypt + Session | 密码哈希和会话认证 |
| 前端 | HTML / CSS / JavaScript | 原生实现，无前端框架 |
| 部署 | Docker | 多阶段构建，Alpine 运行镜像 |

## License

MIT License. See [LICENSE](LICENSE).
