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

            // 移动端默认侧边栏收起
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.add('collapsed');
            }
            
            // 隐藏侧边栏展开按钮
            const toggleButton = document.getElementById('toggleSidebar');
            if (toggleButton) {
                toggleButton.style.display = 'none';
            }

            this.setupMobileLayout(); // 保持遮罩层逻辑
            // this.setupTouchEvents(); // 移除，因为阻止缩放的代码已被注释
            this.handleSidebarToggle(); // 保持侧边栏切换逻辑
            this.fixMenuItemClicks(); // 保持菜单项点击修复
            this.fixKeyboardIssues(); // 保持键盘问题修复
            this.setupSimpleWelcomeBar(); // 添加处理简化欢迎栏的方法
            this.optimizeBottomButtons(); // 优化底部按钮区域
        }
    },

    // 设置移动端布局 (只保留遮罩层逻辑)
    setupMobileLayout() {
        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        // 添加小菜单按钮在顶部
        const mobileMenuButton = document.createElement('button');
        mobileMenuButton.className = 'mobile-menu-button';
        mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        document.querySelector('.main-content').insertBefore(mobileMenuButton, document.querySelector('.main-content').firstChild);
        
        // 设置菜单按钮点击事件
        mobileMenuButton.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
                if (!sidebar.classList.contains('collapsed')) {
                    overlay.classList.add('show');
                } else {
                    overlay.classList.remove('show');
                }
            }
        });

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
            .mobile-menu-button {
                position: fixed;
                top: 15px;
                left: 15px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: white;
                border: none;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                cursor: pointer;
                color: #FF69B4;
                font-size: 18px;
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = overlayStyles;
        document.head.appendChild(styleSheet);

        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
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
                // 键盘弹出时
                 inputArea.style.position = 'fixed';
                 inputArea.style.bottom = '0';
                 inputArea.style.left = '0';
                 inputArea.style.right = '0';
                 inputArea.style.zIndex = '100';
                 
                 // 确保输入区域不会被键盘遮挡，给聊天内容区域添加底部间距
                 const inputAreaHeight = inputArea.offsetHeight;
                 chatMessages.style.paddingBottom = `${inputAreaHeight + 20}px`;
                 
                 // 添加过渡效果
                 inputArea.style.transition = 'all 0.3s ease';
                 
                 // 滚动到输入框，确保用户看到输入内容
                 setTimeout(() => {
                     messageInput.scrollIntoView({behavior: 'smooth', block: 'center'});
                 }, 300);
             } else {
                 // 键盘收起时
                 inputArea.style.position = 'relative';
                 inputArea.style.transition = 'none'; // 移除过渡效果，避免收起时的动画问题
                 chatMessages.style.paddingBottom = '30px';
                 
                 // 恢复滚动位置
                 setTimeout(() => {
                     const lastMessage = document.querySelector('.chat-messages .message:last-child');
                     if (lastMessage) {
                         lastMessage.scrollIntoView({behavior: 'smooth', block: 'nearest'});
                     }
                 }, 100);
             }
        }

        messageInput.addEventListener('focus', () => {
             // 立即调整布局
            adjustLayoutForKeyboard(true); 
        });
        
        messageInput.addEventListener('blur', () => {
             // 延迟处理键盘收起
            setTimeout(() => adjustLayoutForKeyboard(false), 200);
        });
        
        // 监听窗口大小变化来检测键盘状态
        window.addEventListener('resize', () => {
            const currentWindowHeight = window.innerHeight;
            const isKeyboardLikelyOpen = currentWindowHeight < initialWindowHeight * 0.75; // 更敏感的阈值
            
            if (document.activeElement === messageInput) {
               adjustLayoutForKeyboard(isKeyboardLikelyOpen);
            }
        });

        // 确保文本区域高度自适应
        messageInput.addEventListener('input', function() {
            // 首先将高度设为自动，以便正确计算
            this.style.height = 'auto';
            // 然后设置为实际内容高度
            this.style.height = (this.scrollHeight) + 'px';
            // 限制最大高度
            if (this.scrollHeight > 120) {
                this.style.height = '120px';
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });

        // 初始设置高度
        document.documentElement.style.height = `${window.innerHeight}px`;
        document.body.style.height = `${window.innerHeight}px`;
    },

    // 设置移动端简化欢迎栏
    setupSimpleWelcomeBar() {
        // 获取欢迎卡片
        const welcomeCard = document.querySelector('.welcome-card');
        
        if (welcomeCard) {
            // 确保CSS中的样式能正确应用
            welcomeCard.classList.add('mobile-welcome');
            
            // 如果需要动态修改欢迎卡片的内容，可以在这里进行
            // 比如可以简化欢迎信息或者修改某些元素
            
            // 获取欢迎卡片中的文本内容
            const welcomeText = welcomeCard.querySelector('.welcome-text');
            if (welcomeText) {
                welcomeText.textContent = '我是您的AI助手，可以帮您解答问题、创作内容和编写代码。';
            }
            
            // 优化移动端的欢迎卡片交互
            welcomeCard.addEventListener('click', function() {
                // 点击欢迎卡片后，可以聚焦到输入框
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.focus();
                }
            });
        }
    },

    // 优化底部按钮区域布局
    optimizeBottomButtons() {
        const bottomButtons = document.querySelector('.bottom-buttons');
        if (!bottomButtons) return;
        
        // 标记为已处理
        bottomButtons.classList.add('processed');
        
        // 获取所有模型按钮
        const modelButtons = Array.from(bottomButtons.querySelectorAll('.model-button'));
        // 获取右侧按钮区域
        const rightButtons = bottomButtons.querySelector('.right-buttons');
        
        // 创建一个包含模型按钮的容器
        const modelButtonsRow = document.createElement('div');
        modelButtonsRow.className = 'model-buttons-row';
        
        // 清空底部按钮容器
        while (bottomButtons.firstChild) {
            bottomButtons.removeChild(bottomButtons.firstChild);
        }
        
        // 将所有模型按钮添加到模型按钮行
        modelButtons.forEach(button => {
            modelButtonsRow.appendChild(button);
        });
        
        // 将模型按钮行和右侧按钮区域添加到底部按钮容器
        bottomButtons.appendChild(modelButtonsRow);
        if (rightButtons) {
            bottomButtons.appendChild(rightButtons);
        }
    }
};

// 页面加载完成后初始化移动设备适配
document.addEventListener('DOMContentLoaded', () => {
    MobileAdapter.init();
});