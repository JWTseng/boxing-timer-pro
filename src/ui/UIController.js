// Boxing Timer Pro - UI控制器
// 整合计时引擎、闪动效果和界面显示

import { FlashManager } from './FlashEffects.js';
import { AudioManager } from '../audio/AudioManager.js';

/**
 * UI控制器类
 * 负责协调计时引擎和界面显示
 */
export class UIController {
    constructor(timerEngine) {
        this.timerEngine = timerEngine;
        this.flashManager = new FlashManager();
        this.audioManager = new AudioManager();
        
        // UI元素引用
        this.elements = {
            timeDisplay: null,        // 主时间显示
            phaseDisplay: null,       // 相位显示
            roundDisplay: null,       // 回合显示
            totalDisplay: null,       // 总时间显示
            progressBar: null,        // 进度条
            startButton: null,        // 开始按钮
            pauseButton: null,        // 暂停按钮
            stopButton: null          // 停止按钮
        };
        
        // 绑定事件
        this.bindTimerEvents();
        
        // 初始化音频系统
        this.initAudioSystem();
        
        console.log('🎮 UIController 初始化完成');
    }

    /**
     * 初始化音频系统
     */
    async initAudioSystem() {
        try {
            await this.audioManager.init();
            console.log('🔊 音频系统初始化完成');
        } catch (error) {
            console.warn('⚠️ 音频系统初始化失败，将在静音模式下运行:', error);
        }
    }

    /**
     * 绑定计时器事件
     */
    bindTimerEvents() {
        // 时间更新事件
        this.timerEngine.addEventListener('tick', (data) => {
            this.updateTimeDisplay(data);
            this.updateProgress(data);
            
            // 检查是否需要脉冲效果
            if (data.remainingTime <= 3 && data.remainingTime > 0) {
                this.flashManager.triggerCountdownPulse(this.elements.timeDisplay);
            }
        });

        // 相位变化事件
        this.timerEngine.addEventListener('phaseChange', (data) => {
            this.updatePhaseDisplay(data);
            this.updateBackgroundColor(data.phase);
            
            // 触发相位闪动
            this.flashManager.triggerPhaseChange(
                data.phase.toUpperCase(), 
                this.timerEngine.getPhaseColor()
            );
            
            // 触发音效
            this.audioManager.playPhaseSound(data.phase);
        });

        // WARNING状态变化事件
        this.timerEngine.addEventListener('warningChange', (data) => {
            if (data.isWarning) {
                this.updateBackgroundColor('WARNING');
                this.flashManager.triggerWarning();
                this.audioManager.playWarningSound();
                console.log('⚠️ 进入WARNING状态，触发警告闪动和音效');
            }
        });

        // 倒计时事件
        this.timerEngine.addEventListener('countdownTick', (data) => {
            this.audioManager.playCountdownSound(data.secondsRemaining);
        });

        // 状态变化事件
        this.timerEngine.addEventListener('stateChange', (data) => {
            this.updateButtonStates(data.newState);
            this.updatePhaseDisplay(data);
        });

        // 回合完成事件
        this.timerEngine.addEventListener('roundComplete', (data) => {
            console.log(`🥊 第${data.round}回合完成`);
        });

        // 训练完成事件
        this.timerEngine.addEventListener('trainingComplete', (data) => {
            this.flashManager.triggerFinish();
            this.audioManager.playCompletionSound();
            this.showCompletionMessage(data);
            console.log('🎉 训练完成！');
        });
    }

    /**
     * 初始化UI元素引用
     * @param {Object} elementMap - 元素映射对象
     */
    initElements(elementMap) {
        this.elements = { ...this.elements, ...elementMap };
        
        // 绑定按钮事件
        this.bindButtonEvents();
        
        // 初始化显示
        this.updateDisplay();
        
        console.log('📱 UI元素绑定完成');
    }

    /**
     * 绑定按钮事件
     */
    bindButtonEvents() {
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => {
                this.handleStartClick();
            });
        }

        if (this.elements.pauseButton) {
            this.elements.pauseButton.addEventListener('click', () => {
                this.handlePauseClick();
            });
        }

        if (this.elements.stopButton) {
            this.elements.stopButton.addEventListener('click', () => {
                this.handleStopClick();
            });
        }
    }

    /**
     * 处理开始按钮点击
     */
    async handleStartClick() {
        try {
            const state = this.timerEngine.getState();
            
            if (state.state === 'stopped') {
                // 开始新训练
                await this.timerEngine.start();
                console.log('▶️ 开始新训练');
            } else if (state.state === 'paused') {
                // 恢复训练
                await this.timerEngine.start();
                console.log('▶️ 恢复训练');
            }
        } catch (error) {
            console.error('启动训练失败:', error);
            this.showError('启动失败，请检查浏览器权限设置');
        }
    }

    /**
     * 处理暂停按钮点击
     */
    handlePauseClick() {
        const state = this.timerEngine.getState();
        
        if (state.state === 'running') {
            this.timerEngine.pause();
            console.log('⏸️ 暂停训练');
        }
    }

    /**
     * 处理停止按钮点击
     */
    handleStopClick() {
        this.timerEngine.stop();
        this.updateBackgroundColor('default');
        console.log('⏹️ 停止训练');
    }

    /**
     * 更新时间显示
     * @param {Object} data - 计时数据
     */
    updateTimeDisplay(data) {
        if (this.elements.timeDisplay) {
            const formattedTime = this.timerEngine.formatTime(data.remainingTime);
            this.elements.timeDisplay.textContent = formattedTime;
        }

        if (this.elements.totalDisplay && data.totalRemaining !== undefined) {
            const totalFormatted = this.timerEngine.formatTime(data.totalRemaining);
            this.elements.totalDisplay.textContent = totalFormatted;
        }
    }

    /**
     * 更新相位显示
     * @param {Object} data - 相位数据
     */
    updatePhaseDisplay(data) {
        if (this.elements.phaseDisplay) {
            const phaseName = this.timerEngine.getPhaseDisplayName();
            this.elements.phaseDisplay.textContent = phaseName;
        }

        if (this.elements.roundDisplay) {
            const state = this.timerEngine.getState();
            if (state.currentRound > 0) {
                this.elements.roundDisplay.textContent = 
                    `${state.currentRound.toString().padStart(2, '0')}`;
            } else {
                this.elements.roundDisplay.textContent = '--';
            }
        }
    }

    /**
     * 更新进度条
     * @param {Object} data - 计时数据
     */
    updateProgress(data) {
        if (!this.elements.progressBar) return;

        const state = this.timerEngine.getState();
        let progress = 0;

        // 计算当前相位的进度百分比
        if (state.phase === 'prepare') {
            progress = ((state.settings.prepareTime - data.remainingTime) / state.settings.prepareTime) * 100;
        } else if (state.phase === 'round') {
            progress = ((state.settings.roundTime - data.remainingTime) / state.settings.roundTime) * 100;
        } else if (state.phase === 'rest') {
            progress = ((state.settings.restTime - data.remainingTime) / state.settings.restTime) * 100;
        }

        this.elements.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }

    /**
     * 更新背景颜色
     * @param {string} phase - 相位名称或特殊状态
     */
    updateBackgroundColor(phase) {
        let color;
        
        if (phase === 'WARNING') {
            color = '#FF9500'; // 橙色警告
        } else {
            color = this.timerEngine.getPhaseColor();
        }

        // 使用CSS变量设置颜色，方便后续的主题切换
        document.documentElement.style.setProperty('--current-phase-color', color);
        document.body.style.backgroundColor = color;
    }

    /**
     * 更新按钮状态
     * @param {string} timerState - 计时器状态
     */
    updateButtonStates(timerState) {
        const buttons = this.elements;

        switch(timerState) {
            case 'stopped':
                this.setButtonState(buttons.startButton, 'START', true);
                this.setButtonState(buttons.pauseButton, '⏸️', false);
                this.setButtonState(buttons.stopButton, '✕', false);
                break;

            case 'running':
                this.setButtonState(buttons.startButton, 'START', false);
                this.setButtonState(buttons.pauseButton, '⏸️', true);
                this.setButtonState(buttons.stopButton, '✕', true);
                break;

            case 'paused':
                this.setButtonState(buttons.startButton, '▶️', true);
                this.setButtonState(buttons.pauseButton, '⏸️', false);
                this.setButtonState(buttons.stopButton, '✕', true);
                break;

            case 'completed':
                this.setButtonState(buttons.startButton, 'START', true);
                this.setButtonState(buttons.pauseButton, '⏸️', false);
                this.setButtonState(buttons.stopButton, '✕', false);
                break;
        }
    }

    /**
     * 设置按钮状态
     * @param {Element} button - 按钮元素
     * @param {string} text - 按钮文本
     * @param {boolean} enabled - 是否启用
     */
    setButtonState(button, text, enabled) {
        if (!button) return;

        button.textContent = text;
        button.disabled = !enabled;
        button.classList.toggle('disabled', !enabled);
    }

    /**
     * 显示完成消息
     * @param {Object} data - 完成数据
     */
    showCompletionMessage(data) {
        // 这里可以显示一个完成对话框或通知
        console.log(`🎉 训练完成！完成${data.totalRounds}回合，总时间${Math.floor(data.totalTime / 60)}分钟`);
        
        // 可以添加更具体的UI反馈，比如模态框、通知等
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    showError(message) {
        console.error('❌ 错误:', message);
        // 这里可以显示错误通知给用户
    }

    /**
     * 更新所有显示元素
     */
    updateDisplay() {
        const state = this.timerEngine.getState();
        
        // 更新时间显示
        this.updateTimeDisplay({
            remainingTime: state.remainingTime,
            totalRemaining: state.totalRemaining
        });

        // 更新相位显示
        this.updatePhaseDisplay(state);

        // 更新背景颜色
        this.updateBackgroundColor(state.phase);

        // 更新按钮状态
        this.updateButtonStates(state.state);

        // 更新进度
        this.updateProgress(state);
    }

    /**
     * 设置闪动效果是否启用
     * @param {boolean} enabled - 是否启用
     */
    setFlashEnabled(enabled) {
        this.flashManager.setEnabled(enabled);
    }

    /**
     * 销毁UI控制器
     */
    destroy() {
        // 清理事件监听器
        // 注意：TimerEngine的事件监听器会在TimerEngine销毁时自动清理
        
        console.log('🗑️ UIController 已销毁');
    }
}