// Boxing Timer Pro - 简化版设置管理器
// 临时版本，提供基础设置管理功能

/**
 * 简化版设置管理器
 */
export class SimpleSettingsManager {
    constructor() {
        this.settings = this.getDefaultSettings();
        this.storageKey = 'boxing-timer-simple-settings';
        
        console.log('⚙️ SimpleSettingsManager 实例化完成');
    }

    /**
     * 获取默认设置
     */
    getDefaultSettings() {
        return {
            // 界面设置
            theme: 'dark',
            showMilliseconds: false,
            enableProgressBar: true,
            
            // 音频设置
            audioVolume: 0.8,
            soundScheme: 'bell',
            enableVibration: true,
            
            // 其他设置
            confirmBeforeReset: true,
            enableAnimation: true,
            lastUpdated: Date.now()
        };
    }

    /**
     * 初始化设置管理器
     */
    async init() {
        try {
            await this.loadSettings();
            this.applySettings();
            console.log('✅ SimpleSettingsManager 初始化完成');
        } catch (error) {
            console.error('❌ SimpleSettingsManager 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 从本地存储加载设置
     */
    async loadSettings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const storedSettings = JSON.parse(stored);
                this.settings = { ...this.settings, ...storedSettings };
                console.log('✅ 设置加载完成');
            }
        } catch (error) {
            console.warn('⚠️ 加载设置失败，使用默认设置:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        try {
            this.settings.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            console.log('✅ 设置保存完成');
        } catch (error) {
            console.error('❌ 保存设置失败:', error);
        }
    }

    /**
     * 应用设置
     */
    applySettings() {
        // 应用主题
        document.documentElement.classList.toggle('theme-dark', this.settings.theme === 'dark');
        document.documentElement.classList.toggle('theme-light', this.settings.theme === 'light');
        
        // 应用动画设置
        document.documentElement.classList.toggle('no-animation', !this.settings.enableAnimation);
        
        console.log('🎨 基础设置应用完成');
    }

    /**
     * 获取设置值
     */
    get(key, defaultValue = null) {
        return this.settings[key] ?? defaultValue;
    }

    /**
     * 设置值
     */
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }

    /**
     * 批量更新设置
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.applySettings();
        console.log('⚙️ 设置批量更新完成');
    }

    /**
     * 获取所有设置
     */
    getAll() {
        return { ...this.settings };
    }

    /**
     * 重置为默认设置
     */
    reset() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.applySettings();
        console.log('🔄 设置已重置为默认值');
    }

    /**
     * 销毁实例
     */
    destroy() {
        console.log('🗑️ SimpleSettingsManager 已销毁');
    }
}