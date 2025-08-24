/**
 * 视图管理器
 * 管理不同界面（Timer Setup, Phase Adjustment, Settings）之间的切换
 */

import { TimePicker } from './TimePicker.js';

export class ViewManager {
  constructor() {
    this.currentView = 'timer-setup-view';
    this.views = {
      'timer-setup-view': document.getElementById('timer-setup-view'),
      'phase-adjustment-view': document.getElementById('phase-adjustment-view'),
      'settings-view': document.getElementById('settings-view'),
      'timer-running-view': document.getElementById('timer-running-view')
    };
    
    this.timePicker = null;
    this.currentPhase = null;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.showView('timer-setup-view');
  }
  
  bindEvents() {
    // 主界面事件
    document.getElementById('menu-btn')?.addEventListener('click', () => {
      this.showView('settings-view');
    });
    
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.showView('timer-running-view');
    });
    
    // 时长标签点击事件 - 修复选择器并添加时间选择器支持
    document.querySelectorAll('.time-tag').forEach(timeTag => {
      timeTag.addEventListener('click', (e) => {
        const phase = e.target.closest('.phase-row')?.dataset.phase;
        if (phase) {
          console.log(`🎛️ 点击${phase}时间设置`);
          this.showTimePicker(phase, e.target.textContent);
        }
      });
    });
    
    // 阶段调整界面事件
    document.getElementById('phase-back-btn')?.addEventListener('click', () => {
      this.showView('timer-setup-view');
    });
    
    document.getElementById('phase-done-btn')?.addEventListener('click', () => {
      this.applyPhaseTime();
      this.showView('timer-setup-view');
    });
    
    // 设置界面事件
    document.getElementById('settings-done-btn')?.addEventListener('click', () => {
      this.showView('timer-setup-view');
    });
    
    // 运行界面事件
    document.getElementById('stop-btn')?.addEventListener('click', () => {
      this.showView('timer-setup-view');
    });
    
    // 回合数调整
    document.getElementById('rounds-minus')?.addEventListener('click', () => {
      this.adjustRounds(-1);
    });
    
    document.getElementById('rounds-plus')?.addEventListener('click', () => {
      this.adjustRounds(1);
    });
  }
  
  showView(viewId) {
    // 隐藏所有视图
    Object.values(this.views).forEach(view => {
      if (view) {
        view.classList.remove('active');
        view.style.display = 'none';
      }
    });
    
    // 显示目标视图
    const targetView = this.views[viewId];
    if (targetView) {
      targetView.style.display = 'flex';
      targetView.classList.add('active');
      this.currentView = viewId;
      
      // 视图切换后的特殊处理
      if (viewId === 'phase-adjustment-view') {
        this.initTimePicker();
      }
    }
  }
  
  showTimePicker(phase, currentTimeText) {
    // 使用时间选择器弹窗而不是切换到阶段调整视图
    if (!this.timePicker) {
      this.timePicker = new TimePicker(document.body); // 传递正确的容器参数
      this.timePicker.init();
      
      // 监听时间更新事件
      document.addEventListener('timeUpdated', (e) => {
        this.handleTimeUpdate(e.detail);
      });
      
      console.log('🎛️ TimePicker 已创建并初始化');
    }
    
    console.log(`📱 显示时间选择器: ${phase} = ${currentTimeText}`);
    this.timePicker.show(phase, currentTimeText);
  }
  
  handleTimeUpdate(data) {
    const { phase, time, seconds } = data;
    
    // 更新对应的时间标签
    const timeElement = document.getElementById(`${phase}-time`);
    if (timeElement) {
      timeElement.textContent = time;
    }
    
    // 更新总时间显示
    this.updateTotalTime();
    
    console.log(`📝 ${phase}时间已更新: ${time} (${seconds}秒)`);
  }

  showPhaseAdjustment(phase) {
    this.currentPhase = phase;
    
    // 更新界面标题和显示
    const phaseTitle = document.getElementById('phase-title');
    const phaseBadge = document.getElementById('phase-badge');
    const currentTimeDisplay = document.getElementById('current-time-display');
    
    const phaseNames = {
      'prepare': 'Prepare Duration',
      'round': 'Round Duration', 
      'warning': 'Warning Duration',
      'rest': 'Rest Duration'
    };
    
    const phaseLabels = {
      'prepare': 'PREPARE',
      'round': 'ROUND',
      'warning': 'WARNING', 
      'rest': 'REST'
    };
    
    if (phaseTitle) phaseTitle.textContent = phaseNames[phase] || 'Duration';
    if (phaseBadge) {
      phaseBadge.textContent = phaseLabels[phase] || phase.toUpperCase();
      phaseBadge.className = `phase-badge ${phase}`;
    }
    
    // 获取当前时长
    const currentTime = this.getPhaseTime(phase);
    if (currentTimeDisplay) {
      currentTimeDisplay.textContent = this.formatTime(currentTime);
    }
    
    // 更新快速预设按钮
    this.updateQuickPresets(phase);
    
    this.showView('phase-adjustment-view');
  }
  
  initTimePicker() {
    const pickerContainer = document.querySelector('.time-picker');
    if (!pickerContainer || this.timePicker) return;
    
    const currentTime = this.getPhaseTime(this.currentPhase);
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    
    this.timePicker = new TimePicker(pickerContainer, {
      initialMinutes: minutes,
      initialSeconds: seconds,
      onChange: (totalSeconds, timeData) => {
        const currentTimeDisplay = document.getElementById('current-time-display');
        if (currentTimeDisplay) {
          currentTimeDisplay.textContent = this.formatTime(totalSeconds);
        }
      }
    });
  }
  
  updateQuickPresets(phase) {
    const presetButtons = document.getElementById('preset-buttons');
    if (!presetButtons) return;
    
    // 清空现有按钮
    presetButtons.innerHTML = '';
    
    // 不同阶段的预设时长
    const presets = {
      'prepare': [10, 15, 30],        // 10s, 15s, 30s
      'round': [120, 180, 300],       // 2min, 3min, 5min
      'warning': [5, 10, 15],         // 5s, 10s, 15s  
      'rest': [30, 60, 90]            // 30s, 1min, 1.5min
    };
    
    const phasePresets = presets[phase] || [60, 120, 180];
    
    phasePresets.forEach(seconds => {
      const button = document.createElement('button');
      button.className = 'preset-btn-time';
      button.dataset.time = seconds;
      button.textContent = this.formatTime(seconds);
      
      button.addEventListener('click', () => {
        if (this.timePicker) {
          this.timePicker.setValue(seconds);
        }
        // 更新选中状态
        document.querySelectorAll('.preset-btn-time').forEach(btn => {
          btn.classList.remove('selected');
        });
        button.classList.add('selected');
      });
      
      presetButtons.appendChild(button);
    });
  }
  
  getPhaseTime(phase) {
    const timeElement = document.getElementById(`${phase}-time`);
    if (timeElement) {
      const timeText = timeElement.textContent.trim();
      return this.parseTimeString(timeText);
    }
    return 0;
  }
  
  applyPhaseTime() {
    if (!this.timePicker || !this.currentPhase) return;
    
    const totalSeconds = this.timePicker.getValue();
    // CMAI修复：添加DOM元素安全检查
    const timeElement = document.getElementById(`${this.currentPhase}-time`);
    
    if (timeElement) {
      timeElement.textContent = this.formatTime(totalSeconds);
    } else {
      console.warn(`⚠️ 无法找到时间显示元素: ${this.currentPhase}-time`);
    }
    
    // 更新总时长
    this.updateTotalTime();
    
    // 清理时长选择器
    this.timePicker = null;
  }
  
  adjustRounds(delta) {
    const roundsDisplay = document.getElementById('rounds-count');
    if (!roundsDisplay) return;
    
    const currentRounds = parseInt(roundsDisplay.textContent) || 1;
    const newRounds = Math.max(1, Math.min(99, currentRounds + delta));
    
    roundsDisplay.textContent = newRounds;
    this.updateTotalTime();
  }
  
  updateTotalTime() {
    const rounds = parseInt(document.getElementById('rounds-count')?.textContent) || 1;
    
    const prepareTime = this.getPhaseTime('prepare');
    const roundTime = this.getPhaseTime('round');
    const warningTime = this.getPhaseTime('warning');
    const restTime = this.getPhaseTime('rest');
    
    // 总时长 = 准备时间 + (回合时间 + 警告时间 + 休息时间) * 回合数
    // 注意：最后一个回合后通常没有休息时间
    const totalSeconds = prepareTime + ((roundTime + warningTime + restTime) * rounds);
    
    const totalTimeElement = document.getElementById('total-time');
    if (totalTimeElement) {
      totalTimeElement.textContent = this.formatTime(totalSeconds);
    }
  }
  
  parseTimeString(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return 0;
  }
  
  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}