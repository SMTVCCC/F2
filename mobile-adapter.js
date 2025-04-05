// 移动设备适配器
const MobileAdapter = {
    // 检测是否为移动设备
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // 检测是否为安卓设备
    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    },

    // 初始化移动设备适配
    init() {
        if (this.isMobile()) {
            // 添加 mobile-device 和 android-device (如果适用) 类到 body
            document.body.classList.add('mobile-device');
            if (this.isAndroid()) {
                document.body.classList.add('android-device');
            }

            this.setupMobileLayout(); // 保持遮罩层逻辑
            // this.setupTouchEvents(); // 移除，因为阻止缩放的代码已被注释
            this.handleSidebarToggle(); // 保持侧边栏切换逻辑
            this.fixMenuItemClicks(); // 保持菜单项点击修复
            this.fixKeyboardIssues(); // 保持键盘问题修复
        }
    },

    // 设置移动端布局 (只保留遮罩层逻辑)
    setupMobileLayout() {
        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        // 设置遮罩层样式 (可以考虑也移到CSS)
        const overlayStyles = `
            .mobile-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 999;
            }
            .mobile-overlay.show {
                display: block;
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = overlayStyles;
        document.head.appendChild(styleSheet);

        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar && overlay) { // 添加空检查
                sidebar.classList.add('collapsed');
                overlay.classList.remove('show');
            }
        });
    },

    // 处理侧边栏切换按钮
    handleSidebarToggle() {
        const toggleButton = document.getElementById('toggleSidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if(toggleButton && sidebar && overlay) { // 添加空检查
            const originalClickHandler = toggleButton.onclick;
            toggleButton.onclick = function(e) {
                // 调用原始切换函数（如果存在）
                if(typeof originalClickHandler === 'function') {
                    originalClickHandler.call(this, e);
                } else { // 否则，执行默认切换
                    sidebar.classList.toggle('collapsed');
                }
                
                // 移动端特有的处理
                if(MobileAdapter.isMobile()) {
                    if(sidebar.classList.contains('collapsed')) {
                        overlay.classList.remove('show');
                    } else {
                        overlay.classList.add('show');
                    }
                }
            };
        }
    },

    // 修复菜单项点击后自动收回侧边栏 (保持)
    fixMenuItemClicks() {
        const menuItems = document.querySelectorAll('.menu-item');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (!sidebar || !overlay) return; // 添加空检查

        menuItems.forEach(item => {
            // 移除旧的监听器以防重复添加
            const new_item = item.cloneNode(true);
            item.parentNode.replaceChild(new_item, item);
            
            const prompt = new_item.getAttribute('data-prompt');
            new_item.addEventListener('click', function(e) {
                // 处理 prompt
                 const messageInput = document.getElementById('messageInput');
                 if(messageInput && prompt) {
                     messageInput.value = prompt;
                     messageInput.focus();
                 }

                // 点击后收起侧边栏
                if(MobileAdapter.isMobile()) {
                    sidebar.classList.add('collapsed');
                    overlay.classList.remove('show');
                }
            });
        });
    },
    
    // 修复键盘相关问题 (保持并简化)
    fixKeyboardIssues() {
        const messageInput = document.getElementById('messageInput');
        const chatMessages = document.querySelector('.chat-messages');
        const inputArea = document.querySelector('.input-area');
        
        if (!messageInput || !chatMessages || !inputArea) return;
        
        let initialWindowHeight = window.innerHeight;

        const adjustLayoutForKeyboard = (isKeyboardOpen) => {
             document.body.classList.toggle('keyboard-open', isKeyboardOpen);
             if (isKeyboardOpen) {
                // 键盘弹出
                 inputArea.style.position = 'fixed';
                 inputArea.style.bottom = '0';
                 inputArea.style.left = '0';
                 inputArea.style.right = '0';
                 inputArea.style.zIndex = '100';
                 chatMessages.style.paddingBottom = `${inputArea.offsetHeight}px`;
                 // 尝试滚动到输入框
                 setTimeout(() => messageInput.scrollIntoView(false), 150); 
             } else {
                 // 键盘收起
                 inputArea.style.position = 'sticky'; // 恢复 sticky
                 inputArea.style.zIndex = '10';
                 chatMessages.style.paddingBottom = '';
             }
        }

        messageInput.addEventListener('focus', () => {
             // 立即调整一次布局可能有助于防止跳动
            adjustLayoutForKeyboard(true); 
        });
        
        messageInput.addEventListener('blur', () => {
             // 延迟一点时间来处理键盘收起
            setTimeout(() => adjustLayoutForKeyboard(false), 100);
        });
        
        // 监听窗口大小变化来检测键盘状态（更可靠的方式）
        window.addEventListener('resize', () => {
            const currentWindowHeight = window.innerHeight;
            // 简单检测：高度显著减小视为键盘弹出
            const isKeyboardLikelyOpen = currentWindowHeight < initialWindowHeight * 0.85;
            
            if (document.activeElement === messageInput) { // 仅当输入框聚焦时调整
               adjustLayoutForKeyboard(isKeyboardLikelyOpen);
            }
            // 更新初始高度以便下次比较（可选，可能在某些场景下有用）
            // initialWindowHeight = currentWindowHeight; 
        });

        // 初始设置高度
        document.documentElement.style.height = `${window.innerHeight}px`;
        document.body.style.height = `${window.innerHeight}px`;
    }
};

// 页面加载完成后初始化移动设备适配
document.addEventListener('DOMContentLoaded', () => {
    MobileAdapter.init();
});