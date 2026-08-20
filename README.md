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
- API 健康检查：<https://20250821cdcdifc.top/cat/api/health/>

## 生产部署

生产环境运行于腾讯云 Ubuntu Server 24.04 LTS：

- Next.js 前端：`cat-atlas-web.service`，监听 `127.0.0.1:3180`
- Django API：`cat-atlas-api.service`，监听 `127.0.0.1:3181`
- 发布目录：`/srv/cat-atlas/releases/<commit-sha>`
- 当前版本：`/srv/cat-atlas/current`
- 持久数据：`/srv/cat-atlas/shared/data` 与 `/srv/cat-atlas/shared/media`
- 服务配置：`/etc/cat-atlas/api.env` 与 `/etc/cat-atlas/web.env`

推送到 `master` 后，[GitHub Actions](.github/workflows/deploy.yml) 会执行类型检查、
测试和 Next.js 构建。发布包排除 `.next/cache`、SQLite 和媒体目录；服务器通过
npmmirror 安装 Node.js 依赖、通过清华 PyPI 镜像创建 Python 虚拟环境，然后执行
Django migration、collectstatic、原子切换和双端健康检查。发布失败会恢复上一版本，
SQLite 会在迁移前备份。

仓库需要配置 `DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_SSH_KEY` 和
`DEPLOY_HOST_KEY` 四项 Actions Secrets。部署用户只可调用固定的
`/usr/local/sbin/deploy-cat-atlas`，密钥、后台凭据和生产环境文件不得提交到 Git。

## 验证

```bash
npm run typecheck
npm test
npm run build
```

## 当前状态

MVP 已部署；2023 图鉴录入 10 只猫咪，工作人员可在后台继续新增猫咪和时间线记录。
