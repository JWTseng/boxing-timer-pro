# Boxing Timer Pro

专业拳击/搏击训练计时器 Web 应用

## 项目概述

Boxing Timer Pro 是一款专注搏击与 HIIT 训练计时的专业 Web 应用，提供简洁直观的回合计时和多样化提示，帮助用户高效管理训练节奏。

## 核心功能

### MVP 功能
- ✅ **回合计时核心** - 支持自定义回合时长、休息时长、准备时间和总回合数
- ✅ **提醒系统** - 多样化提示音、振动反馈、语音播报
- ✅ **预设管理** - 保存和快速调用常用训练方案
- ✅ **本地训练日志** - 自动记录训练历史和统计数据
- ✅ **个性化设置** - 主题切换、字体调整、色盲模式等

### 技术特性
- **PWA 应用** - 支持离线使用，可添加到主屏幕
- **高精度计时** - Web Worker + Web Audio API 实现 ±20ms 精度
- **跨平台兼容** - 针对 iOS Safari 和 Android Chrome 特别优化
- **无障碍支持** - 符合 WCAG 2.2 AA 标准
- **响应式设计** - 适配手机、平板等不同尺寸设备

## 目标用户

- **拳击教练** - 需要管理多学员训练的专业教练
- **个人训练者** - 进行家庭 HIIT 和拳击训练的健身爱好者

## 技术栈

- **前端框架**: Vanilla JavaScript (ES6+)
- **构建工具**: Vite
- **PWA**: Vite PWA Plugin + Workbox
- **数据存储**: IndexedDB (Dexie.js)
- **音频处理**: Web Audio API
- **计时引擎**: Web Worker + AudioContext
- **样式**: CSS3 + CSS Variables (Design Tokens)

## 项目结构

```
boxing-timer/
├── public/                 # 静态资源
│   ├── assets/            # 音频、图标等资源
│   └── manifest.json      # PWA 配置
├── src/                   # 源代码
│   ├── audio/            # 音频管理
│   ├── components/       # UI 组件
│   ├── storage/          # 数据存储
│   ├── timer/            # 计时引擎
│   ├── utils/            # 工具函数
│   └── styles/           # 样式文件
├── docs/                 # 项目文档
└── tests/                # 测试文件
```

## 快速开始

### 环境要求
- Node.js 16+ 
- 现代浏览器支持 (Chrome 80+, Safari 14+, Firefox 78+)

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 开发指南

### 项目架构
- **计时核心**: 使用 Web Worker 确保计时精度和后台运行
- **音频系统**: Web Audio API 提供低延迟、高质量音效
- **数据层**: IndexedDB 本地存储，支持离线使用
- **UI 层**: 响应式设计，支持触控和键盘操作

### 设计原则
1. **移动优先** - 针对手机端触控操作优化
2. **可访问性** - 支持屏幕阅读器、键盘导航
3. **性能优先** - 快速加载，低电量消耗
4. **渐进增强** - 核心功能优先，高级功能可选

## 浏览器支持

| 浏览器 | 版本要求 | 备注 |
|---------|----------|------|
| Chrome | 80+ | 完整功能支持 |
| Safari iOS | 14+ | 需要用户交互解锁音频 |
| Firefox | 78+ | 完整功能支持 |
| Edge | 80+ | 完整功能支持 |

## 部署

### Netlify 部署
1. 连接 GitHub 仓库
2. 构建命令: `npm run build`
3. 发布目录: `dist`

### Vercel 部署
```bash
npm i -g vercel
vercel --prod
```

### 自定义服务器
```bash
npm run build
# 将 dist/ 目录部署到任意静态服务器
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 路线图

- [x] MVP 核心功能 (v0.1)
- [ ] 增强功能和优化 (v0.2)
- [ ] 正式发布版本 (v1.0)
- [ ] 高级功能扩展 (v1.x)

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 作者: JW Zeng
- 项目链接: [https://github.com/your-username/boxing-timer](https://github.com/your-username/boxing-timer)

---

**Boxing Timer Pro** - 专注于提供最佳的拳击训练计时体验 🥊⏱️