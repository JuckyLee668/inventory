# Electron 库存管理 App（模拟实现）

本项目根据需求文档实现了一个可运行的 Electron 原型，覆盖以下能力：

- 入库管理、出库管理、库存查询、低库存预警
- 条码拍照识别（模拟）
- 语音输入识别（模拟）
- 数据上传与指数退避重试（模拟）
- Electron 主进程/渲染进程/Preload + IPC 架构

## 运行方式

```bash
npm install
npm run test
npm start
```

## 说明

- `src/data/mock-db.json` 作为模拟数据库。
- `src/services/` 包含库存、识别、上传服务。
- `src/main.js` 中通过 `ipcMain.handle` 暴露主能力。
