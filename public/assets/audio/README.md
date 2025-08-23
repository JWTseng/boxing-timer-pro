# Boxing Timer Pro - 音频资源

本目录包含 Boxing Timer Pro 应用所需的音频文件。

## 音频文件列表

### 拳击铃声系列 (Bell)
- `boxing-bell.mp3` - 经典拳击铃声（回合开始/结束）
- `rest-bell.mp3` - 休息铃声（音调较低）
- `prepare-beep.mp3` - 准备提示音
- `victory-bell.mp3` - 训练完成庆祝铃声
- `countdown-beep.mp3` - 倒计时提示音
- `warning-beep.mp3` - 警告提示音

### 哨声系列 (Whistle)
- `whistle-start.mp3` - 开始哨声
- `whistle-end.mp3` - 结束哨声
- `whistle-rest.mp3` - 休息哨声
- `whistle-prepare.mp3` - 准备哨声
- `whistle-victory.mp3` - 胜利哨声
- `whistle-countdown.mp3` - 倒计时哨声
- `whistle-warning.mp3` - 警告哨声

### 电子音系列 (Beep)
- `beep-high.mp3` - 高音调蜂鸣（开始）
- `beep-double.mp3` - 双重蜂鸣（结束）
- `beep-low.mp3` - 低音调蜂鸣（休息）
- `beep-soft.mp3` - 轻柔蜂鸣（准备）
- `beep-victory.mp3` - 胜利蜂鸣
- `beep-tick.mp3` - 滴答声（倒计时）
- `beep-alert.mp3` - 警报声

## 音频规格要求

### 技术规格
- **格式**: MP3 (主要) + WAV (备用)
- **采样率**: 44.1 kHz
- **比特率**: 128-192 kbps (MP3)
- **声道**: 单声道或立体声
- **时长**: 0.5-3.0 秒

### 音量要求
- **主提示音** (开始/结束): -6 dBFS
- **次要提示音** (准备/休息): -12 dBFS
- **倒计时音**: -18 dBFS
- **警告音**: -6 dBFS
- **庆祝音**: -6 dBFS

### 音频特性
- **清晰度**: 在嘈杂环境下仍能清楚识别
- **穿透力**: 能够穿透运动噪音和呼吸声
- **不刺耳**: 避免过于尖锐的高频
- **区分度**: 不同类型的音效要有明显区别

## 音频来源

### 推荐资源
1. **免费资源**:
   - Freesound.org
   - Zapsplat (需注册)
   - Adobe Audition 内置音效

2. **付费资源**:
   - AudioJungle
   - PremiumBeat
   - Epidemic Sound

### 自制音效
可以使用以下工具生成简单的蜂鸣音：
- Audacity (免费)
- Adobe Audition
- Logic Pro (macOS)
- Pro Tools

## 版权声明

所有音频文件必须符合以下条件之一：
- 原创制作
- 使用 Creative Commons 许可
- 购买商业许可
- 使用免版税音效库

**注意**: 请勿使用受版权保护的音频文件。

## 文件命名规范

音频文件命名采用以下格式：
```
{category}-{type}.{format}
```

示例：
- `boxing-bell.mp3` - 拳击铃声
- `whistle-start.mp3` - 开始哨声
- `beep-countdown.mp3` - 倒计时蜂鸣

## 压缩和优化

### 文件大小优化
- 每个音频文件应控制在 50KB 以内
- 使用适当的压缩设置平衡质量和大小
- 考虑移动设备的存储空间限制

### 加载优化
- 提供多种格式以确保兼容性
- 考虑使用音频精灵图技术合并小音效
- 实现预加载策略避免播放延迟

## 测试清单

在添加新音频文件后，请测试：
- [ ] 在 iOS Safari 中正常播放
- [ ] 在 Android Chrome 中正常播放
- [ ] 在桌面浏览器中正常播放
- [ ] 音量适中，不过大或过小
- [ ] 与其他音效有明显区别
- [ ] 文件大小合理
- [ ] 没有版权问题