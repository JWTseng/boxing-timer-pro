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
        
        // 用户自定义预设时间存储 - @UIAI + @CMAI: 记忆用户偏好
        this.userPresets = {
            prepare: [10, 20, 60],  // 默认值
            round: [10, 30, 60],
            warning: [10, 5, 15],   // @UIAI修正：首个值与HTML显示一致
            rest: [30, 60, 90]
        };
        
        // 当前选中的预设索引 - @UIAI: 始终保持一个选中状态
        this.selectedPresetIndex = 0;
        
        // 各阶段最后选中的预设索引 - @UIAI: 记忆用户选择
        this.lastSelectedIndexes = {
            prepare: 0,
            round: 0,
            warning: 0,
            rest: 0
        };
        
        // 加载保存的用户预设和选中索引
        this.loadUserPresets();
        this.loadLastSelectedIndexes();
        
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
        
        // 移除调试按钮 - @UIAI: 保持界面整洁
        // this.addDebugButton();
        
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
        
        // CMAI修复：添加null检查，避免运行时错误
        if (this.elements.modal) {
            this.elements.phaseCard = this.elements.modal.querySelector('.phase-time-card');
            this.elements.presetButtons = this.elements.modal.querySelectorAll('.preset-time-btn');
        } else {
            console.warn('⚠️ TimePicker模态框未找到，某些功能可能无法使用');
            this.elements.phaseCard = null;
            this.elements.presetButtons = null;
        }
        
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
        // 预设按钮点击 - @UIAI + @CMAI: 记录选中索引
        this.elements.presetButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                const timeSeconds = parseInt(e.target.getAttribute('data-time'));
                this.setTimeFromSeconds(timeSeconds);
                this.updatePresetSelection(btn);
                this.selectedPresetIndex = index; // 记录选中的索引
                this.lastSelectedIndexes[this.currentPhase] = index; // 记忆该阶段的选择
                this.saveLastSelectedIndexes(); // 保存到localStorage
                console.log(`🎯 选择预设按钮 ${index}: ${timeSeconds}秒`);
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
        
        // 主界面的阶段时间按钮 - 绑定PREPARE/ROUND/WARNING/REST
        this.setupPhaseTimeButtons();
        
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
     * 显示时间选择器 - @UIAI: 恢复用户上次选择的预设位置
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
        
        // @UIAI + @CMAI: 智能选择预设位置
        const totalSeconds = this.selectedTime.minutes * 60 + this.selectedTime.seconds;
        const bestIndex = this.findBestPresetIndex(phase, totalSeconds);
        const lastIndex = this.lastSelectedIndexes[phase] || 0;
        
        // 优先使用最接近时间的预设，如果时间完全匹配则使用记忆的位置
        const targetIndex = (Math.abs(this.userPresets[phase][bestIndex] - totalSeconds) <= 2) ? bestIndex : lastIndex;
        
        this.selectPresetByIndex(targetIndex);
        console.log(`📍 智能选择预设: 当前${totalSeconds}秒, 最接近索引${bestIndex}, 记忆索引${lastIndex}, 最终选择${targetIndex}`);
        
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
        // @UIAI + @CMAI: 实时更新预设按钮而不是清除选中
        this.updateSelectedPresetInRealtime();
    }
    
    /**
     * 选择秒钟 - @UIAI + @CMAI: 实时更新预设按钮
     */
    selectSecond(second) {
        this.selectedTime.seconds = second;
        this.scrollToSecond(second);
        this.updateTimeDisplay();
        // @UIAI + @CMAI: 实时更新预设按钮而不是清除选中
        this.updateSelectedPresetInRealtime();
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
     * 设置主界面阶段时间按钮事件
     */
    setupPhaseTimeButtons() {
        // 绑定主界面的 PREPARE, ROUND, WARNING, REST 按钮
        const phaseButtons = [
            { id: 'prepare-time', phase: 'prepare' },
            { id: 'round-time', phase: 'round' },
            { id: 'warning-time', phase: 'warning' },
            { id: 'rest-time', phase: 'rest' }
        ];

        phaseButtons.forEach(({ id, phase }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    console.log(`🎯 点击 ${phase} 时间按钮，显示时间选择器`);
                    this.show(phase, button.textContent.trim());
                });
                console.log(`✅ ${phase} 按钮绑定完成`);
            } else {
                console.warn(`⚠️ 未找到 ${phase} 按钮: #${id}`);
            }
        });
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
     * 更新预设按钮（根据当前相位）- @UIAI + @CMAI: 使用用户自定义预设
     */
    updatePresetButtons() {
        // 使用用户自定义的预设时间
        const times = this.userPresets[this.currentPhase] || this.userPresets.prepare;
        
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
     * 确认时间选择 - @UIAI + @CMAI: 保存用户自定义预设
     */
    confirmTime() {
        const timeString = `${this.selectedTime.minutes.toString().padStart(2, '0')}:${this.selectedTime.seconds.toString().padStart(2, '0')}`;
        const totalSeconds = this.selectedTime.minutes * 60 + this.selectedTime.seconds;
        
        // 预设已经在实时更新中保存了，这里只需要持久化
        this.saveUserPresets();
        
        // 触发时间更新事件
        const event = new CustomEvent('timeUpdated', {
            detail: {
                phase: this.currentPhase,
                time: timeString,
                seconds: totalSeconds
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
     * 按索引选中预设按钮 - @UIAI: 保持始终有选中状态并记忆选择
     */
    selectPresetByIndex(index) {
        if (!this.elements.presetButtons || index >= this.elements.presetButtons.length) return;
        
        this.selectedPresetIndex = index;
        this.lastSelectedIndexes[this.currentPhase] = index; // 记忆选择
        
        this.elements.presetButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('selected');
                // 同时更新时间到该预设值
                const timeSeconds = parseInt(btn.getAttribute('data-time'));
                this.setTimeFromSeconds(timeSeconds);
            } else {
                btn.classList.remove('selected');
            }
        });
        
        // 保存选择到localStorage
        this.saveLastSelectedIndexes();
        console.log(`✅ 选中预设按钮 ${index} 并记忆`);
    }
    
    /**
     * 实时更新当前选中的预设按钮内容 - @UIAI + @CMAI: 滚轮调整时实时更新
     */
    updateSelectedPresetInRealtime() {
        // 防抖处理，避免过于频繁的更新
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        
        this.updateTimer = setTimeout(() => {
            this._doUpdateSelectedPreset();
        }, 100); // 100ms防抖
    }
    
    /**
     * 实际执行预设更新 - @CMAI: 内部方法
     */
    _doUpdateSelectedPreset() {
        if (this.selectedPresetIndex === undefined || this.selectedPresetIndex === null) {
            this.selectedPresetIndex = 0; // 确保始终有选中
        }
        
        // 边界检查
        if (!this.elements.presetButtons || this.elements.presetButtons.length === 0) {
            console.warn('⚠️ 预设按钮未找到');
            return;
        }
        
        const btn = this.elements.presetButtons[this.selectedPresetIndex];
        if (!btn) return;
        
        // 计算当前时间的总秒数
        const totalSeconds = this.selectedTime.minutes * 60 + this.selectedTime.seconds;
        
        // 更新按钮显示文本
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        btn.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        btn.setAttribute('data-time', totalSeconds.toString());
        
        // 更新用户预设数组
        this.userPresets[this.currentPhase][this.selectedPresetIndex] = totalSeconds;
        
        // 保持选中状态
        btn.classList.add('selected');
        
        console.log(`🔄 实时更新预设按钮 ${this.selectedPresetIndex}: ${btn.textContent}`);
    }
    
    /**
     * 智能更新用户预设 - @CMAI: 替换最接近的预设值
     */
    updateUserPreset(phase, newTime) {
        const presets = this.userPresets[phase];
        if (!presets) return;
        
        // 查找最接近的预设值位置
        let closestIndex = 0;
        let minDiff = Math.abs(presets[0] - newTime);
        
        for (let i = 1; i < presets.length; i++) {
            const diff = Math.abs(presets[i] - newTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        
        // 只有当差异大于5秒时才更新（避免微小调整）
        if (minDiff > 5) {
            console.log(`📝 更新预设时间: ${phase}[${closestIndex}] = ${newTime}秒`);
            this.userPresets[phase][closestIndex] = newTime;
            
            // 保存到localStorage
            this.saveUserPresets();
            
            // 立即更新预设按钮显示
            setTimeout(() => this.updatePresetButtons(), 100);
        }
    }
    
    /**
     * 保存用户预设到localStorage
     */
    saveUserPresets() {
        try {
            localStorage.setItem('boxing-timer-user-presets', JSON.stringify(this.userPresets));
            console.log('💾 用户预设已保存:', this.userPresets);
        } catch (error) {
            console.warn('⚠️ 保存用户预设失败:', error);
        }
    }
    
    /**
     * 从localStorage加载用户预设
     */
    loadUserPresets() {
        try {
            const saved = localStorage.getItem('boxing-timer-user-presets');
            if (saved) {
                const loaded = JSON.parse(saved);
                // 合并加载的预设，保留新增的相位默认值
                Object.keys(loaded).forEach(phase => {
                    if (this.userPresets[phase]) {
                        this.userPresets[phase] = loaded[phase];
                    }
                });
                console.log('📂 加载用户预设:', this.userPresets);
            }
        } catch (error) {
            console.warn('⚠️ 加载用户预设失败:', error);
            // 重置为默认值 - @UIAI修正：与HTML显示一致
            this.userPresets = {
                prepare: [10, 20, 60],
                round: [10, 30, 60],
                warning: [10, 5, 15],   // 首个值与HTML一致
                rest: [30, 60, 90]
            };
        }
    }
    
    /**
     * @UIAI + @CMAI: 重新加载用户预设并更新界面
     */
    async reloadUserPresets() {
        console.log('🔄 重新加载用户预设数据...');
        
        // 重新从localStorage加载预设
        this.loadUserPresets();
        
        // 如果时间选择器当前打开，重新渲染预设按钮
        if (this.isOpen && this.elements.presetButtons) {
            this.renderPresetButtons(this.currentPhase);
            console.log('✅ 预设按钮已重新渲染');
        }
        
        console.log('✅ 用户预设数据重新加载完成');
    }
    
    /**
     * 保存最后选中的索引到localStorage - @UIAI: 记忆用户习惯
     */
    saveLastSelectedIndexes() {
        try {
            localStorage.setItem('boxing-timer-last-selected-indexes', JSON.stringify(this.lastSelectedIndexes));
            console.log('💾 已保存最后选中的索引:', this.lastSelectedIndexes);
        } catch (error) {
            console.warn('⚠️ 保存选中索引失败:', error);
        }
    }
    
    /**
     * 从localStorage加载最后选中的索引 - @UIAI: 恢复用户选择
     */
    loadLastSelectedIndexes() {
        try {
            const saved = localStorage.getItem('boxing-timer-last-selected-indexes');
            if (saved) {
                const loaded = JSON.parse(saved);
                // 合并加载的索引，保留新增阶段的默认值
                Object.keys(loaded).forEach(phase => {
                    if (this.lastSelectedIndexes[phase] !== undefined) {
                        // 确保索引在有效范围内
                        const index = Math.max(0, Math.min(2, loaded[phase])); // 限制在0-2之间
                        this.lastSelectedIndexes[phase] = index;
                    }
                });
                console.log('📂 加载最后选中的索引:', this.lastSelectedIndexes);
            }
        } catch (error) {
            console.warn('⚠️ 加载选中索引失败:', error);
            // 重置为默认值
            this.lastSelectedIndexes = {
                prepare: 0,
                round: 0,
                warning: 0,
                rest: 0
            };
        }
    }
    
    /**
     * 智能选择预设位置 - @UIAI + @CMAI: 根据时间找到最接近的预设
     */
    findBestPresetIndex(phase, totalSeconds) {
        const presets = this.userPresets[phase];
        if (!presets || presets.length === 0) return 0;
        
        let closestIndex = 0;
        let minDiff = Math.abs(presets[0] - totalSeconds);
        
        for (let i = 1; i < presets.length; i++) {
            const diff = Math.abs(presets[i] - totalSeconds);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        
        console.log(`🎯 找到最接近 ${totalSeconds}秒 的预设: 索引${closestIndex} (${presets[closestIndex]}秒)`);
        return closestIndex;
    }
    
    /**
     * 销毁时间选择器
     */
    destroy() {
        this.close();
        console.log('🗑️ TimePicker 已销毁');
    }
}