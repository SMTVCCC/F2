/**
 * 页面自动刷新与状态管理脚本
 * 用于确保页面刷新时正确保存和恢复会话状态
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[auto-refresh.js] 初始化页面状态管理');
    
    // 上次会话时间检查
    const lastSessionTime = localStorage.getItem('lastSessionTime');
    const currentTime = Date.now();
    
    // 如果上次会话时间存在且距离现在小于1小时，认为是同一会话的刷新
    if (lastSessionTime && (currentTime - parseInt(lastSessionTime)) < 3600000) {
        console.log('[auto-refresh.js] 检测到页面刷新，尝试恢复状态');
        
        // 尝试恢复输入框内容
        try {
            const savedInput = localStorage.getItem('pendingInput');
            if (savedInput) {
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = savedInput;
                    console.log('[auto-refresh.js] 已恢复输入框内容');
                }
                // 恢复后清除，防止下次无意中恢复
                localStorage.removeItem('pendingInput');
            }
        } catch (error) {
            console.error('[auto-refresh.js] 恢复输入框内容失败:', error);
        }
    }
    
    // 更新会话时间
    localStorage.setItem('lastSessionTime', currentTime.toString());
    
    // 在页面即将卸载时保存状态
    window.addEventListener('beforeunload', function() {
        // 保存输入框内容
        try {
            const messageInput = document.getElementById('messageInput');
            if (messageInput && messageInput.value.trim()) {
                localStorage.setItem('pendingInput', messageInput.value);
                console.log('[auto-refresh.js] 已保存输入框内容');
            }
        } catch (error) {
            console.error('[auto-refresh.js] 保存输入框内容失败:', error);
        }
    });
}); 