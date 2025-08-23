// Boxing Timer Pro - 数据库管理器
// 使用 Dexie.js 封装 IndexedDB，提供数据存储和管理功能

import Dexie from 'dexie';

/**
 * 预设数据结构
 */
export const PresetSchema = {
    id: '++id',
    name: 'string',
    roundTime: 'number',
    restTime: 'number',
    prepareTime: 'number',
    roundCount: 'number',
    soundScheme: 'string',
    createdAt: 'date',
    updatedAt: 'date',
    isDefault: 'boolean'
};

/**
 * 训练记录数据结构
 */
export const SessionSchema = {
    id: '++id',
    presetId: 'number',
    presetName: 'string',
    roundTime: 'number',
    restTime: 'number',
    prepareTime: 'number',
    roundCount: 'number',
    completedRounds: 'number',
    totalTime: 'number',
    date: 'date',
    notes: 'string',
    isCompleted: 'boolean'
};

/**
 * 错误日志数据结构
 */
export const ErrorLogSchema = {
    id: '++id',
    message: 'string',
    stack: 'string',
    timestamp: 'date',
    userAgent: 'string',
    url: 'string'
};

/**
 * 数据库管理器类
 */
export class Database extends Dexie {
    constructor() {
        super('BoxingTimerProDB');
        
        // 定义数据库架构
        this.version(1).stores({
            presets: '++id, name, createdAt, isDefault',
            sessions: '++id, presetId, date, isCompleted',
            errorLogs: '++id, timestamp',
            settings: 'key, value'
        });
        
        // 表引用
        this.presets = this.table('presets');
        this.sessions = this.table('sessions');
        this.errorLogs = this.table('errorLogs');
        this.settings = this.table('settings');
        
        console.log('💾 Database 实例化完成');
    }

    /**
     * 初始化数据库
     */
    async init() {
        try {
            // 打开数据库
            await this.open();
            
            // 检查并创建默认预设
            await this.createDefaultPresets();
            
            // 清理旧数据
            await this.cleanupOldData();
            
            console.log('✅ Database 初始化完成');
            
        } catch (error) {
            console.error('❌ Database 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 创建默认预设
     */
    async createDefaultPresets() {
        try {
            const existingDefaults = await this.presets.where('isDefault').equals(true).count();
            
            if (existingDefaults === 0) {
                const defaultPresets = [
                    {
                        name: '拳击训练 (3x3分钟)',
                        roundTime: 180,
                        restTime: 60,
                        prepareTime: 10,
                        roundCount: 3,
                        soundScheme: 'bell',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isDefault: true
                    },
                    {
                        name: 'HIIT间歇训练 (8x30秒)',
                        roundTime: 30,
                        restTime: 10,
                        prepareTime: 5,
                        roundCount: 8,
                        soundScheme: 'beep',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isDefault: true
                    },
                    {
                        name: 'MMA综合训练 (5x5分钟)',
                        roundTime: 300,
                        restTime: 90,
                        prepareTime: 10,
                        roundCount: 5,
                        soundScheme: 'bell',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isDefault: true
                    },
                    {
                        name: '跳绳训练 (10x1分钟)',
                        roundTime: 60,
                        restTime: 30,
                        prepareTime: 5,
                        roundCount: 10,
                        soundScheme: 'whistle',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isDefault: true
                    }
                ];
                
                await this.presets.bulkAdd(defaultPresets);
                console.log('✅ 默认预设创建完成');
            }
        } catch (error) {
            console.error('❌ 创建默认预设失败:', error);
        }
    }

    /**
     * 清理旧数据
     */
    async cleanupOldData() {
        try {
            // 清理30天前的错误日志
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const deletedLogs = await this.errorLogs.where('timestamp').below(thirtyDaysAgo).delete();
            
            if (deletedLogs > 0) {
                console.log(`🧹 清理了 ${deletedLogs} 条旧错误日志`);
            }
            
            // 清理6个月前的训练记录（可选）
            const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
            const oldSessions = await this.sessions.where('date').below(sixMonthsAgo).count();
            
            if (oldSessions > 100) { // 只在记录过多时清理
                const deletedSessions = await this.sessions.where('date').below(sixMonthsAgo).delete();
                console.log(`🧹 清理了 ${deletedSessions} 条旧训练记录`);
            }
            
        } catch (error) {
            console.warn('⚠️ 清理旧数据失败:', error);
        }
    }

    // ========== 预设管理 ==========

    /**
     * 获取所有预设
     */
    async getAllPresets() {
        try {
            return await this.presets.orderBy('createdAt').reverse().toArray();
        } catch (error) {
            console.error('❌ 获取预设列表失败:', error);
            return [];
        }
    }

    /**
     * 根据ID获取预设
     */
    async getPreset(id) {
        try {
            return await this.presets.get(id);
        } catch (error) {
            console.error(`❌ 获取预设失败 (ID: ${id}):`, error);
            return null;
        }
    }

    /**
     * 创建预设
     */
    async createPreset(presetData) {
        try {
            const preset = {
                ...presetData,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: false
            };
            
            const id = await this.presets.add(preset);
            console.log(`✅ 预设创建成功 (ID: ${id}): ${preset.name}`);
            return id;
            
        } catch (error) {
            console.error('❌ 创建预设失败:', error);
            throw error;
        }
    }

    /**
     * 更新预设
     */
    async updatePreset(id, updates) {
        try {
            const updatedData = {
                ...updates,
                updatedAt: new Date()
            };
            
            const result = await this.presets.update(id, updatedData);
            
            if (result) {
                console.log(`✅ 预设更新成功 (ID: ${id})`);
                return true;
            } else {
                throw new Error('预设不存在');
            }
            
        } catch (error) {
            console.error(`❌ 更新预设失败 (ID: ${id}):`, error);
            throw error;
        }
    }

    /**
     * 删除预设
     */
    async deletePreset(id) {
        try {
            const preset = await this.presets.get(id);
            if (!preset) {
                throw new Error('预设不存在');
            }
            
            if (preset.isDefault) {
                throw new Error('不能删除默认预设');
            }
            
            await this.presets.delete(id);
            console.log(`✅ 预设删除成功 (ID: ${id}): ${preset.name}`);
            return true;
            
        } catch (error) {
            console.error(`❌ 删除预设失败 (ID: ${id}):`, error);
            throw error;
        }
    }

    /**
     * 复制预设
     */
    async duplicatePreset(id) {
        try {
            const original = await this.presets.get(id);
            if (!original) {
                throw new Error('预设不存在');
            }
            
            const duplicate = {
                ...original,
                name: `${original.name} (副本)`,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDefault: false
            };
            
            delete duplicate.id; // 移除原ID
            
            const newId = await this.presets.add(duplicate);
            console.log(`✅ 预设复制成功 (新ID: ${newId})`);
            return newId;
            
        } catch (error) {
            console.error(`❌ 复制预设失败 (ID: ${id}):`, error);
            throw error;
        }
    }

    // ========== 训练记录管理 ==========

    /**
     * 记录训练会话
     */
    async recordSession(sessionData) {
        try {
            const session = {
                ...sessionData,
                date: new Date()
            };
            
            const id = await this.sessions.add(session);
            console.log(`✅ 训练记录保存成功 (ID: ${id})`);
            return id;
            
        } catch (error) {
            console.error('❌ 保存训练记录失败:', error);
            throw error;
        }
    }

    /**
     * 获取训练记录列表
     */
    async getSessions(limit = 50, offset = 0) {
        try {
            return await this.sessions
                .orderBy('date')
                .reverse()
                .offset(offset)
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('❌ 获取训练记录失败:', error);
            return [];
        }
    }

    /**
     * 根据日期范围获取训练记录
     */
    async getSessionsByDateRange(startDate, endDate) {
        try {
            return await this.sessions
                .where('date')
                .between(startDate, endDate, true, true)
                .reverse()
                .toArray();
        } catch (error) {
            console.error('❌ 获取日期范围训练记录失败:', error);
            return [];
        }
    }

    /**
     * 获取训练统计数据
     */
    async getTrainingStats(days = 30) {
        try {
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            const sessions = await this.sessions.where('date').above(startDate).toArray();
            
            const stats = {
                totalSessions: sessions.length,
                completedSessions: sessions.filter(s => s.isCompleted).length,
                totalTime: sessions.reduce((sum, s) => sum + s.totalTime, 0),
                totalRounds: sessions.reduce((sum, s) => sum + s.completedRounds, 0),
                averageSessionTime: 0,
                averageRoundsPerSession: 0,
                weeklyStats: this.calculateWeeklyStats(sessions),
                dailyStats: this.calculateDailyStats(sessions, days)
            };
            
            if (stats.totalSessions > 0) {
                stats.averageSessionTime = stats.totalTime / stats.totalSessions;
                stats.averageRoundsPerSession = stats.totalRounds / stats.totalSessions;
            }
            
            return stats;
            
        } catch (error) {
            console.error('❌ 获取训练统计失败:', error);
            return null;
        }
    }

    /**
     * 计算每周统计
     */
    calculateWeeklyStats(sessions) {
        const weeklyMap = new Map();
        
        sessions.forEach(session => {
            const weekStart = this.getWeekStart(session.date);
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyMap.has(weekKey)) {
                weeklyMap.set(weekKey, {
                    week: weekStart,
                    sessions: 0,
                    totalTime: 0,
                    totalRounds: 0
                });
            }
            
            const weekStats = weeklyMap.get(weekKey);
            weekStats.sessions++;
            weekStats.totalTime += session.totalTime;
            weekStats.totalRounds += session.completedRounds;
        });
        
        return Array.from(weeklyMap.values()).sort((a, b) => b.week - a.week);
    }

    /**
     * 计算每日统计
     */
    calculateDailyStats(sessions, days) {
        const dailyMap = new Map();
        
        // 初始化所有日期
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateKey = date.toISOString().split('T')[0];
            dailyMap.set(dateKey, {
                date: date,
                sessions: 0,
                totalTime: 0,
                totalRounds: 0
            });
        }
        
        // 填充实际数据
        sessions.forEach(session => {
            const dateKey = session.date.toISOString().split('T')[0];
            if (dailyMap.has(dateKey)) {
                const dayStats = dailyMap.get(dateKey);
                dayStats.sessions++;
                dayStats.totalTime += session.totalTime;
                dayStats.totalRounds += session.completedRounds;
            }
        });
        
        return Array.from(dailyMap.values()).reverse();
    }

    /**
     * 获取周开始日期
     */
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 周一作为开始
        return new Date(d.setDate(diff));
    }

    /**
     * 删除训练记录
     */
    async deleteSession(id) {
        try {
            await this.sessions.delete(id);
            console.log(`✅ 训练记录删除成功 (ID: ${id})`);
            return true;
        } catch (error) {
            console.error(`❌ 删除训练记录失败 (ID: ${id}):`, error);
            throw error;
        }
    }

    // ========== 设置管理 ==========

    /**
     * 保存设置
     */
    async saveSetting(key, value) {
        try {
            await this.settings.put({ key, value });
            console.log(`✅ 设置保存成功: ${key}`);
        } catch (error) {
            console.error(`❌ 保存设置失败 (${key}):`, error);
            throw error;
        }
    }

    /**
     * 获取设置
     */
    async getSetting(key, defaultValue = null) {
        try {
            const setting = await this.settings.get(key);
            return setting ? setting.value : defaultValue;
        } catch (error) {
            console.error(`❌ 获取设置失败 (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * 批量保存设置
     */
    async saveSettings(settings) {
        try {
            const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
            await this.settings.bulkPut(entries);
            console.log('✅ 批量设置保存成功');
        } catch (error) {
            console.error('❌ 批量保存设置失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有设置
     */
    async getAllSettings() {
        try {
            const settings = await this.settings.toArray();
            const settingsObj = {};
            settings.forEach(({ key, value }) => {
                settingsObj[key] = value;
            });
            return settingsObj;
        } catch (error) {
            console.error('❌ 获取所有设置失败:', error);
            return {};
        }
    }

    // ========== 错误日志管理 ==========

    /**
     * 记录错误日志
     */
    async logError(errorData) {
        try {
            const errorLog = {
                ...errorData,
                timestamp: new Date(),
                url: window.location.href
            };
            
            await this.errorLogs.add(errorLog);
            // 不在控制台输出，避免重复日志
            
        } catch (error) {
            console.warn('⚠️ 记录错误日志失败:', error);
        }
    }

    /**
     * 获取错误日志
     */
    async getErrorLogs(limit = 100) {
        try {
            return await this.errorLogs
                .orderBy('timestamp')
                .reverse()
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('❌ 获取错误日志失败:', error);
            return [];
        }
    }

    /**
     * 清理所有错误日志
     */
    async clearErrorLogs() {
        try {
            await this.errorLogs.clear();
            console.log('✅ 错误日志清理完成');
        } catch (error) {
            console.error('❌ 清理错误日志失败:', error);
        }
    }

    // ========== 数据导入导出 ==========

    /**
     * 导出所有数据
     */
    async exportData() {
        try {
            const data = {
                presets: await this.presets.toArray(),
                sessions: await this.sessions.toArray(),
                settings: await this.getAllSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            return JSON.stringify(data, null, 2);
            
        } catch (error) {
            console.error('❌ 导出数据失败:', error);
            throw error;
        }
    }

    /**
     * 导入数据
     */
    async importData(jsonData, options = { overwrite: false }) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.version || !data.exportDate) {
                throw new Error('无效的数据格式');
            }
            
            const { overwrite } = options;
            
            // 导入预设
            if (data.presets && data.presets.length > 0) {
                if (overwrite) {
                    await this.presets.where('isDefault').equals(false).delete();
                }
                
                const presetsToImport = data.presets
                    .filter(p => !p.isDefault) // 不导入默认预设
                    .map(p => {
                        delete p.id; // 移除原ID
                        return {
                            ...p,
                            createdAt: new Date(p.createdAt),
                            updatedAt: new Date(),
                            isDefault: false
                        };
                    });
                
                await this.presets.bulkAdd(presetsToImport);
            }
            
            // 导入训练记录
            if (data.sessions && data.sessions.length > 0) {
                if (overwrite) {
                    await this.sessions.clear();
                }
                
                const sessionsToImport = data.sessions.map(s => {
                    delete s.id; // 移除原ID
                    return {
                        ...s,
                        date: new Date(s.date)
                    };
                });
                
                await this.sessions.bulkAdd(sessionsToImport);
            }
            
            // 导入设置
            if (data.settings && typeof data.settings === 'object') {
                await this.saveSettings(data.settings);
            }
            
            console.log('✅ 数据导入成功');
            return true;
            
        } catch (error) {
            console.error('❌ 导入数据失败:', error);
            throw error;
        }
    }

    /**
     * 重置所有数据
     */
    async resetAllData() {
        try {
            await this.transaction('rw', this.presets, this.sessions, this.settings, this.errorLogs, async () => {
                await this.presets.clear();
                await this.sessions.clear();
                await this.settings.clear();
                await this.errorLogs.clear();
            });
            
            // 重新创建默认预设
            await this.createDefaultPresets();
            
            console.log('✅ 所有数据重置完成');
            return true;
            
        } catch (error) {
            console.error('❌ 重置数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取数据库信息
     */
    async getDatabaseInfo() {
        try {
            const info = {
                name: this.name,
                version: this.verno,
                presetsCount: await this.presets.count(),
                sessionsCount: await this.sessions.count(),
                errorLogsCount: await this.errorLogs.count(),
                settingsCount: await this.settings.count()
            };
            
            return info;
            
        } catch (error) {
            console.error('❌ 获取数据库信息失败:', error);
            return null;
        }
    }
}