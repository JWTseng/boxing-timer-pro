// Boxing Timer Pro - 系统健康检查器
// CMAI设计：确保应用能正常启动的诊断工具

/**
 * 系统健康检查器 - Unix风格的系统诊断
 */
export class SystemHealthChecker {
    constructor() {
        this.checkResults = {
            overall: false,
            environment: false,
            dependencies: false,
            permissions: false,
            apis: false
        };
        
        this.errors = [];
        this.warnings = [];
        this.infos = [];
    }

    /**
     * 执行完整的系统健康检查
     */
    async runHealthCheck() {
        console.log('🔍 CMAI系统健康检查开始...');
        
        try {
            // 1. 环境检查
            this.checkEnvironment();
            
            // 2. 依赖检查
            await this.checkDependencies();
            
            // 3. 权限检查
            await this.checkPermissions();
            
            // 4. API可用性检查
            await this.checkWebAPIs();
            
            // 5. 计算整体健康状态
            this.calculateOverallHealth();
            
            // 6. 生成诊断报告
            this.generateReport();
            
            return this.checkResults;
            
        } catch (error) {
            this.errors.push({
                category: 'system',
                message: `健康检查执行失败: ${error.message}`,
                severity: 'critical'
            });
            
            console.error('💥 系统健康检查失败:', error);
            return this.checkResults;
        }
    }

    /**
     * 检查运行环境
     */
    checkEnvironment() {
        console.log('  📱 检查运行环境...');
        
        const checks = [
            {
                name: '浏览器支持',
                test: () => typeof window !== 'undefined',
                critical: true
            },
            {
                name: 'ES6模块支持', 
                test: () => {
                    // 测试动态导入是否可用（间接检查）
                    try {
                        return typeof Promise !== 'undefined' && 'then' in Promise.prototype;
                    } catch {
                        return false;
                    }
                },
                critical: true
            },
            {
                name: 'localStorage支持',
                test: () => typeof localStorage !== 'undefined',
                critical: false
            },
            {
                name: 'sessionStorage支持',
                test: () => typeof sessionStorage !== 'undefined', 
                critical: false
            },
            {
                name: '现代JavaScript支持',
                test: () => {
                    try {
                        // 测试箭头函数、解构、async/await等
                        const test = async () => ({ ...{}, a: 1 });
                        return typeof test === 'function';
                    } catch {
                        return false;
                    }
                },
                critical: true
            }
        ];

        let passed = 0;
        let critical = 0;
        
        checks.forEach(check => {
            const result = check.test();
            if (result) {
                passed++;
                this.infos.push(`✅ ${check.name}: 通过`);
            } else {
                const severity = check.critical ? 'critical' : 'warning';
                if (check.critical) critical++;
                
                this[severity === 'critical' ? 'errors' : 'warnings'].push({
                    category: 'environment',
                    message: `${check.name}: 不支持`,
                    severity
                });
            }
        });

        this.checkResults.environment = critical === 0;
        console.log(`  📱 环境检查: ${passed}/${checks.length} 通过`);
    }

    /**
     * 检查项目依赖
     */
    async checkDependencies() {
        console.log('  📦 检查项目依赖...');
        
        const dependencies = [
            {
                name: 'ViewManager',
                path: '/src/components/ViewManager.js',
                critical: true
            },
            {
                name: 'TimePicker', 
                path: '/src/components/TimePicker.js',
                critical: true
            },
            {
                name: 'ErrorHandler',
                path: '/src/utils/ErrorHandler.js',
                critical: false
            }
        ];

        let loadedCount = 0;
        
        for (const dep of dependencies) {
            try {
                // 测试模块是否可以加载（不实际导入）
                const moduleExists = await this.testModuleExists(dep.path);
                
                if (moduleExists) {
                    loadedCount++;
                    this.infos.push(`✅ ${dep.name}: 可加载`);
                } else {
                    const severity = dep.critical ? 'critical' : 'warning';
                    this[severity === 'critical' ? 'errors' : 'warnings'].push({
                        category: 'dependencies',
                        message: `${dep.name}: 模块不存在 (${dep.path})`,
                        severity
                    });
                }
            } catch (error) {
                const severity = dep.critical ? 'critical' : 'warning';
                this[severity === 'critical' ? 'errors' : 'warnings'].push({
                    category: 'dependencies', 
                    message: `${dep.name}: 加载失败 - ${error.message}`,
                    severity
                });
            }
        }

        const criticalDeps = dependencies.filter(d => d.critical);
        const loadedCritical = criticalDeps.length - this.errors.filter(e => e.category === 'dependencies').length;
        
        this.checkResults.dependencies = loadedCritical === criticalDeps.length;
        console.log(`  📦 依赖检查: ${loadedCount}/${dependencies.length} 可加载`);
    }

    /**
     * 测试模块是否存在（不实际导入）
     */
    async testModuleExists(path) {
        try {
            // 使用fetch检查文件是否存在
            const response = await fetch(path);
            return response.ok;
        } catch {
            // 如果fetch失败，假设模块不存在
            return false;
        }
    }

    /**
     * 检查浏览器权限
     */
    async checkPermissions() {
        console.log('  🔐 检查浏览器权限...');
        
        const permissions = [
            {
                name: 'Web Audio API',
                test: async () => {
                    try {
                        const AudioContext = window.AudioContext || window.webkitAudioContext;
                        if (!AudioContext) return false;
                        
                        const context = new AudioContext();
                        const canPlay = context.state !== undefined;
                        context.close();
                        return canPlay;
                    } catch {
                        return false;
                    }
                },
                critical: false
            },
            {
                name: 'Web Workers',
                test: async () => {
                    try {
                        return typeof Worker !== 'undefined';
                    } catch {
                        return false;
                    }
                },
                critical: false
            },
            {
                name: '屏幕常亮锁',
                test: async () => {
                    try {
                        return 'wakeLock' in navigator;
                    } catch {
                        return false;
                    }
                },
                critical: false
            }
        ];

        let grantedCount = 0;
        
        for (const permission of permissions) {
            try {
                const granted = await permission.test();
                if (granted) {
                    grantedCount++;
                    this.infos.push(`✅ ${permission.name}: 可用`);
                } else {
                    this.warnings.push({
                        category: 'permissions',
                        message: `${permission.name}: 不可用`,
                        severity: 'warning'
                    });
                }
            } catch (error) {
                this.warnings.push({
                    category: 'permissions',
                    message: `${permission.name}: 检查失败 - ${error.message}`,
                    severity: 'warning'
                });
            }
        }

        this.checkResults.permissions = true; // 权限问题不阻止启动
        console.log(`  🔐 权限检查: ${grantedCount}/${permissions.length} 可用`);
    }

    /**
     * 检查Web API可用性
     */
    async checkWebAPIs() {
        console.log('  🌐 检查Web API可用性...');
        
        const apis = [
            { name: 'requestAnimationFrame', test: () => typeof requestAnimationFrame !== 'undefined' },
            { name: 'fetch', test: () => typeof fetch !== 'undefined' },
            { name: 'Promise', test: () => typeof Promise !== 'undefined' },
            { name: 'addEventListener', test: () => typeof addEventListener !== 'undefined' },
            { name: 'querySelector', test: () => typeof document?.querySelector !== 'undefined' }
        ];

        let availableCount = 0;
        
        apis.forEach(api => {
            const available = api.test();
            if (available) {
                availableCount++;
                this.infos.push(`✅ ${api.name}: 可用`);
            } else {
                this.warnings.push({
                    category: 'apis',
                    message: `${api.name}: 不可用`,
                    severity: 'warning'
                });
            }
        });

        this.checkResults.apis = availableCount >= 4; // 至少4个API可用
        console.log(`  🌐 API检查: ${availableCount}/${apis.length} 可用`);
    }

    /**
     * 计算整体健康状态
     */
    calculateOverallHealth() {
        const criticalChecks = ['environment', 'dependencies'];
        const criticalPassed = criticalChecks.every(check => this.checkResults[check]);
        
        this.checkResults.overall = criticalPassed;
    }

    /**
     * 生成诊断报告
     */
    generateReport() {
        console.log('\n📋 CMAI系统健康检查报告:');
        console.log('================================');
        
        // 整体状态
        const overallStatus = this.checkResults.overall ? '🟢 健康' : '🔴 异常';
        console.log(`整体状态: ${overallStatus}`);
        console.log('');
        
        // 各项检查结果
        Object.entries(this.checkResults).forEach(([key, value]) => {
            if (key !== 'overall') {
                const status = value ? '✅' : '❌';
                const name = this.getCheckDisplayName(key);
                console.log(`${status} ${name}: ${value ? '通过' : '失败'}`);
            }
        });
        
        console.log('');
        
        // 错误信息
        if (this.errors.length > 0) {
            console.log('🚨 严重错误:');
            this.errors.forEach(error => {
                console.log(`  - ${error.message}`);
            });
            console.log('');
        }
        
        // 警告信息
        if (this.warnings.length > 0) {
            console.log('⚠️ 警告信息:');
            this.warnings.forEach(warning => {
                console.log(`  - ${warning.message}`);
            });
            console.log('');
        }
        
        // 启动建议
        if (!this.checkResults.overall) {
            console.log('💡 启动修复建议:');
            console.log('  1. 检查浏览器兼容性');
            console.log('  2. 确保所有必需的模块文件存在');
            console.log('  3. 检查网络连接和文件服务器');
            console.log('  4. 清除浏览器缓存重试');
        } else {
            console.log('🎉 系统健康，可以正常启动！');
        }
        
        console.log('================================\n');
    }

    /**
     * 获取检查项显示名称
     */
    getCheckDisplayName(key) {
        const names = {
            environment: '运行环境',
            dependencies: '项目依赖', 
            permissions: '浏览器权限',
            apis: 'Web API'
        };
        return names[key] || key;
    }

    /**
     * 获取启动状态摘要
     */
    getStartupSummary() {
        return {
            canStart: this.checkResults.overall,
            criticalErrors: this.errors.length,
            warnings: this.warnings.length,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * 获取修复建议
     */
    getRecommendations() {
        const recommendations = [];
        
        if (!this.checkResults.environment) {
            recommendations.push('升级到现代浏览器');
        }
        
        if (!this.checkResults.dependencies) {
            recommendations.push('检查模块文件完整性');
        }
        
        if (this.warnings.length > 0) {
            recommendations.push('解决权限和API兼容性问题');
        }
        
        return recommendations;
    }
}

// 导出便捷函数
export const runSystemHealthCheck = async () => {
    const checker = new SystemHealthChecker();
    return await checker.runHealthCheck();
};

console.log('🛡️ CMAI系统健康检查器已加载');