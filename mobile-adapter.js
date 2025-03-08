// 移动设备适配器
const MobileAdapter = {
    // 检测是否为移动设备
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // 初始化移动设备适配
    init() {
        if (this.isMobile()) {
            this.applyMobileStyles();
            this.setupMobileLayout();
            this.setupTouchEvents();
            this.handleSidebarToggle();
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
            }

            .mobile-device .chat-messages {
                padding: 10px;
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
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = mobileStyles;
        document.head.appendChild(styleSheet);
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
    }
};

// 页面加载完成后初始化移动设备适配
document.addEventListener('DOMContentLoaded', () => {
    MobileAdapter.init();
});