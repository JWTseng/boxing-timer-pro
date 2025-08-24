// Boxing Timer Pro - START按钮控制器
// 负责处理训练启动逻辑和状态管理

import { TimerEngine } from '../timer/TimerEngine.js';
import { RunningViewController } from '../ui/RunningViewController.js';

/**
 * START按钮和训练启动控制器
 */
export class StartController {
    constructor() {
        this.appState = 'setup';
        this.timerEngine = null;
        this.runningViewController = null; // 运行界面控制器
        this.currentSettings = null;
        this.onStateChange = null; // 状态变化回调
        
        // Play/Pause状态管理
        this.pausedTime = null; // 暂停时保存的时间
        this.pausedTotalTime = null; // 暂停时保存的总剩余时间
        
        // 初始化Play/Pause按钮状态
        setTimeout(() => {
            this.initializePlayPauseButton();
        }, 100);
        
        // 应用状态常量
        this.STATES = {
            SETUP: 'setup',
            VALIDATING: 'validating', 
            PREPARING: 'preparing',
            READY: 'ready',
            RUNNING: 'running',
            PAUSED: 'paused',
            FINISHED: 'finished'
        };
        
        // 计时器阶段常量
        this.PHASES = {
            PREPARE: 'prepare',
            ROUND: 'round', 
            WARNING: 'warning',
            REST: 'rest'
        };
        
        console.log('🎯 StartController 初始化完成');
        
        // 调试方法仅在控制台可用，不自动暴露到全局
        console.log('🧪 调试提示：输入以下命令测试功能');
        console.log('window.startController.debugTestStart() - 测试START按钮');
        console.log('window.startController.debugTestPhase("phase") - 测试阶段切换');
    }
    
    /**
     * 调试方法：测试START按钮功能
     */
    debugTestStart() {
        console.log('🧪 测试START按钮功能');
        this.handleStartClick();
    }
    
    /**
     * 调试方法：测试阶段切换 - 修复版：不自动显示运行界面
     */
    debugTestPhase(phase) {
        const phases = ['prepare', 'round', 'warning', 'rest'];
        if (!phases.includes(phase)) {
            console.warn('⚠️ 无效阶段，使用prepare');
            phase = 'prepare';
        }
        
        // @CMAI修复：只在运行界面已显示时才切换阶段
        const runningView = document.getElementById('timer-running-view');
        if (runningView && runningView.style.display !== 'none') {
            // 模拟阶段变化
            setTimeout(() => {
                this.handlePhaseChange({ phase, round: 1 });
                console.log(`🧪 测试阶段切换到: ${phase}`);
            }, 500);
        } else {
            console.log('⚠️ 运行界面未显示，先点击START按钮启动训练');
        }
    }
    
    /**
     * 调试方法：仅供开发使用，不自动显示界面
     */
    debugShowRunningUI() {
        console.log('🚫 此方法已禁用以确保正确的应用流程');
        console.log('✅ 请使用正常流程：点击START按钮 → 显示运行界面');
        console.log('🧪 如需测试，请使用: window.startController.debugTestStart()');
    }
    
    /**
     * 初始化控制器
     */
    init() {
        this.bindStartButton();
        this.bindControlButtons();
        this.loadUserSettings();
        this.initRunningViewController();
        console.log('✅ StartController 绑定完成');
    }
    
    /**
     * 初始化运行界面控制器
     */
    initRunningViewController() {
        this.runningViewController = new RunningViewController();
        this.runningViewController.init();
        console.log('🎨 RunningViewController 已初始化');
    }
    
    /**
     * 绑定START按钮事件
     */
    bindStartButton() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStartClick();
            });
            console.log('🔘 START按钮绑定完成');
        } else {
            console.warn('⚠️ 未找到START按钮元素');
        }
    }
    
    /**
     * 绑定PAUSE/STOP控制按钮事件
     */
    bindControlButtons() {
        // 绑定全新Play/Pause按钮
        const playPauseButton = document.getElementById('play-pause-button');
        if (playPauseButton) {
            playPauseButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePlayPause();
            });
            console.log('✅ 全新Play/Pause按钮绑定完成');
        }
        
        // 绑定停止按钮
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.handleStopClick();
            });
            console.log('⏹️ STOP按钮绑定完成');
        }
    }
    
    /**
     * 处理暂停按钮点击
     */
    /**
     * 处理Play/Pause按钮切换
     */
    /**
     * 全新的Play/Pause切换逻辑
     */
    togglePlayPause() {
        console.log('🎯 Play/Pause按钮被点击');
        
        const button = document.getElementById('play-pause-button');
        if (!button) {
            console.error('❌ Play/Pause按钮未找到');
            return;
        }
        
        if (this.appState === 'running') {
            // 运行中 → 暂停
            this.pauseTimer();
            this.setState('paused');
            this.showPlayState();
            console.log('⏸️ 训练已暂停');
            
        } else if (this.appState === 'paused') {
            // 暂停中 → 运行
            this.resumeTimer();
            this.setState('running');
            this.showPauseState();
            console.log('▶️ 训练已恢复');
        }
    }
    
    /**
     * 显示暂停状态（显示暂停条）
     */
    showPauseState() {
        const button = document.getElementById('play-pause-button');
        if (!button) return;
        
        const pauseBars = button.querySelector('.pause-bars');
        const playArrow = button.querySelector('.play-arrow');
        
        if (pauseBars && playArrow) {
            pauseBars.style.display = 'flex';
            playArrow.style.display = 'none';
            button.setAttribute('aria-label', '暂停');
            console.log('🎯 显示暂停状态');
        }
    }
    
    /**
     * 显示播放状态（显示播放箭头）
     */
    showPlayState() {
        const button = document.getElementById('play-pause-button');
        if (!button) return;
        
        const pauseBars = button.querySelector('.pause-bars');
        const playArrow = button.querySelector('.play-arrow');
        
        if (pauseBars && playArrow) {
            pauseBars.style.display = 'none';
            playArrow.style.display = 'flex';
            button.setAttribute('aria-label', '播放');
            console.log('🎯 显示播放状态');
        }
    }
    
    /**
     * 初始化按钮状态
     */
    initializePlayPauseButton() {
        console.log('🚀 初始化Play/Pause按钮');
        
        // 默认显示暂停状态
        this.showPauseState();
    }
    
    // @CMAI: 删除复杂的切换方法，使用简单的toggle逻辑替代
    
    /**
     * 暂停计时器 - 保存当前状态
     */
    pauseTimer() {
        // 停止当前倒计时
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // 保存当前时间状态
        const mainTimer = document.getElementById('main-timer');
        const totalProgress = document.getElementById('total-progress');
        
        if (mainTimer) {
            // 从显示的时间解析剩余时间
            const timeText = mainTimer.textContent;
            const [minutes, seconds] = timeText.split(':').map(s => parseInt(s) || 0);
            this.pausedTime = minutes * 60 + seconds;
            console.log(`💾 保存暂停时间: ${this.pausedTime}秒`);
        }
        
        if (totalProgress) {
            // 从总剩余时间解析
            const totalText = totalProgress.textContent.split('\n')[0];
            const [totalMinutes, totalSeconds] = totalText.split(':').map(s => parseInt(s) || 0);
            this.pausedTotalTime = totalMinutes * 60 + totalSeconds;
            console.log(`💾 保存总剩余时间: ${this.pausedTotalTime}秒`);
        }
    }
    
    /**
     * 恢复计时器 - 从暂停点继续
     */
    resumeTimer() {
        console.log('▶️ 从暂停点恢复计时');
        
        // 如果没有保存的时间，则从当前设置重新开始
        if (this.pausedTime === null) {
            console.warn('⚠️ 未找到暂停时间，重新开始');
            this.startSimpleCountdown();
            return;
        }
        
        // 从暂停点继续倒计时
        this.continueCountdownFromPaused();
    }
    
    /**
     * 从暂停点继续倒计时
     */
    continueCountdownFromPaused() {
        let timeLeft = this.pausedTime;
        let totalTimeLeft = this.pausedTotalTime;
        
        const mainTimer = document.getElementById('main-timer');
        const totalProgress = document.getElementById('total-progress');
        
        console.log(`⏱️ 从暂停点继续: ${timeLeft}秒, 总剩余: ${totalTimeLeft}秒`);
        
        this.countdownInterval = setInterval(() => {
            if (timeLeft > 0 && totalTimeLeft > 0) {
                // 更新主计时器显示
                if (mainTimer) {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    mainTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                
                // 更新总剩余时间
                if (totalProgress) {
                    const totalMinutes = Math.floor(totalTimeLeft / 60);
                    const totalSeconds = totalTimeLeft % 60;
                    totalProgress.innerHTML = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}<br><span class="progress-label">remaining</span>`;
                }
                
                timeLeft--;
                totalTimeLeft--;
                
                // 更新保存的时间状态
                this.pausedTime = timeLeft;
                this.pausedTotalTime = totalTimeLeft;
                
            } else {
                console.log('⏱️ 当前阶段倒计时完成');
                clearInterval(this.countdownInterval);
                this.showSuccess('当前阶段完成！');
            }
        }, 1000);
    }
    
    /**
     * 处理停止按钮点击 - X按钮直接结束
     */
    handleStopClick() {
        console.log('⏹️ 用户点击停止按钮');
        
        // 停止倒计时
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // 清除暂停状态
        this.pausedTime = null;
        this.pausedTotalTime = null;
        
        this.setState('setup');
        this.returnToSetup();
        // this.showInfo('训练已停止'); // @CMAI: 方法不存在，先注释掉
        console.log('⏹️ 训练已停止');
    }
    
    /**
     * 处理START按钮点击
     */
    async handleStartClick() {
        console.log('🚀 用户点击START按钮');
        
        try {
            // 步骤1: 立即更新按钮状态
            this.updateStartButton('启动中...', true, true);
            
            // 步骤2: 快速验证设置
            const settings = this.getCurrentSettings();
            console.log('📋 当前设置:', settings);
            
            // 步骤3: 直接启动训练（简化流程）
            await this.startTrainingDirect();
            
        } catch (error) {
            console.error('❌ START按钮处理失败:', error);
            this.setState('setup');
            this.updateStartButton('START', false, false);
            this.showError('启动失败，请重试');
        }
    }
    
    /**
     * 直接启动训练（简化版本）
     */
    async startTrainingDirect() {
        console.log('🥊 直接启动拳击训练');
        
        try {
            // 获取设置
            this.currentSettings = this.getCurrentSettings();
            console.log('⚙️ 训练设置:', this.currentSettings);
            
            // 立即切换到运行视图
            this.switchToRunningViewAnimated();
            
            // 更新状态
            this.setState('running');
            this.updateStartButton('运行中...', true, true);
            
            // 启动简单的倒计时演示
            this.startSimpleCountdown();
            
            console.log('✅ 训练界面启动成功');
            
        } catch (error) {
            console.error('❌ 训练启动失败:', error);
            throw error;
        }
    }
    
    /**
     * 启动简单倒计时演示
     */
    startSimpleCountdown() {
        console.log('⏱️ 启动准备阶段倒计时');
        
        let timeLeft = this.currentSettings.prepareTime;
        const mainTimer = document.getElementById('main-timer');
        const totalProgress = document.getElementById('total-progress');
        
        // 计算总时间
        const totalTime = this.currentSettings.prepareTime + 
                         (this.currentSettings.roundTime + this.currentSettings.restTime) * this.currentSettings.rounds;
        let remainingTotal = totalTime;
        
        this.countdownInterval = setInterval(() => {
            if (timeLeft > 0) {
                // 更新主计时器显示
                if (mainTimer) {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    mainTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                
                // 更新总剩余时间
                if (totalProgress) {
                    const totalMinutes = Math.floor(remainingTotal / 60);
                    const totalSeconds = remainingTotal % 60;
                    totalProgress.innerHTML = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}<br><span class="progress-label">remaining</span>`;
                }
                
                timeLeft--;
                remainingTotal--;
            } else {
                console.log('⏱️ 准备阶段结束');
                clearInterval(this.countdownInterval);
                this.showSuccess('准备阶段完成！开始第一回合！');
            }
        }, 1000);
    }
    
    /**
     * 验证用户设置
     */
    validateSettings() {
        const settings = this.getCurrentSettings();
        const errors = [];
        
        // 验证回合数
        if (settings.rounds <= 0 || settings.rounds > 50) {
            errors.push('回合数必须在1-50之间');
        }
        
        // 验证准备时间
        if (settings.prepareTime < 5 || settings.prepareTime > 300) {
            errors.push('准备时间必须在5-300秒之间');
        }
        
        // 验证回合时间
        if (settings.roundTime < 10 || settings.roundTime > 1800) {
            errors.push('回合时间必须在10秒-30分钟之间');
        }
        
        // 验证警告时间
        if (settings.warningTime < 5 || settings.warningTime > 60) {
            errors.push('警告时间必须在5-60秒之间');
        }
        
        // 验证休息时间
        if (settings.restTime < 10 || settings.restTime > 600) {
            errors.push('休息时间必须在10秒-10分钟之间');
        }
        
        const valid = errors.length === 0;
        console.log(valid ? '✅ 设置验证通过' : '❌ 设置验证失败:', errors);
        
        return { valid, errors, settings };
    }
    
    /**
     * 获取当前设置
     */
    getCurrentSettings() {
        // 从DOM元素获取当前用户设置
        const rounds = parseInt(document.getElementById('rounds-count')?.textContent || '10');
        const prepareTime = this.parseTimeText(document.getElementById('prepare-time')?.textContent || '00:10');
        const roundTime = this.parseTimeText(document.getElementById('round-time')?.textContent || '00:10');
        const warningTime = this.parseTimeText(document.getElementById('warning-time')?.textContent || '00:10');
        const restTime = this.parseTimeText(document.getElementById('rest-time')?.textContent || '00:30');
        
        return {
            rounds,
            prepareTime,
            roundTime,
            warningTime,
            restTime
        };
    }
    
    /**
     * 解析时间文本为秒数
     */
    parseTimeText(timeText) {
        const [minutes, seconds] = timeText.split(':').map(s => parseInt(s) || 0);
        return minutes * 60 + seconds;
    }
    
    /**
     * 初始化TimerEngine
     */
    async initializeTimerEngine() {
        try {
            console.log('⚙️ 初始化TimerEngine...');
            
            // 创建TimerEngine实例
            this.timerEngine = new TimerEngine();
            
            // 初始化
            await this.timerEngine.init();
            
            // 绑定事件监听器
            this.bindTimerEngineEvents();
            
            console.log('✅ TimerEngine初始化完成');
            
        } catch (error) {
            console.error('❌ TimerEngine初始化失败:', error);
            throw new Error('计时器初始化失败，请检查系统权限');
        }
    }
    
    /**
     * 绑定TimerEngine事件监听器
     */
    bindTimerEngineEvents() {
        // 状态变化事件
        this.timerEngine.addEventListener('stateChange', (state) => {
            console.log('⏱️ 计时器状态变化:', state);
            this.handleTimerStateChange(state);
        });
        
        // 阶段变化事件
        this.timerEngine.addEventListener('phaseChange', (data) => {
            console.log('🔄 训练阶段变化:', data);
            this.handlePhaseChange(data);
            
            // 转发给RunningViewController - 发送DOM事件
            this.dispatchTimerEvent('timer-phase-change', {
                phase: data.phase,
                roundNumber: data.round,
                totalRounds: data.totalRounds || this.currentSettings.rounds,
                duration: data.duration
            });
        });
        
        // 倒计时事件
        this.timerEngine.addEventListener('tick', (data) => {
            this.updateTimerDisplay(data);
            
            // 转发给RunningViewController
            this.dispatchTimerEvent('timer-tick', {
                remainingTime: data.remainingTime,
                totalRemainingTime: data.totalRemaining,
                isPaused: this.appState === 'paused',
                phase: data.phase,
                isWarning: data.isWarning
            });
        });
        
        // 警告状态变化事件
        this.timerEngine.addEventListener('warningChange', (data) => {
            console.log('⚠️ 警告状态变化:', data);
        });
        
        // 倒计时滴答事件（用于最后3秒闪动）
        this.timerEngine.addEventListener('countdownTick', (data) => {
            // 检查是否需要启动闪动效果
            if (data.secondsRemaining <= 3 && data.secondsRemaining > 0) {
                this.dispatchTimerEvent('timer-flash-start', {
                    remainingTime: data.secondsRemaining,
                    phase: data.phase
                });
            } else {
                this.dispatchTimerEvent('timer-flash-stop', {});
            }
        });
        
        // 训练完成事件
        this.timerEngine.addEventListener('trainingComplete', (data) => {
            console.log('🏁 训练完成:', data);
            this.handleTrainingComplete();
        });
        
        console.log('📡 TimerEngine事件监听器绑定完成');
    }
    
    /**
     * 发送DOM事件给RunningViewController
     */
    dispatchTimerEvent(eventType, detail) {
        const event = new CustomEvent(eventType, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * 启动训练
     */
    async startTraining() {
        try {
            console.log('🥊 启动拳击训练');
            
            // 获取和保存设置
            this.currentSettings = this.getCurrentSettings();
            this.saveSettingsToStorage();
            
            // 配置TimerEngine
            this.configureTimerEngine();
            
            // 切换到运行视图（带动画）
            this.switchToRunningViewAnimated();
            
            // 更新状态
            this.setState('ready');
            this.updateStartButton('正在启动...', true, true);
            
            // 启动TimerEngine
            await this.timerEngine.start();
            
            // 更新最终状态
            this.setState('running');
            this.showSuccess('训练已开始！');
            console.log('✅ 训练启动成功');
            
        } catch (error) {
            console.error('❌ 训练启动失败:', error);
            this.setState('setup');
            this.updateStartButton('START', false);
            throw error;
        }
    }
    
    /**
     * 配置TimerEngine设置
     */
    configureTimerEngine() {
        const settings = {
            roundCount: this.currentSettings.rounds,
            prepareTime: this.currentSettings.prepareTime,
            roundTime: this.currentSettings.roundTime,
            warningTime: this.currentSettings.warningTime,
            restTime: this.currentSettings.restTime
        };
        
        this.timerEngine.setSettings(settings);
        console.log('⚙️ TimerEngine设置已配置:', settings);
    }
    
    /**
     * 处理计时器状态变化
     */
    handleTimerStateChange(state) {
        switch (state) {
            case 'running':
                this.setState('running');
                break;
            case 'paused':
                this.setState('paused');
                break;
            case 'completed':
                this.setState('finished');
                break;
        }
    }
    
    /**
     * 处理训练阶段变化
     */
    handlePhaseChange(data) {
        const phase = data.phase || data;
        
        // 硬切换运行界面背景和阶段信息
        const runningView = document.getElementById('timer-running-view');
        if (runningView) {
            runningView.className = `view timer-running phase-${phase}`;
        }
        
        // 更新阶段信息
        const phaseInfo = document.getElementById('phase-info');
        if (phaseInfo) {
            phaseInfo.textContent = phase.toString().toUpperCase();
        }
        
        console.log(`🎯 阶段信息已更新: ${phase}`);
        
        // 更新回合信息
        this.updateRoundInfo();
        
        console.log(`🔄 阶段变化: ${phase} - 硬切换背景`);
    }
    
    /**
     * 更新计时器显示
     */
    updateTimerDisplay(data) {
        const mainTimer = document.getElementById('main-timer');
        if (mainTimer && data.remainingTime !== undefined) {
            const minutes = Math.floor(data.remainingTime / 60);
            const seconds = data.remainingTime % 60;
            mainTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * 更新回合信息
     */
    updateRoundInfo() {
        // 更新回合数字显示
        const roundNumber = document.getElementById('round-number');
        if (roundNumber && this.timerEngine) {
            const current = this.timerEngine.currentRound || 1;
            roundNumber.textContent = current.toString().padStart(2, '0');
        }
    }
    
    /**
     * 处理训练完成
     */
    handleTrainingComplete() {
        this.setState('finished');
        
        // 显示完成界面或返回设置界面
        setTimeout(() => {
            this.returnToSetup();
        }, 3000);
        
        console.log('🎉 训练完成，3秒后返回设置界面');
    }
    
    /**
     * 返回设置界面 - Safari兼容版
     */
    returnToSetup() {
        const setupView = document.getElementById('timer-setup-view');
        const runningView = document.getElementById('timer-running-view');
        
        console.log('🔄 返回设置界面');
        
        if (setupView && runningView) {
            // 隐藏运行界面
            runningView.style.display = 'none';
            runningView.classList.remove('active');
            
            // 显示设置界面
            setupView.style.display = 'block';
            setupView.classList.add('active');
            
            this.setState('setup');
            this.updateStartButton('START', false, false);
            
            console.log('✅ 已切换到设置界面');
            
            console.log('🔄 返回设置界面');
        }
    }
    
    /**
     * 切换到运行视图 - Safari兼容版
     */
    switchToRunningView() {
        const setupView = document.getElementById('timer-setup-view');
        const runningView = document.getElementById('timer-running-view');
        
        if (setupView && runningView) {
            setupView.style.display = 'none';
            runningView.classList.add('active'); // 使用CSS类控制显示
            console.log('🔄 切换到运行界面');
        }
    }
    
    /**
     * 触发计时器启动
     */
    triggerTimerStart() {
        // 创建自定义事件通知其他组件
        const startEvent = new CustomEvent('timer-start', {
            detail: this.currentSettings
        });
        document.dispatchEvent(startEvent);
        console.log('📡 发送计时器启动事件');
    }
    
    /**
     * 更新START按钮状态（带动画）
     */
    updateStartButton(text, disabled, loading = false) {
        const startBtn = document.getElementById('start-btn');
        if (!startBtn) return;
        
        // 添加加载状态样式
        if (loading) {
            startBtn.classList.add('loading');
            startBtn.innerHTML = `
                <span class="loading-spinner"></span>
                <span>${text}</span>
            `;
        } else {
            startBtn.classList.remove('loading');
            startBtn.textContent = text;
        }
        
        startBtn.disabled = disabled;
        
        // 添加按钮动画样式（如果还未添加）
        this.addButtonAnimations();
    }
    
    /**
     * 添加按钮动画样式
     */
    addButtonAnimations() {
        if (document.querySelector('#start-button-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'start-button-animations';
        style.textContent = `
            .start-button.loading {
                position: relative;
                pointer-events: none;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .start-button:disabled {
                opacity: 0.6;
                transform: scale(0.98);
                transition: all 0.2s ease;
            }
            
            .start-button:not(:disabled):hover {
                transform: scale(1.02);
                transition: all 0.2s ease;
            }
            
            .start-button:not(:disabled):active {
                transform: scale(0.98);
                transition: all 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 切换到运行界面（硬切换版本）- Safari兼容版
     */
    switchToRunningViewAnimated() {
        const setupView = document.getElementById('timer-setup-view');
        const runningView = document.getElementById('timer-running-view');
        
        if (!setupView || !runningView) {
            console.warn('⚠️ 视图元素未找到');
            return;
        }
        
        console.log('🔄 切换到运行界面');
        
        // 确保切换成功 - 多重保障
        setupView.style.display = 'none';
        setupView.classList.remove('active');
        
        runningView.style.display = 'flex'; // 直接设置显示
        runningView.classList.add('active');
        
        // 初始化运行界面的阶段
        this.updateRunningUI('prepare', 1, this.currentSettings);
        
        console.log('✅ 运行界面已显示');
        
        console.log('🎬 切换到运行界面');
    }
    
    /**
     * 更新运行界面UI
     */
    updateRunningUI(phase, roundNumber, settings) {
        const runningView = document.getElementById('timer-running-view');
        const phaseInfo = document.getElementById('phase-info');
        const roundNumberEl = document.getElementById('round-number');
        
        if (!runningView) return;
        
        // 硬切换背景颜色阶段
        runningView.className = `view timer-running phase-${phase}`;
        
        // 更新阶段信息
        if (phaseInfo) {
            phaseInfo.textContent = phase.toUpperCase();
        }
        
        // 更新回合数字
        if (roundNumberEl) {
            roundNumberEl.textContent = roundNumber.toString().padStart(2, '0');
        }
        
        console.log(`🎨 更新UI: ${phase} 阶段, 第${roundNumber}回合`);
    }
    
    /**
     * 添加视图过渡样式
     */
    addViewTransitionStyles() {
        if (document.querySelector('#view-transition-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'view-transition-styles';
        style.textContent = `
            .view {
                will-change: opacity, transform;
            }
            
            .view-transition-enter {
                opacity: 0;
                transform: translateY(20px);
            }
            
            .view-transition-enter-active {
                opacity: 1;
                transform: translateY(0);
                transition: opacity 0.4s ease-out, transform 0.4s ease-out;
            }
            
            .view-transition-exit {
                opacity: 1;
                transform: translateY(0);
            }
            
            .view-transition-exit-active {
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease-out, transform 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 显示验证错误（友好的UI提示）
     */
    showValidationError(errors) {
        this.showToast('设置验证失败', errors.join('、'), 'error');
        console.warn('⚠️ 验证错误:', errors);
    }
    
    /**
     * 显示通用错误
     */
    showError(message) {
        this.showToast('操作失败', message, 'error');
        console.error('❌ 错误:', message);
    }
    
    /**
     * 显示成功消息
     */
    showSuccess(message) {
        this.showToast('操作成功', message, 'success');
        console.log('✅ 成功:', message);
    }
    
    /**
     * 显示Toast通知
     */
    showToast(title, message, type = 'info') {
        // 移除现有toast
        const existingToast = document.querySelector('.start-controller-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `start-controller-toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong>${this.getToastIcon(type)} ${title}</strong>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        // 样式
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getToastBackground(type)};
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // 添加CSS动画
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .toast-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .toast-close { background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.7; }
                .toast-close:hover { opacity: 1; }
                .toast-body { font-size: 14px; line-height: 1.4; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // 自动隐藏
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, type === 'error' ? 5000 : 3000);
    }
    
    /**
     * 获取Toast图标
     */
    getToastIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
    
    /**
     * 获取Toast背景色
     */
    getToastBackground(type) {
        switch (type) {
            case 'success': return '#FF9500';
            case 'error': return '#FF3B30';
            case 'warning': return '#FF9500';
            default: return '#007AFF';
        }
    }
    
    /**
     * 设置应用状态
     */
    setState(newState) {
        const oldState = this.appState;
        this.appState = newState;
        console.log(`🔄 状态变化: ${oldState} → ${newState}`);
        
        // 调用状态变化回调
        if (this.onStateChange) {
            this.onStateChange(newState, oldState);
        }
    }
    
    /**
     * 获取当前状态
     */
    getState() {
        return this.appState;
    }
    
    /**
     * 加载用户设置
     */
    loadUserSettings() {
        try {
            const saved = localStorage.getItem('boxing-timer-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                console.log('📋 加载保存的设置:', settings);
                // TODO: 应用设置到UI
            }
        } catch (error) {
            console.warn('⚠️ 加载设置失败:', error);
        }
    }
    
    /**
     * 保存设置到存储
     */
    saveSettingsToStorage() {
        try {
            localStorage.setItem('boxing-timer-settings', JSON.stringify(this.currentSettings));
            sessionStorage.setItem('boxing-timer-current-session', JSON.stringify(this.currentSettings));
            console.log('💾 设置已保存');
        } catch (error) {
            console.warn('⚠️ 保存设置失败:', error);
        }
    }
    
    /**
     * 延迟工具函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

console.log('📦 StartController 模块加载完成');