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
            this.setupMobileEvents();
        }
    },

    // 应用移动设备样式
    applyMobileStyles() {
        document.body.classList.add('mobile-device');
        
        // 添加移动设备专属样式
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
                padding: 12px 15px;
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

            .mobile-device .menu-toggle {
                display: block;
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 1001;
                background: #FFB6C1;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            .mobile-device .overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 999;
            }

            .mobile-device .overlay.show {
                display: block;
            }
        `;

        // 添加样式到页面
        const styleElement = document.createElement('style');
        styleElement.textContent = mobileStyles;
        document.head.appendChild(styleElement);

        // 添加菜单切换按钮
        const menuButton = document.createElement('button');
        menuButton.className = 'menu-toggle';
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(menuButton);

        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    },

    // 设置移动设备事件处理
    setupMobileEvents() {
        const menuButton = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        const messageInput = document.querySelector('#messageInput');

        // 菜单切换
        menuButton.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });

        // 点击遮罩层关闭菜单
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });

        // 处理触摸事件
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchEndX - touchStartX;

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
        });

        // 优化移动设备输入体验
        messageInput.addEventListener('focus', () => {
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 300);
        });
    }
};

// 页面加载完成后初始化移动设备适配
document.addEventListener('DOMContentLoaded', () => {
    MobileAdapter.init();
});