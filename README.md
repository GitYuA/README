<div align="center">

# Emby Users Panel

**轻量、全能的 Emby 用户生命周期管理面板**

单二进制 · 零外部依赖 · 多服务器 · Docker 一键部署

![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Pure_Go-003B57?logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 目录

- [功能概览](#功能概览)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [配置指南](#配置指南)
- [项目结构](#项目结构)
- [API 参考](#api-参考)
- [安全机制](#安全机制)
- [开发指南](#开发指南)
- [License](#license)

---

## 功能概览

### 仪表盘总览
- 媒体库统计（电影、剧集、单集数量）
- 运营数据概览（用户数、总播放次数、总播放时长）
- 在线会话实时监控（正在播放的用户、进度、设备信息）
- 最近入库 / 最近播放内容展示（横向封面卡片）
- 播放趋势图（入库趋势 / 播放趋势，支持 30 天 / 12 周 / 12 月时间范围切换）
- 影视榜（热度榜 / 观影榜模式切换，支持 30 天 / 12 周 / 12 月时间范围切换）

### 用户管理
- 创建、编辑、充值 / 续费、启用 / 禁用、删除用户
- 批量操作：充值、修改、启用、禁用、删除
- 从模板用户复制权限与配置创建新用户
- 用户分组管理与备注
- 表格列自定义显示 / 隐藏、排序偏好记忆

### 多服务器
- 同时管理多台 Emby 服务器，面板内一键切换
- 每台服务器独立数据库、独立配置覆盖（定时任务、SMTP、过期策略等）

### 自动化任务
- 可配置的每日定时检测，自动禁用或删除过期用户
- 到期前 N 天邮件提醒通知
- 操作通知邮件（充值、启用、禁用、删除）

### 播放统计
- 集成 Emby Playback Reporting 插件，获取详细播放记录
- 无插件时自动回退到 Emby Items API 采集播放数据
- 按剧集名称智能聚合（API 回退 + SeriesName 批量查询）

### 用户自助查询
- 独立端口的用户查询页面，用户可自行查看到期时间
- 可选 Token 验证保护
- 独立 per-IP 和 per-username 双重限流

### 数据管理
- 一键导出 / 导入 JSON 备份（恢复上限 10MB）
- 操作日志记录与下载
- 配置文件自动持久化

### 界面体验
- 浅色 / 深色 / 跟随系统主题切换
- 完整的移动端响应式适配

---

## 技术架构

| 层级 | 选型 | 说明 |
|:-----|:-----|:-----|
| **后端** | Go 1.24 | 纯标准库 `net/http`，无 Web 框架 |
| **数据库** | SQLite | 纯 Go 驱动 ([modernc.org/sqlite](https://pkg.go.dev/modernc.org/sqlite))，无 CGO |
| **认证** | bcrypt + Session | 密码哈希存储，CSRF Token 防护 |
| **前端** | HTML / CSS / JS | 原生实现，零框架依赖 |
| **部署** | Docker | 多阶段构建，Alpine 基础镜像，约 20MB |

---

## 快速开始

### 方式一：Docker Compose（推荐）

```bash
git clone <repo-url> && cd emby-users-panel
docker compose up -d
```

默认的 `docker-compose.yml` 已包含端口映射、数据卷挂载与健康检查。

### 方式二：Docker 手动运行

```bash
# 构建镜像
docker build -t emby-users-panel:latest .

# 运行容器
docker run -d \
  --name embyuserspanel \
  --restart always \
  -p 8086:8086 \
  -p 8085:8085 \
  -v ./data:/data \
  -e TZ=Asia/Shanghai \
  emby-users-panel:latest
```

### 方式三：本地编译

```bash
# 需要 Go 1.24+
go mod tidy
go build -trimpath -o build/emby-users-panel .
./build/emby-users-panel
```

### 访问地址

启动后通过浏览器访问：

| 服务 | 地址 | 说明 |
|:-----|:-----|:-----|
| 管理面板 | `http://<host>:8086` | 管理员操作后台 |
| 用户查询 | `http://<host>:8085` | 用户自助查询页面 |
| 健康检查 | `http://<host>:8086/health` | 返回 `{"status":"ok"}` |

---

## 配置指南

### 首次设置

1. 访问管理面板 `http://<host>:8086`
2. 进入**系统设置 → 服务器管理**，添加 Emby 服务器
3. 填写服务器地址（如 `http://192.168.1.100:8096`）和 API Key
4. API Key 在 Emby 后台 **设置 → API 密钥** 页面生成

所有设置均通过面板修改，自动持久化到 `/data/config.json`。

### 环境变量

| 变量 | 默认值 | 说明 |
|:-----|:-------|:-----|
| `APP_DATA_DIR` | `/data` | 运行时数据目录（配置、数据库、日志） |
| `TZ` | `Asia/Shanghai` | 系统时区（影响定时任务与日期显示） |

### 每服务器独立配置

在面板中可为每台服务器单独覆盖以下设置，未设置的项自动继承全局配置：

- 定时检查时间 / 是否启用自动任务
- 过期处理策略（禁用 / 删除）
- SMTP 邮件配置
- 日志保留天数
- 模板用户

---

## 项目结构

```
.
.
├── main.go                         # 启动入口，注入版本并调用 internal/panel
├── internal/
│   └── panel/                      # 后端业务代码
│       ├── app.go                  # App 容器、初始化、路由和双端口服务
│       ├── admin.go                # 管理端 GET/POST、认证、Action 分发
│       ├── admin_user_actions.go   # 用户充值、创建、编辑、删除、批量操作
│       ├── admin_dashboard_actions.go # 仪表盘数据、缓存、趋势和实时播放
│       ├── admin_server_actions.go # 服务器保存、切换、删除
│       ├── admin_settings_actions.go # 系统设置和邮件测试
│       ├── admin_backup_logs_actions.go # 备份恢复、日志、手动任务
│       ├── config.go               # 配置类型与 ConfigStore
│       ├── db.go                   # SQLite 连接池和本地用户存储
│       ├── emby.go                 # Emby REST API 和图片代理
│       ├── users.go                # 用户 CRUD、本地数据与 Emby 同步
│       ├── query.go                # 用户自助查询端路由与逻辑
│       └── utils.go                # 通用工具函数
├── public/
│   └── assets/
│       ├── css/
│       │   ├── style.css           # 管理端样式入口
│       │   ├── admin/              # 管理端样式模块
│       │   └── user/               # 用户查询页样式
│       └── js/
│           ├── common.js           # 公共前端工具
│           ├── admin/              # 管理端交互模块
│           └── user/               # 用户查询页交互
├── templates/
│   ├── admin/                      # 管理端模板
│   └── user/                       # 用户查询页模板
├── build/                          # 本地构建产物
├── data/                           # 运行时数据（自动创建）
├── Dockerfile
├── docker-compose.yml
├── go.mod
└── README.md
```

---

## API 参考

### 管理端（端口 8086）

| 方法 | 路径 | 说明 |
|:-----|:-----|:-----|
| `GET` | `/` | 管理面板主页（未登录时显示登录页） |
| `POST` | `/` | 登录认证 / AJAX 操作分发 |
| `GET` | `/index.php` | 兼容路径，同 `/` |
| `GET` | `/emby_image` | Emby 图片代理（隐藏 API Key） |
| `GET` | `/assets/*` | 静态资源（JS / CSS） |
| `GET` | `/health` | 健康检查 |

#### AJAX Action 列表

管理端所有操作通过 `POST /` 的 `action` 字段分发，需携带 `X-CSRF-Token` 请求头：

| Action | 说明 |
|:-------|:-----|
| `login` | 管理员登录（无需已认证会话） |
| `charge` | 单用户充值 |
| `create` | 创建新用户 |
| `save_edit` | 保存用户编辑 |
| `delete` | 删除用户 |
| `batch` | 批量操作（充值 / 修改 / 启用 / 禁用 / 删除） |
| `refresh_cache` | 刷新用户缓存 |
| `server_op` | 服务器管理操作（增 / 删 / 切换） |
| `settings_op` | 保存系统设置 |
| `test_email` | 发送测试邮件 |
| `restore` | 导入备份 |
| `get_users` | 获取用户列表 JSON |
| `get_dashboard_heavy` | 获取仪表盘重数据（统计、趋势、排行榜、媒体库等） |
| `get_dashboard_realtime` | 获取仪表盘实时数据（在线会话、播放状态等） |
| `get_logs` | 获取操作日志 |
| `run_auto_check` | 手动触发过期检测 |

> **备份导出** 和 **日志下载** 通过 `POST /` 的 `backup` / `download_log` action 进行，需携带 `X-CSRF-Token` 请求头。

### 查询端（端口 8085）

| 方法 | 路径 | 说明 |
|:-----|:-----|:-----|
| `GET` | `/` | 用户查询页面 |
| `GET` | `/user/user.html` | 用户查询页面 |
| `POST` | `/query.php` | 用户查询接口 |
| `POST` | `/user/query.php` | 同上（兼容路径） |
| `GET` | `/health` | 健康检查 |

---

## 安全机制

| 防护层 | 实现方式 |
|:-------|:---------|
| **密码存储** | bcrypt 哈希，不存储明文 |
| **会话管理** | 内存 Session + HttpOnly / Secure / SameSite Cookie，登录成功后重新生成 Session ID |
| **CSRF 防护** | 每 Session 随机 Token，所有写操作校验 `X-CSRF-Token` 请求头 |
| **安全响应头** | `X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、`Referrer-Policy`、`Permissions-Policy` 等 |
| **API Key 保护** | 图片请求通过 `/emby_image` 后端代理，API Key 不暴露到前端；服务器操作响应中 Key 自动脱敏为 `******` |
| **速率限制** | 内存滑动窗口 per-IP 限流 + 查询端 per-username 限流，防止暴力枚举 |
| **登录防护** | 每 IP 速率限制 + 每 Session 失败次数窗口（5 次 / 10 分钟锁定） |
| **Token 验证** | 用户查询页可启用独立访问令牌（SHA256 恒定时间比较） |
| **输入校验** | 用户名长度限制（64 字符）、表单参数消毒、邮件内容 HTML 转义防注入 |
| **备份恢复** | 上传文件限制 10MB，防止 OOM |
| **深拷贝** | Emby Policy 等嵌套对象使用 JSON 深拷贝，避免数据污染 |

---

## 开发指南

```bash
# 安装依赖
go mod tidy

# 运行
go run .

# 编译
go build -trimpath -o build/emby-users-panel .

# 测试
go test ./...
```

### 构建版本注入

Docker 构建时通过 `-ldflags` 自动注入版本号（日期格式）：

```bash
go build -ldflags="-s -w -X main.version=$(date +%Y%m%d)" -o build/emby-users-panel .
```

### 依赖

| 模块 | 用途 |
|:-----|:-----|
| `golang.org/x/crypto` | bcrypt 密码哈希 |
| `modernc.org/sqlite` | 纯 Go SQLite 驱动（无 CGO） |

---

## License

[MIT](LICENSE)
