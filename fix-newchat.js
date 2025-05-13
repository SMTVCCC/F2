/**
 * 新对话按钮修复脚本
 * 针对点击新对话按钮无响应的问题
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[fix-newchat.js] 初始化新对话按钮修复');
    
    // 获取新对话按钮
    const newChatButton = document.getElementById('newChat');
    
    if (newChatButton) {
        console.log('[fix-newchat.js] 找到新对话按钮，添加事件监听器');
        
        // 清除可能存在的冲突事件
        const newElement = newChatButton.cloneNode(true);
        if (newChatButton.parentNode) {
            newChatButton.parentNode.replaceChild(newElement, newChatButton);
        }
        
        // 添加多种事件监听方式，确保至少一种方式能正常工作
        
        // 方式1: 直接添加onclick属性
        newElement.onclick = function(e) {
            console.log('[fix-newchat.js] 新对话按钮被点击 (onclick)');
            e.preventDefault();
            createNewChatFixed();
            return false;
        };
        
        // 方式2: 使用addEventListener
        newElement.addEventListener('click', function(e) {
            console.log('[fix-newchat.js] 新对话按钮被点击 (addEventListener)');
            e.preventDefault();
            createNewChatFixed();
            e.stopPropagation();
        }, true);
        
        // 方式3: 通过HTML属性
        newElement.setAttribute('onclick', "createNewChatFixed(); return false;");
    } else {
        console.error('[fix-newchat.js] 未找到新对话按钮元素');
        
        // 尝试在页面加载后延迟查找并添加事件
        setTimeout(function() {
            const laterButton = document.getElementById('newChat') || document.querySelector('.new-chat');
            if (laterButton) {
                console.log('[fix-newchat.js] 延迟找到新对话按钮，添加事件监听器');
                laterButton.onclick = function() {
                    createNewChatFixed();
                    return false;
                };
            }
        }, 2000);
    }
    
    // 添加事件委托，以防元素被动态更改
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('#newChat, .new-chat');
        if (target) {
            console.log('[fix-newchat.js] 通过事件委托捕获新对话按钮点击');
            e.preventDefault();
            createNewChatFixed();
            e.stopPropagation();
        }
    });
});

/**
 * 修复的创建新对话函数
 * 使用多种可能的页面刷新方法，确保至少一种生效
 */
function createNewChatFixed() {
    console.log('[fix-newchat.js] 执行创建新对话函数');
    
    try {
        // 方法1: 直接使用location.reload()
        window.location.reload();
    } catch (error1) {
        console.error('[fix-newchat.js] 刷新方法1失败:', error1);
        
        try {
            // 方法2: 使用location.href重新导航
            window.location.href = window.location.href.split('#')[0];
        } catch (error2) {
            console.error('[fix-newchat.js] 刷新方法2失败:', error2);
            
            try {
                // 方法3: 使用history API
                window.history.go(0);
            } catch (error3) {
                console.error('[fix-newchat.js] 刷新方法3失败:', error3);
                
                // 方法4: 最后尝试直接设置location
                try {
                    document.location = document.location;
                } catch (error4) {
                    console.error('[fix-newchat.js] 所有刷新方法都失败');
                    alert('请手动刷新页面以创建新对话');
                }
            }
        }
    }
} 