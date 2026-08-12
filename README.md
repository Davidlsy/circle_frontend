# Circle 粉丝社群 · 前端

> **当前版本**：`1.0.68`（取自 `package.json`，文档与代码同步）
> **技术栈**：Vue 3 + Vite 5 + Pinia + vue-router 4 + axios
> **定位**：Circle 粉丝社群平台的**前端单页应用（SPA）**，与后端 [`circle_backend`](https://github.com/Davidlsy/circle_backend) 前后端分离协作。

---

## 一、项目简介

Circle 是一个面向明星与粉丝的社群平台。本仓库为其**前端**，基于 Vue 3 构建：

- 用户端通过浏览器访问，所有数据经 `/api` 前缀请求后端 REST 接口；
- 开发期由 Vite 代理把 `/api` 转发到本地后端（`http://localhost:8000`）；
- 后端代码仓库：[`circle_backend`](https://github.com/Davidlsy/circle_backend)。

> ⚠️ 本 README 严格依据仓库当前代码现状编写（路由表、API 模块、scripts 均实测提取），不凭记忆补全。已知坑见 [第九章](#九已知问题--待修复必读)。

---

## 二、功能特性

> 状态图例：**✅ 已实现** · **🟡 部分实现（流程未完全接通）** · **🔲 规划中（代码尚无对应实现）**

| 模块 | 功能点 | 状态 | 说明 / 接口 |
|------|--------|------|-------------|
| **账号体系** | 注册 | ✅ | `POST /auth/register` |
| | 登录（用户名+密码） | ✅ | `POST /auth/login`（OAuth2 表单格式 `application/x-www-form-urlencoded`） |
| | 个人资料 | ✅ | `GET /users/me` |
| | **找回密码** | 🔲 | 代码中无 forgot/reset 接口与页面，属规划中 |
| **第三方登录** | 微信 / 抖音 / 支付宝 | 🟡 | `oauth.js` 与 `OauthCallbackView` 已实现调用，但**回调路由未注册 + 注册接口后端缺失** → 见 [§九](#九已知问题--待修复必读) R1、补充⑦ |
| **动态与帖子** | 动态流 | ✅ | `GET /feed/` |
| | 帖子列表 | ✅ | `GET /posts/` |
| | 发布帖子 | 🟡 | API `POST /posts/` 已实现，但**发帖入口 `CreatePostView` 未注册路由** → R3 |
| | 图片上传 | ✅ | `POST /posts/{id}/images` |
| | 评论 | ✅ | `GET/POST /posts/{id}/comments` |
| | 点赞 | ✅ | `POST /posts/{id}/like` |
| | 收藏 | ✅ | `POST /posts/{id}/collect` |
| | 推荐 | ✅ | `GET /posts/recommended` |
| **关注关系** | 关注 / 取关 | ✅ | `POST /users/{id}/follow`（toggle） |
| | 粉丝 / 关注列表 | ✅ | `GET /users/{id}/followers`、`GET /users/{id}/following` |
| | 用户资料 | ✅（不稳定） | `GET /users/{id}` 后端重复路由致结构不确定 → R2 |
| **私信与群聊** | 私信会话 | ✅ | `GET/POST /messages/conversations` |
| | 会话消息 | ✅ | `GET/POST /messages/conversations/{id}/messages` |
| | 标记已读 | ✅ | `PUT /messages/conversations/{id}/read` |
| | 未读计数 | ✅ | `GET /messages/conversations/unread-count` |
| | 群聊 | ✅ | `GET /groups/`、`GET/POST /groups/{id}/messages` 等 |
| **明星 Stars** | 列表 / 详情 | ✅ | `GET /stars/`、`GET /stars/{id}` |
| | 申请粉丝 / 粉丝列表 | ✅ | `POST /stars/{id}/fans/apply`、`GET /stars/{id}/fans` |
| | 关注明星 | ✅ | `POST /stars/{id}/follow` |
| | 打卡 | ✅ | `POST /stars/{id}/checkin`、`GET /stars/{id}/checkin/status` |
| **粉丝圈 FanCircle** | 列表 / 详情页 | 🟡 | 页面 `FanCirclesView` / `FanCircleDetailView` 已存在，但**无独立 fan-circle API 模块**，复用 `stars`/`posts` 数据，详情页直接请求 `/fan-circles/{id}/photos` → R4 |
| **表情包 Sticker** | 消息展示 | 🔲 | 仅聊天消息 `message_type='sticker'` 占位显示 `[表情包]`，无数据模块 / 选择器 → R5 |

---

## 三、技术栈

| 类别 | 依赖 | 版本（取自 `package.json`） |
|------|------|------------------------------|
| 框架 | `vue` | ^3.4.0 |
| 构建工具 | `vite` | ^5.4.0 |
| Vue 插件 | `@vitejs/plugin-vue` | ^5.0.0 |
| 状态管理 | `pinia` | ^2.1.0 |
| 路由 | `vue-router` | ^4.3.0 |
| HTTP | `axios` | ^1.7.0 |

> 仓库**未内置** ESLint / Prettier / 单测脚本，提交前请各自本地约定代码风格。

---

## 四、环境要求

- **Node.js ≥ 18**（LTS 推荐，如 18.x / 20.x）。`start.bat` 会校验 `node` 是否存在；Vite 5 本身要求 Node 18+。
- 包管理器：`npm`（或 `pnpm` / `yarn`，请保持锁文件一致；仓库已带 `package-lock.json`）。
- `package.json` 未声明 `engines` 字段，版本要求以上述实测为准。

---

## 五、安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 生产构建（输出到 dist/）
npm run build

# 4. 本地预览构建产物
npm run preview
```

**脚本说明（`package.json` 实测）**

| 命令 | 等价 | 说明 |
|------|------|------|
| `npm run dev` | `vite` | 开发服务器，默认端口 5173 |
| `npm run build` | `vite build` | 生产构建 |
| `npm run preview` | `vite preview` | 预览构建结果 |

**Windows 一键启动**：仓库根目录已提供 `start.bat`，双击即自动检测 Node、首次自动 `npm install` 并启动 `npm run dev`（提示前端 `http://localhost:5173`、后端 `http://localhost:8000/docs`）。

---

## 六、环境变量 / 配置

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| API 基础路径 | `/api`（硬编码于 `src/api/index.js`） | axios 实例 `baseURL: '/api'`，开发期由 Vite 代理转发 |
| Vite 代理 | `/api` → `http://localhost:8000` | 见 `vite.config.js`，带 `rewrite` 去掉 `/api` 前缀 |
| 路径别名 | `@` → `/src` | 见 `vite.config.js` `resolve.alias` |

> **关于直连后端 / 生产 API 地址**：当前 `src/api/index.js` 把 `baseURL` **硬编码为 `/api`**，代码内**没有** `VITE_API_BASE` 之类的环境变量开关。因此：
> - 开发期：改后端地址只需编辑 `vite.config.js` 的 `server.proxy['/api'].target`。
> - 生产期：构建产物仍请求同源的 `/api`，需由部署层（如 Nginx 反向代理）把 `/api` 指到后端；若需改前缀，请在 `src/api/index.js` 自行接入 `import.meta.env.VITE_API_BASE`。
> - 仓库 `.gitignore` 已忽略 `.env*` 文件，环境配置不入库。

---

## 七、目录结构

```
circle_frontend/
├── Direct_ai/                                   # 第三方登录 / 游客访问等需求文档
│   ├── GUEST_ACCESS_REQUIREMENTS.md
│   ├── THIRD_PARTY_LOGIN_FRONTEND_REQUIREMENTS.md
│   └── 第三方账号注册与登录功能需求表（前端）.md
├── src/
│   ├── api/
│   │   ├── index.js                             # axios 实例（baseURL='/api'、拦截器）
│   │   └── modules/                             # 六大 API 模块
│   │       ├── auth.js                          # 登录 / 注册 / 解绑 / 授权 URL
│   │       ├── oauth.js                         # 第三方 OAuth 登录 / 注册 / 绑定
│   │       ├── posts.js                         # 动态 / 帖子 / 评论 / 点赞 / 收藏 / 推荐 / 图片
│   │       ├── social.js                        # 关注关系 / 用户资料
│   │       ├── chat.js                          # 私信 + 群聊
│   │       └── stars.js                         # 明星 / 粉丝 / 打卡
│   ├── components/
│   │   └── AuthModal.vue                        # 登录过期弹窗
│   ├── composables/
│   │   └── useAuthGuard.js                       # 401 拦截与过期提示
│   ├── router/
│   │   └── index.js                             # 路由表（见下）
│   ├── stores/
│   │   └── user.js                              # Pinia 用户态（token / profile）
│   ├── views/                                   # 15 个页面组件
│   │   ├── CreatePostView.vue                   # 发帖（⚠️ 未在路由注册，见 R3）
│   │   ├── FanCircleDetailView.vue
│   │   ├── FanCirclesView.vue
│   │   ├── GroupChatView.vue
│   │   ├── GroupsView.vue
│   │   ├── HomeView.vue
│   │   ├── LayoutView.vue
│   │   ├── LoginView.vue
│   │   ├── MessagesView.vue
│   │   ├── OauthCallbackView.vue                # 第三方回调（⚠️ 未在路由注册，见补充⑦）
│   │   ├── PostDetailView.vue
│   │   ├── ProfileView.vue
│   │   ├── RegisterView.vue
│   │   ├── StarDetailView.vue
│   │   └── StarsView.vue
│   ├── assets/
│   │   └── main.css
│   ├── App.vue
│   └── main.js
├── index.html                                    # 标题 "Circle - 粉丝社群"
├── vite.config.js                                # 开发代理 /api → :8000
├── start.bat                                     # Windows 一键启动
├── package.json                                  # v1.0.68
├── package-lock.json
└── .gitignore
```

**路由表（`src/router/index.js` 实测）**

| 路径 | 名称 | 页面 | 访问 |
|------|------|------|------|
| `/login` | Login | LoginView | 游客 |
| `/register` | Register | RegisterView | 游客 |
| `/` | Home | HomeView | 公开 |
| `/stars` | Stars | StarsView | 公开 |
| `/stars/:id` | StarDetail | StarDetailView | 公开 |
| `/fan-circles` | FanCircles | FanCirclesView | 公开 |
| `/fan-circles/:id` | FanCircleDetail | FanCircleDetailView | 公开 |
| `/posts/:id` | PostDetail | PostDetailView | 公开 |
| `/messages` | Messages | MessagesView | 需登录 |
| `/groups` | Groups | GroupsView | 需登录 |
| `/groups/:id` | GroupChat | GroupChatView | 需登录 |
| `/profile/:id?` | Profile | ProfileView | 需登录 |

> 受保护路由未登录会自动跳 `/login` 并带 `?redirect=` 回跳；已登录用户访问 `/login`、`/register` 会被重定向回首页。

---

## 八、前后端联调

1. **启动后端**：参照 [`circle_backend`](https://github.com/Davidlsy/circle_backend)，默认 `uvicorn` 监听 `0.0.0.0:8000`，交互式文档 `http://localhost:8000/docs`。
2. **启动前端**：`npm run dev` → `http://localhost:5173`。
3. **代理链路**：前端请求 `/api/xxx` → Vite 代理（`rewrite` 去掉 `/api`）→ 后端 `/xxx`。开发期无需处理跨域。
4. **⚠️ CORS（生产必看）**：后端通过环境变量 `CORS_ORIGINS` 控制允许的跨域来源：
   - 空值（`""`）= 仅本地开发默认地址；
   - **生产环境必须显式设置**，且不允许通配符 `*`、不允许 `localhost`、建议用 HTTPS，例如：
     ```
     CORS_ORIGINS=https://your-frontend-domain.com
     ```
   - 若前端以独立域名部署且 `CORS_ORIGINS` 未包含该域名，**请求会被浏览器拦截** → 见 R8。
5. **Mock 授权（第三方登录调试）**：后端 `OAUTH_MOCK_MODE=true` 时提供 `/mock/oauth/{provider}` 授权页与 `/mock/oauth/{provider}/accounts` 测试账号，前端无需自建授权页即可联调。

---

## 九、第三方账号登录（Direct_ai）

支持 **微信（`wechat`）/ 抖音（`douyin`）/ 支付宝（`alipay`）** 三种平台（见 `src/api/modules/oauth.js` 的 `PROVIDER_NAMES`）。

**流程（`authorize → callback`，由 `OauthCallbackView` 处理）**

1. 前端调用 `GET /auth/oauth/{provider}/authorize?purpose=login|bind` 获取 `authorize_url`；
2. `window.location.href = authorize_url` 跳转平台授权页（Mock 模式跳 `/mock/oauth/{provider}`）；
3. 平台回调前端，**前端把 `action`（`login` / `register` / `bind`）与 `state` 暂存于 `localStorage`**（`oauth_action`、`oauth_state`）；
4. `OauthCallbackView` 读取 `code` + `state`，先做 **state 校验（CSRF 防护）**，再按 action 分支：
   - **login** → `POST /auth/oauth/{provider}/callback`
   - **register** → `POST /auth/oauth/{provider}/register`（⚠️ 后端暂无此路由，当前必 404 → R1）
   - **bind**（需已登录）→ `POST /auth/oauth/{provider}/bind`
5. 绑定 / 解绑 / 查询：`POST /auth/oauth/{provider}/bind`、`DELETE /auth/oauth/{provider}/unbind`、`GET /auth/oauth/bindings`。

**需求文档（位于仓库 `Direct_ai/`）**

- `Direct_ai/THIRD_PARTY_LOGIN_FRONTEND_REQUIREMENTS.md` — 第三方登录前端需求表 v2
- `Direct_ai/第三方账号注册与登录功能需求表（前端）.md` — 功能需求总表
- `Direct_ai/GUEST_ACCESS_REQUIREMENTS.md` — 游客访问需求

---

## 十、已知问题 / 待修复（必读）

> 下表为**强制暴露给使用者**的已知坑，对应《前端代码修改需求》（R1–R10）。请以最新盘点结果为准，勿照抄旧结论。

| # | 问题 | 说明 | 对应需求 |
|---|------|------|----------|
| 1 | **第三方注册流程 404** | 前端注册流程调用 `POST /auth/oauth/{provider}/register`，后端 `oauth_router` 无此路由（仅有 authorize/callback/bind/unbind/bindings），当前第三方注册必失败 | R1（P0） |
| 2 | **`getUserProfile` 字段不稳** | 后端 `/users/{id}` 存在重复路由，返回结构不确定，主页计数可能错乱 | R2（P0） |
| 3 | **发帖入口可能不可达** | `CreatePostView` 已在 `views/` 中实现，但未在 `src/router/index.js` 注册路由，用户无法进入发帖页 | R3（P1） |
| 4 | **粉丝圈 / 表情包数据未对接** | 粉丝圈页面复用 `stars`/`posts` 数据、无独立 fan-circle API 模块，详情页直接请求 `/fan-circles/{id}/photos`；表情包仅聊天消息占位显示、无数据模块 | R4、R5（P1） |
| 5 | **CORS 需手动配置** | 生产环境后端 `CORS_ORIGINS` 必须包含前端域名，否则跨域请求被拦 | R8（P2） |
| 6 | **API 模块清单待盘点** | 历史文档曾漏判 `stars.js`，须按 R9 全量盘点后再定论 | R9（P2） |

**补充代码发现（非原始 6 项，但实测存在，建议一并关注）**

- **⑦ OAuth 回调页未接入路由**：`OauthCallbackView.vue` 已实现完整的 code/state 处理，但 `src/router/index.js` 中**未注册** `/oauth/callback/:provider` 路由，第三方登录回调链路目前无法触达（与 R1 关联，是第 1 项的根因之一）。
- **⑧ 找回密码流程缺失**：需求列有"找回"，但代码中无 forgot/reset 接口与页面，属规划中（见 [§二](#二功能特性)）。

配套需求文档：《前端代码修改需求》（R1–R10，建议随代码入仓至 `docs/前端代码修改需求.md`）。

---

## 十一、相关文档 / 链接

- 前端仓库：<https://github.com/Davidlsy/circle_frontend>
- 后端仓库：<https://github.com/Davidlsy/circle_backend>
- 第三方登录前端需求表：`Direct_ai/THIRD_PARTY_LOGIN_FRONTEND_REQUIREMENTS.md`
- 第三方登录功能需求总表：`Direct_ai/第三方账号注册与登录功能需求表（前端）.md`
- 游客访问需求：`Direct_ai/GUEST_ACCESS_REQUIREMENTS.md`
- 前后端匹配度检查报告 / 前端代码修改需求：建议随代码入仓（R1–R10），路径 `docs/前端代码修改需求.md`

---

## 十二、贡献约定（建议）

- 分支：功能分支 `feat/xxx`、修复 `fix/xxx`，PR 合入前自测 `npm run build` 通过。
- **新增 API 模块时**，请在 `src/api/modules/` 下补充并在本 README [§七](#七目录结构) 与 [§二](#二功能特性) 同步更新，避免再次"文档落后代码"。
- 功能状态（✅/🟡/🔲）随代码变化及时修订 [§二](#二功能特性) 与 [§十](#十已知问题--待修复必读)。
- 修复 R1–R9 任一项后，请在 [§十](#十已知问题--待修复必读) 对应行标注"已修复 / 版本号"。
