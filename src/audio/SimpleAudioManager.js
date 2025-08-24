// Boxing Timer Pro - 简化版音频管理器
// 临时版本，提供基础音效功能

export const SoundType = {
    PREPARE: 'prepare',
    ROUND_START: 'round_start',
    REST_START: 'rest_start',
    ROUND_END: 'round_end',
    TRAINING_COMPLETE: 'training_complete',
    WARNING: 'warning',
    COUNTDOWN: 'countdown'
};

/**
 * 简化版音频管理器
 */
export class SimpleAudioManager {
    constructor() {
        this.isInitialized = false;
        this.settings = {
            volume: 0.8,
            enabled: true
        };
        
        console.log('🔊 SimpleAudioManager 实例化完成');
    }

    /**
     * 初始化音频管理器
     */
    async init() {
        try {
            this.isInitialized = true;
            console.log('✅ SimpleAudioManager 初始化完成');
        } catch (error) {
            console.error('❌ SimpleAudioManager 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 播放音效 (简化版 - 使用Web Audio API生成音调)
     */
    async playSound(soundType, options = {}) {
        if (!this.settings.enabled) {
            console.log('🔇 音效已禁用');
            return;
        }

        try {
            // 创建简单的音调
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 根据音效类型设置不同的音调
            const soundConfigs = {
                [SoundType.ROUND_START]: { frequency: 800, duration: 0.5 },
                [SoundType.ROUND_END]: { frequency: 400, duration: 0.8 },
                [SoundType.REST_START]: { frequency: 600, duration: 0.3 },
                [SoundType.PREPARE]: { frequency: 1000, duration: 0.2 },
                [SoundType.WARNING]: { frequency: 1200, duration: 0.1 },
                [SoundType.COUNTDOWN]: { frequency: 1500, duration: 0.1 },
                [SoundType.TRAINING_COMPLETE]: { frequency: 523, duration: 1.0 }
            };

            const config = soundConfigs[soundType] || { frequency: 440, duration: 0.3 };
            
            oscillator.frequency.value = config.frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + config.duration);

            console.log(`🔊 播放简化音效: ${soundType}`);
            
        } catch (error) {
            console.warn(`⚠️ 播放音效失败 (${soundType}):`, error);
        }
    }

    /**
     * 播放倒计时音效
     */
    async playCountdown(seconds) {
        await this.playSound(SoundType.COUNTDOWN, { seconds });
    }

    /**
     * 更新设置
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('⚙️ 音频设置已更新:', this.settings);
    }

    /**
     * 获取设置
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.isInitialized = false;
        console.log('🗑️ SimpleAudioManager 已销毁');
    }
}