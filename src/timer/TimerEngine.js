// Boxing Timer Pro - 计时引擎核心
// 使用 Web Worker + Web Audio API 实现高精度计时

/**
 * 计时器状态枚举
 */
export const TimerState = {
    STOPPED: 'stopped',
    READY: 'ready',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed'
};

/**
 * 训练阶段枚举
 */
export const TrainingPhase = {
    PREPARE: 'prepare',
    ROUND: 'round',
    REST: 'rest',
    FINISHED: 'finished'
};

/**
 * 计时引擎类
 * 负责高精度计时逻辑和状态管理
 */
export class TimerEngine {
    constructor() {
        this.state = TimerState.STOPPED;
        this.currentPhase = TrainingPhase.PREPARE;
        
        // 计时设置
        this.settings = {
            roundTime: 180,      // 回合时长(秒)
            restTime: 60,        // 休息时长(秒)
            prepareTime: 10,     // 准备时长(秒)
            roundCount: 3,       // 回合数
            soundScheme: 'bell'  // 音效方案
        };
        
        // 计时状态
        this.currentRound = 0;
        this.totalRounds = 0;
        this.remainingTime = 0;
        this.totalElapsedTime = 0;
        
        // Web Worker 相关
        this.timerWorker = null;
        this.audioContext = null;
        
        // 事件回调
        this.eventCallbacks = {
            stateChange: [],
            phaseChange: [],
            tick: [],
            roundComplete: [],
            trainingComplete: []
        };
        
        // 后台运行相关
        this.wakeLock = null;
        this.lastVisibleTime = Date.now();
        
        console.log('⏱️ TimerEngine 实例化完成');
    }

    /**
     * 初始化计时引擎
     */
    async init() {
        try {
            // 初始化 Audio Context
            await this.initAudioContext();
            
            // 初始化 Web Worker
            await this.initTimerWorker();
            
            // 请求屏幕常亮权限
            await this.requestWakeLock();
            
            console.log('✅ TimerEngine 初始化完成');
            
        } catch (error) {
            console.error('❌ TimerEngine 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化 Audio Context
     */
    async initAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            
            // 由于浏览器自动播放策略，需要等待用户交互
            if (this.audioContext.state === 'suspended') {
                console.log('🔊 AudioContext 处于暂停状态，等待用户交互解锁');
            }
            
        } catch (error) {
            console.warn('⚠️ AudioContext 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化 Timer Worker
     */
    async initTimerWorker() {
        try {
            // 创建 Worker 内联脚本
            const workerScript = this.createWorkerScript();
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            
            this.timerWorker = new Worker(workerUrl);
            
            // 设置 Worker 消息处理
            this.timerWorker.onmessage = (event) => {
                this.handleWorkerMessage(event.data);
            };
            
            this.timerWorker.onerror = (error) => {
                console.error('❌ Timer Worker 错误:', error);
            };
            
            // 发送初始化消息
            this.timerWorker.postMessage({
                type: 'init',
                audioContextSampleRate: this.audioContext.sampleRate
            });
            
            // 清理 URL
            URL.revokeObjectURL(workerUrl);
            
        } catch (error) {
            console.error('❌ Timer Worker 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 创建 Worker 脚本
     */
    createWorkerScript() {
        return `
        // Timer Worker Script
        let isRunning = false;
        let startTime = 0;
        let duration = 0;
        let intervalId = null;
        
        // 高精度计时器
        function startTimer(durationMs) {
            if (isRunning) return;
            
            isRunning = true;
            startTime = performance.now();
            duration = durationMs;
            
            // 使用 setInterval 进行精确计时
            intervalId = setInterval(() => {
                if (!isRunning) return;
                
                const now = performance.now();
                const elapsed = now - startTime;
                const remaining = Math.max(0, duration - elapsed);
                
                // 发送计时更新
                self.postMessage({
                    type: 'tick',
                    elapsed: Math.floor(elapsed),
                    remaining: Math.floor(remaining)
                });
                
                // 检查是否完成
                if (remaining <= 0) {
                    stopTimer();
                    self.postMessage({ type: 'complete' });
                }
                
            }, 50); // 50ms 更新间隔，足够精确且不会过度消耗资源
        }
        
        function stopTimer() {
            isRunning = false;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
        
        function pauseTimer() {
            if (isRunning) {
                isRunning = false;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                
                const now = performance.now();
                const elapsed = now - startTime;
                duration -= elapsed; // 更新剩余时长
                
                self.postMessage({
                    type: 'paused',
                    remaining: Math.floor(duration)
                });
            }
        }
        
        function resumeTimer() {
            if (!isRunning && duration > 0) {
                startTimer(duration);
            }
        }
        
        // 处理主线程消息
        self.onmessage = function(event) {
            const { type, data } = event.data;
            
            switch (type) {
                case 'init':
                    self.postMessage({ type: 'initialized' });
                    break;
                    
                case 'start':
                    startTimer(data.duration);
                    break;
                    
                case 'stop':
                    stopTimer();
                    break;
                    
                case 'pause':
                    pauseTimer();
                    break;
                    
                case 'resume':
                    resumeTimer();
                    break;
                    
                default:
                    console.warn('Unknown message type:', type);
            }
        };
        `;
    }

    /**
     * 处理 Worker 消息
     */
    handleWorkerMessage(message) {
        const { type, elapsed, remaining } = message;
        
        switch (type) {
            case 'initialized':
                console.log('✅ Timer Worker 初始化完成');
                break;
                
            case 'tick':
                this.remainingTime = Math.floor(remaining / 1000);
                this.totalElapsedTime += 0.05; // 50ms 间隔
                this.emitEvent('tick', {
                    remainingTime: this.remainingTime,
                    elapsed: Math.floor(elapsed / 1000),
                    phase: this.currentPhase,
                    round: this.currentRound
                });
                break;
                
            case 'complete':
                this.handlePhaseComplete();
                break;
                
            case 'paused':
                this.remainingTime = Math.floor(remaining / 1000);
                this.setState(TimerState.PAUSED);
                break;
                
            default:
                console.warn('未知的 Worker 消息类型:', type);
        }
    }

    /**
     * 设置计时参数
     */
    setSettings(newSettings) {
        if (this.state !== TimerState.STOPPED) {
            throw new Error('只能在停止状态下修改设置');
        }
        
        this.settings = { ...this.settings, ...newSettings };
        this.totalRounds = this.settings.roundCount;
        
        // 重置状态
        this.reset();
        
        console.log('⚙️ 计时设置已更新:', this.settings);
    }

    /**
     * 开始训练
     */
    async start() {
        if (this.state === TimerState.RUNNING) {
            console.warn('计时器已在运行中');
            return;
        }
        
        try {
            // 确保 AudioContext 已解锁
            await this.unlockAudioContext();
            
            // 获取屏幕常亮锁
            await this.requestWakeLock();
            
            if (this.state === TimerState.STOPPED) {
                // 开始新的训练
                this.startNewTraining();
            } else if (this.state === TimerState.PAUSED) {
                // 恢复暂停的训练
                this.resumeTraining();
            }
            
        } catch (error) {
            console.error('❌ 开始训练失败:', error);
            throw error;
        }
    }

    /**
     * 开始新训练
     */
    startNewTraining() {
        this.reset();
        
        if (this.settings.prepareTime > 0) {
            // 开始准备阶段
            this.currentPhase = TrainingPhase.PREPARE;
            this.remainingTime = this.settings.prepareTime;
            this.setState(TimerState.RUNNING);
            
            this.timerWorker.postMessage({
                type: 'start',
                data: { duration: this.settings.prepareTime * 1000 }
            });
            
            this.emitEvent('phaseChange', {
                phase: TrainingPhase.PREPARE,
                duration: this.settings.prepareTime
            });
        } else {
            // 直接开始第一回合
            this.startRound();
        }
        
        console.log('🥊 开始新的训练');
    }

    /**
     * 开始回合
     */
    startRound() {
        this.currentRound++;
        this.currentPhase = TrainingPhase.ROUND;
        this.remainingTime = this.settings.roundTime;
        this.setState(TimerState.RUNNING);
        
        this.timerWorker.postMessage({
            type: 'start',
            data: { duration: this.settings.roundTime * 1000 }
        });
        
        this.emitEvent('phaseChange', {
            phase: TrainingPhase.ROUND,
            round: this.currentRound,
            totalRounds: this.totalRounds,
            duration: this.settings.roundTime
        });
        
        console.log(`🥊 开始第 ${this.currentRound} 回合`);
    }

    /**
     * 开始休息
     */
    startRest() {
        this.currentPhase = TrainingPhase.REST;
        this.remainingTime = this.settings.restTime;
        this.setState(TimerState.RUNNING);
        
        this.timerWorker.postMessage({
            type: 'start',
            data: { duration: this.settings.restTime * 1000 }
        });
        
        this.emitEvent('phaseChange', {
            phase: TrainingPhase.REST,
            round: this.currentRound,
            totalRounds: this.totalRounds,
            duration: this.settings.restTime
        });
        
        console.log(`😴 开始休息 (第 ${this.currentRound} 回合后)`);
    }

    /**
     * 暂停训练
     */
    pause() {
        if (this.state !== TimerState.RUNNING) {
            console.warn('计时器未在运行状态');
            return;
        }
        
        this.timerWorker.postMessage({ type: 'pause' });
        console.log('⏸️ 训练已暂停');
    }

    /**
     * 恢复训练
     */
    resumeTraining() {
        if (this.state !== TimerState.PAUSED) {
            console.warn('计时器未在暂停状态');
            return;
        }
        
        this.setState(TimerState.RUNNING);
        this.timerWorker.postMessage({ type: 'resume' });
        console.log('▶️ 训练已恢复');
    }

    /**
     * 停止并重置训练
     */
    stop() {
        this.timerWorker.postMessage({ type: 'stop' });
        this.reset();
        this.releaseWakeLock();
        console.log('⏹️ 训练已停止');
    }

    /**
     * 重置计时器
     */
    reset() {
        this.setState(TimerState.STOPPED);
        this.currentPhase = TrainingPhase.PREPARE;
        this.currentRound = 0;
        this.remainingTime = 0;
        this.totalElapsedTime = 0;
        
        this.emitEvent('stateChange', {
            state: this.state,
            phase: this.currentPhase
        });
    }

    /**
     * 处理阶段完成
     */
    handlePhaseComplete() {
        switch (this.currentPhase) {
            case TrainingPhase.PREPARE:
                // 准备阶段结束，开始第一回合
                this.startRound();
                break;
                
            case TrainingPhase.ROUND:
                // 回合结束
                this.emitEvent('roundComplete', {
                    round: this.currentRound,
                    totalRounds: this.totalRounds
                });
                
                if (this.currentRound >= this.totalRounds) {
                    // 所有回合完成
                    this.completeTraining();
                } else {
                    // 开始休息
                    this.startRest();
                }
                break;
                
            case TrainingPhase.REST:
                // 休息结束，开始下一回合
                this.startRound();
                break;
        }
    }

    /**
     * 完成训练
     */
    completeTraining() {
        this.setState(TimerState.COMPLETED);
        this.currentPhase = TrainingPhase.FINISHED;
        this.releaseWakeLock();
        
        this.emitEvent('trainingComplete', {
            totalRounds: this.totalRounds,
            totalTime: this.totalElapsedTime,
            settings: { ...this.settings }
        });
        
        console.log('🎉 训练完成！');
        
        // 自动重置到初始状态
        setTimeout(() => {
            this.reset();
        }, 2000);
    }

    /**
     * 设置状态
     */
    setState(newState) {
        if (this.state !== newState) {
            const oldState = this.state;
            this.state = newState;
            
            this.emitEvent('stateChange', {
                oldState,
                newState,
                phase: this.currentPhase
            });
        }
    }

    /**
     * 页面隐藏处理
     */
    handlePageHidden() {
        this.lastVisibleTime = Date.now();
        console.log('📱 页面隐藏，记录时间戳');
    }

    /**
     * 页面显示处理
     */
    handlePageVisible() {
        const hiddenTime = Date.now() - this.lastVisibleTime;
        console.log(`📱 页面显示，隐藏时间: ${Math.floor(hiddenTime / 1000)}秒`);
        
        // 如果隐藏时间超过阈值，可能需要校正计时
        if (hiddenTime > 3000 && this.state === TimerState.RUNNING) {
            console.log('⚠️ 页面隐藏时间过长，可能需要校正计时');
            // 这里可以添加计时校正逻辑
        }
    }

    /**
     * 解锁 AudioContext
     */
    async unlockAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('🔊 AudioContext 已解锁');
            } catch (error) {
                console.warn('⚠️ AudioContext 解锁失败:', error);
            }
        }
    }

    /**
     * 请求屏幕常亮锁
     */
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('🔒 屏幕常亮锁获取成功');
                
                this.wakeLock.addEventListener('release', () => {
                    console.log('🔓 屏幕常亮锁已释放');
                });
            } catch (error) {
                console.warn('⚠️ 屏幕常亮锁获取失败:', error);
            }
        } else {
            console.log('ℹ️ 浏览器不支持 Wake Lock API');
        }
    }

    /**
     * 释放屏幕常亮锁
     */
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    }

    /**
     * 保存状态
     */
    saveState() {
        const stateData = {
            state: this.state,
            currentPhase: this.currentPhase,
            currentRound: this.currentRound,
            remainingTime: this.remainingTime,
            totalElapsedTime: this.totalElapsedTime,
            settings: this.settings,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('boxing-timer-state', JSON.stringify(stateData));
        } catch (error) {
            console.warn('⚠️ 保存状态失败:', error);
        }
    }

    /**
     * 恢复状态
     */
    restoreState() {
        try {
            const savedState = localStorage.getItem('boxing-timer-state');
            if (savedState) {
                const stateData = JSON.parse(savedState);
                const timeSinceLastSave = Date.now() - stateData.timestamp;
                
                // 如果保存时间不超过5分钟，则恢复状态
                if (timeSinceLastSave < 5 * 60 * 1000) {
                    this.settings = stateData.settings;
                    this.currentRound = stateData.currentRound;
                    this.totalElapsedTime = stateData.totalElapsedTime;
                    
                    // 只恢复非运行状态
                    if (stateData.state !== TimerState.RUNNING) {
                        this.state = stateData.state;
                        this.currentPhase = stateData.currentPhase;
                        this.remainingTime = stateData.remainingTime;
                    }
                    
                    console.log('✅ 状态恢复成功');
                }
            }
        } catch (error) {
            console.warn('⚠️ 恢复状态失败:', error);
        }
    }

    /**
     * 添加事件监听器
     */
    addEventListener(eventType, callback) {
        if (this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType].push(callback);
        }
    }

    /**
     * 移除事件监听器
     */
    removeEventListener(eventType, callback) {
        if (this.eventCallbacks[eventType]) {
            const index = this.eventCallbacks[eventType].indexOf(callback);
            if (index > -1) {
                this.eventCallbacks[eventType].splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     */
    emitEvent(eventType, data) {
        if (this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件回调执行失败 (${eventType}):`, error);
                }
            });
        }
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            state: this.state,
            phase: this.currentPhase,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            remainingTime: this.remainingTime,
            totalElapsedTime: this.totalElapsedTime,
            settings: { ...this.settings }
        };
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.stop();
        this.releaseWakeLock();
        
        if (this.timerWorker) {
            this.timerWorker.terminate();
            this.timerWorker = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 清空所有事件监听器
        Object.keys(this.eventCallbacks).forEach(key => {
            this.eventCallbacks[key] = [];
        });
        
        console.log('🗑️ TimerEngine 已销毁');
    }
}