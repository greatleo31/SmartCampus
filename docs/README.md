# SmartCampus Windows 启动说明

本文按 Windows 电脑本地演示环境编写，命令默认在 PowerShell 中执行。

## 1. 准备环境

先安装并确认以下工具可用：

- JDK 17
- Maven 3.9+
- Node.js 20.19+、22.13+ 或 24+
- MySQL 8.0+

在 PowerShell 检查版本：

```powershell
java -version
mvn -v
node -v
npm -v
mysql --version
```

如果提示命令不存在，先把对应工具加入 Windows `Path` 环境变量，再重新打开 PowerShell。

## 2. 进入项目目录

```powershell
cd D:\projectCollection\SmartCampus
```

如果你的项目放在别的位置，把路径换成自己的项目目录。

## 3. 初始化 MySQL 数据库

后端默认连接：

- 数据库：`smart_campus`
- 地址：`localhost:3306`
- 用户名：`root`
- 密码：`123456`

启动本机 MySQL 服务后，进入 MySQL：

```powershell
mysql -u root -p
```

输入 MySQL 密码后，在 `mysql>` 中依次执行：

```sql
source D:/projectCollection/SmartCampus/sql/schema.sql;
source D:/projectCollection/SmartCampus/sql/views.sql;
source D:/projectCollection/SmartCampus/sql/data.sql;
exit;
```

如果项目目录不是 `D:\projectCollection\SmartCampus`，把 `source` 后面的路径改成你的实际路径，并使用 `/` 分隔。

如果你的 MySQL 用户名或密码不是默认值，启动后端前在 PowerShell 设置：

```powershell
$env:SMARTCAMPUS_DB_USERNAME="root"
$env:SMARTCAMPUS_DB_PASSWORD="你的MySQL密码"
```

如果数据库地址也不同，同时设置：

```powershell
$env:SMARTCAMPUS_DB_URL="jdbc:mysql://localhost:3306/smart_campus?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai"
```

## 4. 启动后端

打开第一个 PowerShell 窗口：

```powershell
cd D:\projectCollection\SmartCampus\backend
mvn spring-boot:run
```

看到类似下面日志说明后端已启动：

```text
Tomcat started on port 8080
Started SmartCampusApplication
```

后端地址：

- 接口文档：`http://localhost:8080/doc.html`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`

这个 PowerShell 窗口需要保持运行。停止后端时按 `Ctrl+C`。

## 5. Redis 说明

项目配置了 Redis，默认地址是 `192.168.100.128:6379`，密码默认 `123456`。

业务缓存层已经做了降级处理：Redis 连接失败时，会跳过 Redis，回退到本地缓存和数据库，主流程通常仍可演示。

如果你本机有 Redis，可以按实际情况设置：

```powershell
$env:SMARTCAMPUS_REDIS_HOST="localhost"
$env:SMARTCAMPUS_REDIS_PORT="6379"
$env:SMARTCAMPUS_REDIS_PASSWORD=""
```

注意：项目同时引入了 Spring Session Redis。当前认证主流程使用 JWT 且安全配置是无状态模式，正常接口不依赖 HTTP Session；如果你遇到 Session 相关 Redis 异常，再启动 Redis 或调整 Session 配置。

## 6. 启动前端

打开第二个 PowerShell 窗口：

```powershell
cd D:\projectCollection\SmartCampus\frontend
npm install
npm run dev
```

Vite 会输出访问地址，通常是：

```text
http://localhost:5173/
```

前端默认把 `/api`、`/v3`、`/doc.html` 代理到 `http://localhost:8080`。如果后端改了端口，例如 8081，启动前端前设置：

```powershell
$env:VITE_API_TARGET="http://localhost:8081"
npm run dev
```

这个 PowerShell 窗口也需要保持运行。停止前端时按 `Ctrl+C`。

## 7. 登录演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `123456` |
| 教师 | `teacher01` | `123456` |
| 学生 | `student01` | `123456` |

## 8. 常见问题

### `mvn`、`node`、`npm` 或 `mysql` 不是内部或外部命令

对应工具没有安装，或没有加入 Windows `Path`。安装后重新打开 PowerShell，再执行版本检查命令。

### 后端 8080 端口被占用

启动后端前设置新端口：

```powershell
$env:SMARTCAMPUS_SERVER_PORT="8081"
mvn spring-boot:run
```

同时前端也要代理到新端口：

```powershell
$env:VITE_API_TARGET="http://localhost:8081"
npm run dev
```

### MySQL 连接失败

先确认 MySQL 服务已启动，`smart_campus` 数据库已经通过 `schema.sql` 创建，并检查用户名、密码、端口是否和后端环境变量一致。

### 看到 Redis 连接警告

如果只是演示主要业务流程，可以先忽略缓存降级警告。需要完整 Redis 能力时，再启动 Redis，并设置 `SMARTCAMPUS_REDIS_HOST`、`SMARTCAMPUS_REDIS_PORT`、`SMARTCAMPUS_REDIS_PASSWORD`。

## 9. 正常启动顺序

1. 启动 MySQL。
2. 导入 `sql/schema.sql`、`sql/views.sql`、`sql/data.sql`。
3. 第一个 PowerShell 启动后端：`mvn spring-boot:run`。
4. 第二个 PowerShell 启动前端：`npm run dev`。
5. 浏览器打开 Vite 输出的地址并登录演示账号。

