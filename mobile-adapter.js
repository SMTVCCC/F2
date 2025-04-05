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
            this.applyMobileStyles();
            this.setupMobileLayout();
            this.setupTouchEvents();
            this.handleSidebarToggle();
            this.hideQuickActions();
            this.disableZoomAndScroll();
            this.fixMenuItemClicks();
            this.addWelcomeQuickStartClickHandler();
            this.fixKeyboardIssues();
        }
    },

    // 应用移动设备样式
    applyMobileStyles() {
        document.body.classList.add('mobile-device');
        
        // 添加移动设备专用样式
        const mobileStyles = `
            .mobile-device .sidebar {
                position: fixed;
                left: 0;
                top: 0;
                bottom: 0;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            }

            .mobile-device .sidebar.collapsed {
                left: -240px;
                box-shadow: none;
            }

            .mobile-device .main-content {
                margin-left: 0;
                width: 100%;
                height: 100vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .mobile-device .chat-messages {
                padding: 10px;
                flex: 1;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }

            .mobile-device .message {
                max-width: 95%;
            }

            .mobile-device .message-content {
                font-size: 14px;
                padding: 10px;
            }

            .mobile-device .input-area {
                padding: 10px;
                position: sticky;
                bottom: 0;
                background: white;
                z-index: 10;
                border-top: 1px solid #e0e0e0;
            }

            .mobile-device .input-container {
                padding: 8px;
            }

            .mobile-device #messageInput {
                font-size: 16px;
            }

            .mobile-device .bottom-buttons {
                flex-wrap: wrap;
                gap: 5px;
            }

            .mobile-device .model-button {
                font-size: 12px;
                padding: 4px 8px;
                min-width: 60px;
            }

            .mobile-device .code-block {
                margin: 5px 0;
            }

            .mobile-device .code-block pre {
                padding: 10px;
                font-size: 12px;
            }

            /* 隐藏原有菜单切换按钮的样式，使用我们的CSS来控制 */
            .mobile-device .menu-toggle {
                display: none !important;
            }
            
            /* 确保移动端菜单按钮可见 */
            .mobile-device .toggle-sidebar {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* 隐藏快捷功能区 */
            .mobile-device .quick-actions {
                display: none !important;
            }
            
            /* 固定整体布局 */
            .mobile-device .chat-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
            }
            
            /* 针对安卓设备的特殊处理 */
            .android-device .chat-messages {
                -webkit-overflow-scrolling: touch;
                overflow-y: auto !important;
                position: relative;
                z-index: 1;
            }
            
            .android-device .input-area {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                z-index: 2;
                padding-bottom: env(safe-area-inset-bottom, 10px);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = mobileStyles;
        document.head.appendChild(styleSheet);
        
        // 为安卓设备添加特定类
        if (this.isAndroid()) {
            document.body.classList.add('android-device');
        }
    },

    // 设置移动端布局
    setupMobileLayout() {
        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        // 设置遮罩层样式
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
            sidebar.classList.add('collapsed');
            overlay.classList.remove('show');
        });
    },

    // 处理侧边栏切换按钮
    handleSidebarToggle() {
        const toggleButton = document.getElementById('toggleSidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if(toggleButton) {
            // 重设切换按钮点击事件
            const originalClickHandler = toggleButton.onclick;
            toggleButton.onclick = function(e) {
                // 调用原始切换函数
                if(originalClickHandler) {
                    originalClickHandler.call(this, e);
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

    // 设置触摸事件
    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;

        // 监听触摸开始事件
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        // 监听触摸结束事件
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });
        
        // 防止双指缩放
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    },

    // 处理滑动手势
    handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');

        // 从左向右滑动显示菜单
        if (swipeDistance > 50 && touchStartX < 30) {
            sidebar.classList.remove('collapsed');
            overlay.classList.add('show');
        }
        // 从右向左滑动隐藏菜单
        else if (swipeDistance < -50 && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            overlay.classList.remove('show');
        }
    },
    
    // 隐藏快捷操作按钮
    hideQuickActions() {
        const quickActions = document.querySelector('.quick-actions');
        if (quickActions) {
            quickActions.style.display = 'none';
        }
    },
    
    // 禁止缩放和滚动
    disableZoomAndScroll() {
        // 更新meta viewport标签，禁止缩放
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport) {
            metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
        
        // 禁止body滚动，只允许聊天区域滚动
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.height = '100%';
        document.body.style.width = '100%';
        
        // 防止页面弹性滚动(橡皮筋效果)，特别是在iOS上
        document.addEventListener('touchmove', (e) => {
            const chatMessages = document.querySelector('.chat-messages');
            const target = e.target;
            
            // 检查是否是可滚动元素或其子元素
            let isScrollable = false;
            if (chatMessages && (chatMessages.contains(target) || target === chatMessages)) {
                isScrollable = true;
                
                // 检查是否已经滚动到顶部或底部边界
                if (chatMessages.scrollTop === 0 && e.touches[0].clientY > 50) {
                    // 已经在顶部并且向下拉动，阻止默认行为以避免整页滚动
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                } else if ((chatMessages.scrollTop + chatMessages.clientHeight) >= chatMessages.scrollHeight && e.touches[0].clientY < window.innerHeight - 50) {
                    // 已经在底部并且向上拉动，阻止默认行为以避免整页滚动
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
            }
            
            // 在不可滚动区域阻止默认滚动行为
            if (!isScrollable && e.cancelable) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 特别针对安卓浏览器的额外处理
        if (this.isAndroid()) {
            const chatMessages = document.querySelector('.chat-messages');
            const inputArea = document.querySelector('.input-area');
            
            if (chatMessages && inputArea) {
                // 确保聊天区域可滚动
                chatMessages.style.webkitOverflowScrolling = 'touch';
                chatMessages.style.overflowY = 'auto';
                
                // 安卓浏览器额外修复
                // 防止输入框获取焦点时页面被键盘顶起导致布局问题
                const fixAndroidKeyboard = () => {
                    // 调整聊天区域高度，留出空间给输入区域
                    const inputHeight = inputArea.offsetHeight;
                    const windowHeight = window.innerHeight;
                    chatMessages.style.height = `${windowHeight - inputHeight}px`;
                    
                    // 滚动到底部
                    setTimeout(() => {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 100);
                };
                
                // 输入框获得焦点时调整布局
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.addEventListener('focus', fixAndroidKeyboard);
                    messageInput.addEventListener('blur', fixAndroidKeyboard);
                }
                
                // 监听安卓键盘弹出事件（通过窗口大小变化检测）
                let windowHeight = window.innerHeight;
                window.addEventListener('resize', () => {
                    // 检测键盘是否弹出（当前高度明显小于原始高度）
                    if (window.innerHeight < windowHeight * 0.8) {
                        // 键盘弹出时
                        document.body.classList.add('keyboard-open');
                        // 确保输入区域可见
                        if (messageInput && document.activeElement === messageInput) {
                            setTimeout(() => {
                                messageInput.scrollIntoView(false);
                            }, 300);
                        }
                    } else {
                        // 键盘收起时
                        document.body.classList.remove('keyboard-open');
                    }
                    
                    fixAndroidKeyboard();
                });
                
                // 初始化时修复一次
                fixAndroidKeyboard();
            }
            
            // 针对一些特定安卓浏览器（如三星浏览器）的额外修复
            const isSpecificAndroidBrowser = /SamsungBrowser|UCBrowser|MiuiBrowser/i.test(navigator.userAgent);
            if (isSpecificAndroidBrowser) {
                document.body.classList.add('specific-android-browser');
                
                // 添加特定安卓浏览器的样式修复
                const specificAndroidStyles = `
                    .specific-android-browser .chat-messages {
                        height: calc(100vh - 120px) !important;
                        -webkit-overflow-scrolling: touch;
                    }
                    
                    .specific-android-browser.keyboard-open .chat-messages {
                        height: calc(60vh) !important;
                    }
                    
                    .specific-android-browser .input-area {
                        position: fixed !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        z-index: 100 !important;
                    }
                `;
                
                const styleSheet = document.createElement('style');
                styleSheet.textContent = specificAndroidStyles;
                document.head.appendChild(styleSheet);
            }
        }
    },

    // 修复菜单项点击后自动收回侧边栏
    fixMenuItemClicks() {
        // 为所有菜单项添加点击事件，点击后关闭侧边栏
        const menuItems = document.querySelectorAll('.menu-item');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        menuItems.forEach(item => {
            const originalClickHandler = item.onclick;
            
            item.addEventListener('click', function(e) {
                // 调用原始点击事件（如果有）
                if(originalClickHandler) {
                    originalClickHandler.call(this, e);
                }
                
                // 点击后收起侧边栏
                if(sidebar && overlay && MobileAdapter.isMobile()) {
                    sidebar.classList.add('collapsed');
                    overlay.classList.remove('show');
                }
            });
        });
    },
    
    // 添加欢迎卡片快速启动项点击事件处理
    addWelcomeQuickStartClickHandler() {
        // 为欢迎卡片中的快速启动项添加点击事件
        const quickstartItems = document.querySelectorAll('.quickstart-item');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        quickstartItems.forEach(item => {
            item.addEventListener('click', function() {
                // 如果侧边栏展开，则收起
                if(sidebar && overlay && MobileAdapter.isMobile() && !sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                    overlay.classList.remove('show');
                }
            });
        });
    },
    
    // 修复键盘相关问题
    fixKeyboardIssues() {
        const messageInput = document.getElementById('messageInput');
        const chatMessages = document.querySelector('.chat-messages');
        const inputArea = document.querySelector('.input-area');
        
        if (!messageInput || !chatMessages || !inputArea) return;
        
        // 修复输入框在键盘弹出时的布局问题
        messageInput.addEventListener('focus', () => {
            // 添加键盘弹出标记类
            document.body.classList.add('keyboard-open');
            
            // 设置定时器确保输入区域在键盘弹出后可见
            setTimeout(() => {
                // 滚动到输入框位置
                messageInput.scrollIntoView(false);
                // 确保输入区域可见
                inputArea.style.position = 'fixed';
                inputArea.style.bottom = '0';
                inputArea.style.left = '0';
                inputArea.style.right = '0';
                inputArea.style.zIndex = '100';
                
                // 确保聊天区域不被输入区域遮挡
                chatMessages.style.paddingBottom = `${inputArea.offsetHeight}px`;
            }, 300);
        });
        
        // 键盘收起处理
        messageInput.addEventListener('blur', () => {
            // 移除键盘弹出标记
            document.body.classList.remove('keyboard-open');
            
            // 还原输入区域样式
            setTimeout(() => {
                // 如果是安卓设备，保持fixed定位避免布局跳动
                if (this.isAndroid()) {
                    inputArea.style.position = 'fixed';
                } else {
                    inputArea.style.position = 'sticky';
                }
                
                // 重置聊天区域内边距
                chatMessages.style.paddingBottom = '';
                
                // 延迟滚动到底部
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 100);
            }, 300);
        });
        
        // 处理窗口大小改变事件(包括键盘弹出/收起)
        window.addEventListener('resize', () => {
            // 修复视口高度问题
            document.documentElement.style.height = `${window.innerHeight}px`;
            document.body.style.height = `${window.innerHeight}px`;
            
            // 如果键盘打开状态，确保输入框可见
            if (document.body.classList.contains('keyboard-open') && document.activeElement === messageInput) {
                setTimeout(() => {
                    messageInput.scrollIntoView(false);
                }, 100);
            }
        });
        
        // 立即设置视口高度
        document.documentElement.style.height = `${window.innerHeight}px`;
        document.body.style.height = `${window.innerHeight}px`;
    }
};

// 页面加载完成后初始化移动设备适配
document.addEventListener('DOMContentLoaded', () => {
    MobileAdapter.init();
});