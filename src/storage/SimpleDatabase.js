// Boxing Timer Pro - 简化版数据库管理器
// 临时版本，使用localStorage提供基础存储功能

/**
 * 简化版数据库管理器
 */
export class SimpleDatabase {
    constructor() {
        this.storageKey = 'boxing-timer-simple-db';
        this.data = {
            presets: [],
            sessions: [],
            settings: {}
        };
        
        console.log('💾 SimpleDatabase 实例化完成');
    }

    /**
     * 初始化数据库
     */
    async init() {
        try {
            // 从localStorage加载数据
            await this.loadData();
            
            // 创建默认预设
            await this.createDefaultPresets();
            
            console.log('✅ SimpleDatabase 初始化完成');
        } catch (error) {
            console.error('❌ SimpleDatabase 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 从localStorage加载数据
     */
    async loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedData = JSON.parse(stored);
                this.data = { ...this.data, ...parsedData };
            }
        } catch (error) {
            console.warn('⚠️ 加载数据失败，使用默认数据:', error);
        }
    }

    /**
     * 保存数据到localStorage
     */
    async saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('❌ 保存数据失败:', error);
        }
    }

    /**
     * 创建默认预设
     */
    async createDefaultPresets() {
        if (this.data.presets.length === 0) {
            const defaultPresets = [
                {
                    id: 1,
                    name: '拳击训练标准',
                    roundTime: 180,
                    restTime: 60,
                    prepareTime: 10,
                    roundCount: 3,
                    soundScheme: 'bell',
                    isDefault: true
                },
                {
                    id: 2,
                    name: 'HIIT间歇训练',
                    roundTime: 30,
                    restTime: 10,
                    prepareTime: 5,
                    roundCount: 8,
                    soundScheme: 'beep',
                    isDefault: true
                }
            ];
            
            this.data.presets = defaultPresets;
            await this.saveData();
            console.log('✅ 默认预设创建完成');
        }
    }

    // ========== 预设管理 ==========

    /**
     * 获取所有预设
     */
    async getAllPresets() {
        return [...this.data.presets];
    }

    /**
     * 根据ID获取预设
     */
    async getPreset(id) {
        return this.data.presets.find(p => p.id === id) || null;
    }

    /**
     * 创建预设
     */
    async createPreset(presetData) {
        const id = Date.now(); // 简单的ID生成
        const preset = {
            ...presetData,
            id,
            createdAt: new Date(),
            isDefault: false
        };
        
        this.data.presets.push(preset);
        await this.saveData();
        
        console.log(`✅ 预设创建成功 (ID: ${id}): ${preset.name}`);
        return id;
    }

    /**
     * 更新预设
     */
    async updatePreset(id, updates) {
        const index = this.data.presets.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('预设不存在');
        }
        
        this.data.presets[index] = { ...this.data.presets[index], ...updates };
        await this.saveData();
        
        console.log(`✅ 预设更新成功 (ID: ${id})`);
        return true;
    }

    /**
     * 删除预设
     */
    async deletePreset(id) {
        const index = this.data.presets.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('预设不存在');
        }
        
        if (this.data.presets[index].isDefault) {
            throw new Error('不能删除默认预设');
        }
        
        this.data.presets.splice(index, 1);
        await this.saveData();
        
        console.log(`✅ 预设删除成功 (ID: ${id})`);
        return true;
    }

    // ========== 训练记录管理 ==========

    /**
     * 记录训练会话
     */
    async recordSession(sessionData) {
        const id = Date.now();
        const session = {
            ...sessionData,
            id,
            date: new Date()
        };
        
        this.data.sessions.push(session);
        await this.saveData();
        
        console.log(`✅ 训练记录保存成功 (ID: ${id})`);
        return id;
    }

    /**
     * 获取训练记录列表
     */
    async getSessions(limit = 50) {
        return this.data.sessions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // ========== 设置管理 ==========

    /**
     * 保存设置
     */
    async saveSetting(key, value) {
        this.data.settings[key] = value;
        await this.saveData();
        console.log(`✅ 设置保存成功: ${key}`);
    }

    /**
     * 获取设置
     */
    async getSetting(key, defaultValue = null) {
        return this.data.settings[key] ?? defaultValue;
    }

    /**
     * 获取所有设置
     */
    async getAllSettings() {
        return { ...this.data.settings };
    }

    /**
     * 记录错误日志 (简化版)
     */
    async logError(errorData) {
        console.warn('错误日志 (简化版):', errorData);
        // 可以选择保存到localStorage或忽略
    }

    /**
     * 销毁实例
     */
    destroy() {
        console.log('🗑️ SimpleDatabase 已销毁');
    }
}