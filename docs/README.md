# SmartCampus v1

SmartCampus 是通用高校教务系统，覆盖管理员、教师、学生三类角色。

## 目录

- `backend/`：Java 17、Spring Boot、Spring Security、MyBatis-Plus、Knife4j/OpenAPI。
- `frontend/`：React、TypeScript、Vite、Tailwind、shadcn/ui 风格组件、React Router、Axios、TanStack Query。
- `sql/`：MySQL 手动导入脚本。
- `docs/`：运行、验收和设计说明。

## 数据库导入

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/views.sql
mysql -u root -p < sql/data.sql
```

## 演示账号

账号口令只用于本地演示，数据库中保存 BCrypt 哈希。

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | admin | Admin@12345 |
| 教师 | teacher01 | Teacher@12345 |
| 学生 | student01 | Student@12345 |

## 后端运行

```bash
cd backend
$env:SMARTCAMPUS_DB_USERNAME="root"
$env:SMARTCAMPUS_DB_PASSWORD="你的本地数据库密码"
$env:SMARTCAMPUS_JWT_SECRET="至少32字符的本地开发密钥"
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
