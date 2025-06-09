// IP消息限制器
class MessageRateLimiter {
    constructor() {
        this.storageKey = 'message_rate_limit';
        this.maxMessagesPerDay = 10; 
        this.userIP = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // 获取用户IP（模拟，实际应用中需要服务器端获取）
        this.getUserIP().then(ip => {
            this.userIP = ip;
            this.isInitialized = true;
            // 初始化时不需要检查限制，只在发送消息时检查
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
        
        // 不自动重置，只有达到限制后通过倒计时手动重置
        
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
        // 如果还没有初始化完成，允许发送
        if (!this.isInitialized || !this.userIP) {
            return true;
        }
        
        const now = Date.now();
        const data = this.getStoredData();
        
        if (!data[this.userIP]) {
            data[this.userIP] = {
                count: 0,
                lastReset: now,
                firstMessage: now
            };
        }
        
        // 不自动重置，只有达到限制后通过倒计时手动重置
        
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
        
        const data = this.getStoredData();
        
        if (!data[this.userIP]) {
            return this.maxMessagesPerDay;
        }
        
        return Math.max(0, this.maxMessagesPerDay - data[this.userIP].count);
    }

    // 获取重置时间（3分钟后）
    getResetTime() {
        if (!this.userIP) {
            const now = new Date();
            return new Date(now.getTime() + 3 * 60 * 1000);
        }
        
        const data = this.getStoredData();
        
        // 如果已经有保存的重置时间，使用它
        if (data[this.userIP] && data[this.userIP].resetTime) {
            return new Date(data[this.userIP].resetTime);
        }
        
        // 如果没有保存的重置时间，创建新的并保存
        const now = new Date();
        const resetTime = new Date(now.getTime() + 3 * 60 * 1000);
        
        if (!data[this.userIP]) {
            data[this.userIP] = {
                count: 0,
                lastReset: now.getTime(),
                firstMessage: now.getTime()
            };
        }
        
        data[this.userIP].resetTime = resetTime.getTime();
        this.saveStoredData(data);
        
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
                        <p>您已达到发送上限（${this.maxMessagesPerDay}条/3分钟）</p>
                        <div class="qr-code-container">
                            <img src="qian.JPG" alt="打赏二维码" class="qr-code-image" />
                            <p class="qr-code-text">您的支持，是我们继续产出优质内容的最强引擎！❤️</p>
                        </div>
                        <div class="countdown-container">
                            <div class="countdown-label">距离重置还有：</div>
                            <div class="countdown-timer" id="countdownTimer">计算中...</div>
                        </div>
                    </div>
                    <div class="rate-limit-footer">
                        <button class="rate-limit-close" onclick="rateLimiter.closeModal()">欢迎前往DeepSeek官网继续使用</button>
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
                background: linear-gradient(135deg, rgba(255, 105, 180, 0.15), rgba(218, 112, 214, 0.15));
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .rate-limit-modal {
                 background: linear-gradient(145deg, #ffffff 0%, #fef7f7 100%);
                 border-radius: 20px;
                 box-shadow: 0 20px 60px rgba(255, 105, 180, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
                 max-width: 600px;
                 width: 90%;
                 min-height: 400px;
                 overflow: hidden;
                 border: 1px solid rgba(255, 182, 193, 0.3);
                 animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                 position: relative;
             }
            
            .rate-limit-modal::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #FF69B4, #DA70D6, #FFB6C1, #9370DB);
                background-size: 200% 100%;
                animation: gradientShift 3s ease infinite;
            }
            
            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            .rate-limit-header {
                background: transparent;
                padding: 32px 32px 16px;
                text-align: center;
                border-bottom: none;
            }
            
            .rate-limit-header h3 {
                color: #FF69B4;
                margin: 0;
                font-size: 22px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(255, 105, 180, 0.1);
            }
            
            .rate-limit-content {
                padding: 16px 32px 32px;
                text-align: center;
            }
            
            .qr-code-container {
                margin: 24px 0;
                padding: 24px;
                background: linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(218, 112, 214, 0.1) 100%);
                border-radius: 20px;
                border: 2px dashed rgba(255, 105, 180, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .qr-code-container::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #FF69B4, #DA70D6, #FFB6C1, #9370DB);
                border-radius: 20px;
                z-index: -1;
                opacity: 0.1;
            }
            
            .qr-code-image {
                 width: 240px;
                 height: 180px;
                 margin-bottom: 16px;
                 border: 3px solid rgba(255, 105, 180, 0.2);
                 border-radius: 16px;
                 background: white;
                 padding: 8px;
                 box-shadow: 0 8px 24px rgba(255, 105, 180, 0.15);
                 transition: transform 0.3s ease;
             }
            
            .qr-code-image:hover {
                transform: scale(1.05);
            }
            
            .qr-code-text {
                 font-size: 15px;
                 background: linear-gradient(135deg, #FF69B4, #DA70D6);
                 -webkit-background-clip: text;
                 -webkit-text-fill-color: transparent;
                 background-clip: text;
                 font-weight: 600;
                 margin: 0;
                 line-height: 1.4;
             }
             
             .rate-limit-content p {
                 margin: 0 0 24px 0;
                 color: #666;
                 font-size: 16px;
                 line-height: 1.5;
                 font-weight: 500;
             }
             
             .countdown-container {
                 background: linear-gradient(135deg, rgba(255, 182, 193, 0.08) 0%, rgba(218, 112, 214, 0.08) 100%);
                 border-radius: 16px;
                 padding: 20px;
                 border: 1px solid rgba(255, 182, 193, 0.2);
                 backdrop-filter: blur(5px);
             }
             
             .countdown-label {
                 font-size: 15px;
                 color: #888;
                 margin-bottom: 12px;
                 font-weight: 500;
             }
             
             .countdown-timer {
                 font-size: 28px;
                 font-weight: 700;
                 background: linear-gradient(135deg, #FF69B4, #DA70D6);
                 -webkit-background-clip: text;
                 -webkit-text-fill-color: transparent;
                 background-clip: text;
                 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
                 letter-spacing: 2px;
                 text-shadow: 0 2px 4px rgba(255, 105, 180, 0.1);
             }
            
            .rate-limit-footer {
                padding: 24px 32px 32px;
                text-align: center;
                border-top: none;
                background: transparent;
            }
            
            .rate-limit-close {
                background: linear-gradient(135deg, #FF69B4, #DA70D6);
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 25px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 6px 20px rgba(255, 105, 180, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .rate-limit-close::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }
            
            .rate-limit-close:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
            }
            
            .rate-limit-close:hover::before {
                left: 100%;
            }
            
            .rate-limit-close:active {
                transform: translateY(0);
            }
            
            .remaining-messages {
                display: none !important;
            }
            
            /* 移动端适配 */
            @media (max-width: 768px) {
                .rate-limit-modal {
                    max-width: 95%;
                    margin: 20px;
                }
                
                .rate-limit-header {
                    padding: 24px 20px 12px;
                }
                
                .rate-limit-content {
                    padding: 12px 20px 24px;
                }
                
                .rate-limit-footer {
                    padding: 20px 20px 24px;
                }
                
                .qr-code-image {
                     width: 200px;
                     height: 150px;
                 }
                
                .countdown-timer {
                    font-size: 24px;
                }
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
        const totalDuration = 3 * 60 * 1000; // 3分钟总时长
        
        const updateCountdown = () => {
            const now = new Date();
            const diff = resetTime - now;

            if (diff <= 0) {
                // 时间到了，重置消息计数
                this.resetMessageCount();
                this.closeModal();
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

    // 重置消息计数
    resetMessageCount() {
        if (!this.userIP) return;
        
        const now = Date.now();
        const data = this.getStoredData();
        
        if (data[this.userIP]) {
            data[this.userIP].count = 0;
            data[this.userIP].lastReset = now;
            // 清除保存的重置时间，下次达到限制时重新计算
            delete data[this.userIP].resetTime;
        }
        
        this.saveStoredData(data);
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

    // 更新剩余次数显示 - 已禁用
    updateRemainingCount() {
        // 移除剩余次数显示功能
        const indicator = document.getElementById('remainingMessages');
        if (indicator) {
            indicator.remove();
        }
        // 不再显示剩余次数提示
        return;
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