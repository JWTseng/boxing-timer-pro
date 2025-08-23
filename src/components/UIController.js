// Boxing Timer Pro - UI控制器
// 负责管理用户界面交互和状态更新

import { TimerState, TrainingPhase } from '../timer/TimerEngine.js';
import { SoundType } from '../audio/AudioManager.js';

/**
 * UI控制器类
 * 负责协调UI与各个功能模块的交互
 */
export class UIController {
    constructor(dependencies) {
        this.timer = dependencies.timer;
        this.audio = dependencies.audio;
        this.database = dependencies.database;
        this.settings = dependencies.settings;
        
        // UI元素引用
        this.elements = {};
        
        // 当前状态
        this.currentPreset = null;
        this.isCountingDown = false;
        
        // 界面状态
        this.currentView = 'main';
        
        console.log('🎮 UIController 实例化完成');
    }

    /**
     * 初始化UI控制器
     */
    async init() {
        try {
            // 获取UI元素引用
            this.getElementReferences();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 绑定定时器事件
            this.bindTimerEvents();
            
            // 初始化UI状态
            this.initializeUI();
            
            // 加载默认预设
            await this.loadDefaultPreset();
            
            console.log('✅ UIController 初始化完成');
            
        } catch (error) {
            console.error('❌ UIController 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 获取UI元素引用
     */
    getElementReferences() {
        // 主要控件
        this.elements.startPauseBtn = document.getElementById('start-pause-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.mainTimer = document.getElementById('main-timer');
        this.elements.timerIcon = document.getElementById('timer-icon');
        this.elements.roundStatus = document.getElementById('round-status');
        this.elements.currentPreset = document.getElementById('current-preset');
        this.elements.progressBar = document.querySelector('.progress-fill');
        
        // 导航按钮
        this.elements.presetsBtn = document.getElementById('presets-btn');
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.logsBtn = document.getElementById('logs-btn');
        this.elements.presetsNavBtn = document.getElementById('presets-nav-btn');
        this.elements.settingsNavBtn = document.getElementById('settings-nav-btn');
        
        console.log('🔗 UI元素引用获取完成');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 主要控制按钮
        if (this.elements.startPauseBtn) {
            this.elements.startPauseBtn.addEventListener('click', () => {
                this.handleStartPause();
            });
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', (e) => {
                this.handleReset(e);
            });
        }
        
        // 导航按钮
        if (this.elements.presetsBtn) {
            this.elements.presetsBtn.addEventListener('click', () => {
                this.showPresetsView();
            });
        }
        
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => {
                this.showSettingsView();
            });
        }
        
        if (this.elements.logsBtn) {
            this.elements.logsBtn.addEventListener('click', () => {
                this.showLogsView();
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // 触摸事件处理（提供触觉反馈）
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('control-btn') || e.target.classList.contains('nav-btn')) {
                this.provideTactileFeedback();
            }
        });
        
        console.log('👂 事件监听器设置完成');
    }

    /**
     * 绑定计时器事件
     */
    bindTimerEvents() {
        // 状态变化事件
        this.timer.addEventListener('stateChange', (data) => {
            this.handleTimerStateChange(data);
        });
        
        // 阶段变化事件
        this.timer.addEventListener('phaseChange', (data) => {
            this.handlePhaseChange(data);
        });
        
        // 计时更新事件
        this.timer.addEventListener('tick', (data) => {
            this.handleTimerTick(data);
        });
        
        // 回合完成事件
        this.timer.addEventListener('roundComplete', (data) => {
            this.handleRoundComplete(data);
        });
        
        // 训练完成事件
        this.timer.addEventListener('trainingComplete', (data) => {
            this.handleTrainingComplete(data);
        });
        
        console.log('⏱️ 计时器事件绑定完成');
    }

    /**
     * 初始化UI状态
     */
    initializeUI() {
        // 设置初始显示
        this.updateTimerDisplay('00:00');
        this.updateRoundStatus('准备开始');
        this.updateStartPauseButton(TimerState.STOPPED);
        this.updateProgressBar(0);
        
        // 应用用户设置
        this.applyUISettings();
        
        console.log('🎨 UI状态初始化完成');
    }

    /**
     * 加载默认预设
     */
    async loadDefaultPreset() {
        try {
            const presets = await this.database.getAllPresets();
            const defaultPreset = presets.find(p => p.isDefault) || presets[0];
            
            if (defaultPreset) {
                await this.loadPreset(defaultPreset);
            }
            
        } catch (error) {
            console.warn('⚠️ 加载默认预设失败:', error);
        }
    }

    /**
     * 加载预设
     */
    async loadPreset(preset) {
        try {
            this.currentPreset = preset;
            
            // 更新计时器设置
            this.timer.setSettings({
                roundTime: preset.roundTime,
                restTime: preset.restTime,
                prepareTime: preset.prepareTime,
                roundCount: preset.roundCount,
                soundScheme: preset.soundScheme
            });
            
            // 更新UI显示
            this.elements.currentPreset.textContent = preset.name;
            this.updateRoundStatus(`准备开始 - ${preset.roundCount} 回合训练`);
            
            console.log(`📋 预设加载成功: ${preset.name}`);
            
        } catch (error) {
            console.error('❌ 加载预设失败:', error);
            this.showErrorMessage('加载预设失败，请重试');
        }
    }

    // ========== 事件处理器 ==========

    /**
     * 处理开始/暂停按钮点击
     */
    async handleStartPause() {
        try {
            const currentState = this.timer.getState().state;
            
            if (currentState === TimerState.STOPPED || currentState === TimerState.PAUSED) {
                // 开始或恢复训练
                await this.timer.start();
            } else if (currentState === TimerState.RUNNING) {
                // 暂停训练
                this.timer.pause();
            }
            
            // 提供触觉反馈
            this.provideTactileFeedback();
            
        } catch (error) {
            console.error('❌ 开始/暂停操作失败:', error);
            this.showErrorMessage('操作失败，请重试');
        }
    }

    /**
     * 处理重置按钮点击
     */
    handleReset(event) {
        const confirmReset = this.settings.get('confirmBeforeReset', true);
        
        if (confirmReset && this.timer.getState().state !== TimerState.STOPPED) {
            // 显示确认对话框
            this.showConfirmDialog(
                '确认重置',
                '是否确认重置当前训练？所有进度将丢失。',
                () => {
                    this.timer.stop();
                    this.provideTactileFeedback();
                }
            );
        } else {
            this.timer.stop();
            this.provideTactileFeedback();
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(event) {
        // 只在主界面处理快捷键
        if (this.currentView !== 'main') return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.handleStartPause();
                break;
                
            case 'KeyR':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.handleReset();
                }
                break;
                
            case 'Escape':
                if (this.timer.getState().state === TimerState.RUNNING) {
                    this.timer.pause();
                }
                break;
        }
    }

    /**
     * 处理计时器状态变化
     */
    handleTimerStateChange(data) {
        const { newState, phase } = data;
        
        this.updateStartPauseButton(newState);
        this.updateTimerIcon(phase);
        
        // 状态变化时的特殊处理
        switch (newState) {
            case TimerState.RUNNING:
                this.startCountdownCheck();
                break;
                
            case TimerState.PAUSED:
                this.stopCountdownCheck();
                this.showNotification('训练已暂停', 'info');
                break;
                
            case TimerState.COMPLETED:
                this.stopCountdownCheck();
                this.celebrateCompletion();
                break;
        }
        
        console.log(`🔄 状态变化: ${newState}`);
    }

    /**
     * 处理阶段变化
     */
    async handlePhaseChange(data) {
        const { phase, round, totalRounds, duration } = data;
        
        // 更新UI显示
        this.updateRoundStatus(phase, round, totalRounds);
        this.updateTimerDisplay(this.formatTime(duration));
        this.resetProgressBar();
        
        // 播放相应音效
        await this.playPhaseSound(phase, { round, totalRounds });
        
        console.log(`📍 阶段变化: ${phase}${round ? ` (第${round}回合)` : ''}`);
    }

    /**
     * 处理计时器滴答
     */
    handleTimerTick(data) {
        const { remainingTime, phase, round } = data;
        
        // 更新显示
        this.updateTimerDisplay(this.formatTime(remainingTime));
        this.updateProgressBar(remainingTime, phase);
        
        // 倒计时检查
        if (remainingTime <= 10 && remainingTime > 0) {
            this.handleCountdown(remainingTime);
        }
    }

    /**
     * 处理回合完成
     */
    async handleRoundComplete(data) {
        const { round, totalRounds } = data;
        
        // 播放回合结束音效
        await this.audio.playSound(SoundType.ROUND_END);
        
        // 显示进度提示
        this.showNotification(`第 ${round} 回合完成`, 'success');
        
        console.log(`✅ 第 ${round} 回合完成`);
    }

    /**
     * 处理训练完成
     */
    async handleTrainingComplete(data) {
        const { totalRounds, totalTime, settings } = data;
        
        try {
            // 保存训练记录
            await this.saveTrainingSession(data);
            
            // 播放完成音效
            await this.audio.playSound(SoundType.TRAINING_COMPLETE);
            
            // 显示完成庆祝
            this.showCompletionCelebration(data);
            
            console.log('🎉 训练完成！');
            
        } catch (error) {
            console.error('❌ 处理训练完成失败:', error);
        }
    }

    // ========== UI更新方法 ==========

    /**
     * 更新计时器显示
     */
    updateTimerDisplay(timeString) {
        if (this.elements.mainTimer) {
            this.elements.mainTimer.textContent = timeString;
            
            // 添加闪烁效果（最后几秒）
            const seconds = this.parseTimeString(timeString);
            if (seconds <= 5 && seconds > 0) {
                this.elements.mainTimer.classList.add('countdown-flash');
            } else {
                this.elements.mainTimer.classList.remove('countdown-flash');
            }
        }
    }

    /**
     * 更新回合状态显示
     */
    updateRoundStatus(phase, round = null, totalRounds = null) {
        if (!this.elements.roundStatus) return;
        
        let statusText;
        
        if (typeof phase === 'string' && !round) {
            // 直接传入状态文本
            statusText = phase;
        } else {
            // 根据阶段生成状态文本
            switch (phase) {
                case TrainingPhase.PREPARE:
                    statusText = '准备开始';
                    break;
                case TrainingPhase.ROUND:
                    statusText = `第 ${round} 回合 / 共 ${totalRounds} 回合`;
                    break;
                case TrainingPhase.REST:
                    statusText = `休息中 (第 ${round} 回合后)`;
                    break;
                case TrainingPhase.FINISHED:
                    statusText = '训练完成！';
                    break;
                default:
                    statusText = '准备开始';
            }
        }
        
        this.elements.roundStatus.textContent = statusText;
    }

    /**
     * 更新开始/暂停按钮
     */
    updateStartPauseButton(state) {
        if (!this.elements.startPauseBtn) return;
        
        const button = this.elements.startPauseBtn;
        
        switch (state) {
            case TimerState.STOPPED:
                button.textContent = '开始';
                button.className = 'control-btn primary';
                button.setAttribute('aria-label', '开始训练');
                break;
                
            case TimerState.RUNNING:
                button.textContent = '暂停';
                button.className = 'control-btn warning';
                button.setAttribute('aria-label', '暂停训练');
                break;
                
            case TimerState.PAUSED:
                button.textContent = '继续';
                button.className = 'control-btn primary';
                button.setAttribute('aria-label', '继续训练');
                break;
                
            case TimerState.COMPLETED:
                button.textContent = '完成';
                button.className = 'control-btn success';
                button.setAttribute('aria-label', '训练完成');
                button.disabled = true;
                
                // 2秒后重新启用
                setTimeout(() => {
                    button.disabled = false;
                    this.updateStartPauseButton(TimerState.STOPPED);
                }, 2000);
                break;
        }
    }

    /**
     * 更新计时器图标
     */
    updateTimerIcon(phase) {
        if (!this.elements.timerIcon) return;
        
        const iconMap = {
            [TrainingPhase.PREPARE]: '⏳',
            [TrainingPhase.ROUND]: '🥊',
            [TrainingPhase.REST]: '😴',
            [TrainingPhase.FINISHED]: '🎉'
        };
        
        this.elements.timerIcon.textContent = iconMap[phase] || '⏱️';
    }

    /**
     * 更新进度条
     */
    updateProgressBar(remainingTime, phase = null) {
        if (!this.elements.progressBar) return;
        
        const timerState = this.timer.getState();
        let totalTime, progress;
        
        switch (timerState.phase) {
            case TrainingPhase.PREPARE:
                totalTime = timerState.settings.prepareTime;
                break;
            case TrainingPhase.ROUND:
                totalTime = timerState.settings.roundTime;
                break;
            case TrainingPhase.REST:
                totalTime = timerState.settings.restTime;
                break;
            default:
                totalTime = 1;
        }
        
        progress = totalTime > 0 ? (totalTime - remainingTime) / totalTime : 0;
        progress = Math.max(0, Math.min(1, progress)); // 限制在0-1之间
        
        this.elements.progressBar.style.width = `${progress * 100}%`;
        
        // 根据阶段设置不同颜色
        const phaseColors = {
            [TrainingPhase.PREPARE]: '#ffa500',
            [TrainingPhase.ROUND]: '#00ff00',
            [TrainingPhase.REST]: '#4169e1',
            [TrainingPhase.FINISHED]: '#ffd700'
        };
        
        this.elements.progressBar.style.backgroundColor = phaseColors[timerState.phase] || '#00ff00';
    }

    /**
     * 重置进度条
     */
    resetProgressBar() {
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = '0%';
        }
    }

    // ========== 音效和反馈 ==========

    /**
     * 播放阶段音效
     */
    async playPhaseSound(phase, options = {}) {
        const soundMap = {
            [TrainingPhase.PREPARE]: SoundType.PREPARE,
            [TrainingPhase.ROUND]: SoundType.ROUND_START,
            [TrainingPhase.REST]: SoundType.REST_START
        };
        
        const soundType = soundMap[phase];
        if (soundType) {
            await this.audio.playSound(soundType, options);
        }
    }

    /**
     * 处理倒计时
     */
    async handleCountdown(seconds) {
        if (!this.isCountingDown && this.settings.get('enableCountdown', true)) {
            this.isCountingDown = true;
            await this.audio.playCountdown(seconds);
            
            // 防止重复播放
            setTimeout(() => {
                this.isCountingDown = false;
            }, 800);
        }
    }

    /**
     * 开始倒计时检查
     */
    startCountdownCheck() {
        this.isCountingDown = false;
    }

    /**
     * 停止倒计时检查
     */
    stopCountdownCheck() {
        this.isCountingDown = false;
    }

    /**
     * 提供触觉反馈
     */
    provideTactileFeedback() {
        if (navigator.vibrate && this.settings.get('enableVibration', true)) {
            navigator.vibrate(50); // 短振动
        }
    }

    // ========== 数据保存 ==========

    /**
     * 保存训练记录
     */
    async saveTrainingSession(data) {
        try {
            const sessionData = {
                presetId: this.currentPreset?.id || null,
                presetName: this.currentPreset?.name || '自定义',
                roundTime: data.settings.roundTime,
                restTime: data.settings.restTime,
                prepareTime: data.settings.prepareTime,
                roundCount: data.settings.roundCount,
                completedRounds: data.totalRounds,
                totalTime: Math.round(data.totalTime),
                isCompleted: true,
                notes: ''
            };
            
            await this.database.recordSession(sessionData);
            console.log('💾 训练记录保存成功');
            
        } catch (error) {
            console.error('❌ 保存训练记录失败:', error);
        }
    }

    // ========== 视图管理 ==========

    /**
     * 显示预设视图
     */
    showPresetsView() {
        this.currentView = 'presets';
        // TODO: 实现预设管理界面
        console.log('📋 显示预设管理界面（待实现）');
    }

    /**
     * 显示设置视图
     */
    showSettingsView() {
        this.currentView = 'settings';
        // TODO: 实现设置界面
        console.log('⚙️ 显示设置界面（待实现）');
    }

    /**
     * 显示日志视图
     */
    showLogsView() {
        this.currentView = 'logs';
        // TODO: 实现训练日志界面
        console.log('📊 显示训练日志界面（待实现）');
    }

    /**
     * 返回主视图
     */
    showMainView() {
        this.currentView = 'main';
        console.log('🏠 返回主界面');
    }

    // ========== 通知和对话框 ==========

    /**
     * 显示通知消息
     */
    showNotification(message, type = 'info', duration = 3000) {
        // TODO: 实现通知组件
        console.log(`📢 通知 (${type}): ${message}`);
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        // 简单的浏览器对话框实现
        if (confirm(`${title}\\n\\n${message}`)) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
        }
    }

    /**
     * 显示训练完成庆祝
     */
    showCompletionCelebration(data) {
        const { totalRounds, totalTime } = data;
        const timeString = this.formatTime(Math.round(totalTime));
        
        this.showNotification(
            `🎉 恭喜完成 ${totalRounds} 回合训练！\\n总用时: ${timeString}`,
            'success',
            5000
        );
    }

    /**
     * 庆祝训练完成
     */
    celebrateCompletion() {
        // 添加庆祝动画效果
        document.body.classList.add('celebration');
        setTimeout(() => {
            document.body.classList.remove('celebration');
        }, 2000);
    }

    // ========== 工具方法 ==========

    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
        const mins = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.abs(seconds) % 60;
        const sign = seconds < 0 ? '-' : '';
        
        if (this.settings.get('showMilliseconds', false)) {
            const ms = Math.floor((Math.abs(seconds) % 1) * 100);
            return `${sign}${mins.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
        } else {
            return `${sign}${mins.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}`;
        }
    }

    /**
     * 解析时间字符串为秒数
     */
    parseTimeString(timeString) {
        const parts = timeString.split(':');
        const mins = parseInt(parts[0]) || 0;
        const secs = parseFloat(parts[1]) || 0;
        return mins * 60 + secs;
    }

    /**
     * 应用UI设置
     */
    applyUISettings() {
        // 根据设置调整UI
        const showProgressBar = this.settings.get('enableProgressBar', true);
        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            progressSection.style.display = showProgressBar ? 'block' : 'none';
        }
    }

    /**
     * 获取当前视图
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * 销毁控制器
     */
    destroy() {
        // 移除事件监听器
        // TODO: 实现具体的清理逻辑
        
        console.log('🗑️ UIController 已销毁');
    }
}