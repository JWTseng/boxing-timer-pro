// Boxing Timer Pro - 时间选择器组件
// 实现iOS风格的滚轮时间选择器

export class TimePicker {
    constructor(container) {
        this.container = container || document.body;
        this.currentPhase = 'prepare';
        this.selectedTime = { minutes: 0, seconds: 10 };
        this.isOpen = false;
        
        // DOM元素引用
        this.elements = {};
        
        // 滚轮配置 - 按照@UIAI设计规范优化
        this.wheelConfig = {
            itemHeight: 44, // 增加到44px符合触控标准
            visibleItems: 5,
            centerIndex: 2,
            inertiaDecay: 0.95, // 惯性衰减系数
            snapThreshold: 0.3, // 吸附阈值
            sensitivity: 0.5 // 降低敏感度，适合手套操作
        };
        
        // 惯性滚动状态
        this.velocity = { minutes: 0, seconds: 0 };
        this.isAnimating = { minutes: false, seconds: false };
        
        console.log('🎛️ TimePicker 实例化完成');
    }
    
    /**
     * 初始化时间选择器
     */
    init() {
        console.log('🔧 TimePicker.init() 开始初始化...');
        this.getElementReferences();
        this.setupEventListeners();
        this.generatePickerItems();
        
        // 添加debug按钮到页面，方便测试
        this.addDebugButton();
        
        console.log('✅ TimePicker 初始化完成');
    }
    
    /**
     * 添加调试按钮用于测试 - 开发期间使用
     */
    addDebugButton() {
        // 检查是否已存在调试按钮
        if (document.getElementById('debug-time-picker-btn')) return;
        
        const debugBtn = document.createElement('button');
        debugBtn.id = 'debug-time-picker-btn';
        debugBtn.textContent = '🛠️ 测试时间选择器';
        debugBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF3B30;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        debugBtn.addEventListener('click', () => {
            console.log('🧪 调试：测试时间选择器显示');
            this.show('prepare', '00:10');
        });
        
        document.body.appendChild(debugBtn);
        console.log('🛠️ 调试按钮已添加');
    }
    
    /**
     * 获取DOM元素引用
     */
    getElementReferences() {
        this.elements.modal = document.getElementById('time-adjustment-modal');
        this.elements.phaseTitle = document.getElementById('phase-title');
        this.elements.currentTimeDisplay = document.getElementById('current-time-display');
        this.elements.phaseCard = this.elements.modal.querySelector('.phase-time-card');
        
        // 预设按钮
        this.elements.presetButtons = this.elements.modal.querySelectorAll('.preset-time-btn');
        
        // 滚轮选择器
        this.elements.minutesItems = document.getElementById('minutes-items');
        this.elements.secondsItems = document.getElementById('seconds-items');
        this.elements.minutesWheel = document.getElementById('minutes-wheel');
        this.elements.secondsWheel = document.getElementById('seconds-wheel');
        
        // 确认按钮
        this.elements.doneBtn = document.getElementById('time-done-btn');
        
        console.log('📋 TimePicker 元素引用获取完成');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 预设按钮点击
        this.elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeSeconds = parseInt(e.target.getAttribute('data-time'));
                this.setTimeFromSeconds(timeSeconds);
                this.updatePresetSelection(btn);
            });
        });
        
        // 滚轮滚动事件
        if (this.elements.minutesWheel) {
            this.elements.minutesWheel.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.handleWheelScroll(e, 'minutes');
            });
            
            // 触摸事件支持
            this.setupTouchEvents(this.elements.minutesWheel, 'minutes');
        }
        
        if (this.elements.secondsWheel) {
            this.elements.secondsWheel.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.handleWheelScroll(e, 'seconds');
            });
            
            // 触摸事件支持
            this.setupTouchEvents(this.elements.secondsWheel, 'seconds');
        }
        
        // 确认按钮
        if (this.elements.doneBtn) {
            this.elements.doneBtn.addEventListener('click', () => {
                this.confirmTime();
            });
        }
        
        // 点击遮罩关闭
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.close();
                }
            });
        }
        
        console.log('👂 TimePicker 事件监听器设置完成');
        console.log('🎯 滚轮元素状态:', {
            minutesWheel: !!this.elements.minutesWheel,
            secondsWheel: !!this.elements.secondsWheel,
            minutesItems: !!this.elements.minutesItems,
            secondsItems: !!this.elements.secondsItems
        });
    }
    
    /**
     * 生成滚轮选择项 - 增强版，参考Mobiscroll最佳实践
     */
    generatePickerItems() {
        console.log('🏗️ 开始生成滚轮选择项...');
        console.log('📋 元素状态检查:', {
            minutesItems: !!this.elements.minutesItems,
            secondsItems: !!this.elements.secondsItems,
            minutesItemsId: this.elements.minutesItems?.id,
            secondsItemsId: this.elements.secondsItems?.id
        });
        
        // 生成分钟选择项 (0-59)
        if (this.elements.minutesItems) {
            this.elements.minutesItems.innerHTML = '';
            const fragment = document.createDocumentFragment(); // 使用文档片段优化性能
            
            for (let i = 0; i < 60; i++) {
                const item = document.createElement('div');
                item.className = 'picker-item';
                item.setAttribute('data-value', i);
                item.textContent = i.toString().padStart(2, '0');
                item.addEventListener('click', () => {
                    this.selectMinute(i);
                });
                fragment.appendChild(item);
            }
            
            this.elements.minutesItems.appendChild(fragment);
            console.log('✅ 分钟选择项生成完成，共60项');
        } else {
            console.error('❌ minutesItems 元素未找到');
        }
        
        // 生成秒钟选择项 (0-59)
        if (this.elements.secondsItems) {
            this.elements.secondsItems.innerHTML = '';
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < 60; i++) {
                const item = document.createElement('div');
                item.className = 'picker-item';
                item.setAttribute('data-value', i);
                item.textContent = i.toString().padStart(2, '0');
                item.addEventListener('click', () => {
                    this.selectSecond(i);
                });
                fragment.appendChild(item);
            }
            
            this.elements.secondsItems.appendChild(fragment);
            console.log('✅ 秒钟选择项生成完成，共60项');
        } else {
            console.error('❌ secondsItems 元素未找到');
        }
        
        // 确保DOM渲染完成后再进行后续操作
        requestAnimationFrame(() => {
            this.validateGeneratedItems();
            console.log('🎯 滚轮选择项生成并验证完成');
        });
    }
    
    /**
     * 验证生成的选择项
     */
    validateGeneratedItems() {
        const minutesCount = this.elements.minutesItems?.children.length || 0;
        const secondsCount = this.elements.secondsItems?.children.length || 0;
        
        console.log('🔍 验证生成结果:', {
            minutesItems: minutesCount,
            secondsItems: secondsCount,
            minutesVisible: this.elements.minutesItems?.offsetHeight > 0,
            secondsVisible: this.elements.secondsItems?.offsetHeight > 0
        });
        
        // 检查是否有元素可见
        if (minutesCount === 0 || secondsCount === 0) {
            console.error('⚠️ 滚轮项生成失败，尝试重新生成...');
            setTimeout(() => this.generatePickerItems(), 100);
        }
    }
    
    /**
     * 显示时间选择器 - 优化版本，确保DOM渲染完成
     */
    show(phase, currentTime) {
        this.currentPhase = phase;
        this.isOpen = true;
        
        console.log(`🎨 准备显示${phase}阶段时间选择器: ${currentTime}`);
        
        // 解析当前时间
        this.parseTimeString(currentTime);
        
        // 更新UI
        this.updatePhaseDisplay(phase);
        this.updateTimeDisplay();
        this.updatePresetButtons();
        
        // 显示模态框
        if (this.elements.modal) {
            this.elements.modal.style.display = 'flex';
            
            // 首先生成滚轮选择项
            this.generatePickerItems();
            
            // 确保DOM渲染完成后再设置滚轮位置和动画
            requestAnimationFrame(() => {
                this.elements.modal.classList.add('show');
                
                // 再次确保滚轮选择项已生成和定位
                requestAnimationFrame(() => {
                    this.updateWheelPositions();
                    console.log(`✅ ${phase}阶段时间选择器显示完成`);
                });
            });
        }
    }
    
    /**
     * 隐藏时间选择器
     */
    close() {
        this.isOpen = false;
        
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
            this.elements.modal.classList.remove('show');
        }
        
        console.log('❌ 关闭时间选择器');
    }
    
    /**
     * 更新相位显示
     */
    updatePhaseDisplay(phase) {
        const phaseNames = {
            prepare: 'PREPARE',
            round: 'ROUND',
            warning: 'WARNING',
            rest: 'REST'
        };
        
        // 更新标题
        if (this.elements.phaseTitle) {
            this.elements.phaseTitle.textContent = phaseNames[phase] || phase.toUpperCase();
        }
        
        // 更新卡片颜色
        if (this.elements.phaseCard) {
            this.elements.phaseCard.className = `phase-time-card ${phase}`;
        }
    }
    
    /**
     * 更新时间显示
     */
    updateTimeDisplay() {
        const timeString = `${this.selectedTime.minutes.toString().padStart(2, '0')}:${this.selectedTime.seconds.toString().padStart(2, '0')}`;
        
        if (this.elements.currentTimeDisplay) {
            this.elements.currentTimeDisplay.textContent = timeString;
        }
    }
    
    /**
     * 更新滚轮位置
     */
    updateWheelPositions() {
        this.scrollToMinute(this.selectedTime.minutes);
        this.scrollToSecond(this.selectedTime.seconds);
    }
    
    /**
     * 滚动到指定分钟 - 优化版本，参考Mobiscroll最佳实践
     */
    scrollToMinute(minute) {
        if (!this.elements.minutesItems) {
            console.warn('⚠️ minutesItems 元素不存在，无法滚动');
            return;
        }
        
        // 计算滚动位置：将选中项居中显示
        const offset = -minute * this.wheelConfig.itemHeight + (this.wheelConfig.centerIndex * this.wheelConfig.itemHeight);
        
        console.log('📍 滚动分钟到:', {
            minute,
            offset: offset + 'px',
            itemHeight: this.wheelConfig.itemHeight,
            centerIndex: this.wheelConfig.centerIndex
        });
        
        this.elements.minutesItems.style.transform = `translateY(${offset}px)`;
        this.updateSelectedItem(this.elements.minutesItems, minute);
    }
    
    /**
     * 滚动到指定秒钟 - 优化版本，参考Mobiscroll最佳实践
     */
    scrollToSecond(second) {
        if (!this.elements.secondsItems) {
            console.warn('⚠️ secondsItems 元素不存在，无法滚动');
            return;
        }
        
        // 计算滚动位置：将选中项居中显示
        const offset = -second * this.wheelConfig.itemHeight + (this.wheelConfig.centerIndex * this.wheelConfig.itemHeight);
        
        console.log('📍 滚动秒钟到:', {
            second,
            offset: offset + 'px',
            itemHeight: this.wheelConfig.itemHeight,
            centerIndex: this.wheelConfig.centerIndex
        });
        
        this.elements.secondsItems.style.transform = `translateY(${offset}px)`;
        this.updateSelectedItem(this.elements.secondsItems, second);
    }
    
    /**
     * 更新选中项样式 - 增强版本，支持相邻项样式
     */
    updateSelectedItem(container, selectedIndex) {
        if (!container) {
            console.warn('⚠️ 容器元素不存在，无法更新选中项样式');
            return;
        }
        
        const items = container.querySelectorAll('.picker-item');
        console.log('🎨 更新选中项样式:', {
            containerItems: items.length,
            selectedIndex,
            containerClass: container.className
        });
        
        items.forEach((item, index) => {
            // 清除所有状态类
            item.classList.remove('selected', 'adjacent');
            
            // 设置选中项
            if (index === selectedIndex) {
                item.classList.add('selected');
            }
            // 设置相邻项（可选）
            else if (Math.abs(index - selectedIndex) === 1) {
                item.classList.add('adjacent');
            }
        });
    }
    
    /**
     * 选择分钟
     */
    selectMinute(minute) {
        this.selectedTime.minutes = minute;
        this.scrollToMinute(minute);
        this.updateTimeDisplay();
        this.clearPresetSelection();
    }
    
    /**
     * 选择秒钟
     */
    selectSecond(second) {
        this.selectedTime.seconds = second;
        this.scrollToSecond(second);
        this.updateTimeDisplay();
        this.clearPresetSelection();
    }
    
    /**
     * 设置触摸事件 - 增强版惯性滚动
     */
    setupTouchEvents(wheelElement, type) {
        let startY = 0;
        let startTime = 0;
        let isDragging = false;
        let lastMoveTime = 0;
        let lastMoveY = 0;

        wheelElement.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startY = lastMoveY = touch.clientY;
            startTime = lastMoveTime = Date.now();
            isDragging = true;
            this.velocity[type] = 0;
            this.stopInertia(type);
            
            // 触觉反馈
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            wheelElement.style.cursor = 'grabbing';
        }, { passive: true });

        wheelElement.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const currentY = touch.clientY;
            const currentTime = Date.now();
            
            // 计算速度
            const deltaY = lastMoveY - currentY;
            const deltaTime = currentTime - lastMoveTime;
            this.velocity[type] = deltaTime > 0 ? deltaY / deltaTime : 0;
            
            // 降低敏感度，适合手套操作
            if (Math.abs(deltaY) > 15) { // 从30px降低到15px
                const delta = deltaY > 0 ? 1 : -1;
                this.adjustTime(type, delta);
                lastMoveY = currentY;
                lastMoveTime = currentTime;
                
                // 播放触感反馈音效
                this.playFeedbackSound();
            }
        }, { passive: false });

        wheelElement.addEventListener('touchend', () => {
            isDragging = false;
            wheelElement.style.cursor = 'grab';
            this.startInertia(type);
        });
        
        // 鼠标拖拽支持
        this.setupMouseEvents(wheelElement, type);
    }
    
    /**
     * 设置鼠标拖拽事件
     */
    setupMouseEvents(wheelElement, type) {
        let startY = 0;
        let isDragging = false;
        
        wheelElement.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            isDragging = true;
            wheelElement.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const currentY = e.clientY;
            const deltaY = startY - currentY;
            
            // 每20px的拖拽距离改变一个单位
            if (Math.abs(deltaY) > 20) {
                const delta = deltaY > 0 ? 1 : -1;
                
                if (type === 'minutes') {
                    const newMinute = Math.max(0, Math.min(59, this.selectedTime.minutes + delta));
                    this.selectMinute(newMinute);
                } else if (type === 'seconds') {
                    const newSecond = Math.max(0, Math.min(59, this.selectedTime.seconds + delta));
                    this.selectSecond(newSecond);
                }
                
                startY = currentY;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                wheelElement.style.cursor = 'grab';
            }
        });
    }
    
    /**
     * 统一时间调整方法
     */
    adjustTime(type, delta) {
        if (type === 'minutes') {
            const newMinute = Math.max(0, Math.min(59, this.selectedTime.minutes + delta));
            this.selectMinute(newMinute);
        } else if (type === 'seconds') {
            const newSecond = Math.max(0, Math.min(59, this.selectedTime.seconds + delta));
            this.selectSecond(newSecond);
        }
    }

    /**
     * 惯性滚动实现
     */
    startInertia(type) {
        if (Math.abs(this.velocity[type]) < 0.1) return;
        
        this.isAnimating[type] = true;
        const animate = () => {
            this.velocity[type] *= this.wheelConfig.inertiaDecay;
            
            if (Math.abs(this.velocity[type]) > 0.1) {
                const delta = this.velocity[type] > 0 ? 1 : -1;
                this.adjustTime(type, delta);
                this.playFeedbackSound();
                requestAnimationFrame(animate);
            } else {
                this.isAnimating[type] = false;
                this.snapToNearest(type);
            }
        };
        requestAnimationFrame(animate);
    }

    /**
     * 停止惯性滚动
     */
    stopInertia(type) {
        this.velocity[type] = 0;
        this.isAnimating[type] = false;
    }

    /**
     * 吸附到最近项
     */
    snapToNearest(type) {
        const currentValue = this.selectedTime[type === 'minutes' ? 'minutes' : 'seconds'];
        const container = type === 'minutes' ? this.elements.minutesItems : this.elements.secondsItems;
        
        if (container) {
            // 添加弹性动画
            container.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            this.updateWheelPosition(type, currentValue);
            
            setTimeout(() => {
                if (container) {
                    container.style.transition = '';
                }
            }, 300);
        }
    }

    /**
     * 更新滚轮位置
     */
    updateWheelPosition(type, value) {
        if (type === 'minutes') {
            this.scrollToMinute(value);
        } else if (type === 'seconds') {
            this.scrollToSecond(value);
        }
    }

    /**
     * 音效反馈
     */
    playFeedbackSound() {
        try {
            // 创建简短的点击音效
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // 降低音量
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // 静默处理音频错误
        }
    }

    /**
     * 处理滚轮滚动
     */
    handleWheelScroll(event, type) {
        const delta = event.deltaY > 0 ? 1 : -1;
        this.adjustTime(type, delta);
        this.playFeedbackSound();
    }
    
    /**
     * 从秒数设置时间
     */
    setTimeFromSeconds(totalSeconds) {
        this.selectedTime.minutes = Math.floor(totalSeconds / 60);
        this.selectedTime.seconds = totalSeconds % 60;
        this.updateTimeDisplay();
        this.updateWheelPositions();
    }
    
    /**
     * 解析时间字符串
     */
    parseTimeString(timeString) {
        const parts = timeString.split(':');
        this.selectedTime.minutes = parseInt(parts[0]) || 0;
        this.selectedTime.seconds = parseInt(parts[1]) || 0;
    }
    
    /**
     * 更新预设按钮选中状态
     */
    updatePresetSelection(selectedBtn) {
        this.elements.presetButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        selectedBtn.classList.add('selected');
    }
    
    /**
     * 清除预设按钮选中状态
     */
    clearPresetSelection() {
        this.elements.presetButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    /**
     * 更新预设按钮（根据当前相位）
     */
    updatePresetButtons() {
        const presetTimes = {
            prepare: [10, 20, 60],
            round: [30, 60, 180],
            warning: [5, 10, 15],
            rest: [30, 60, 90]
        };
        
        const times = presetTimes[this.currentPhase] || presetTimes.prepare;
        
        this.elements.presetButtons.forEach((btn, index) => {
            if (times[index]) {
                const seconds = times[index];
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                btn.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                btn.setAttribute('data-time', seconds.toString());
            }
        });
    }
    
    /**
     * 确认时间选择
     */
    confirmTime() {
        const timeString = `${this.selectedTime.minutes.toString().padStart(2, '0')}:${this.selectedTime.seconds.toString().padStart(2, '0')}`;
        
        // 触发时间更新事件
        const event = new CustomEvent('timeUpdated', {
            detail: {
                phase: this.currentPhase,
                time: timeString,
                seconds: this.selectedTime.minutes * 60 + this.selectedTime.seconds
            }
        });
        
        document.dispatchEvent(event);
        
        console.log(`✅ 确认${this.currentPhase}时间: ${timeString}`);
        this.close();
    }
    
    /**
     * 获取当前选中时间
     */
    getCurrentTime() {
        return {
            minutes: this.selectedTime.minutes,
            seconds: this.selectedTime.seconds,
            totalSeconds: this.selectedTime.minutes * 60 + this.selectedTime.seconds,
            formatted: `${this.selectedTime.minutes.toString().padStart(2, '0')}:${this.selectedTime.seconds.toString().padStart(2, '0')}`
        };
    }
    
    /**
     * 销毁时间选择器
     */
    destroy() {
        this.close();
        console.log('🗑️ TimePicker 已销毁');
    }
}