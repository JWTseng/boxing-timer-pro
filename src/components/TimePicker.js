/**
 * 时长选择器组件
 * 实现滚轮式的分钟和秒钟选择
 */

export class TimePicker {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      maxMinutes: options.maxMinutes || 59,
      maxSeconds: options.maxSeconds || 59,
      initialMinutes: options.initialMinutes || 0,
      initialSeconds: options.initialSeconds || 0,
      onChange: options.onChange || (() => {})
    };
    
    this.currentMinutes = this.options.initialMinutes;
    this.currentSeconds = this.options.initialSeconds;
    
    this.init();
  }
  
  init() {
    this.createPickerWheels();
    this.bindEvents();
    this.updateSelection();
  }
  
  createPickerWheels() {
    const minutesPicker = this.container.querySelector('#minutes-picker');
    const secondsPicker = this.container.querySelector('#seconds-picker');
    
    if (!minutesPicker || !secondsPicker) {
      console.error('TimePicker: Required picker elements not found');
      return;
    }
    
    // 生成分钟选项（0-59）
    for (let i = 0; i <= this.options.maxMinutes; i++) {
      const item = document.createElement('div');
      item.className = 'picker-item';
      item.textContent = i.toString().padStart(2, '0');
      item.dataset.value = i;
      minutesPicker.appendChild(item);
    }
    
    // 生成秒钟选项（0-59，以5秒为间隔）
    for (let i = 0; i <= this.options.maxSeconds; i += 5) {
      const item = document.createElement('div');
      item.className = 'picker-item';
      item.textContent = i.toString().padStart(2, '0');
      item.dataset.value = i;
      secondsPicker.appendChild(item);
    }
    
    this.minutesPicker = minutesPicker;
    this.secondsPicker = secondsPicker;
  }
  
  bindEvents() {
    // 点击选择
    this.minutesPicker.addEventListener('click', (e) => {
      if (e.target.classList.contains('picker-item')) {
        this.setMinutes(parseInt(e.target.dataset.value));
      }
    });
    
    this.secondsPicker.addEventListener('click', (e) => {
      if (e.target.classList.contains('picker-item')) {
        this.setSeconds(parseInt(e.target.dataset.value));
      }
    });
    
    // 滚动选择（可选实现）
    let minutesScrollTimeout;
    this.minutesPicker.addEventListener('scroll', () => {
      clearTimeout(minutesScrollTimeout);
      minutesScrollTimeout = setTimeout(() => {
        this.handleScroll(this.minutesPicker, 'minutes');
      }, 100);
    });
    
    let secondsScrollTimeout;
    this.secondsPicker.addEventListener('scroll', () => {
      clearTimeout(secondsScrollTimeout);
      secondsScrollTimeout = setTimeout(() => {
        this.handleScroll(this.secondsPicker, 'seconds');
      }, 100);
    });
  }
  
  handleScroll(picker, type) {
    const items = picker.querySelectorAll('.picker-item');
    const pickerRect = picker.getBoundingClientRect();
    const pickerCenter = pickerRect.top + pickerRect.height / 2;
    
    let closestItem = null;
    let closestDistance = Infinity;
    
    items.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;
      const distance = Math.abs(itemCenter - pickerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    });
    
    if (closestItem) {
      const value = parseInt(closestItem.dataset.value);
      if (type === 'minutes') {
        this.setMinutes(value);
      } else {
        this.setSeconds(value);
      }
    }
  }
  
  setMinutes(minutes) {
    this.currentMinutes = Math.max(0, Math.min(this.options.maxMinutes, minutes));
    this.updateSelection();
    this.onChange();
  }
  
  setSeconds(seconds) {
    this.currentSeconds = Math.max(0, Math.min(this.options.maxSeconds, seconds));
    this.updateSelection();
    this.onChange();
  }
  
  updateSelection() {
    // 更新分钟选择
    const minuteItems = this.minutesPicker.querySelectorAll('.picker-item');
    minuteItems.forEach(item => {
      const value = parseInt(item.dataset.value);
      item.classList.toggle('selected', value === this.currentMinutes);
    });
    
    // 更新秒钟选择
    const secondItems = this.secondsPicker.querySelectorAll('.picker-item');
    secondItems.forEach(item => {
      const value = parseInt(item.dataset.value);
      item.classList.toggle('selected', value === this.currentSeconds);
    });
    
    // 滚动到选中项
    this.scrollToSelected();
  }
  
  scrollToSelected() {
    const selectedMinute = this.minutesPicker.querySelector('.picker-item.selected');
    const selectedSecond = this.secondsPicker.querySelector('.picker-item.selected');
    
    if (selectedMinute) {
      selectedMinute.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    
    if (selectedSecond) {
      selectedSecond.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  
  onChange() {
    const totalSeconds = this.currentMinutes * 60 + this.currentSeconds;
    this.options.onChange(totalSeconds, {
      minutes: this.currentMinutes,
      seconds: this.currentSeconds
    });
  }
  
  setValue(totalSeconds) {
    this.currentMinutes = Math.floor(totalSeconds / 60);
    this.currentSeconds = totalSeconds % 60;
    this.updateSelection();
  }
  
  getValue() {
    return this.currentMinutes * 60 + this.currentSeconds;
  }
  
  getFormattedValue() {
    return `${this.currentMinutes.toString().padStart(2, '0')}:${this.currentSeconds.toString().padStart(2, '0')}`;
  }
}