// Boxing Timer Pro - 音频管理器
// 负责音效播放、语音提示和音频设置管理

/**
 * 音效类型枚举
 */
export const SoundType = {
    ROUND_START: 'round_start',
    ROUND_END: 'round_end',
    REST_START: 'rest_start',
    REST_END: 'rest_end',
    PREPARE: 'prepare',
    TRAINING_COMPLETE: 'training_complete',
    COUNTDOWN: 'countdown',
    WARNING: 'warning'
};

/**
 * 音效方案枚举
 */
export const SoundScheme = {
    BELL: 'bell',
    WHISTLE: 'whistle',
    BEEP: 'beep',
    VOICE: 'voice',
    SILENT: 'silent'
};

/**
 * 音频管理器类
 */
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.soundBuffers = new Map();
        this.isInitialized = false;
        this.isUnlocked = false;
        
        // 音频设置
        this.settings = {
            volume: 0.8,
            soundScheme: SoundScheme.BELL,
            enableVoice: true,
            enableVibration: true,
            bluetoothDelay: 0, // 蓝牙延迟补偿(毫秒)
            enableCountdown: true,
            countdownStart: 10 // 最后N秒开始倒计时
        };
        
        // 语音合成
        this.speechSynthesis = null;
        this.voiceSettings = {
            lang: 'zh-CN',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8
        };
        
        // 预定义音效配置
        this.soundConfigs = {
            [SoundScheme.BELL]: {
                [SoundType.ROUND_START]: { url: '/assets/audio/boxing-bell.mp3', volume: 1.0 },
                [SoundType.ROUND_END]: { url: '/assets/audio/boxing-bell.mp3', volume: 1.0 },
                [SoundType.REST_START]: { url: '/assets/audio/rest-bell.mp3', volume: 0.8 },
                [SoundType.REST_END]: { url: '/assets/audio/boxing-bell.mp3', volume: 1.0 },
                [SoundType.PREPARE]: { url: '/assets/audio/prepare-beep.mp3', volume: 0.6 },
                [SoundType.TRAINING_COMPLETE]: { url: '/assets/audio/victory-bell.mp3', volume: 1.0 },
                [SoundType.COUNTDOWN]: { url: '/assets/audio/countdown-beep.mp3', volume: 0.7 },
                [SoundType.WARNING]: { url: '/assets/audio/warning-beep.mp3', volume: 0.8 }
            },
            [SoundScheme.WHISTLE]: {
                [SoundType.ROUND_START]: { url: '/assets/audio/whistle-start.mp3', volume: 1.0 },
                [SoundType.ROUND_END]: { url: '/assets/audio/whistle-end.mp3', volume: 1.0 },
                [SoundType.REST_START]: { url: '/assets/audio/whistle-rest.mp3', volume: 0.8 },
                [SoundType.REST_END]: { url: '/assets/audio/whistle-start.mp3', volume: 1.0 },
                [SoundType.PREPARE]: { url: '/assets/audio/whistle-prepare.mp3', volume: 0.6 },
                [SoundType.TRAINING_COMPLETE]: { url: '/assets/audio/whistle-victory.mp3', volume: 1.0 },
                [SoundType.COUNTDOWN]: { url: '/assets/audio/whistle-countdown.mp3', volume: 0.7 },
                [SoundType.WARNING]: { url: '/assets/audio/whistle-warning.mp3', volume: 0.8 }
            },
            [SoundScheme.BEEP]: {
                [SoundType.ROUND_START]: { url: '/assets/audio/beep-high.mp3', volume: 1.0 },
                [SoundType.ROUND_END]: { url: '/assets/audio/beep-double.mp3', volume: 1.0 },
                [SoundType.REST_START]: { url: '/assets/audio/beep-low.mp3', volume: 0.8 },
                [SoundType.REST_END]: { url: '/assets/audio/beep-high.mp3', volume: 1.0 },
                [SoundType.PREPARE]: { url: '/assets/audio/beep-soft.mp3', volume: 0.6 },
                [SoundType.TRAINING_COMPLETE]: { url: '/assets/audio/beep-victory.mp3', volume: 1.0 },
                [SoundType.COUNTDOWN]: { url: '/assets/audio/beep-tick.mp3', volume: 0.7 },
                [SoundType.WARNING]: { url: '/assets/audio/beep-alert.mp3', volume: 0.8 }
            }
        };
        
        // 语音文案
        this.voiceTexts = {
            [SoundType.ROUND_START]: (round, total) => `第${round}回合，开始！`,
            [SoundType.ROUND_END]: () => '回合结束',
            [SoundType.REST_START]: () => '休息开始',
            [SoundType.REST_END]: () => '休息结束',
            [SoundType.PREPARE]: () => '准备开始',
            [SoundType.TRAINING_COMPLETE]: () => '训练完成！恭喜你！',
            [SoundType.COUNTDOWN]: (seconds) => `${seconds}`,
            [SoundType.WARNING]: () => '注意！'
        };
        
        console.log('🔊 AudioManager 实例化完成');
    }

    /**
     * 初始化音频管理器
     */
    async init() {
        try {
            // 初始化 Web Audio API
            await this.initWebAudio();
            
            // 初始化语音合成
            this.initSpeechSynthesis();
            
            // 加载音效文件
            await this.loadSoundEffects();
            
            // 加载用户设置
            this.loadSettings();
            
            this.isInitialized = true;
            console.log('✅ AudioManager 初始化完成');
            
        } catch (error) {
            console.error('❌ AudioManager 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化 Web Audio API
     */
    async initWebAudio() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            
            // 创建主增益节点
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.settings.volume;
            
            console.log('🎵 Web Audio API 初始化完成');
            
        } catch (error) {
            console.error('❌ Web Audio API 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化语音合成
     */
    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            console.log('🗣️ 语音合成 API 可用');
        } else {
            console.warn('⚠️ 浏览器不支持语音合成 API');
        }
    }

    /**
     * 加载音效文件
     */
    async loadSoundEffects() {
        const currentScheme = this.soundConfigs[this.settings.soundScheme];
        if (!currentScheme) return;
        
        const loadPromises = Object.entries(currentScheme).map(async ([soundType, config]) => {
            try {
                const buffer = await this.loadAudioBuffer(config.url);
                this.soundBuffers.set(soundType, {
                    buffer,
                    volume: config.volume
                });
            } catch (error) {
                console.warn(`⚠️ 加载音效失败 (${soundType}):`, error);
                // 创建静音缓冲区作为后备
                this.soundBuffers.set(soundType, {
                    buffer: this.createSilentBuffer(),
                    volume: 0
                });
            }
        });
        
        await Promise.all(loadPromises);
        console.log(`✅ 音效加载完成 (${this.settings.soundScheme})`);
    }

    /**
     * 加载音频缓冲区
     */
    async loadAudioBuffer(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
            
        } catch (error) {
            console.warn(`⚠️ 加载音频文件失败 (${url}):`, error);
            // 返回静音缓冲区
            return this.createSilentBuffer();
        }
    }

    /**
     * 创建静音缓冲区
     */
    createSilentBuffer() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        return buffer;
    }

    /**
     * 解锁音频上下文
     */
    async unlockAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                this.isUnlocked = true;
                console.log('🔓 音频上下文已解锁');
                
                // 播放一个静音音效来测试
                await this.testAudioPlayback();
                
            } catch (error) {
                console.warn('⚠️ 音频上下文解锁失败:', error);
            }
        } else if (this.audioContext && this.audioContext.state === 'running') {
            this.isUnlocked = true;
        }
    }

    /**
     * 测试音频播放
     */
    async testAudioPlayback() {
        try {
            // 播放极短的静音来测试音频系统
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.value = 0; // 静音
            oscillator.frequency.value = 440;
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.01);
            
            console.log('🧪 音频播放测试完成');
            
        } catch (error) {
            console.warn('⚠️ 音频播放测试失败:', error);
        }
    }

    /**
     * 播放音效
     */
    async playSound(soundType, options = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ AudioManager 尚未初始化');
            return;
        }
        
        // 确保音频上下文已解锁
        if (!this.isUnlocked) {
            await this.unlockAudioContext();
        }
        
        if (this.settings.soundScheme === SoundScheme.SILENT) {
            console.log('🔇 静音模式，跳过音效播放');
            return;
        }
        
        try {
            // 应用蓝牙延迟补偿
            const delay = this.settings.bluetoothDelay / 1000;
            const when = this.audioContext.currentTime + delay;
            
            // 播放音效文件
            if (this.soundBuffers.has(soundType)) {
                await this.playAudioBuffer(soundType, when, options);
            }
            
            // 播放语音提示
            if (this.settings.enableVoice && soundType !== SoundType.COUNTDOWN) {
                this.playVoice(soundType, options);
            }
            
            // 触发振动
            if (this.settings.enableVibration) {
                this.vibrate(soundType);
            }
            
        } catch (error) {
            console.error(`❌ 播放音效失败 (${soundType}):`, error);
        }
    }

    /**
     * 播放音频缓冲区
     */
    async playAudioBuffer(soundType, when = 0, options = {}) {
        const soundData = this.soundBuffers.get(soundType);
        if (!soundData || !soundData.buffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = soundData.buffer;
        source.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        // 设置音量
        const volume = (options.volume ?? soundData.volume) * this.settings.volume;
        gainNode.gain.value = volume;
        
        // 播放
        const startTime = when || this.audioContext.currentTime;
        source.start(startTime);
        
        console.log(`🔊 播放音效: ${soundType} (音量: ${Math.round(volume * 100)}%)`);
    }

    /**
     * 播放语音提示
     */
    playVoice(soundType, options = {}) {
        if (!this.speechSynthesis || this.settings.soundScheme === SoundScheme.VOICE) {
            return; // 语音模式下不重复播放
        }
        
        const textFunction = this.voiceTexts[soundType];
        if (!textFunction) return;
        
        let text;
        switch (soundType) {
            case SoundType.ROUND_START:
                text = textFunction(options.round, options.totalRounds);
                break;
            case SoundType.COUNTDOWN:
                text = textFunction(options.seconds);
                break;
            default:
                text = textFunction();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.voiceSettings.lang;
        utterance.rate = this.voiceSettings.rate;
        utterance.pitch = this.voiceSettings.pitch;
        utterance.volume = this.voiceSettings.volume * this.settings.volume;
        
        // 应用蓝牙延迟补偿
        if (this.settings.bluetoothDelay > 0) {
            setTimeout(() => {
                this.speechSynthesis.speak(utterance);
            }, this.settings.bluetoothDelay);
        } else {
            this.speechSynthesis.speak(utterance);
        }
        
        console.log(`🗣️ 播放语音: "${text}"`);
    }

    /**
     * 触发振动
     */
    vibrate(soundType) {
        if (!navigator.vibrate || !this.settings.enableVibration) {
            return;
        }
        
        // 不同音效对应不同振动模式
        const vibrationPatterns = {
            [SoundType.ROUND_START]: [200, 100, 200],
            [SoundType.ROUND_END]: [300],
            [SoundType.REST_START]: [100, 50, 100],
            [SoundType.REST_END]: [150],
            [SoundType.PREPARE]: [100],
            [SoundType.TRAINING_COMPLETE]: [200, 100, 200, 100, 200],
            [SoundType.COUNTDOWN]: [50],
            [SoundType.WARNING]: [100, 50, 100, 50, 100]
        };
        
        const pattern = vibrationPatterns[soundType] || [100];
        navigator.vibrate(pattern);
        
        console.log(`📳 触发振动: ${soundType}`);
    }

    /**
     * 播放倒计时音效
     */
    async playCountdown(seconds) {
        if (!this.settings.enableCountdown || seconds > this.settings.countdownStart) {
            return;
        }
        
        await this.playSound(SoundType.COUNTDOWN, { seconds });
    }

    /**
     * 更新音频设置
     */
    updateSettings(newSettings) {
        const oldScheme = this.settings.soundScheme;
        this.settings = { ...this.settings, ...newSettings };
        
        // 更新主音量
        if (this.gainNode) {
            this.gainNode.gain.value = this.settings.volume;
        }
        
        // 如果音效方案改变，重新加载音效
        if (oldScheme !== this.settings.soundScheme) {
            this.loadSoundEffects().catch(error => {
                console.error('❌ 重新加载音效失败:', error);
            });
        }
        
        // 保存设置
        this.saveSettings();
        
        console.log('⚙️ 音频设置已更新:', this.settings);
    }

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        try {
            localStorage.setItem('boxing-timer-audio-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('⚠️ 保存音频设置失败:', error);
        }
    }

    /**
     * 从本地存储加载设置
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('boxing-timer-audio-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...settings };
                console.log('✅ 音频设置加载完成');
            }
        } catch (error) {
            console.warn('⚠️ 加载音频设置失败:', error);
        }
    }

    /**
     * 测试音效播放
     */
    async testSound(soundType) {
        console.log(`🧪 测试音效: ${soundType}`);
        await this.playSound(soundType, { volume: 0.8 });
    }

    /**
     * 检测音频输出设备
     */
    async detectAudioDevice() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return null;
        }
        
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
            
            // 简单的蓝牙设备检测
            const bluetoothDevice = audioOutputs.find(device => 
                device.label.toLowerCase().includes('bluetooth') ||
                device.label.toLowerCase().includes('airpods') ||
                device.label.toLowerCase().includes('headphones')
            );
            
            if (bluetoothDevice) {
                console.log('🎧 检测到蓝牙音频设备:', bluetoothDevice.label);
                return { type: 'bluetooth', device: bluetoothDevice };
            }
            
            return { type: 'default', device: audioOutputs[0] };
            
        } catch (error) {
            console.warn('⚠️ 音频设备检测失败:', error);
            return null;
        }
    }

    /**
     * 校准音频延迟
     */
    async calibrateDelay() {
        // 这里可以实现音频延迟校准逻辑
        // 用户点击按钮时记录时间，听到声音后再次点击，计算延迟
        console.log('🎯 音频延迟校准功能（待实现）');
    }

    /**
     * 获取可用语音列表
     */
    getAvailableVoices() {
        if (!this.speechSynthesis) return [];
        
        const voices = this.speechSynthesis.getVoices();
        return voices.filter(voice => voice.lang.startsWith('zh'));
    }

    /**
     * 获取当前设置
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 获取音效方案列表
     */
    getSoundSchemes() {
        return [
            { value: SoundScheme.BELL, label: '经典铃声', description: '传统拳击训练铃声' },
            { value: SoundScheme.WHISTLE, label: '哨声', description: '清脆的训练哨声' },
            { value: SoundScheme.BEEP, label: '蜂鸣声', description: '简洁的电子提示音' },
            { value: SoundScheme.VOICE, label: '语音提示', description: '纯语音播报' },
            { value: SoundScheme.SILENT, label: '静音模式', description: '关闭所有声音' }
        ];
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 停止所有语音播放
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        
        // 关闭音频上下文
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 清空缓冲区
        this.soundBuffers.clear();
        
        console.log('🗑️ AudioManager 已销毁');
    }
}