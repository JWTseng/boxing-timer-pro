// Boxing Timer Pro - 设置管理器
// 负责应用设置的管理、持久化和主题切换

/**
 * 主题枚举
 */
export const Theme = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

/**
 * 字体大小枚举
 */
export const FontSize = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    EXTRA_LARGE: 'extra-large'
};

/**
 * 设置管理器类
 */
export class SettingsManager {
    constructor() {
        this.settings = this.getDefaultSettings();
        this.observers = [];
        
        // CSS 变量管理
        this.cssVariables = new Map();
        
        console.log('⚙️ SettingsManager 实例化完成');
    }

    /**
     * 获取默认设置
     */
    getDefaultSettings() {
        return {
            // 界面设置
            theme: Theme.DARK,
            fontSize: FontSize.MEDIUM,
            enableColorblindMode: false,
            enableHighContrast: false,
            enableAnimation: true,
            
            // 计时设置
            showMilliseconds: false,
            enableProgressBar: true,
            enableRoundProgress: true,
            
            // 音频设置 (由 AudioManager 管理，这里保留引用)
            audioVolume: 0.8,
            soundScheme: 'bell',
            enableVoice: true,
            enableVibration: true,
            bluetoothDelay: 0,
            
            // 通知设置
            enableNotifications: true,
            enableBackgroundNotifications: false,
            
            // 屏幕设置
            keepScreenOn: true,
            enableFullscreen: false,
            
            // 隐私设置
            enableAnalytics: false,
            enableCrashReporting: true,
            
            // 训练设置
            autoSavePresets: true,
            confirmBeforeReset: true,
            showTrainingTips: true,
            
            // 开发设置
            enableDebugMode: false,
            showPerformanceStats: false,
            
            // 最后更新时间
            lastUpdated: Date.now()
        };
    }

    /**
     * 初始化设置管理器
     */
    async init() {
        try {
            // 从本地存储加载设置
            await this.loadSettings();
            
            // 应用当前设置
            this.applySettings();
            
            // 监听系统主题变化
            this.setupSystemThemeListener();
            
            console.log('✅ SettingsManager 初始化完成');
            
        } catch (error) {
            console.error('❌ SettingsManager 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 从本地存储加载设置
     */
    async loadSettings() {
        try {
            const stored = localStorage.getItem('boxing-timer-settings');
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
            localStorage.setItem('boxing-timer-settings', JSON.stringify(this.settings));
            console.log('✅ 设置保存完成');
        } catch (error) {
            console.error('❌ 保存设置失败:', error);
        }
    }

    /**
     * 应用所有设置
     */
    applySettings() {
        this.applyTheme();
        this.applyFontSize();
        this.applyColorblindMode();
        this.applyHighContrastMode();
        this.applyAnimationSettings();
        this.applyFullscreenSettings();
        
        console.log('🎨 设置应用完成');
    }

    /**
     * 更新设置
     */
    updateSettings(newSettings) {
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...newSettings };
        
        // 应用变化的设置
        this.applySettingsChanges(oldSettings, this.settings);
        
        // 保存设置
        this.saveSettings();
        
        // 通知观察者
        this.notifyObservers('settingsChanged', {
            oldSettings,
            newSettings: this.settings,
            changes: this.getChangedKeys(oldSettings, this.settings)
        });
        
        console.log('⚙️ 设置更新完成:', Object.keys(newSettings));
    }

    /**
     * 应用设置变化
     */
    applySettingsChanges(oldSettings, newSettings) {
        const changes = this.getChangedKeys(oldSettings, newSettings);
        
        changes.forEach(key => {
            switch (key) {
                case 'theme':
                    this.applyTheme();
                    break;
                case 'fontSize':
                    this.applyFontSize();
                    break;
                case 'enableColorblindMode':
                    this.applyColorblindMode();
                    break;
                case 'enableHighContrast':
                    this.applyHighContrastMode();
                    break;
                case 'enableAnimation':
                    this.applyAnimationSettings();
                    break;
                case 'enableFullscreen':
                    this.applyFullscreenSettings();
                    break;
            }
        });
    }

    /**
     * 获取变化的设置键
     */
    getChangedKeys(oldSettings, newSettings) {
        const changes = [];
        
        Object.keys(newSettings).forEach(key => {
            if (oldSettings[key] !== newSettings[key]) {
                changes.push(key);
            }
        });
        
        return changes;
    }

    // ========== 主题管理 ==========

    /**
     * 应用主题
     */
    applyTheme() {
        const theme = this.getEffectiveTheme();
        const root = document.documentElement;
        
        // 移除所有主题类
        root.classList.remove('theme-light', 'theme-dark');
        
        // 添加当前主题类
        root.classList.add(`theme-${theme}`);
        
        // 设置CSS变量
        this.applyThemeVariables(theme);
        
        // 更新meta标签
        this.updateThemeMetaTags(theme);
        
        console.log(`🎨 主题已切换至: ${theme}`);
    }

    /**
     * 获取有效主题（处理auto模式）
     */
    getEffectiveTheme() {
        if (this.settings.theme === Theme.AUTO) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
        }
        return this.settings.theme;
    }

    /**
     * 应用主题CSS变量
     */
    applyThemeVariables(theme) {
        const variables = this.getThemeVariables(theme);
        const root = document.documentElement;
        
        Object.entries(variables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
            this.cssVariables.set(property, value);
        });
    }

    /**
     * 获取主题变量
     */
    getThemeVariables(theme) {
        const baseVariables = {
            // 动画变量
            '--transition-fast': this.settings.enableAnimation ? '0.2s' : '0s',
            '--transition-medium': this.settings.enableAnimation ? '0.3s' : '0s',
            '--transition-slow': this.settings.enableAnimation ? '0.5s' : '0s',
        };
        
        if (theme === Theme.DARK) {
            return {
                ...baseVariables,
                // 深色主题变量
                '--color-bg-primary': '#121212',
                '--color-bg-secondary': '#1e1e1e',
                '--color-bg-tertiary': '#2d2d2d',
                '--color-text-primary': '#ffffff',
                '--color-text-secondary': '#b3b3b3',
                '--color-text-tertiary': '#666666',
                '--color-primary': '#00ff00',
                '--color-primary-hover': '#00cc00',
                '--color-secondary': '#ff4500',
                '--color-secondary-hover': '#cc3300',
                '--color-success': '#4caf50',
                '--color-warning': '#ff9800',
                '--color-error': '#f44336',
                '--color-info': '#2196f3',
                '--color-border': '#333333',
                '--color-shadow': 'rgba(0, 0, 0, 0.5)',
                '--color-overlay': 'rgba(0, 0, 0, 0.8)'
            };
        } else {
            return {
                ...baseVariables,
                // 浅色主题变量
                '--color-bg-primary': '#ffffff',
                '--color-bg-secondary': '#f5f5f5',
                '--color-bg-tertiary': '#e0e0e0',
                '--color-text-primary': '#000000',
                '--color-text-secondary': '#666666',
                '--color-text-tertiary': '#999999',
                '--color-primary': '#007700',
                '--color-primary-hover': '#005500',
                '--color-secondary': '#cc3300',
                '--color-secondary-hover': '#aa2200',
                '--color-success': '#4caf50',
                '--color-warning': '#ff9800',
                '--color-error': '#f44336',
                '--color-info': '#2196f3',
                '--color-border': '#cccccc',
                '--color-shadow': 'rgba(0, 0, 0, 0.2)',
                '--color-overlay': 'rgba(255, 255, 255, 0.9)'
            };
        }
    }

    /**
     * 更新主题相关的meta标签
     */
    updateThemeMetaTags(theme) {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === Theme.DARK ? '#121212' : '#ffffff';
        }
        
        const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (statusBarMeta) {
            statusBarMeta.content = theme === Theme.DARK ? 'black-translucent' : 'default';
        }
    }

    /**
     * 设置系统主题监听器
     */
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', () => {
                if (this.settings.theme === Theme.AUTO) {
                    this.applyTheme();
                    this.notifyObservers('systemThemeChanged', {
                        prefersDark: mediaQuery.matches
                    });
                }
            });
        }
    }

    // ========== 字体大小管理 ==========

    /**
     * 应用字体大小
     */
    applyFontSize() {
        const root = document.documentElement;
        const sizeMultipliers = {
            [FontSize.SMALL]: 0.875,
            [FontSize.MEDIUM]: 1.0,
            [FontSize.LARGE]: 1.25,
            [FontSize.EXTRA_LARGE]: 1.5
        };
        
        const multiplier = sizeMultipliers[this.settings.fontSize] || 1.0;
        root.style.setProperty('--font-size-multiplier', multiplier.toString());
        
        console.log(`🔤 字体大小已设置: ${this.settings.fontSize} (${multiplier}x)`);
    }

    // ========== 无障碍设置 ==========

    /**
     * 应用色盲模式
     */
    applyColorblindMode() {
        const root = document.documentElement;
        
        if (this.settings.enableColorblindMode) {
            root.classList.add('colorblind-mode');
            
            // 色盲友好的颜色变量
            root.style.setProperty('--color-primary', '#0066cc');
            root.style.setProperty('--color-secondary', '#ff8800');
            root.style.setProperty('--color-warning', '#0066cc');
            root.style.setProperty('--color-error', '#ff8800');
            
        } else {
            root.classList.remove('colorblind-mode');
            // 恢复正常颜色（通过重新应用主题）
            this.applyTheme();
        }
        
        console.log(`👁️ 色盲模式: ${this.settings.enableColorblindMode ? '启用' : '禁用'}`);
    }

    /**
     * 应用高对比模式
     */
    applyHighContrastMode() {
        const root = document.documentElement;
        
        if (this.settings.enableHighContrast) {
            root.classList.add('high-contrast-mode');
        } else {
            root.classList.remove('high-contrast-mode');
        }
        
        console.log(`🔆 高对比模式: ${this.settings.enableHighContrast ? '启用' : '禁用'}`);
    }

    // ========== 动画设置 ==========

    /**
     * 应用动画设置
     */
    applyAnimationSettings() {
        const root = document.documentElement;
        
        if (this.settings.enableAnimation) {
            root.classList.remove('no-animation');
        } else {
            root.classList.add('no-animation');
        }
        
        // 更新过渡时间变量
        this.applyThemeVariables(this.getEffectiveTheme());
        
        console.log(`🎬 动画效果: ${this.settings.enableAnimation ? '启用' : '禁用'}`);
    }

    // ========== 全屏设置 ==========

    /**
     * 应用全屏设置
     */
    applyFullscreenSettings() {
        if (this.settings.enableFullscreen) {
            this.requestFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    /**
     * 请求全屏
     */
    async requestFullscreen() {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }
            console.log('📺 已进入全屏模式');
        } catch (error) {
            console.warn('⚠️ 进入全屏失败:', error);
        }
    }

    /**
     * 退出全屏
     */
    async exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
            console.log('📺 已退出全屏模式');
        } catch (error) {
            console.warn('⚠️ 退出全屏失败:', error);
        }
    }

    // ========== 设置访问器 ==========

    /**
     * 获取设置值
     */
    get(key, defaultValue = null) {
        return this.settings[key] ?? defaultValue;
    }

    /**
     * 设置单个值
     */
    set(key, value) {
        this.updateSettings({ [key]: value });
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
        this.applySettings();
        this.saveSettings();
        
        this.notifyObservers('settingsReset', { settings: this.settings });
        console.log('🔄 设置已重置为默认值');
    }

    // ========== 观察者模式 ==========

    /**
     * 添加观察者
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * 移除观察者
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知观察者
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ 观察者回调执行失败:', error);
            }
        });
    }

    // ========== 导入导出 ==========

    /**
     * 导出设置
     */
    export() {
        return {
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 导入设置
     */
    import(data) {
        try {
            if (data.settings && typeof data.settings === 'object') {
                const validSettings = this.validateSettings(data.settings);
                this.updateSettings(validSettings);
                console.log('✅ 设置导入成功');
                return true;
            } else {
                throw new Error('无效的设置数据格式');
            }
        } catch (error) {
            console.error('❌ 导入设置失败:', error);
            throw error;
        }
    }

    /**
     * 验证设置数据
     */
    validateSettings(settings) {
        const defaultSettings = this.getDefaultSettings();
        const validSettings = {};
        
        Object.keys(defaultSettings).forEach(key => {
            if (key in settings) {
                const value = settings[key];
                const defaultValue = defaultSettings[key];
                
                // 类型检查
                if (typeof value === typeof defaultValue) {
                    // 枚举值检查
                    if (key === 'theme' && !Object.values(Theme).includes(value)) {
                        validSettings[key] = defaultValue;
                    } else if (key === 'fontSize' && !Object.values(FontSize).includes(value)) {
                        validSettings[key] = defaultValue;
                    } else {
                        validSettings[key] = value;
                    }
                } else {
                    validSettings[key] = defaultValue;
                }
            }
        });
        
        return validSettings;
    }

    // ========== 调试功能 ==========

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        return {
            currentSettings: this.settings,
            effectiveTheme: this.getEffectiveTheme(),
            cssVariables: Object.fromEntries(this.cssVariables),
            observersCount: this.observers.length,
            browserSupport: {
                localStorage: 'localStorage' in window,
                matchMedia: 'matchMedia' in window,
                fullscreenAPI: 'requestFullscreen' in document.documentElement
            }
        };
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 清空观察者
        this.observers = [];
        
        // 清空CSS变量缓存
        this.cssVariables.clear();
        
        console.log('🗑️ SettingsManager 已销毁');
    }
}