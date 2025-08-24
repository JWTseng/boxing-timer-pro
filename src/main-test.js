// Boxing Timer Pro - 测试版主应用入口
// CMAI创建：用于测试的简化版本，避免CSS导入问题

// 不导入CSS文件，避免MIME类型问题
// import './styles/main.css';  // 注释掉CSS导入

// CMAI修复：使用简化版健康检查（避免语法问题）
import { SimpleHealthChecker } from './utils/SimpleHealthChecker.js';
import { DataConsistency } from './utils/DataConsistency.js';
import { ViewManager } from './components/ViewManager.js';
import { TimePicker } from './components/TimePicker.js';
import { StartController } from './controllers/StartController.js';
// @TimeAI修复：重新启用TimerEngine支持START按钮功能
import { TimerEngine } from './timer/TimerEngine.js';
// import { AudioManager } from './audio/AudioManager.js';
// import { Database } from './storage/Database.js';
// import { SettingsManager } from './utils/SettingsManager.js';

/**
 * Boxing Timer Pro 应用主类 - 测试版
 * 负责初始化和协调各个模块
 */
class BoxingTimerApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        
        // @UIAI + @CMAI: 数据一致性检查器
        this.dataConsistency = new DataConsistency();
        
        console.log('🥊 BoxingTimerApp 测试实例创建');
    }

    /**
     * 应用初始化 - 测试版
     */
    async init() {
        try {
            console.log('🥊 Boxing Timer Pro 测试版启动中...');
            
            // CMAI步骤1: 简化版健康检查
            const healthChecker = new SimpleHealthChecker();
            const healthResults = await healthChecker.runBasicCheck();
            
            if (!healthResults.overall) {
                const summary = healthChecker.getStartupSummary();
                throw new Error(`系统健康检查失败: ${summary.errors} 个错误`);
            }
            
            // 隐藏加载界面，显示主应用
            this.hideLoadingScreen();
            console.log('✅ 加载界面已隐藏，主应用已显示');
            
            // 初始化核心组件以支持用户交互
            console.log('📦 初始化用户界面组件...');
            
            // 初始化时间选择器 - 支持PREPARE/ROUND/WARNING/REST按钮交互
            this.components = {};
            this.components.timePicker = new TimePicker(document.body);
            this.components.timePicker.init();
            console.log('✅ TimePicker 组件初始化完成，支持弹窗交互');
            
            // 初始化视图管理器
            this.components.viewManager = new ViewManager();
            console.log('✅ ViewManager 组件初始化完成');
            
            // 初始化START控制器
            this.components.startController = new StartController();
            this.components.startController.init();
            
            // 暴露到全局以便调试
            window.startController = this.components.startController;
            console.log('✅ StartController 组件初始化完成');
            
            // 不再重复绑定START按钮 - StartController已处理
            console.log('✅ START按钮由StartController管理，不重复绑定');
            
            // @UIAI + @CMAI: 启动时检查并修复数据一致性
            await this.checkAndFixDataConsistency();
            
            this.isInitialized = true;
            console.log('✅ Boxing Timer Pro 测试版初始化完成');
            
            return {
                success: true,
                message: 'Boxing Timer Pro 测试版启动成功',
                components: {
                    healthChecker: 'working',
                    viewManager: 'available',
                    timePicker: 'available'
                }
            };
            
        } catch (error) {
            console.error('❌ 测试版应用初始化失败:', error);
            return {
                success: false,
                message: `应用初始化失败: ${error.message}`,
                error: error
            };
        }
    }


    /**
     * 隐藏加载界面，显示主应用
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 300);
        }
        
        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.style.opacity = '0';
            setTimeout(() => {
                appContainer.style.opacity = '1';
            }, 100);
        }
    }

    /**
     * @UIAI + @CMAI: 检查并修复数据一致性
     */
    async checkAndFixDataConsistency() {
        try {
            console.log('🔍 开始启动时数据一致性检查...');
            
            // 检查数据一致性
            const consistencyResult = this.dataConsistency.checkConsistency();
            
            if (consistencyResult.hasIssues) {
                console.warn('⚠️ 检测到数据不一致问题:', consistencyResult.issues.length, '个问题');
                
                // 自动修复：以HTML显示为准
                const fixResult = this.dataConsistency.fixConsistency('html-priority');
                
                if (fixResult.fixed) {
                    console.log('✅ 数据一致性问题已自动修复');
                    
                    // 通知TimePicker重新加载数据
                    if (this.components.timePicker) {
                        await this.components.timePicker.reloadUserPresets();
                        console.log('🔄 TimePicker预设数据已重新加载');
                    }
                } else {
                    console.log('ℹ️ 无需修复或修复未执行');
                }
            } else {
                console.log('✅ 数据一致性检查通过，无问题发现');
            }
            
            // 生成并输出报告（开发模式）
            if (window.location.hostname === 'localhost') {
                const report = this.dataConsistency.generateReport();
                console.log('📊 数据一致性报告:\n' + report);
            }
            
        } catch (error) {
            console.error('❌ 数据一致性检查失败:', error);
        }
    }

    /**
     * 获取应用状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            timestamp: new Date().toISOString(),
            version: 'test-1.0'
        };
    }
}

// 创建全局应用实例并自动初始化
const app = new BoxingTimerApp();

// DOM 加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// 将应用实例暴露到全局，便于调试
window.BoxingTimerApp = app;

// 导出应用类用于测试
export default BoxingTimerApp;

console.log('📦 Boxing Timer Pro 测试版模块加载完成');