// 消息速率限制器
class MessageRateLimiter {
    constructor() {
        this.storageKey = 'message_rate_limit';
        this.defaultMaxMessages = 20; // 默认对话模式限制
        this.deepseekMaxMessages = 10; // DeepSeek模式限制
        this.userIP = null;
        this.isInitialized = false;
        this.init();
    }

    // 获取当前消息限制
    getCurrentMaxMessages() {
        // 检查是否使用DeepSeek模型
        if (typeof window !== 'undefined' && window.useDeepseekModel) {
            return this.deepseekMaxMessages;
        }
        return this.defaultMaxMessages;
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
        if (!this.isInitialized) {
            return true; // 如果还未初始化，允许发送
        }
        
        const data = this.getStoredData();
        const now = Date.now();
        const currentMaxMessages = this.getCurrentMaxMessages();
        
        if (!data[this.userIP]) {
            data[this.userIP] = {
                count: 0,
                lastReset: now,
                firstMessage: now
            };
        }
        
        // 不自动重置，只有达到限制后通过倒计时手动重置
        
        // 检查是否超过限制
        if (data[this.userIP].count >= currentMaxMessages) {
            // 显示限制弹窗
            this.showRateLimitModal();
            return false;
        }
        
        return true;
    }

    // 记录新消息
    recordMessage() {
        if (!this.isInitialized) {
            return true;
        }
        
        const now = Date.now();
        const data = this.getStoredData();
        const currentMaxMessages = this.getCurrentMaxMessages();
        
        if (!data[this.userIP]) {
            data[this.userIP] = {
                count: 0,
                lastReset: now,
                firstMessage: now
            };
        }
        
        // 不自动重置，只有达到限制后通过倒计时手动重置
        
        // 检查是否超过限制
        if (data[this.userIP].count >= currentMaxMessages) {
            return false;
        }
        
        data[this.userIP].count++;
        data[this.userIP].lastMessage = now;
        
        this.saveStoredData(data);
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
    cleanupExpiredData() {
        const data = this.getStoredData();
        const now = Date.now();
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        
        Object.keys(data).forEach(ip => {
            if (now - data[ip].lastReset > threeDays) {
                delete data[ip];
            }
        });
        
        this.saveStoredData(data);
    }

    // 获取剩余消息数
    getRemainingMessages() {
        if (!this.isInitialized) {
            return this.getCurrentMaxMessages();
        }
        
        const data = this.getStoredData();
        const currentMaxMessages = this.getCurrentMaxMessages();
        
        if (!data[this.userIP]) {
            return currentMaxMessages;
        }
        
        return Math.max(0, currentMaxMessages - data[this.userIP].count);
    }

    // 获取重置时间（3分钟后）
    getResetTime() {
        if (!this.isInitialized) {
            const now = new Date();
            return new Date(now.getTime() + 3 * 60 * 1000);
        }
        
        const data = this.getStoredData();
        
        if (!data[this.userIP] || !data[this.userIP].resetTime) {
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
        // 防止重复显示
        if (document.querySelector('.rate-limit-overlay')) {
            return;
        }

        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'rate-limit-overlay';
        modal.innerHTML = `
            <div class="rate-limit-modal">
                <div class="rate-limit-header">
                    <h3>🚀 消息次数已用完</h3>
                </div>
                <div class="rate-limit-content">
                    <div class="qr-code-container">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij7mianlsZXnoIHkuoznu7TnoIE8L3RleHQ+Cjwvc3ZnPg==" alt="二维码" class="qr-code-image">
                        <p class="qr-code-text">扫码关注公众号获取更多次数</p>
                    </div>
                    <p>您今日的消息次数已用完，请关注公众号获取更多使用次数，或等待重置。</p>
                    <div class="countdown-container">
                        <div class="countdown-label">距离重置还有：</div>
                        <div class="countdown-timer" id="countdown-timer">03:00:00</div>
                    </div>
                </div>
                <div class="rate-limit-footer">
                    <button class="rate-limit-close" onclick="rateLimiter.closeModal()">我知道了</button>
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
                background: rgba(0, 0, 0, 0.8);
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 450px;
                width: 90%;
                animation: slideIn 0.4s ease;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.2);
                  position: relative;
              }
            
            .rate-limit-modal::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd);
                background-size: 400% 400%;
                opacity: 0.1;
                animation: gradientShift 3s ease infinite;
            }
            
            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            .rate-limit-header {
                padding: 30px 30px 15px;
                text-align: center;
                border-bottom: none;
            }
            
            .rate-limit-header h3 {
                margin: 0;
                color: white;
                font-size: 24px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(255, 105, 180, 0.1);
            }
            
            .rate-limit-content {
                padding: 15px 30px 30px;
                text-align: center;
            }
            
            .qr-code-container {
                margin: 20px 0;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                overflow: hidden;
            }
            
            .qr-code-container::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transform: rotate(45deg);
                animation: shimmer 2s infinite;
                opacity: 0.1;
            }
            
            .qr-code-image {
                width: 180px;
                height: 180px;
                border-radius: 10px;
                background: white;
                padding: 10px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.3);
                  transition: transform 0.3s ease;
              }
            
            .qr-code-image:hover {
                transform: scale(1.05);
            }
            
            .qr-code-text {
                margin: 15px 0 0 0;
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                  line-height: 1.4;
              }
              
              .rate-limit-content p {
                  color: rgba(255, 255, 255, 0.9);
                  margin: 20px 0;
                  line-height: 1.6;
                  font-weight: 500;
              }
              
              .countdown-container {
                  margin: 25px 0;
                  padding: 20px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 15px;
                  backdrop-filter: blur(5px);
              }
              
              .countdown-label {
                  color: rgba(255, 255, 255, 0.8);
                  font-size: 14px;
                  margin-bottom: 10px;
                  font-weight: 500;
              }
              
              .countdown-timer {
                  color: #fff;
                  font-size: 28px;
                  font-weight: 700;
                  font-family: 'Courier New', monospace;
                  letter-spacing: 2px;
                  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  text-shadow: 0 2px 4px rgba(255, 105, 180, 0.1);
              }
            
            .rate-limit-footer {
                padding: 0 30px 30px;
                text-align: center;
                background: transparent;
            }
            
            .rate-limit-close {
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
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
            @media (max-width: 480px) {
                .rate-limit-modal {
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
                      width: 150px;
                      height: 150px;
                  }
                
                .countdown-timer {
                    font-size: 24px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // 禁止页面滚动
        document.body.style.overflow = 'hidden';
        
        // 启动倒计时
        this.startCountdown();
    }

    // 启动倒计时
    startCountdown() {
        const resetTime = this.getResetTime();
        const timerElement = document.getElementById('countdown-timer');
        
        if (!timerElement) return;
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const diff = resetTime.getTime() - now;
            
            if (diff <= 0) {
                this.resetMessageCount();
                this.closeModal();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            if (timerElement) {
                timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };

        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    // 重置消息计数
    resetMessageCount() {
        if (!this.isInitialized) {
            return;
        }
        
        const data = this.getStoredData();
        
        if (data[this.userIP]) {
            data[this.userIP].count = 0;
            data[this.userIP].lastReset = Date.now();
            delete data[this.userIP].resetTime;
        }
        
        this.saveStoredData(data);
    }

    // 关闭弹窗
    closeModal() {
        const modal = document.querySelector('.rate-limit-overlay');
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
        // 移除所有剩余次数指示器
        const indicator = document.querySelector('.remaining-messages');
        if (indicator) {
            indicator.remove();
        }
        // 不再显示剩余次数提示
        return;
    }

    // 拦截发送消息的函数
    interceptSendMessage() {
        // 拦截按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.matches('.send-button, .action-button, [onclick*="sendMessage"]')) {
                if (!this.checkRateLimit()) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        }, true);
        
        // 拦截表单提交
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                if (!this.checkRateLimit()) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        }, true);
        
        // 拦截回车键发送
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                if (target.matches('input[type="text"], textarea')) {
                    if (!this.checkRateLimit()) {
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
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        rateLimiter.interceptSendMessage();
        rateLimiter.updateRemainingCount();
    }, 1000);
});