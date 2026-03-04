# doc-frontend

基于 `doc-ai-agent` 的 React 对话前端（GPT 风格界面），支持：

- 会话列表与多会话切换
- 本地持久化聊天记录（localStorage）
- 助手消息模拟流式输出（前端 chunk 渲染）
- 证据面板（`mode` / `data` / `evidence`）

## 本地启动

### 1) 启动后端（doc-ai-agent）

在另一个终端启动：

```bash
cd /Users/mac/Desktop/personal/doc-cloud/doc-ai-agent
set -a && source .env.local && set +a
PYTHONPATH=src python3 scripts/run_server.py
```

确保健康检查可用：

```bash
curl -s http://127.0.0.1:8000/health
```

### 2) 启动前端

```bash
cd /Users/mac/Desktop/personal/doc-cloud/doc-frontend
npm install --cache /tmp/doc-frontend-npm-cache
npm run dev
```

默认地址：`http://127.0.0.1:5173`

## 代理说明

开发环境通过 Vite 代理：

- 前端请求：`/api/chat`
- 实际转发：`http://127.0.0.1:8000/chat`

配置见：`vite.config.ts`

## 测试与构建

```bash
npm run test:run
npm run build
```

## 未来线上发布建议

当前是本地开发模式（依赖 dev proxy）。上线时可选：

1. 在网关/Nginx 层反向代理 `/api/chat` 到 `doc-ai-agent`
2. 或后端增加 CORS，前端使用 `VITE_API_BASE_URL` 直连

建议优先方案 1，前后端职责更清晰。
