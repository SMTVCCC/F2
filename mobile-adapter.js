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
        }
    },

    // 应用移动设备样式
    applyMobileStyles() {
        document.body.classList.add('mobile-device');
        
        // 添加移动设备专用样式
        const mobileStyles = `
            .mobile-device .sidebar {
                position: fixed;
                left: -280px;
                top: 0;
                bottom: 0;
                z-index: 1000;
                transition: left 0.3s ease;
            }

            .mobile-device .sidebar.show {
                left: 0;
            }

            .mobile-device .main-content {
                margin-left: 0;
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

            .mobile-device .menu-toggle {
                display: block;
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 1001;
                background: #FFB6C1;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = mobileStyles;
        document.head.appendChild(styleSheet);
    },

    // 设置移动端布局
    setupMobileLayout() {
        // 创建菜单切换按钮
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(menuToggle);

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

        // 绑定菜单切换事件
        menuToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });

        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
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
            sidebar.classList.add('show');
            overlay.classList.add('show');
        }
        // 从右向左滑动隐藏菜单
        else if (swipeDistance < -50 && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
    }
};

// 页面加载完成后初始化移动设备适配
document.addEventListener('DOMContentLoaded', () => {
    MobileAdapter.init();
});