// 设备检测函数
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

// 移动端适配初始化
function initMobileAdapter() {
    const isMobile = isMobileDevice();
    document.body.classList.toggle('mobile-device', isMobile);

    if (isMobile) {
        setupMobileUI();
        setupMobileEvents();
    }
}

// 设置移动端UI
function setupMobileUI() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const menuToggle = document.createElement('button');
    
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.insertBefore(menuToggle, document.body.firstChild);

    // 默认隐藏侧边栏
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');

    // 调整输入区域
    adjustInputArea();
}

// 设置移动端事件处理
function setupMobileEvents() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // 点击主内容区域时收起侧边栏
    mainContent.addEventListener('click', () => {
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    });

    // 处理触摸事件
    setupTouchEvents();
}

// 调整输入区域
function adjustInputArea() {
    const inputArea = document.querySelector('.input-area');
    const messageInput = document.querySelector('#messageInput');

    // 监听输入框高度变化
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
}

// 设置触摸事件
function setupTouchEvents() {
    const chatMessages = document.querySelector('.chat-messages');
    let touchStartY = 0;

    chatMessages.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    chatMessages.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const scrollTop = chatMessages.scrollTop;
        
        // 防止下拉刷新
        if (scrollTop === 0 && touchY > touchStartY) {
            e.preventDefault();
        }
    });
}

// 页面加载完成后初始化移动端适配
document.addEventListener('DOMContentLoaded', initMobileAdapter);

// 监听窗口大小变化
window.addEventListener('resize', initMobileAdapter);