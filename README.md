# 库存管理三端应用（Electron + Mobile + Server）

本项目已按要求实现三端：

- **手机 App（H5）**：`mobile/index.html`
- **电脑后台（Electron）**：`src/admin.html`
- **服务器端（Node.js API）**：`server/index.js`

## 功能覆盖

- 入库管理、出库管理、库存查询、低库存预警
- 条码识别（模拟）、语音识别（模拟）
- 数据同步上传与指数退避重试（模拟）
- 角色权限校验（admin/operator）

## 运行方式

```bash
npm install
npm run lint
npm run test
npm run start:server
npm start
```

> 若当前环境无法安装 Electron，可先运行 `npm run start:server`，
> 再通过静态服务器打开 `src/admin.html` 或 `mobile/index.html` 进行联调。

## 目录结构

- `src/`：电脑后台与业务服务
- `mobile/`：手机端页面
- `server/`：HTTP API 服务
- `docs/`：需求文档
