# Circle 前端 README 编写（修改）需求说明书

> **对象**：`circle_frontend`（Vue 3 + Vite 5 + Pinia + vue-router + axios）
> **版本**：`package.json` 1.0.68
> **依据**：仓库根目录现状核对（README 缺失）、前端真实代码结构（router / views / api / Direct_ai）、前文《前后端匹配度检查报告》与《前端代码修改需求》
> **编制时间**：2026-08-12
> **目标读者**：仓库维护者 / 前端开发

---

## 一、现状与背景

经核对，前端仓库根目录**不存在 README 文件**（已验证 `README.md` 与 `readme.md` 均返回 404；根目录实际仅有 `Direct_ai/`、`src/`、`index.html`、`package.json`、`package-lock.json`、`vite.config.js`、`.gitignore`、`start.bat`）。

> 注：后端 `circle_backend` 的 README 倒是存在，但已严重滞后（标注 v1.0.3，代码实际 1.0.66）。前端是**连 README 都没有**。
> 若你本意是改**后端** README，可直接参考本说明书的章节结构套用；下文聚焦前端。

因此，本需求实质是：**从零新建一份 README.md，且必须与当前代码现状严格一致**（不要重蹈后端"文档落后代码半年"的覆辙）。

---

## 二、目标

1. 让新成员 clone 后能照 README 独立完成安装、运行、联调。
2. 准确描述前端已实现的功能、技术栈、目录结构、配置与联调方式。
3. 明确标注**已知问题 / 待修复项**，并链接到《前端代码修改需求》，避免使用者踩坑。
4. 版本号、路由、API 路径等关键信息与代码保持一致，禁止写死或臆造。

---

## 三、README 必须包含的章节与内容要点

| # | 章节 | 必须写的内容 | 数据来源 / 备注 |
|---|------|--------------|------------------|
| 1 | **项目简介** | 一句话定位：粉丝社群平台（Circle）前端 SPA；可提与 `circle_backend` 的前后端分离关系 | 自述 |
| 2 | **功能特性** | 账号体系（注册/登录/找回）、第三方登录（微信/抖音/支付宝）、动态流与帖子（发布/图片/评论/点赞/收藏/推荐）、关注关系、私信与群聊、明星（Stars）、粉丝圈（FanCircle）、表情包（sticker） | 见 router/views 实查；标"已实现"与"规划中" |
| 3 | **技术栈** | Vue 3、Vite 5、Pinia、vue-router 4、axios；可选列出 ESLint/Prettier 等 | 见 `package.json` |
| 4 | **环境要求** | Node.js 版本（建议 LTS，如 ≥18）、npm/pnpm | 依 `package.json` `engines`（若无则补充声明） |
| 5 | **安装与运行** | `npm install`；`npm run dev`（默认 `http://localhost:5173`）；`npm run build`；`npm run preview`；Windows 一键 `start.bat` 说明 | 依 `package.json` scripts；`start.bat` 已在仓库根 |
| 6 | **环境变量 / 配置** | 前端 `baseURL='/api'`（走 Vite 代理）；如需直连后端可配置 `VITE_API_BASE`；说明生产构建后 API 地址如何配置 | 见 `src/api/index.js`、`vite.config.js` |
| 7 | **目录结构** | 真实 `src/` 树（api/modules、router、stores、views、components、assets 等）+ 根 `Direct_ai/` 目录 | 见前文结构核对 |
| 8 | **前后端联调** | Vite 代理 `/api` → 后端 `localhost:8000`；**必须提示后端 `CORS_ORIGINS` 需包含前端域名**；链接后端仓库 | 见匹配度报告 §五 |
| 9 | **第三方账号登录（Direct_ai）** | 支持微信/抖音/支付宝；`authorize → callback` 流程；`OauthCallbackView` 处理登录/注册/绑定；mock 授权说明（`/mock/oauth/{provider}/accounts`）；链接 `Direct_ai/` 需求表 | 见 `oauth.js`、`OauthCallbackView`、`Direct_ai/` |
| 10 | **已知问题 / 待修复** | 见 §四（必须包含，链接《前端代码修改需求》） | 见匹配度报告 + 前端修改需求 |
| 11 | **相关文档 / 链接** | 后端仓库、Direct_ai 需求表、匹配度检查报告、前端修改需求 | 链接 |
| 12 | **贡献约定（可选）** | 分支/提交规范、API 模块新增时同步更新 README | 建议 |

> 章节 1–9 为"现状描述"，须与代码一致；章节 10–11 为"治理与导航"，帮助使用者规避已知坑。

---

## 四、已知问题章节必须包含的内容（强制）

README 的"已知问题 / 待修复"一节**必须**列出以下项，并链接到 `/workspace/前端代码修改需求.md`（或仓库内对应文档）：

| 问题 | 说明 | 对应需求 |
|------|------|----------|
| 第三方注册流程 404 | 前端注册流程调用 `POST /auth/oauth/{provider}/register`，后端无此路由，当前第三方注册会失败；需按 R1 修复 | R1（P0） |
| `getUserProfile` 字段不稳 | 后端 `/users/{id}` 重复路由致返回结构不确定，主页计数可能错乱；需 R2 兼容 | R2（P0） |
| 发帖入口可能不可达 | `CreatePostView` 未在路由注册，需 R3 补入口 | R3（P1） |
| 粉丝圈/表情包数据未对接 | 页面已有但缺对应 API 模块，需 R4/R5 补数据 | R4、R5（P1） |
| CORS 需手动配置 | 生产环境后端 `CORS_ORIGINS` 须含前端域名，否则请求被拦 | R8（P2） |
| API 模块清单待盘点 | 文档曾漏判 `stars.js`，须按 R9 全量盘点后再定论 | R9（P2） |

> 写 README 时应**以最新盘点结果为准**，不要照抄旧结论。

---

## 五、一致性要求（红线）

- **版本号**：README 顶部标注前端版本 `1.0.68`（取自 `package.json`），与代码同步；禁止写后端陈旧的 v1.0.x。
- **路由/路径**：所有提到的页面路径、API 路径必须与 `src/router/index.js`、`src/api/modules/*` 实测一致。
- **功能状态**：每个功能标注"已实现 / 规划中"，规划中的不得写成已完成。
- **禁止臆造**：目录树、scripts、依赖版本均从实际文件提取，不凭记忆补全。

---

## 六、验收标准

- [ ] 仓库根目录存在 `README.md`，新成员能照其完成 `npm install` → `npm run dev` → 打开 `localhost:5173` 联调。
- [ ] 技术栈、scripts、目录结构与代码实际一致，无虚构。
- [ ] "前后端联调"节明确写出 `/api` 代理与 CORS 配置要求。
- [ ] "第三方账号登录"节说明微信/抖音/支付宝流程与 `Direct_ai/` 需求表位置。
- [ ] "已知问题"节列出 §四 全部 6 项并链接前端修改需求文档。
- [ ] 版本号标注为 `1.0.68`，与 `package.json` 一致。

---

## 七、涉及文件

| 文件 | 操作 |
|------|------|
| `README.md`（仓库根） | **新建** |

---

## 八、与前端代码修改需求的关系

本说明书与 `/workspace/前端代码修改需求.md` 配套：
- **代码修改需求（R1–R10）** 解决功能与契约问题；
- **本 README 需求** 解决"文档缺失/与代码脱节"问题，并在"已知问题"节把 R1–R9 暴露给使用者。

建议执行顺序：先按《前端代码修改需求》完成 R9 全量盘点 → 据此编写本 README（确保功能状态描述准确）→ 随代码修复（R1/R2/R3…）同步更新 README 的"已知问题"节。
