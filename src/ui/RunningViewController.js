// Boxing Timer Pro - 运行界面视图控制器
// 负责管理运行时界面的视觉效果：阶段切换、闪动效果、UI更新等

/**
 * 运行界面视图控制器
 * 按照设计要求实现：
 * 1. 阶段颜色系统（硬切换）
 * 2. 最后3秒闪动效果
 * 3. 界面布局更新
 */
export class RunningViewController {
    constructor() {
        // 阶段颜色映射
        this.PHASE_CLASSES = {
            PREPARE: 'phase-prepare',
            ROUND: 'phase-round',
            WARNING: 'phase-warning',
            REST: 'phase-rest'
        };
        
        // 阶段中文描述
        this.PHASE_DESCRIPTIONS = {
            PREPARE: '准备阶段',
            ROUND: '训练回合',
            WARNING: '回合警告',
            REST: '休息时间'
        };
        
        // DOM元素引用
        this.backgroundElement = null;
        this.timerElement = null;
        this.phaseTitleElement = null;
        this.phaseDescriptionElement = null;
        this.roundInfoElement = null;
        this.totalRemainingElement = null;
        this.pauseIconElement = null;
        
        // 状态管理
        this.currentPhase = null;
        this.isFlashing = false;
        this.flashInterval = null;
        
        // 绑定方法以确保正确的this上下文
        this.handlePhaseChange = this.handlePhaseChange.bind(this);
        this.handleTimeTick = this.handleTimeTick.bind(this);
        this.handleFlashStart = this.handleFlashStart.bind(this);
        this.handleFlashStop = this.handleFlashStop.bind(this);
        
        console.log('🎨 RunningViewController 初始化完成');
    }
    
    /**
     * 初始化控制器
     */
    init() {
        this.cacheDOM();
        this.setupEventListeners();
        console.log('✅ RunningViewController 初始化绑定完成');
    }
    
    /**
     * 缓存DOM元素引用
     */
    cacheDOM() {
        // 修复DOM元素ID匹配问题
        this.backgroundElement = document.getElementById('timer-running-view'); // 使用实际存在的元素
        this.timerElement = document.getElementById('main-timer');              // ✅ 正确
        this.phaseTitleElement = document.getElementById('phase-info');         // 修正：phase-title → phase-info
        this.phaseDescriptionElement = null; // 该元素不存在，设为null
        this.roundInfoElement = document.getElementById('round-number');        // 修正：round-info → round-number  
        this.totalRemainingElement = document.getElementById('total-progress'); // 修正：total-remaining → total-progress
        this.pauseIconElement = document.getElementById('pause-btn');           // 暂停按钮
        
        // 验证关键元素
        if (!this.backgroundElement) {
            console.warn('⚠️ 未找到timer-running-view元素');
        }
        if (!this.timerElement) {
            console.warn('⚠️ 未找到main-timer元素');
        }
        
        console.log('📦 DOM元素缓存完成');
        console.log('🔍 缓存的元素:', {
            backgroundElement: !!this.backgroundElement,
            timerElement: !!this.timerElement,
            phaseTitleElement: !!this.phaseTitleElement,
            roundInfoElement: !!this.roundInfoElement,
            totalRemainingElement: !!this.totalRemainingElement,
            pauseIconElement: !!this.pauseIconElement
        });
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听计时器引擎的阶段变化事件
        document.addEventListener('timer-phase-change', this.handlePhaseChange);
        document.addEventListener('timer-tick', this.handleTimeTick);
        document.addEventListener('timer-flash-start', this.handleFlashStart);
        document.addEventListener('timer-flash-stop', this.handleFlashStop);
        
        console.log('📡 事件监听器设置完成');
    }
    
    /**
     * 处理阶段变化
     * 实现硬切换效果（无过渡动画）
     */
    handlePhaseChange(event) {
        const { phase, roundNumber, totalRounds } = event.detail || {};
        
        if (!phase) {
            console.warn('⚠️ 阶段变化事件缺少phase信息');
            return;
        }
        
        console.log(`🔄 阶段变化: ${this.currentPhase} → ${phase}`);
        
        // 更新当前阶段
        this.currentPhase = phase.toUpperCase();
        
        // 立即硬切换背景颜色
        this.switchPhaseBackground(this.currentPhase);
        
        // 更新阶段信息
        this.updatePhaseInfo(this.currentPhase, roundNumber, totalRounds);
        
        // 停止闪动效果（如果正在闪动）
        this.stopFlashing();
        
        console.log(`✅ 阶段切换到: ${this.currentPhase}`);
    }
    
    /**
     * 硬切换阶段背景
     * 按设计要求：立即切换，无过渡动画
     */
    switchPhaseBackground(phase) {
        if (!this.backgroundElement) return;
        
        // 移除所有阶段类
        Object.values(this.PHASE_CLASSES).forEach(className => {
            this.backgroundElement.classList.remove(className);
        });
        
        // 添加新阶段类
        const phaseClass = this.PHASE_CLASSES[phase];
        if (phaseClass) {
            this.backgroundElement.classList.add(phaseClass);
            console.log(`🎨 背景切换到: ${phaseClass}`);
        } else {
            console.warn(`⚠️ 未知阶段: ${phase}`);
        }
    }
    
    /**
     * 更新阶段信息显示
     */
    updatePhaseInfo(phase, roundNumber, totalRounds) {
        // 更新阶段标题
        if (this.phaseTitleElement) {
            this.phaseTitleElement.textContent = phase;
        }
        
        // 更新阶段描述
        if (this.phaseDescriptionElement) {
            const description = this.PHASE_DESCRIPTIONS[phase] || phase;
            this.phaseDescriptionElement.textContent = description;
        }
        
        // 更新回合信息 - 只显示回合数字（按HTML结构）
        if (this.roundInfoElement && roundNumber) {
            this.roundInfoElement.textContent = roundNumber.toString().padStart(2, '0');
        }
        
        console.log(`📝 阶段信息已更新: ${phase}`);
    }
    
    /**
     * 处理倒计时更新
     */
    handleTimeTick(event) {
        const { remainingTime, totalRemainingTime, isPaused } = event.detail || {};
        
        // 更新主计时器显示
        if (this.timerElement && remainingTime !== undefined) {
            this.updateTimerDisplay(remainingTime);
        }
        
        // 更新总剩余时间
        if (this.totalRemainingElement && totalRemainingTime !== undefined) {
            this.updateTotalRemainingTime(totalRemainingTime);
        }
        
        // 更新暂停按钮状态
        this.updatePauseButtonState(isPaused);
    }
    
    /**
     * 更新计时器显示
     */
    updateTimerDisplay(seconds) {
        if (!this.timerElement) return;
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        this.timerElement.textContent = timeString;
    }
    
    /**
     * 更新总剩余时间显示
     */
    updateTotalRemainingTime(seconds) {
        if (!this.totalRemainingElement) return;
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // 按HTML结构更新，包含换行和label
        this.totalRemainingElement.innerHTML = `${timeString}<br><span class="progress-label">remaining</span>`;
    }
    
    /**
     * 更新暂停按钮状态
     */
    updatePauseButtonState(isPaused) {
        if (!this.pauseIconElement) return;
        
        if (isPaused) {
            this.pauseIconElement.textContent = '▶️';
            this.pauseIconElement.setAttribute('aria-label', '恢复训练');
        } else {
            this.pauseIconElement.textContent = '⏸️';
            this.pauseIconElement.setAttribute('aria-label', '暂停训练');
        }
    }
    
    /**
     * 处理闪动开始
     * 按设计要求：最后3秒闪动9次（当前颜色↔黑色）
     */
    handleFlashStart(event) {
        console.log('⚡ 开始最后3秒闪动');
        this.startFlashing();
    }
    
    /**
     * 处理闪动停止
     */
    handleFlashStop(event) {
        console.log('🔇 停止闪动');
        this.stopFlashing();
    }
    
    /**
     * 开始闪动效果
     * 实现9次硬闪烁（3秒内，每0.33秒一次）
     */
    startFlashing() {
        if (this.isFlashing || !this.backgroundElement) return;
        
        this.isFlashing = true;
        this.backgroundElement.classList.add('flash-countdown');
        
        console.log('⚡ 闪动效果已启动');
    }
    
    /**
     * 停止闪动效果
     */
    stopFlashing() {
        if (!this.isFlashing || !this.backgroundElement) return;
        
        this.isFlashing = false;
        this.backgroundElement.classList.remove('flash-countdown');
        
        if (this.flashInterval) {
            clearInterval(this.flashInterval);
            this.flashInterval = null;
        }
        
        console.log('🔇 闪动效果已停止');
    }
    
    /**
     * 重置界面到初始状态
     */
    reset() {
        // 停止闪动
        this.stopFlashing();
        
        // 重置阶段
        this.currentPhase = null;
        
        // 清除阶段背景类
        if (this.backgroundElement) {
            Object.values(this.PHASE_CLASSES).forEach(className => {
                this.backgroundElement.classList.remove(className);
            });
        }
        
        // 重置显示内容
        if (this.timerElement) {
            this.timerElement.textContent = '00:00';
        }
        
        if (this.phaseTitleElement) {
            this.phaseTitleElement.textContent = 'READY';
        }
        
        if (this.phaseDescriptionElement) {
            this.phaseDescriptionElement.textContent = '准备开始';
        }
        
        if (this.roundInfoElement) {
            this.roundInfoElement.textContent = '01';
        }
        
        console.log('🔄 运行界面已重置');
    }
    
    /**
     * 手动设置阶段（用于测试和调试）
     */
    setPhase(phase, roundNumber, totalRounds) {
        this.handlePhaseChange({
            detail: {
                phase: phase,
                roundNumber: roundNumber,
                totalRounds: totalRounds
            }
        });
    }
    
    /**
     * 手动触发闪动（用于测试）
     */
    testFlashing() {
        console.log('🧪 测试闪动效果');
        this.startFlashing();
        
        // 3秒后自动停止
        setTimeout(() => {
            this.stopFlashing();
        }, 3000);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 移除事件监听器
        document.removeEventListener('timer-phase-change', this.handlePhaseChange);
        document.removeEventListener('timer-tick', this.handleTimeTick);
        document.removeEventListener('timer-flash-start', this.handleFlashStart);
        document.removeEventListener('timer-flash-stop', this.handleFlashStop);
        
        // 停止闪动
        this.stopFlashing();
        
        // 清空DOM引用
        this.backgroundElement = null;
        this.timerElement = null;
        this.phaseTitleElement = null;
        this.phaseDescriptionElement = null;
        this.roundInfoElement = null;
        this.totalRemainingElement = null;
        this.pauseIconElement = null;
        
        console.log('🗑️ RunningViewController 已销毁');
    }
}

console.log('📦 RunningViewController 模块加载完成');