# JLU GPA Calculator

吉林大学绩点计算器，自己写着用的小工具。

导入教务系统导出的成绩单 Excel（`XX成绩查询.xlsx`），自动算加权平均分和绩点（满绩 4.0），也可以手动加课、删课。纯前端本地计算，不上传任何数据。

一套代码（Taro + React），编译成微信小程序和网页两个版本。

## 功能

- 导入教务系统导出的成绩单 xlsx，严格校验 21 列表头，自动识别课程 / 学分 / 成绩
- 加权平均分、绩点一键计算：总 GPA 保留 5 位小数，课程明细绩点保留 1 位小数
- 百分制成绩自动换算绩点，等级制成绩（优 / 良 / 中…）手动填绩点
- 按学期筛选课程明细，分学期统计 GPA
- 手动添加 / 删除课程，导入错了可以直接在列表里改
- 课程数据存在本地，下次打开还在，随时可清空

## 截图

网页版（计算 / 指南 / 我的）：

![web-calc](docs/images/web-calc.png)

![web-guide](docs/images/web-guide.png)

![web-mine](docs/images/web-mine.png)

小程序版：

![weapp](docs/images/weapp.png)

## 怎么使用

### 第一步：导出成绩单

1. 浏览器打开吉林大学教务系统，登录
2. 进「成绩查询」模块，查询全部成绩
3. 点导出，得到 `XX成绩查询.xlsx`

注意：表头（21 列）别动，改了会识别不出来。其他来源的 Excel 不支持。

### 第二步：选一个版本用

**网页版（最省事）**

- `npm run build:h5` 构建后，双击 `dist/h5/index.html` 就能用，不用起服务
- 点「选择文件」直接从电脑上选成绩单
- 想发给别人：把 `dist/h5` 整个文件夹压缩发过去，解压双击 index.html 就行；也可以把 `dist/h5` 部署到任意静态托管平台（Cloudflare Pages 之类）拿到在线链接

**微信小程序版**

1. `npm run build:weapp` 构建，产物在 `dist/weapp`
2. 微信开发者工具导入项目根目录即可预览（AppID 配置见下面「本地开发」）
3. 手机上用的话：先把成绩单 xlsx 发到微信「文件传输助手」，再在小程序里点「选择文件」→ 从聊天记录中选它（小程序不能直接打开电脑文件，只能从聊天记录拿）

导入之后，课程列表、加权平均分、绩点就都出来了，可以按学期看，也可以手动改。

## 本地开发

```
git clone https://github.com/Augenstern-W/JLU-GPA-calculator.git
cd JLU-GPA-calculator
npm install
```

```
npm run dev:h5       # 网页版开发预览（浏览器实时刷新）
npm run dev:weapp    # 小程序开发模式（配合微信开发者工具）
npm run build:h5     # 网页版构建 -> dist/h5
npm run build:weapp  # 小程序构建 -> dist/weapp
```

AppID 配置：`project.config.json` 含个人 AppID，没有入库。复制 `project.config.json.example` 改名为 `project.config.json`，把 `appid` 换成自己的（微信公众平台注册小程序后能拿到；用测试号也行）。

## 项目结构

```
.
├── config/                        # Taro 构建配置
│   ├── index.ts                   # 主配置：outputRoot 按端分流（weapp -> dist/weapp，h5 -> dist/h5），H5 publicPath 用相对路径（支持双击打开）
│   ├── dev.ts                     # 开发环境变量
│   └── prod.ts                    # 生产环境变量
├── src/
│   ├── app.tsx                    # 应用入口
│   ├── app.config.ts              # 全局配置：页面注册、tabBar（ lazyCodeLoading 按需注入）
│   ├── app.scss                   # 全局样式
│   ├── index.html                 # H5 的 HTML 模板
│   ├── pages/
│   │   ├── index/                 # 计算页（首页）：导入成绩单、课程明细、手动添加、计算结果
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts    # 页面配置（导航栏标题等）
│   │   │   └── index.module.scss
│   │   ├── guide/                 # 指南页：使用步骤、绩点换算表
│   │   └── mine/                  # 我的页：开发者信息、清空本地数据
│   ├── utils/
│   │   ├── gpa.ts                 # 核心：绩点换算表、21 列表头校验、xlsx 解析、加权 GPA 计算
│   │   ├── importFile.ts          # 跨端选文件：小程序从聊天记录选、网页用 input[type=file]，统一走 base64 传输
│   │   └── storage.ts             # 课程数据的本地存储（Taro.setStorage 封装）
│   ├── types/
│   │   └── course.ts              # 课程 / 表单的类型定义
│   ├── styles/
│   │   ├── theme.scss             # 主题变量（吉大蓝 #003F95）
│   │   ├── variables.scss         # SCSS 变量
│   │   └── compat.scss            # 兼容性样式
│   └── assets/tabbar/             # 小程序底部导航图标（8 张，选中/未选中各 4）
├── types/
│   └── global.d.ts                # 全局类型声明
├── project.config.json.example    # 小程序配置模板（appid 是占位符，复制改名后填自己的）
├── babel.config.js
├── tsconfig.json
└── package.json
```

### 关键实现

- **表头校验**：xlsx 第一行必须和 [gpa.ts](src/utils/gpa.ts) 里的 `EXPECTED_HEADER` 21 列完全一致，差一个字都不行，防止误导入别的表格
- **绩点换算**：90-100 → 4.0，87-89 → 3.7，84-86 → 3.3……60 以下 → 0，完整对照表在指南页和 `JD_SCALE`
- **GPA 计算**：Σ(绩点 × 学分) ÷ Σ学分，只统计绩点已知的课程；等级制成绩（绩点为空）不参与计算，会在结果里提示待填数量
- **跨端选文件**：小程序的 ArrayBuffer 和 xlsx 库有兼容坑（zip 会被误当纯文本），所以文件内容统一转 base64 字符串再解析，两端一套逻辑
- **产物隔离**：`dist/weapp` 和 `dist/h5` 分开存放，构建网页不会覆盖小程序产物（反过来也是）

## 技术栈

Taro 4.1.9 + React 18 + TypeScript + SCSS Modules + [xlsx](https://github.com/SheetJS/sheetjs)（Excel 解析）

## 成绩单要求

仅支持吉林大学教务系统「成绩查询」模块导出的 `XX成绩查询.xlsx`，且保持原始表头（21 列）不改动。其他格式会提示「仅支持吉大教务系统导出的《XX成绩查询.xlsx》」。

计算结果仅供参考，以教务系统认定为准。

忘江湖 2464231867@qq.com