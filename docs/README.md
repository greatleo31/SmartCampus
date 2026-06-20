# SmartCampus v1

SmartCampus 是通用高校教务系统，覆盖管理员、教师、学生三类角色。

## 目录

- `backend/`：Java 17、Spring Boot、Spring Security、MyBatis-Plus、Knife4j/OpenAPI。
- `frontend/`：React、TypeScript、Vite、Tailwind、shadcn/ui 风格组件、React Router、Axios、TanStack Query。
- `sql/`：MySQL 手动导入脚本。
- `docs/`：运行、验收和设计说明。

## 数据库导入

目标电脑需要本机 MySQL 服务，演示环境固定使用：

- 数据库：`smart_campus`
- 用户名：`root`
- 密码：`123456`

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/views.sql
mysql -u root -p < sql/data.sql
```

## 演示账号

账号口令只用于本地演示，数据库中保存 BCrypt 哈希。

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | admin | 123456 |
| 教师 | teacher01 | 123456 |
| 学生 | student01 | 123456 |

## 后端运行

后端已内置演示数据库连接配置，并默认读取 `backend/config/jwt-secret.txt` 作为 JWT 密钥。该密钥文件只用于课程演示交付；生产环境应改用 `SMARTCAMPUS_JWT_SECRET` 或本机私有密钥文件。

```bash
cd backend
mvn spring-boot:run
```

接口文档：

- OpenAPI JSON：`http://localhost:8080/v3/api-docs`
- Knife4j：`http://localhost:8080/doc.html`

## 前端运行

```bash
cd frontend
npm install
npm run dev
```

默认代理后端：`http://localhost:8080`。
