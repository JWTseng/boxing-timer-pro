// Boxing Timer Pro - 闪动效果系统
// 实现相位切换的视觉闪动反馈

/**
 * 闪动效果配置
 */
export const FlashConfig = {
    // 标准闪动（PREPARE/ROUND/REST）
    standard: {
        pattern: [
            { color: 'black', duration: 150 },
            { color: 'phase', duration: 150 },
            { color: 'black', duration: 150 },
            { color: 'phase', duration: 'stay' }
        ],
        totalDuration: 450
    },
    
    // 警告闪动（WARNING）
    warning: {
        pattern: [
            { color: 'green', duration: 100 },
            { color: 'orange', duration: 100 },
            { color: 'green', duration: 100 },
            { color: 'orange', duration: 100 },
            { color: 'green', duration: 100 },
            { color: 'orange', duration: 'stay' }
        ],
        totalDuration: 500
    },
    
    // 结束闪动
    finish: {
        pattern: [
            { color: 'current', duration: 200 },
            { color: 'black', duration: 200 },
            { color: 'current', duration: 200 },
            { color: 'black', duration: 200 },
            { color: 'current', duration: 200 },
            { color: 'black', duration: 'stay' }
        ],
        totalDuration: 1000
    }
};

/**
 * 闪动效果执行器
 */
export class FlashEffectExecutor {
    constructor() {
        this.container = document.body;
        this.isFlashing = false;
        this.originalColor = null;
    }

    /**
     * 执行闪动效果
     * @param {string} flashType - 闪动类型：'standard', 'warning', 'finish'
     * @param {string} phaseColor - 相位颜色
     */
    async executeFlash(flashType, phaseColor) {
        if (this.isFlashing) {
            console.log('⚠️ 闪动正在进行，跳过新的闪动');
            return;
        }

        const config = FlashConfig[flashType];
        if (!config) {
            console.error('未知的闪动类型:', flashType);
            return;
        }

        this.isFlashing = true;
        
        // 保存原始颜色
        this.originalColor = this.container.style.backgroundColor || phaseColor;
        
        console.log(`✨ 开始${flashType}闪动效果`);

        try {
            // 执行闪动序列
            for (const step of config.pattern) {
                const color = this.resolveColor(step.color, phaseColor, this.originalColor);
                
                if (step.duration === 'stay') {
                    this.setBackgroundColor(color);
                    break;
                }
                
                this.setBackgroundColor(color);
                await this.delay(step.duration);
            }
        } catch (error) {
            console.error('闪动效果执行错误:', error);
            // 恢复原始颜色
            this.setBackgroundColor(this.originalColor);
        } finally {
            this.isFlashing = false;
        }
    }

    /**
     * 解析颜色类型
     * @param {string} colorType - 颜色类型
     * @param {string} phaseColor - 相位颜色
     * @param {string} originalColor - 原始颜色
     * @returns {string} 解析后的颜色值
     */
    resolveColor(colorType, phaseColor, originalColor) {
        switch(colorType) {
            case 'black': 
                return '#000000';
            case 'phase': 
                return phaseColor;
            case 'current': 
                return originalColor;
            case 'green': 
                return '#4CAF50';
            case 'orange': 
                return '#FF9500';
            default: 
                return colorType; // 直接使用颜色值
        }
    }

    /**
     * 设置背景颜色
     * @param {string} color - 颜色值
     */
    setBackgroundColor(color) {
        this.container.style.backgroundColor = color;
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 立即停止闪动并恢复颜色
     * @param {string} targetColor - 目标颜色
     */
    stopFlash(targetColor) {
        this.isFlashing = false;
        if (targetColor) {
            this.setBackgroundColor(targetColor);
        }
    }
}

/**
 * CSS动画版本的闪动效果
 */
export class CSSFlashEffector {
    constructor() {
        this.container = document.body;
        this.setupCSS();
    }

    /**
     * 设置CSS动画样式
     */
    setupCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* 基础闪动动画 */
            @keyframes phase-flash-standard {
                0%, 100% { background-color: var(--phase-color); }
                25%, 75% { background-color: #000000; }
                50% { background-color: var(--phase-color); }
            }

            /* WARNING特殊闪动 */
            @keyframes phase-flash-warning {
                0%, 100% { background-color: #FF9500; }
                16.66% { background-color: #4CAF50; }
                33.33% { background-color: #FF9500; }
                50% { background-color: #4CAF50; }
                66.66% { background-color: #FF9500; }
                83.33% { background-color: #4CAF50; }
            }

            /* 完成闪动 */
            @keyframes phase-flash-finish {
                0%, 33.33%, 66.66% { opacity: 1; }
                16.66%, 50%, 83.33% { opacity: 0.1; background-color: #000000; }
            }

            /* 应用闪动的类 */
            .flash-standard {
                animation: phase-flash-standard 0.45s ease-out 1;
            }

            .flash-warning {
                animation: phase-flash-warning 0.5s ease-out 1;
            }

            .flash-finish {
                animation: phase-flash-finish 1s ease-out 1;
            }

            /* 数字脉冲效果（倒计时最后几秒） */
            @keyframes number-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .pulse-countdown {
                animation: number-pulse 0.5s ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 触发相位闪动
     * @param {string} phaseType - 相位类型
     */
    triggerPhaseFlash(phaseType) {
        const body = this.container;
        
        // 移除可能存在的闪动类
        body.classList.remove('flash-standard', 'flash-warning', 'flash-finish');
        
        // 强制重绘
        void body.offsetWidth;
        
        // 根据相位类型添加对应闪动
        switch(phaseType) {
            case 'PREPARE':
            case 'ROUND':
            case 'REST':
                body.style.setProperty('--phase-color', this.getPhaseColor(phaseType));
                body.classList.add('flash-standard');
                break;
                
            case 'WARNING':
                body.classList.add('flash-warning');
                break;
                
            case 'FINISH':
                body.classList.add('flash-finish');
                break;
        }
        
        // 动画结束后清理
        setTimeout(() => {
            body.classList.remove('flash-standard', 'flash-warning', 'flash-finish');
        }, 1000);
    }

    /**
     * 获取相位颜色
     * @param {string} phase - 相位名称
     * @returns {string} 颜色值
     */
    getPhaseColor(phase) {
        const colors = {
            'PREPARE': '#DED140',
            'ROUND': '#4CAF50',
            'REST': '#FF5722'
        };
        return colors[phase] || '#2C2C2E';
    }

    /**
     * 触发数字脉冲效果
     * @param {Element} element - 目标元素
     */
    triggerNumberPulse(element) {
        if (!element) return;
        
        element.classList.remove('pulse-countdown');
        void element.offsetWidth; // 强制重绘
        element.classList.add('pulse-countdown');
        
        setTimeout(() => {
            element.classList.remove('pulse-countdown');
        }, 500);
    }
}

/**
 * 统一的闪动管理器
 */
export class FlashManager {
    constructor() {
        // 默认使用CSS动画版本（性能更好）
        this.effector = new CSSFlashEffector();
        
        // 如果需要更精确的控制，可以切换到JS版本
        // this.effector = new FlashEffectExecutor();
        
        this.enabled = true;
    }

    /**
     * 设置是否启用闪动效果
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * 触发相位变化闪动
     * @param {string} phaseType - 相位类型
     * @param {string} phaseColor - 相位颜色
     */
    triggerPhaseChange(phaseType, phaseColor) {
        if (!this.enabled) return;
        
        console.log(`✨ 触发相位闪动: ${phaseType}`);
        
        if (this.effector.triggerPhaseFlash) {
            // CSS版本
            this.effector.triggerPhaseFlash(phaseType);
        } else {
            // JS版本
            this.effector.executeFlash('standard', phaseColor);
        }
    }

    /**
     * 触发WARNING闪动
     */
    triggerWarning() {
        if (!this.enabled) return;
        
        console.log('⚠️ 触发WARNING闪动');
        
        if (this.effector.triggerPhaseFlash) {
            this.effector.triggerPhaseFlash('WARNING');
        } else {
            this.effector.executeFlash('warning', '#FF9500');
        }
    }

    /**
     * 触发训练完成闪动
     */
    triggerFinish() {
        if (!this.enabled) return;
        
        console.log('🎉 触发完成闪动');
        
        if (this.effector.triggerPhaseFlash) {
            this.effector.triggerPhaseFlash('FINISH');
        } else {
            this.effector.executeFlash('finish', null);
        }
    }

    /**
     * 触发倒计时脉冲
     * @param {Element} element - 目标元素
     */
    triggerCountdownPulse(element) {
        if (!this.enabled || !this.effector.triggerNumberPulse) return;
        
        this.effector.triggerNumberPulse(element);
    }
}