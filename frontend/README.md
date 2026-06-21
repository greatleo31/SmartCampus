# SmartCampus 前端

前端使用 React、TypeScript、Vite 和 Tailwind。完整 Windows 启动步骤见：[`../docs/README.md`](../docs/README.md)。

单独启动前端：

```powershell
npm install
npm run dev
```

默认代理后端：`http://localhost:8080`。

如果后端端口不是 8080：

```powershell
$env:VITE_API_TARGET="http://localhost:8081"
npm run dev
```

