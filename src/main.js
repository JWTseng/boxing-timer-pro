// Boxing Timer Pro - 主应用入口
// 专业拳击/搏击训练计时器

import './styles/main.css';
import { TimerEngine } from './timer/TimerEngine.js';
import { AudioManager } from './audio/AudioManager.js';
import { Database } from './storage/Database.js';
import { SettingsManager } from './utils/SettingsManager.js';
import { UIController } from './components/UIController.js';
import { ViewManager } from './components/ViewManager.js';

/**
 * Boxing Timer Pro 应用主类
 * 负责初始化和协调各个模块
 */
class BoxingTimerApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        
        // 检查浏览器兼容性
        this.checkCompatibility();
    }

    /**
     * 应用初始化
     */
    async init() {
        try {
            console.log('🥊 Boxing Timer Pro 启动中...');
            
            // 显示加载界面
            this.showLoadingScreen();
            
            // 初始化核心组件
            await this.initializeComponents();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 注册 Service Worker (PWA)
            await this.registerServiceWorker();
            
            // 隐藏加载界面，显示主界面
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Boxing Timer Pro 初始化完成');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showErrorMessage('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化应用组件
     */
    async initializeComponents() {
        // 初始化数据库
        this.components.database = new Database();
        await this.components.database.init();
        
        // 初始化设置管理器
        this.components.settings = new SettingsManager();
        await this.components.settings.init();
        
        // 初始化音频管理器
        this.components.audio = new AudioManager();
        await this.components.audio.init();
        
        // 初始化计时引擎
        this.components.timer = new TimerEngine();
        await this.components.timer.init();
        
        // 初始化UI控制器
        this.components.ui = new UIController({
            timer: this.components.timer,
            audio: this.components.audio,
            database: this.components.database,
            settings: this.components.settings
        });
        await this.components.ui.init();
        
        // 初始化视图管理器
        this.components.viewManager = new ViewManager();
        console.log('🎛️ 视图管理器初始化完成');
        
        console.log('📦 所有组件初始化完成');
    }

    /**
     * 设置全局事件监听
     */
    setupEventListeners() {
        // 页面可见性变化 - 用于后台运行管理
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.components.timer.handlePageVisible();
            } else {
                this.components.timer.handlePageHidden();
            }
        });
        
        // 页面焦点变化
        window.addEventListener('focus', () => {
            this.components.timer.handlePageVisible();
        });
        
        window.addEventListener('blur', () => {
            this.components.timer.handlePageHidden();
        });
        
        // 页面卸载前保存状态
        window.addEventListener('beforeunload', () => {
            this.components.timer.saveState();
            this.components.settings.saveSettings();
        });
        
        // 错误处理
        window.addEventListener('error', (event) => {
            console.error('🚨 全局错误:', event.error);
            this.handleGlobalError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 未处理的Promise拒绝:', event.reason);
            this.handleGlobalError(event.reason);
        });
        
        console.log('👂 全局事件监听器设置完成');
    }

    /**
     * 注册 Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('📱 Service Worker 注册成功:', registration.scope);
                
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.warn('⚠️ Service Worker 注册失败:', error);
            }
        }
    }

    /**
     * 检查浏览器兼容性
     */
    checkCompatibility() {
        const requiredFeatures = [
            'indexedDB',
            'serviceWorker',
            'AudioContext',
            'fetch',
            'Promise'
        ];
        
        const unsupported = requiredFeatures.filter(feature => {
            switch (feature) {
                case 'indexedDB':
                    return !('indexedDB' in window);
                case 'serviceWorker':
                    return !('serviceWorker' in navigator);
                case 'AudioContext':
                    return !('AudioContext' in window || 'webkitAudioContext' in window);
                case 'fetch':
                    return !('fetch' in window);
                case 'Promise':
                    return !('Promise' in window);
                default:
                    return false;
            }
        });
        
        if (unsupported.length > 0) {
            const message = `您的浏览器不支持以下功能: ${unsupported.join(', ')}。\\n请使用现代浏览器访问此应用。`;
            this.showErrorMessage(message, true);
            throw new Error(`浏览器兼容性检查失败: ${unsupported.join(', ')}`);
        }
        
        console.log('✅ 浏览器兼容性检查通过');
    }

    /**
     * 显示加载界面
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
        if (appContainer) {
            appContainer.classList.add('hidden');
        }
    }

    /**
     * 隐藏加载界面
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app');
        
        // 添加淡出效果
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 300);
        }
        
        if (appContainer) {
            appContainer.classList.remove('hidden');
            // 添加淡入效果
            appContainer.style.opacity = '0';
            setTimeout(() => {
                appContainer.style.opacity = '1';
            }, 100);
        }
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(message, critical = false) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>${critical ? '严重错误' : '错误'}</h3>
                <p>${message}</p>
                ${critical ? '' : '<button onclick="this.parentElement.parentElement.remove()">确定</button>'}
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        if (!critical) {
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    }

    /**
     * 显示应用更新可用提示
     */
    showUpdateAvailable() {
        const updateDiv = document.createElement('div');
        updateDiv.className = 'update-available';
        updateDiv.innerHTML = `
            <div class="update-content">
                <h3>🎉 新版本可用</h3>
                <p>Boxing Timer Pro 有新版本可用，点击更新获得最新功能。</p>
                <button onclick="window.location.reload()">立即更新</button>
                <button onclick="this.parentElement.parentElement.remove()">稍后</button>
            </div>
        `;
        
        document.body.appendChild(updateDiv);
    }

    /**
     * 全局错误处理
     */
    handleGlobalError(error) {
        // 根据错误类型进行不同处理
        if (error instanceof TypeError) {
            console.error('类型错误，可能是API不兼容:', error);
        } else if (error instanceof ReferenceError) {
            console.error('引用错误，可能是模块加载失败:', error);
        } else {
            console.error('未知错误:', error);
        }
        
        // 记录错误到本地存储以便调试
        if (this.components.database) {
            this.components.database.logError({
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        }
    }

    /**
     * 获取应用组件
     */
    getComponent(name) {
        return this.components[name];
    }

    /**
     * 应用是否已初始化
     */
    get initialized() {
        return this.isInitialized;
    }
}

// 创建全局应用实例
const app = new BoxingTimerApp();

// DOM 加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// 将应用实例暴露到全局，便于调试
window.BoxingTimerApp = app;

// 导出应用类
export default BoxingTimerApp;