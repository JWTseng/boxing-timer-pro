// Boxing Timer Pro - 统一错误处理系统
// CMAI设计：遵循Unix哲学的简洁错误处理

/**
 * 统一错误处理器 - Unix风格的简洁设计
 */
export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100; // 限制日志大小，避免内存泄漏
    }

    /**
     * 标准错误处理 - 记录、报告、恢复
     */
    handle(error, context = '', severity = 'error') {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            context: context,
            severity: severity,
            stack: error.stack || new Error().stack
        };

        // 记录错误
        this.logError(errorInfo);

        // 根据严重程度处理
        switch(severity) {
            case 'critical':
                this.handleCritical(errorInfo);
                break;
            case 'error':
                this.handleError(errorInfo);
                break;
            case 'warning':
                this.handleWarning(errorInfo);
                break;
            case 'info':
                this.handleInfo(errorInfo);
                break;
        }

        return errorInfo;
    }

    /**
     * 记录错误到内存日志
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // Unix风格：保持日志大小限制
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
    }

    /**
     * 处理关键错误
     */
    handleCritical(errorInfo) {
        console.error(`💥 [CRITICAL] ${errorInfo.context}: ${errorInfo.message}`);
        
        // 关键错误可能需要显示用户通知
        this.showUserNotification(
            '系统错误', 
            '发生关键错误，建议刷新页面重试', 
            'error'
        );
    }

    /**
     * 处理一般错误
     */
    handleError(errorInfo) {
        console.error(`❌ [ERROR] ${errorInfo.context}: ${errorInfo.message}`);
        
        // 可选：发送到错误收集服务
        // this.reportToService(errorInfo);
    }

    /**
     * 处理警告
     */
    handleWarning(errorInfo) {
        console.warn(`⚠️ [WARNING] ${errorInfo.context}: ${errorInfo.message}`);
    }

    /**
     * 处理信息
     */
    handleInfo(errorInfo) {
        console.info(`ℹ️ [INFO] ${errorInfo.context}: ${errorInfo.message}`);
    }

    /**
     * 显示用户通知（如果UI系统可用）
     */
    showUserNotification(title, message, type = 'info') {
        // 简单的通知实现
        if (typeof window !== 'undefined' && window.alert) {
            // 生产环境可以替换为更优雅的通知系统
            if (type === 'error') {
                alert(`${title}\n\n${message}`);
            }
        }
    }

    /**
     * 获取错误统计
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            critical: 0,
            error: 0,
            warning: 0,
            info: 0
        };

        this.errorLog.forEach(log => {
            stats[log.severity]++;
        });

        return stats;
    }

    /**
     * 清理错误日志
     */
    clearLog() {
        this.errorLog = [];
        console.info('🧹 错误日志已清理');
    }

    /**
     * 导出错误日志（用于调试）
     */
    exportLog() {
        return JSON.stringify(this.errorLog, null, 2);
    }
}

/**
 * 全局错误处理器实例
 */
export const globalErrorHandler = new ErrorHandler();

/**
 * 便捷的错误处理函数
 */
export const handleError = (error, context = '', severity = 'error') => {
    return globalErrorHandler.handle(error, context, severity);
};

/**
 * 异步函数错误包装器
 */
export const wrapAsync = (asyncFn, context = '') => {
    return async (...args) => {
        try {
            return await asyncFn.apply(this, args);
        } catch (error) {
            handleError(error, context, 'error');
            throw error; // 重新抛出以便调用者处理
        }
    };
};

/**
 * 同步函数错误包装器
 */
export const wrapSync = (syncFn, context = '') => {
    return (...args) => {
        try {
            return syncFn.apply(this, args);
        } catch (error) {
            handleError(error, context, 'error');
            throw error;
        }
    };
};

// 设置全局错误捕获（如果在浏览器环境）
if (typeof window !== 'undefined') {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
        handleError(event.reason, 'UnhandledPromiseRejection', 'critical');
    });

    // 捕获全局JavaScript错误
    window.addEventListener('error', (event) => {
        handleError(event.error || event.message, 'GlobalError', 'critical');
    });
}

console.log('🛡️ CMAI统一错误处理系统已激活');