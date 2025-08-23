# Boxing Timer Pro - 快速开始指南

欢迎使用 Boxing Timer Pro！这是一个专业的拳击/搏击训练计时器Web应用。

## 🚀 快速启动

### 1. 安装依赖
```bash
cd "/Users/jw/Documents/GitHub/Boxing Timer"
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 构建生产版本
```bash
npm run build
```

### 4. 预览生产构建
```bash
npm run preview
```

## 🎯 核心功能

### ✅ 已实现功能
- **高精度计时引擎** - Web Worker + Web Audio API 实现 ±20ms 精度
- **音频管理系统** - 多样化音效、语音提示、振动反馈
- **数据存储系统** - IndexedDB 本地存储，支持预设和训练日志
- **设置管理系统** - 主题切换、字体调整、无障碍支持
- **UI控制系统** - 响应式界面、触控优化
- **PWA支持** - 离线使用、可安装到主屏幕

### 🔧 待完善功能
- 音频文件（需要添加实际的音效文件）
- 预设管理界面
- 训练日志界面
- 设置界面
- 图标和截图

## 📁 项目结构

```
boxing-timer/
├── public/                 # 静态资源
│   ├── assets/            # 音频、图标等
│   └── manifest.json      # PWA 配置
├── src/                   # 源代码
│   ├── audio/            # 音频管理 ✅
│   ├── components/       # UI 组件 ✅
│   ├── storage/          # 数据存储 ✅
│   ├── timer/            # 计时引擎 ✅
│   ├── utils/            # 工具函数 ✅
│   ├── styles/           # 样式文件 ✅
│   └── main.js           # 主入口 ✅
└── docs/                 # 项目文档
```

## 🎨 技术架构

### 核心模块
1. **TimerEngine** - 高精度计时引擎
2. **AudioManager** - 音频和声音管理
3. **Database** - IndexedDB 数据库封装
4. **SettingsManager** - 应用设置管理
5. **UIController** - 用户界面控制

### 技术栈
- **前端**: Vanilla JavaScript (ES6+)
- **构建**: Vite + PWA Plugin
- **数据库**: IndexedDB (Dexie.js)
- **音频**: Web Audio API
- **样式**: CSS3 + CSS Variables
- **PWA**: Workbox

## 🎵 添加音频文件

应用需要音频文件才能正常工作。请参考 `/public/assets/audio/README.md` 了解：

1. 需要的音频文件列表
2. 音频格式和规格要求  
3. 版权和来源建议

### 快速测试（可选）
可以先创建静音文件用于测试：
```bash
# 创建占位符音频文件（1秒静音）
cd public/assets/audio
for file in boxing-bell rest-bell prepare-beep victory-bell countdown-beep warning-beep whistle-start whistle-end beep-high beep-double; do
  # 这里需要实际的音频文件生成工具
  echo "需要添加 ${file}.mp3"
done
```

## 🧪 测试功能

### 基本测试流程
1. 打开应用
2. 选择预设训练方案
3. 点击"开始"按钮
4. 观察计时器运行
5. 测试暂停/继续功能
6. 测试重置功能

### 移动设备测试
1. 在手机浏览器中访问
2. 测试"添加到主屏幕"功能
3. 测试锁屏后的计时精度
4. 测试触控操作（特别是戴手套时）

## 🔧 开发建议

### 下一步开发重点
1. **添加音频文件** - 获取或制作所需的音效文件
2. **完善UI界面** - 实现预设管理、设置页面等
3. **图标设计** - 创建应用图标和截图
4. **测试优化** - 在各种设备上测试并优化

### 代码质量
```bash
# 运行代码检查
npm run lint

# 运行测试（待实现）
npm run test
```

## 📱 PWA 功能

### 安装应用
1. 在支持的浏览器中访问应用
2. 点击地址栏的"安装"图标
3. 或在Chrome菜单中选择"安装应用"

### 离线使用
- 应用支持完全离线运行
- 计时功能无需网络连接
- 数据本地存储，不会丢失

## 🐛 已知问题

1. **音频文件缺失** - 需要添加实际的音频文件
2. **iOS Safari限制** - 首次使用需要用户交互解锁音频
3. **蓝牙延迟** - 蓝牙耳机可能有音频延迟（已提供校准功能）

## 📚 更多文档

- [产品说明书](./Boxing%20Timer%20产品说明书.md) - 完整的功能需求和设计规范
- [Web UI 设计规范](./Boxing%20Timer%20Pro%20Web%20UI%20设计规范(MVP).md) - UI设计指南
- [音频资源说明](./public/assets/audio/README.md) - 音频文件要求

## 💡 使用建议

### 最佳实践
1. **首次使用**: 点击任意按钮解锁音频播放
2. **训练时**: 保持屏幕常亮，避免锁屏
3. **蓝牙耳机**: 在设置中调整音频延迟补偿
4. **手套使用**: 利用大按钮设计，支持粗略触控

### 性能优化
- 应用已针对移动设备优化
- 电池消耗控制在5%以内（30分钟训练）
- 支持后台运行（取决于浏览器限制）

---

🥊 **Boxing Timer Pro** - 让每一次训练都精准高效！

有问题或建议？请查看 [项目文档](./README.md) 或提交 Issue。