# GenPhoto 全新 Windows 环境搭建指南

> 本文档记录在一台全新的 Windows 电脑上从零开始运行 GenPhoto 项目所需的全部步骤。

---

## 一、环境要求总览

| 依赖       | 版本要求       | 用途              |
| ---------- | -------------- | ----------------- |
| JDK        | 17             | 后端 Spring Boot  |
| Node.js    | 18+            | 前端 Vite + React |
| npm        | 9+（随 Node）  | 前端包管理        |
| MySQL      | 8.0+           | 数据库            |
| Git        | 任意版本       | 拉取代码          |
| Maven      | 3.9.9（已内置）| 后端构建（mvnw）  |

---

## 二、逐步安装

### 1. 安装 JDK 17

1. 下载：https://adoptium.net/temurin/releases/?version=17&os=windows&arch=x64
   - 选择 `.msi` 安装包，安装时勾选 **Set JAVA_HOME variable**
2. 验证：
   ```
   java -version    # 输出应包含 "17"
   echo %JAVA_HOME% # 应指向 JDK 安装目录
   ```

### 2. 安装 Node.js

1. 下载：https://nodejs.org/ （选择 LTS 版本，18 或 20 均可）
   - 安装时勾选 **Add to PATH**
2. 验证：
   ```
   node -v  # v18.x 或更高
   npm -v   # 9.x 或更高
   ```

### 3. 安装 MySQL 8.0

1. 下载：https://dev.mysql.com/downloads/installer/
   - 选择 **mysql-installer-community**（完整版）
2. 安装时注意：
   - 选择 **Server only**（只装服务端即可）
   - 设置 root 密码（记住这个密码，后面要用）
   - 默认端口 **3306** 不要改
   - 字符集选择 **UTF-8**（默认即可）
3. 验证：
   ```
   mysql -u root -p
   # 输入密码后能进入 MySQL 命令行即可
   ```
4. 数据库会自动创建，无需手动建库（连接串中已配置 `createDatabaseIfNotExist=true`）

### 4. 安装 Git

1. 下载：https://git-scm.com/download/win
2. 安装时全部默认即可
3. 验证：
   ```
   git --version
   ```

---

## 三、获取代码

```bash
git clone <仓库地址>
cd genphoto
```

---

## 四、修改配置（重要）

后端配置文件位于：

```
genphoto-web/src/main/resources/application.yml
```

**以下是你需要根据本机环境修改的配置项：**

### 1. 数据库连接

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/genphoto?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&createDatabaseIfNotExist=true
    username: root
    password: 你的MySQL密码    # <-- 改成你安装 MySQL 时设置的 root 密码
```

### 2. AI API 配置

项目使用第三方 OpenAI 兼容 API 进行图片生成：

```yaml
spring:
  ai:
    openai:
      api-key: 你的API密钥       # <-- 找管理员获取 API Key
      base-url: https://api.cphone.vip
      chat:
        options:
          model: gemini-2.5-flash-image
```

### 3. JWT 密钥（可选，生产环境必须修改）

```yaml
jwt:
  secret: 至少32字节的密钥字符串    # <-- 生产环境请替换
  expiration: 86400000             # 24小时，单位毫秒
```

### 4. 图片存储路径（可选）

```yaml
genphoto:
  storage:
    path: ./uploads    # 默认存储在项目根目录下的 uploads 文件夹
```

---

## 五、安装前端依赖

```bash
cd genphoto-frontend
npm install
cd ..
```

首次运行必须执行此步骤，之后不需要重复执行（除非 package.json 有变动）。

---

## 六、启动项目

### 方式一：一键启动（推荐）

双击项目根目录下的 **start.bat**，会自动打开两个窗口分别运行后端和前端。

### 方式二：手动启动

**终端 1 — 启动后端：**
```bash
cd genphoto
mvnw.cmd spring-boot:run -pl genphoto-web
```

**终端 2 — 启动前端：**
```bash
cd genphoto/genphoto-frontend
npm run dev
```

### 启动后访问

| 服务     | 地址                              |
| -------- | --------------------------------- |
| 前端页面 | http://localhost:5173             |
| 后端 API | http://localhost:8080             |
| API 文档 | http://localhost:8080/swagger-ui.html |

---

## 七、常见问题

### Q: 后端启动报错 `Access denied for user 'root'`
**A:** application.yml 中的 MySQL 密码与你本机不一致，修改 `spring.datasource.password`。

### Q: 后端启动报错 `Communications link failure`
**A:** MySQL 服务未启动。打开 Windows 服务（`services.msc`），找到 MySQL 服务并启动。

### Q: 前端启动报 `npm ERR! code ENOENT`
**A:** 没有执行 `npm install`，先进入 `genphoto-frontend` 目录执行一次。

### Q: 前端请求后端报 CORS 错误
**A:** 确保后端已正常启动，且前端请求的地址是 `http://localhost:8080`。

### Q: `mvnw.cmd` 执行报错 `JAVA_HOME is not set`
**A:** JDK 安装时没有设置 JAVA_HOME。手动设置：
1. 右键「此电脑」→ 属性 → 高级系统设置 → 环境变量
2. 新建系统变量 `JAVA_HOME`，值为 JDK 安装路径（如 `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`）
3. 重新打开终端

### Q: 首次构建下载 Maven 依赖很慢
**A:** Maven 默认从国外仓库下载。可在 `C:\Users\<用户名>\.m2` 下创建 `settings.xml` 配置阿里云镜像：
```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```
注意：本项目依赖 Spring AI（milestone 版本），需要保留 Spring Milestones 仓库的访问，因此建议 `mirrorOf` 设为 `central` 而非 `*`。

### Q: npm install 下载很慢
**A:** 配置淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

---

## 八、项目结构

```
genphoto/
├── genphoto-common/       # 公共模块（工具类、异常、统一响应）
├── genphoto-user/         # 用户模块（注册、登录、JWT）
├── genphoto-generation/   # AI图片生成模块（Spring AI）
├── genphoto-image/        # 图片存储模块（上传、下载、画廊）
├── genphoto-prompt/       # 提示词模块（模板、变量、历史）
├── genphoto-favorite/     # 收藏模块（收藏夹、标签）
├── genphoto-social/       # 社交模块（分享、评论）
├── genphoto-stats/        # 统计模块（使用分析、CSV导出）
├── genphoto-web/          # 主启动模块（Spring Boot 入口）
├── genphoto-frontend/     # 前端（React + TypeScript + Vite）
├── start.bat              # 一键启动脚本
├── pom.xml                # Maven 根配置
└── SETUP.md               # 本文档
```

---

## 九、技术栈版本速查

| 技术             | 版本          |
| ---------------- | ------------- |
| Spring Boot      | 3.4.3         |
| Spring AI        | 1.0.0-M6      |
| Java             | 17            |
| Maven            | 3.9.9（内置） |
| MySQL Connector  | 随 Spring Boot|
| JJWT             | 0.12.6        |
| SpringDoc OpenAPI| 2.8.4         |
| React            | 19.2.4        |
| TypeScript       | 5.9.3         |
| Vite             | 8.0.0         |
| Axios            | 1.13.6        |
| React Router     | 7.13.1        |
| Zustand          | 5.0.11        |
