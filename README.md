# GenPhoto

AI 图片生成平台，基于 Spring Boot 3 + React，支持多模型图片生成、提示词管理、社交分享、收藏标签、数据统计等功能。

## 技术栈

**后端：** Spring Boot 3.4.3 · Spring Security · Spring AI · LangChain4J · JPA + MySQL · MinIO · JWT

**前端：** React 19 · TypeScript · Vite · Zustand · React Router

## 项目结构

```
genphoto/
├── genphoto-common        # 公共模块（统一响应、异常处理、事件定义）
├── genphoto-web           # 主启动模块（聚合所有子模块、配置管理）
├── genphoto-user          # 用户认证（注册登录、JWT、Spring Security）
├── genphoto-image         # 图片管理（上传下载、MinIO 对象存储）
├── genphoto-generation    # AI 图片生成（Spring AI、多模型多风格）
├── genphoto-prompt        # 提示词管理（模板、变量渲染、历史记录）
├── genphoto-social        # 社交分享（公开图库、评论系统、事件驱动）
├── genphoto-ai            # AI 文本服务（灵感生成、提示词优化、自动评价）
├── genphoto-favorite      # 收藏标签（收藏夹、标签分类）
├── genphoto-stats         # 数据统计（使用分析、报表导出）
├── genphoto-frontend      # 前端应用（React SPA）
└── deploy/                # 部署脚本与配置
```

## 功能特性

- **AI 图片生成** — 支持 Gemini 2.5 Flash Image 等多模型，6 种艺术风格（自然、鲜艳、动漫、油画、水彩、像素）
- **提示词系统** — 模板管理、变量渲染、AI 灵感生成、提示词优化
- **用户系统** — 邮箱注册登录、JWT 无状态认证、个人资料管理
- **图片管理** — MinIO 对象存储、流式下载、ETag 缓存
- **社交功能** — 公开图库（广场）、评论系统、AI 自动评价（事件驱动）
- **收藏标签** — 收藏夹、多标签分类筛选
- **数据统计** — 个人统计、每日趋势、模型分布、CSV 导出

## 快速开始

### 环境要求

| 依赖 | 版本 |
|------|------|
| JDK | 17 |
| Node.js | 18+ |
| MySQL | 8.0+ |

### 1. 克隆项目

```bash
git clone https://github.com/A47z/genphoto.git
cd genphoto
```

### 2. 配置环境变量

项目通过环境变量管理敏感配置，也可直接修改 `genphoto-web/src/main/resources/application.yml`：

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `DB_HOST` | MySQL 地址 | `localhost` |
| `DB_USERNAME` | MySQL 用户名 | `root` |
| `DB_PASSWORD` | MySQL 密码 | `changeme` |
| `AI_IMAGE_API_KEY` | 图片生成 API Key | - |
| `AI_IMAGE_BASE_URL` | 图片生成 API 地址 | `https://api.openai.com` |
| `AI_TEXT_API_KEY` | 文本 LLM API Key | - |
| `AI_TEXT_BASE_URL` | 文本 LLM API 地址 | `http://localhost:8317/v1` |
| `JWT_SECRET` | JWT 签名密钥（≥32 字节） | - |
| `MINIO_ENDPOINT` | MinIO 地址 | `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO Access Key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO Secret Key | `minioadmin` |

数据库会自动创建（连接串已配置 `createDatabaseIfNotExist=true`），无需手动建库。

### 3. 安装前端依赖

```bash
cd genphoto-frontend
npm install
cd ..
```

### 4. 启动

**方式一：一键启动（Windows）**

双击 `start.bat`，自动打开后端和前端两个窗口。

**方式二：手动启动**

```bash
# 终端 1 — 后端
./mvnw spring-boot:run -pl genphoto-web

# 终端 2 — 前端
cd genphoto-frontend && npm run dev
```

### 5. 访问

| 服务 | 地址 |
|------|------|
| 前端页面 | http://localhost:5173 |
| 后端 API | http://localhost:8080 |
| API 文档 | http://localhost:8080/swagger-ui.html |

## API 概览

| 模块 | 端点前缀 | 说明 |
|------|---------|------|
| 用户 | `/api/user` | 注册、登录、个人资料 |
| 图片 | `/api/images` | 上传、下载、删除、列表 |
| 生成 | `/api/generation` | AI 图片生成、模型/风格列表 |
| 提示词 | `/api/prompts` | 模板 CRUD、渲染、历史 |
| 分享 | `/api/share` | 公开/私密切换、公共图库 |
| 评论 | `/api/comments` | 添加、列表、删除 |
| AI 文本 | `/api/ai/prompt` | 灵感生成、提示词优化 |
| 收藏 | `/api/favorites` | 收藏、取消收藏 |
| 标签 | `/api/tags` | 标签管理、按标签筛选 |
| 统计 | `/api/stats` | 个人统计、趋势、导出 |

完整 API 文档启动后访问 Swagger UI。

## 部署

```
Browser → Nginx (:80)
             ├─ /           → 静态前端文件
             ├─ /api/images/*/file → 代理 + 缓存
             └─ /api/*      → Spring Boot (:8080)
                                ├─ MySQL (:3306)
                                └─ MinIO (:9000)
```

部署脚本位于 `deploy/` 目录，详见 [SETUP.md](SETUP.md)。

## License

MIT
