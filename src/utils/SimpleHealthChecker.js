// Boxing Timer Pro - 简化版系统健康检查器
// CMAI设计：最小依赖的启动诊断工具

/**
 * 简化版系统健康检查器 - 避免复杂语法
 */
export class SimpleHealthChecker {
    constructor() {
        this.results = {
            overall: false,
            errors: [],
            warnings: [],
            infos: []
        };
    }

    /**
     * 执行基础健康检查
     */
    async runBasicCheck() {
        console.log('🔍 CMAI基础健康检查开始...');
        
        try {
            // 1. 环境检查
            this.checkEnvironment();
            
            // 2. 基础API检查
            this.checkWebAPIs();
            
            // 3. 计算结果
            this.calculateResult();
            
            // 4. 生成报告
            this.generateSimpleReport();
            
            return this.results;
            
        } catch (error) {
            console.error('💥 健康检查失败:', error);
            this.results.errors.push(`健康检查执行失败: ${error.message}`);
            return this.results;
        }
    }

    /**
     * 检查基础环境
     */
    checkEnvironment() {
        console.log('  📱 检查基础环境...');
        
        const checks = [
            { name: '浏览器环境', test: () => typeof window !== 'undefined' },
            { name: 'Promise支持', test: () => typeof Promise !== 'undefined' },
            { name: 'localStorage', test: () => typeof localStorage !== 'undefined' },
            { name: '现代JavaScript', test: () => {
                try {
                    // 测试箭头函数和解构
                    const test = () => ({ a: 1 });
                    const { a } = test();
                    return a === 1;
                } catch {
                    return false;
                }
            }}
        ];

        let passed = 0;
        checks.forEach(check => {
            try {
                const result = check.test();
                if (result) {
                    passed++;
                    this.results.infos.push(`✅ ${check.name}: 支持`);
                } else {
                    this.results.warnings.push(`⚠️ ${check.name}: 不支持`);
                }
            } catch (error) {
                this.results.errors.push(`❌ ${check.name}: 检查失败 - ${error.message}`);
            }
        });

        console.log(`  📱 环境检查: ${passed}/${checks.length} 通过`);
    }

    /**
     * 检查Web API
     */
    checkWebAPIs() {
        console.log('  🌐 检查Web API...');
        
        const apis = [
            { name: 'fetch', test: () => typeof fetch !== 'undefined' },
            { name: 'requestAnimationFrame', test: () => typeof requestAnimationFrame !== 'undefined' },
            { name: 'addEventListener', test: () => typeof addEventListener !== 'undefined' },
            { name: 'querySelector', test: () => typeof document.querySelector !== 'undefined' }
        ];

        let available = 0;
        apis.forEach(api => {
            try {
                const result = api.test();
                if (result) {
                    available++;
                    this.results.infos.push(`✅ ${api.name}: 可用`);
                } else {
                    this.results.warnings.push(`⚠️ ${api.name}: 不可用`);
                }
            } catch (error) {
                this.results.warnings.push(`⚠️ ${api.name}: 检查失败`);
            }
        });

        console.log(`  🌐 API检查: ${available}/${apis.length} 可用`);
    }

    /**
     * 计算检查结果
     */
    calculateResult() {
        // 如果没有严重错误，认为可以启动
        this.results.overall = this.results.errors.length === 0;
    }

    /**
     * 生成简单报告
     */
    generateSimpleReport() {
        console.log('\n📋 CMAI简化健康检查报告:');
        console.log('================================');
        
        const status = this.results.overall ? '🟢 可以启动' : '🔴 启动异常';
        console.log(`整体状态: ${status}`);
        console.log('');
        
        if (this.results.errors.length > 0) {
            console.log('🚨 错误:');
            this.results.errors.forEach(error => console.log(`  - ${error}`));
            console.log('');
        }
        
        if (this.results.warnings.length > 0) {
            console.log('⚠️ 警告:');
            this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
            console.log('');
        }
        
        console.log(`✅ 通过检查: ${this.results.infos.length} 项`);
        console.log('================================\n');
    }

    /**
     * 获取启动建议
     */
    getStartupSummary() {
        return {
            canStart: this.results.overall,
            errors: this.results.errors.length,
            warnings: this.results.warnings.length,
            recommendations: this.results.overall ? 
                ['系统正常，可以启动'] : 
                ['检查浏览器兼容性', '刷新页面重试']
        };
    }
}

// 导出便捷函数
export const runBasicHealthCheck = async () => {
    const checker = new SimpleHealthChecker();
    return await checker.runBasicCheck();
};

console.log('🛡️ CMAI简化健康检查器已加载');