// IP消息限制器
class MessageRateLimiter {
    constructor() {
        this.storageKey = 'message_rate_limit';
        this.maxMessagesPerDay = 10;
        this.init();
    }

    init() {
        // 获取用户IP（模拟，实际应用中需要服务器端获取）
        this.getUserIP().then(ip => {
            this.userIP = ip;
            this.checkRateLimit();
        });
    }

    // 获取用户IP地址
    async getUserIP() {
        try {
            // 使用免费的IP获取服务
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            // 如果获取失败，使用浏览器指纹作为替代
            return this.generateBrowserFingerprint();
        }
    }

    // 生成浏览器指纹作为IP替代
    generateBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        // 简单哈希
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return 'fp_' + Math.abs(hash).toString(36);
    }

    // 检查速率限制
    checkRateLimit() {
        const now = Date.now();
        const data = this.getStoredData();
        
        if (!data[this.userIP]) {
            data[this.userIP] = {
                count: 0,
                lastReset: now,
                firstMessage: now
            };
        }
        
        // 检查是否需要重置（12小时后）
        const timeSinceReset = now - data[this.userIP].lastReset;
        if (timeSinceReset >= 12 * 60 * 60 * 1000) {
            data[this.userIP].count = 0;
            data[this.userIP].lastReset = now;
        }
        
        // 清理过期数据
        this.cleanOldData(data);
        
        this.saveStoredData(data);
        
        // 检查是否已达到限制
        if (data[this.userIP].count >= this.maxMessagesPerDay) {
            this.showRateLimitModal();
            return false;
        }
        
        return true;
    }

    // 记录新消息
    recordMessage() {
        if (!this.userIP) return false;
        
        const now = Date.now();
        const data = this.getStoredData();
        
        if (!data[this.userIP]) {
            data[this.userIP] = {
                count: 0,
                lastReset: now,
                firstMessage: now
            };
        }
        
        // 检查是否需要重置（12小时后）
        const timeSinceReset = now - data[this.userIP].lastReset;
        if (timeSinceReset >= 12 * 60 * 60 * 1000) {
            data[this.userIP].count = 0;
            data[this.userIP].lastReset = now;
        }
        
        if (data[this.userIP].count >= this.maxMessagesPerDay) {
            this.showRateLimitModal();
            return false;
        }
        
        data[this.userIP].count++;
        this.saveStoredData(data);
        
        // 更新剩余次数显示
        this.updateRemainingCount();
        
        return true;
    }

    // 获取存储的数据
    getStoredData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    }

    // 保存数据到本地存储
    saveStoredData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('无法保存限制数据:', error);
        }
    }

    // 清理过期数据
    cleanOldData(data) {
        const now = Date.now();
        const cutoffTime = now - 7 * 24 * 60 * 60 * 1000; // 7天前
        
        Object.keys(data).forEach(ip => {
            if (data[ip].lastReset < cutoffTime) {
                delete data[ip];
            }
        });
    }

    // 获取剩余消息数
    getRemainingMessages() {
        if (!this.userIP) return this.maxMessagesPerDay;
        
        const now = Date.now();
        const data = this.getStoredData();
        
        if (!data[this.userIP]) {
            return this.maxMessagesPerDay;
        }
        
        // 检查是否需要重置（12小时后）
        const timeSinceReset = now - data[this.userIP].lastReset;
        if (timeSinceReset >= 12 * 60 * 60 * 1000) {
            return this.maxMessagesPerDay;
        }
        
        return Math.max(0, this.maxMessagesPerDay - data[this.userIP].count);
    }

    // 获取重置时间（12小时后）
    getResetTime() {
        const now = new Date();
        const resetTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12小时后
        return resetTime;
    }

    // 显示限制弹窗
    showRateLimitModal() {
        // 移除已存在的弹窗
        const existingModal = document.getElementById('rateLimitModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 创建弹窗
        const modal = document.createElement('div');
        modal.id = 'rateLimitModal';
        modal.innerHTML = `
            <div class="rate-limit-overlay">
                <div class="rate-limit-modal">
                    <div class="rate-limit-header">
                        <h3>🚫 消息发送限制</h3>
                    </div>
                    <div class="rate-limit-content">
                        <p>您已达到发送上限（${this.maxMessagesPerDay}条/12小时）</p>
                        <div class="countdown-container">
                            <div class="countdown-label">距离重置还有：</div>
                            <div class="countdown-timer" id="countdownTimer">计算中...</div>
                        </div>
                    </div>
                    <div class="rate-limit-footer">
                        <button class="rate-limit-close" onclick="rateLimiter.closeModal()">我知道了</button>
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .rate-limit-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .rate-limit-modal {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-width: 400px;
                width: 90%;
                overflow: hidden;
            }
            
            .rate-limit-header {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #e9ecef;
            }
            
            .rate-limit-header h3 {
                color: #495057;
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }
            
            .rate-limit-content {
                padding: 20px;
                text-align: center;
            }
            
            .rate-limit-content p {
                margin: 0 0 20px 0;
                color: #6c757d;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .countdown-container {
                background: #f8f9fa;
                border-radius: 4px;
                padding: 15px;
                border: 1px solid #e9ecef;
            }
            
            .countdown-label {
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 8px;
            }
            
            .countdown-timer {
                font-size: 20px;
                font-weight: 600;
                color: #dc3545;
                font-family: monospace;
            }
            
            .rate-limit-footer {
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e9ecef;
                background: #f8f9fa;
            }
            
            .rate-limit-close {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .rate-limit-close:hover {
                background: #0056b3;
            }
            
            .remaining-messages {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007bff;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // 启动倒计时
        this.startCountdown();

        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
    }

    // 启动倒计时
    startCountdown() {
        const data = this.getStoredData();
        const resetTime = this.getResetTime();
        const totalDuration = 12 * 60 * 60 * 1000; // 12小时总时长
        
        const updateCountdown = () => {
            const now = new Date();
            const diff = resetTime - now;

            if (diff <= 0) {
                // 时间到了，重新加载页面
                location.reload();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const timerElement = document.getElementById('countdownTimer');
            if (timerElement) {
                timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };

        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    // 关闭弹窗
    closeModal() {
        const modal = document.getElementById('rateLimitModal');
        if (modal) {
            modal.remove();
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }

    // 更新剩余次数显示
    updateRemainingCount() {
        let indicator = document.getElementById('remainingMessages');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'remainingMessages';
            indicator.className = 'remaining-messages';
            document.body.appendChild(indicator);
        }
        
        const remaining = this.getRemainingMessages();
        indicator.textContent = `剩余消息: ${remaining}/${this.maxMessagesPerDay}`;
        
        // 根据剩余数量改变颜色
        if (remaining <= 2) {
            indicator.style.background = 'rgba(231, 76, 60, 0.9)';
        } else if (remaining <= 5) {
            indicator.style.background = 'rgba(243, 156, 18, 0.9)';
        } else {
            indicator.style.background = 'rgba(52, 152, 219, 0.9)';
        }
    }

    // 拦截发送消息的函数
    interceptSendMessage() {
        // 查找发送按钮或表单
        const sendButtons = document.querySelectorAll('button[type="submit"], .send-button, #send-btn, .submit-btn');
        const forms = document.querySelectorAll('form');
        
        // 拦截按钮点击
        sendButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.recordMessage()) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, true);
        });
        
        // 拦截表单提交
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.recordMessage()) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, true);
        });
        
        // 拦截回车键发送
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                    if (!this.recordMessage()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
            }
        }, true);
    }
}

// 创建全局实例
const rateLimiter = new MessageRateLimiter();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟一秒后开始拦截，确保页面元素都已加载
    setTimeout(() => {
        rateLimiter.interceptSendMessage();
        rateLimiter.updateRemainingCount();
    }, 1000);
});

// 防止通过刷新绕过限制
window.addEventListener('beforeunload', function() {
    // 在页面卸载前保存当前状态
    const data = rateLimiter.getStoredData();
    rateLimiter.saveStoredData(data);
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageRateLimiter;
}