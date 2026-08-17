# 猫猫图鉴

面向单个校园或社区的猫咪档案、动态时间线、故事与征集网站。

## 核心功能

- 猫咪图鉴、辨认特征、公开状态与独立时间线
- 用户照片上传、手动认猫和待认领照片池
- 临时建档申请、举报纠错与工作人员后台
- 猫咪故事和固定模板征集投稿
- 独立 Django 工作人员后台、投稿 API 与腾讯云 COS 图片存储

## 技术栈

Next.js 16、TypeScript、Tailwind CSS、Django 4.2、SQLite、腾讯云 COS、Vitest。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

本地未启用 Django API 时，网站使用演示数据。后台开发运行方式见 `backend/manage.py` 和 `backend/requirements.txt`。

## 线上地址

- 网站：<https://20250821cdcdifc.top/cat/>
- 工作人员后台：<https://20250821cdcdifc.top/cat/admin/>
- 后台账号凭据保存在服务器 `/root/cat-admin-credentials.txt`（权限 `600`）。

## 验证

```bash
npm run typecheck
npm test
npm run build
```

## 当前状态

MVP 已部署；2023 图鉴录入 10 只猫咪，工作人员可在后台继续新增猫咪和时间线记录。
