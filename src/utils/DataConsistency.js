// Boxing Timer Pro - 数据一致性检查和修复工具
// 确保所有组件的数据保持一致性

export class DataConsistency {
    constructor() {
        this.defaultSettings = {
            prepare: 10,    // 秒
            round: 10,      // 秒  
            warning: 10,    // 秒
            rest: 30,       // 秒
            rounds: 10      // 回合数
        };
        
        console.log('🔍 数据一致性检查器已初始化');
    }
    
    /**
     * 检查所有数据源的一致性 - @UIAI + @CMAI: 确保用户看到的数据一致
     */
    checkConsistency() {
        console.log('🧪 开始数据一致性检查...');
        
        const issues = [];
        
        // 1. 检查HTML显示值
        const htmlValues = this.getHTMLValues();
        console.log('📄 HTML显示值:', htmlValues);
        
        // 2. 检查localStorage用户预设
        const userPresets = this.getUserPresets();
        console.log('💾 用户预设值:', userPresets);
        
        // 3. 检查位置记忆
        const lastIndexes = this.getLastSelectedIndexes();
        console.log('🧠 位置记忆:', lastIndexes);
        
        // 4. 比较一致性
        Object.keys(this.defaultSettings).forEach(phase => {
            if (phase === 'rounds') return; // 跳过回合数检查
            
            const htmlValue = htmlValues[phase];
            const defaultPreset = userPresets[phase] ? userPresets[phase][0] : this.defaultSettings[phase];
            
            if (htmlValue !== defaultPreset) {
                issues.push({
                    type: 'preset_mismatch',
                    phase: phase,
                    htmlValue: htmlValue,
                    presetValue: defaultPreset,
                    message: `${phase}阶段: HTML显示${htmlValue}秒，但首个预设为${defaultPreset}秒`
                });
            }
        });
        
        return {
            hasIssues: issues.length > 0,
            issues: issues,
            htmlValues: htmlValues,
            userPresets: userPresets,
            lastIndexes: lastIndexes
        };
    }
    
    /**
     * 获取HTML页面显示的时间值
     */
    getHTMLValues() {
        const phases = ['prepare', 'round', 'warning', 'rest'];
        const values = {};
        
        phases.forEach(phase => {
            const element = document.getElementById(`${phase}-time`);
            if (element) {
                const timeText = element.textContent.trim();
                values[phase] = this.parseTimeText(timeText);
            } else {
                values[phase] = this.defaultSettings[phase];
            }
        });
        
        return values;
    }
    
    /**
     * 获取用户自定义预设
     */
    getUserPresets() {
        try {
            const saved = localStorage.getItem('boxing-timer-user-presets');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('⚠️ 读取用户预设失败:', error);
        }
        
        // 返回默认预设 - @UIAI修正：与HTML显示一致
        return {
            prepare: [10, 20, 60],
            round: [10, 30, 60],
            warning: [10, 5, 15],   // 首个值与HTML一致
            rest: [30, 60, 90]
        };
    }
    
    /**
     * 获取位置记忆索引
     */
    getLastSelectedIndexes() {
        try {
            const saved = localStorage.getItem('boxing-timer-last-selected-indexes');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('⚠️ 读取位置记忆失败:', error);
        }
        
        return {
            prepare: 0,
            round: 0,
            warning: 0,
            rest: 0
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
     * 格式化秒数为时间文本
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 修复数据一致性问题 - @UIAI: 以HTML显示为准
     */
    fixConsistency(fixMode = 'html-priority') {
        console.log('🔧 开始修复数据一致性...');
        
        const htmlValues = this.getHTMLValues();
        const userPresets = this.getUserPresets();
        const lastIndexes = this.getLastSelectedIndexes();
        
        let fixed = false;
        
        if (fixMode === 'html-priority') {
            // 以HTML显示的时间为准，更新预设的第一个值
            Object.keys(htmlValues).forEach(phase => {
                if (userPresets[phase] && userPresets[phase][0] !== htmlValues[phase]) {
                    console.log(`🔄 修复${phase}: 预设${userPresets[phase][0]}秒 → ${htmlValues[phase]}秒`);
                    userPresets[phase][0] = htmlValues[phase];
                    fixed = true;
                }
            });
            
            if (fixed) {
                // 保存修复后的预设
                localStorage.setItem('boxing-timer-user-presets', JSON.stringify(userPresets));
                console.log('✅ 预设数据已修复并保存');
            }
        }
        
        return {
            fixed: fixed,
            newPresets: userPresets
        };
    }
    
    /**
     * 重置所有数据为默认值 - @UIAI: 提供重置功能
     */
    resetToDefaults() {
        console.log('🔄 重置所有数据为默认值...');
        
        // 重置用户预设 - @UIAI修正：与HTML显示一致
        const defaultPresets = {
            prepare: [10, 20, 60],
            round: [10, 30, 60],
            warning: [10, 5, 15],   // 首个值与HTML一致
            rest: [30, 60, 90]
        };
        
        // 重置位置记忆
        const defaultIndexes = {
            prepare: 0,
            round: 0,
            warning: 0,
            rest: 0
        };
        
        localStorage.setItem('boxing-timer-user-presets', JSON.stringify(defaultPresets));
        localStorage.setItem('boxing-timer-last-selected-indexes', JSON.stringify(defaultIndexes));
        
        // 更新HTML显示
        this.updateHTMLValues({
            prepare: 10,
            round: 10,
            warning: 10,
            rest: 30
        });
        
        console.log('✅ 所有数据已重置为默认值');
        
        return {
            presets: defaultPresets,
            indexes: defaultIndexes
        };
    }
    
    /**
     * 更新HTML显示值
     */
    updateHTMLValues(values) {
        Object.keys(values).forEach(phase => {
            const element = document.getElementById(`${phase}-time`);
            if (element) {
                element.textContent = this.formatTime(values[phase]);
                console.log(`📄 更新${phase}显示: ${this.formatTime(values[phase])}`);
            }
        });
    }
    
    /**
     * 生成一致性检查报告
     */
    generateReport() {
        const check = this.checkConsistency();
        
        let report = '🔍 **数据一致性检查报告**\n\n';
        
        if (!check.hasIssues) {
            report += '✅ **状态：良好** - 所有数据源保持一致\n\n';
        } else {
            report += '⚠️ **状态：发现问题** - 检测到数据不一致\n\n';
            report += '**问题详情：**\n';
            check.issues.forEach((issue, index) => {
                report += `${index + 1}. ${issue.message}\n`;
            });
            report += '\n';
        }
        
        report += '**当前数据状态：**\n';
        report += `- HTML显示: ${JSON.stringify(check.htmlValues, null, 2)}\n`;
        report += `- 用户预设: ${JSON.stringify(check.userPresets, null, 2)}\n`;
        report += `- 位置记忆: ${JSON.stringify(check.lastIndexes, null, 2)}\n`;
        
        return report;
    }
}

console.log('📦 DataConsistency 工具类加载完成');