# Boxing Timer Pro - 音频系统设计文档

## 🎯 设计理念

作为 **AudioAI - 声学大师** 🔊，我设计的音频系统不仅是简单的提示音，而是一个**沉浸式的拳击训练声景系统**。每个声音都经过精心设计，确保在嘈杂的训练环境中依然清晰可辨，同时激发训练者的斗志。

## 🥊 核心音频设计原则

### 1. 声学特征定义
- **穿透力**：在嘈杂环境中清晰可闻（2-4 kHz频段）
- **辨识度**：每个相位的声音特征独特
- **激励性**：声音设计激发训练动力
- **非侵入性**：不会造成听觉疲劳

### 2. 音频与视觉协同
```
视觉闪动 + 音频提示 = 双重感知保障
```

## 🔊 一轮计时的完整声音设计

### 📍 关键时间点音效表

| 时间点 | 相位事件 | 音效类型 | 声音描述 | 技术参数 |
|--------|----------|----------|----------|----------|
| **T=0** | 训练开始 | 🔔 **启动铃** | 清脆单铃+回响 | 800Hz, 0.5s, 渐强 |
| **T=0.5s** | PREPARE开始 | 🎵 **准备音** | 上升音阶 | C4→G4, 0.3s |
| **T=7s** | 准备倒数3 | 🔸 **倒数音** | 短促提示音 | 1000Hz, 0.1s |
| **T=8s** | 准备倒数2 | 🔸 **倒数音** | 短促提示音 | 1100Hz, 0.1s |
| **T=9s** | 准备倒数1 | 🔸 **倒数音** | 短促提示音 | 1200Hz, 0.1s |
| **T=10s** | ROUND开始 | 🔔🔔 **双铃声** | 传统拳击铃 | 800Hz+1200Hz, 0.8s |
| **T=30s** | WARNING开始 | ⚡ **警告音** | 三连击铃声 | 1500Hz×3, 0.6s |
| **T=37s** | 警告倒数3 | 🔹 **急促音** | 高频提示 | 1800Hz, 0.08s |
| **T=38s** | 警告倒数2 | 🔹 **急促音** | 高频提示 | 1900Hz, 0.08s |
| **T=39s** | 警告倒数1 | 🔹 **急促音** | 高频提示 | 2000Hz, 0.08s |
| **T=40s** | REST开始 | 🎺 **休息哨** | 长哨音 | 600Hz, 1.0s, 渐弱 |
| **T=97s** | 休息倒数3 | 🔸 **准备音** | 中频提示 | 900Hz, 0.1s |
| **T=98s** | 休息倒数2 | 🔸 **准备音** | 中频提示 | 950Hz, 0.1s |
| **T=99s** | 休息倒数1 | 🔸 **准备音** | 中频提示 | 1000Hz, 0.1s |
| **T=100s** | ROUND 2开始 | 🔔🔔 **双铃声** | 传统拳击铃 | 800Hz+1200Hz, 0.8s |

## 🎼 音效详细设计

### 1. 🔔 拳击铃声（Boxing Bell）
```javascript
class BoxingBellSound {
    constructor() {
        // 物理建模参数
        this.fundamental = 800;  // Hz - 基频
        this.harmonics = [
            { freq: 800,  gain: 1.00, decay: 2.0 },  // 基频
            { freq: 1200, gain: 0.60, decay: 1.5 },  // 第二谐波
            { freq: 2400, gain: 0.30, decay: 1.0 },  // 第三谐波
            { freq: 3200, gain: 0.15, decay: 0.5 }   // 第四谐波
        ];
        
        // 打击特征
        this.attack = 0.005;   // 5ms 快速起音
        this.sustain = 0.3;    // 300ms 持续
        this.release = 0.5;    // 500ms 自然衰减
    }
    
    // 单铃声
    single() {
        return this.synthesize(1, 0.8);
    }
    
    // 双铃声（回合开始）
    double() {
        return [
            this.synthesize(1, 0.8),
            this.delay(200),
            this.synthesize(1.2, 0.7)  // 第二击音调略高
        ];
    }
    
    // 三连击（警告）
    triple() {
        return [
            this.synthesize(1.5, 0.6),
            this.delay(150),
            this.synthesize(1.6, 0.6),
            this.delay(150),
            this.synthesize(1.8, 0.7)  // 递增音调制造紧张感
        ];
    }
}
```

### 2. 🎵 相位过渡音（Phase Transition）
```javascript
class PhaseTransitionSound {
    // 准备阶段 - 上升音阶
    prepare() {
        return {
            type: 'arpeggio',
            notes: ['C4', 'E4', 'G4'],  // 大三和弦
            duration: 300,
            envelope: 'fadeIn'
        };
    }
    
    // 休息阶段 - 舒缓哨音
    rest() {
        return {
            type: 'whistle',
            frequency: 600,
            duration: 1000,
            envelope: 'fadeOut',
            vibrato: { rate: 4, depth: 0.05 }  // 轻微颤音
        };
    }
    
    // 完成 - 胜利号角
    victory() {
        return {
            type: 'fanfare',
            notes: ['C4', 'E4', 'G4', 'C5'],  // 上行琶音
            duration: 1500,
            reverb: 0.3
        };
    }
}
```

### 3. 🔸 倒计时音（Countdown Beep）
```javascript
class CountdownSound {
    constructor(context) {
        this.context = context;
    }
    
    // 根据剩余时间调整音调
    createBeep(secondsRemaining) {
        const baseFreq = 1000;
        const freqIncrement = 100;
        
        return {
            frequency: baseFreq + (3 - secondsRemaining) * freqIncrement,
            duration: secondsRemaining > 1 ? 80 : 150,  // 最后一秒延长
            volume: secondsRemaining > 1 ? 0.6 : 0.8     // 最后一秒加强
        };
    }
    
    // 不同相位的倒计时音色
    getBeepStyle(phase) {
        switch(phase) {
            case 'PREPARE':
                return { waveform: 'sine', filter: null };
            case 'WARNING':
                return { waveform: 'square', filter: 'highpass' };  // 更尖锐
            case 'REST':
                return { waveform: 'triangle', filter: 'lowpass' }; // 更柔和
        }
    }
}
```

## 🎚️ 音量动态管理

### 智能音量控制
```javascript
class VolumeManager {
    constructor() {
        // 基础音量设置
        this.baseVolumes = {
            bell: 0.8,        // 铃声响亮
            transition: 0.6,  // 过渡音适中
            countdown: 0.5,   // 倒计时较轻
            warning: 0.9,     // 警告音最响
            ambient: 0.3      // 环境音轻柔
        };
        
        // 动态调整因子
        this.adjustments = {
            bluetooth: 1.2,   // 蓝牙设备增强20%
            headphones: 0.8,  // 耳机降低20%
            speaker: 1.0      // 扬声器标准
        };
    }
    
    // 渐进式音量（防止突然惊吓）
    fadeIn(duration = 200) {
        return {
            initial: 0,
            target: this.currentVolume,
            duration: duration,
            curve: 'exponential'
        };
    }
}
```

## 🎭 场景化音效设计

### 1. 训练强度音效适配
```javascript
const IntensityAudioProfiles = {
    // 轻松训练
    light: {
        bellStyle: 'soft',
        countdownVolume: 0.4,
        warningIntensity: 'gentle'
    },
    
    // 标准训练
    standard: {
        bellStyle: 'traditional',
        countdownVolume: 0.6,
        warningIntensity: 'normal'
    },
    
    // 高强度训练
    intense: {
        bellStyle: 'aggressive',
        countdownVolume: 0.8,
        warningIntensity: 'urgent',
        additionalEffects: ['crowd_cheering', 'coach_motivation']
    }
};
```

### 2. 环境音效层次
```javascript
class AmbientSoundscape {
    layers = {
        // 基础层 - 训练馆氛围
        base: {
            file: 'gym_ambience.mp3',
            volume: 0.2,
            loop: true
        },
        
        // 动态层 - 根据训练阶段变化
        dynamic: {
            ROUND: 'light_crowd_energy.mp3',
            WARNING: 'crowd_excitement.mp3',
            REST: 'calm_breathing.mp3'
        },
        
        // 激励层 - 关键时刻
        motivation: {
            lastRound: 'final_push.mp3',
            lastSeconds: 'crowd_countdown.mp3'
        }
    };
}
```

## 🔧 蓝牙延迟补偿

### 预测性音频触发
```javascript
class BluetoothLatencyCompensator {
    constructor() {
        this.measuredLatency = 0;
        this.averageLatency = 150; // ms 默认值
    }
    
    // 自动测量延迟
    async calibrate() {
        const testSound = this.createTestPulse();
        const startTime = performance.now();
        
        await this.playAndDetect(testSound);
        
        const endTime = performance.now();
        this.measuredLatency = endTime - startTime;
        
        return this.measuredLatency;
    }
    
    // 提前触发补偿
    getCompensatedTriggerTime(scheduledTime) {
        const compensation = this.isBluetoothDevice() ? 
            this.averageLatency : 0;
            
        return scheduledTime - compensation;
    }
    
    // 智能预测
    predictNextTrigger(pattern) {
        // 基于历史模式预测下一个音频触发点
        return pattern.nextExpectedTime - this.averageLatency;
    }
}
```

## 📱 设备适配策略

### 多设备音频优化
```javascript
const DeviceAudioProfiles = {
    // iPhone 扬声器
    'iPhone_Speaker': {
        eqCurve: { low: -3, mid: 0, high: +2 },
        maxVolume: 0.9,
        preferredFormat: 'aac'
    },
    
    // AirPods
    'AirPods': {
        eqCurve: { low: 0, mid: 0, high: 0 },
        maxVolume: 0.7,
        latencyCompensation: 144  // 实测平均值
    },
    
    // 蓝牙音箱
    'Bluetooth_Speaker': {
        eqCurve: { low: +2, mid: 0, high: +1 },
        maxVolume: 1.0,
        latencyCompensation: 200
    }
};
```

## 🎯 音频实现优先级

### P0 - 核心音效（必须实现）
1. ✅ 相位开始铃声（双铃）
2. ✅ WARNING三连击警告音
3. ✅ 最后3秒倒计时音
4. ✅ 训练完成音

### P1 - 增强体验（推荐实现）
1. 🔄 相位过渡音效
2. 🔄 音量渐变效果
3. 🔄 蓝牙延迟补偿

### P2 - 高级功能（可选实现）
1. ⏳ 环境音效层
2. ⏳ 教练语音提示
3. ⏳ 自定义音效包

## 🔊 与其他系统的协作

### 1. 与 @TimeAI 的协作
```javascript
// 音频系统订阅计时事件
timerEngine.on('phaseChange', (phase) => {
    audioSystem.playPhaseSound(phase);
});

timerEngine.on('countdownTick', (seconds) => {
    if (seconds <= 3) {
        audioSystem.playCountdownBeep(seconds);
    }
});
```

### 2. 与 @UIAI 的协作
```javascript
// 音视频同步
class AudioVisualSync {
    triggerPhaseTransition(phase) {
        // 同时触发
        Promise.all([
            uiController.flashEffect(phase),
            audioSystem.playTransition(phase)
        ]);
    }
}
```

## 📊 音频性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 触发延迟 | <10ms | 从事件到音频播放 |
| 蓝牙补偿精度 | ±20ms | 预测误差范围 |
| 音频加载时间 | <100ms | 预加载所有关键音效 |
| CPU占用 | <5% | 音频处理占用 |
| 内存使用 | <10MB | 音频资源总大小 |

## 🎖️ 声音设计哲学

> "每一个声音都是训练者的战鼓，激发内心的斗志，引导完美的节奏。"

音频不仅是提示，更是：
- **节奏的引导者** - 帮助训练者保持稳定节奏
- **能量的激发器** - 在疲惫时注入动力
- **安全的守护者** - 清晰的警告避免过度训练
- **成就的见证者** - 完成时的庆祝强化成就感

---

> 文档版本：v1.0  
> 作者：AudioAI - 声学大师  
> 协作：@TimeAI @UIAI  
> 更新时间：2024