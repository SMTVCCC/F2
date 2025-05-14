document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatHistory = document.getElementById('chatHistory');
    const newChatButton = document.getElementById('newChat');
    const sendButton = document.getElementById('sendButton');
    const contextToggle = document.getElementById('contextToggle');
    const copyButton = document.getElementById('copyButton');
    const cutButton = document.getElementById('cutButton');
    const clearHistoryButton = document.getElementById('clearHistory');
    const confirmDialog = document.getElementById('confirmDialog');
    const modalOverlay = document.getElementById('modalOverlay');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const perfectAnswerToggle = document.getElementById('perfectAnswerToggle');
    const logoImage = document.querySelector('.logo'); // 获取logo元素
    const easterEggAudio = document.getElementById('easterEggAudio'); // 获取音频元素

    // 添加logo点击彩蛋
    let isEasterEggActive = false;
    let easterEggOverlay = null;

    // 创建锁屏遮罩
    function createEasterEggOverlay() {
        easterEggOverlay = document.createElement('div');
        easterEggOverlay.className = 'easter-egg-overlay';
        easterEggOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 105, 180, 0.7);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.5s;
            pointer-events: all;
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            font-size: 32px;
            color: white;
            text-align: center;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
            margin-bottom: 20px;
            font-weight: bold;
        `;
        message.textContent = '发现彩蛋！';
        
        // 添加旋转的糖果图标
        const candyContainer = document.createElement('div');
        candyContainer.style.cssText = `
            font-size: 100px;
            display: flex;
            margin: 20px 0;
        `;
        
        // 添加多个旋转糖果
        for (let i = 0; i < 5; i++) {
            const candy = document.createElement('div');
            candy.textContent = '🍬';
            candy.style.cssText = `
                animation: rotateCandyEgg 2s infinite ${i * 0.2}s;
                margin: 0 10px;
            `;
            candyContainer.appendChild(candy);
        }
        
        // 倒计时文本
        const countdown = document.createElement('div');
        countdown.style.cssText = `
            font-size: 24px;
            color: white;
            margin-top: 20px;
        `;
        countdown.textContent = '屏幕锁定中...6秒';
        
        // 添加音频播放按钮（解决浏览器自动播放限制）
        const playButton = document.createElement('button');
        playButton.style.cssText = `
            margin-top: 20px;
            padding: 10px 20px;
            border: 2px solid white;
            background: rgba(255,255,255,0.2);
            color: white;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        `;
        playButton.textContent = '🔊 点击播放音效';
        playButton.addEventListener('click', function() {
            if (easterEggAudio) {
                easterEggAudio.currentTime = 0;
                easterEggAudio.volume = 0.8;
                easterEggAudio.play();
                this.textContent = '✓ 音效已播放';
                this.style.background = 'rgba(0,255,0,0.2)';
                this.style.borderColor = '#00FF00';
            }
        });
        
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rotateCandyEgg {
                0% { transform: rotate(0deg) scale(1); }
                25% { transform: rotate(90deg) scale(1.2); }
                50% { transform: rotate(180deg) scale(1); }
                75% { transform: rotate(270deg) scale(0.8); }
                100% { transform: rotate(360deg) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        easterEggOverlay.appendChild(message);
        easterEggOverlay.appendChild(candyContainer);
        easterEggOverlay.appendChild(countdown);
        easterEggOverlay.appendChild(playButton); // 添加播放按钮
        document.body.appendChild(easterEggOverlay);
        
        // 倒计时效果
        let secondsLeft = 6;
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                countdown.textContent = `屏幕锁定中...${secondsLeft}秒`;
            } else {
                clearInterval(countdownInterval);
                countdown.textContent = '解锁中...';
            }
        }, 1000);
        
        // 渐变显示
        setTimeout(() => {
            easterEggOverlay.style.opacity = '1';
        }, 10);
    }

    // 添加logo点击事件
    if (logoImage) {
        logoImage.style.cursor = 'pointer'; // 添加指针样式提示可点击
        logoImage.title = '试试连续点击3次...'; // 修改悬停提示
        
        // 检查是否已经触发过彩蛋（从localStorage读取状态）
        let hasTriggeredEasterEgg = localStorage.getItem('smtEasterEggTriggered') === 'true';
        
        // 如果已经触发过，修改提示
        if (hasTriggeredEasterEgg) {
            logoImage.title = '再次点击logo 3次可重置彩蛋'; 
        }
        
        // 添加悬停效果
        logoImage.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        logoImage.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        // 初始化音频（预加载）
        if (easterEggAudio) {
            // 确保音频元素正确配置
            easterEggAudio.preload = 'auto';
            easterEggAudio.volume = 0.8;
            
            // 添加音频事件监听器以便调试
            easterEggAudio.addEventListener('canplaythrough', () => {
                console.log('[调试] 音频文件已加载完成，可以播放');
            });
            
            easterEggAudio.addEventListener('error', (e) => {
                console.error('[错误] 音频加载失败:', e);
            });
            
            // 尝试预加载音频
            try {
                easterEggAudio.load();
            } catch (e) {
                console.error('[错误] 音频预加载失败:', e);
            }
        } else {
            console.error('[错误] 未找到音频元素!');
        }
        
        // 跟踪连续点击
        let clickCount = 0;
        let clickTimer = null;
        
        logoImage.addEventListener('click', function(e) {
            // 增加点击计数
            clickCount++;
            console.log('[调试] Logo被点击，当前点击次数:', clickCount);
            
            // 清除之前的计时器
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
            
            // 设置新的计时器，1.5秒内没有新的点击则重置计数
            clickTimer = setTimeout(() => {
                console.log('[调试] 点击超时，重置计数');
                clickCount = 0;
            }, 1500);
            
            // 只有达到3次点击才触发彩蛋
            if (clickCount < 3) {
                return;
            }
            
            // 重置点击计数
            clickCount = 0;
            
            // 如果已经触发过彩蛋，则重置状态并退出
            if (hasTriggeredEasterEgg) {
                localStorage.removeItem('smtEasterEggTriggered');
                hasTriggeredEasterEgg = false;
                logoImage.title = '试试连续点击3次...';
                
                return;
            }
            
            // 防止重复触发
            if (isEasterEggActive) return;
            isEasterEggActive = true;
            
            // 记录彩蛋已被触发
            localStorage.setItem('smtEasterEggTriggered', 'true');
            hasTriggeredEasterEgg = true;
            
            // 锁定整个界面的交互
            document.body.style.overflow = 'hidden'; // 禁止滚动
            
            // 创建一个透明遮罩，防止用户点击任何界面元素
            const interactionBlocker = document.createElement('div');
            interactionBlocker.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9998;
                cursor: not-allowed;
            `;
            document.body.appendChild(interactionBlocker);
            
            // 播放音频
            if (easterEggAudio) {
                console.log('[调试] 尝试播放音频');
                
                // 强制重新加载音频
                easterEggAudio.load();
                easterEggAudio.currentTime = 0; // 重置音频起始位置
                
                // 设置音量渐变
                easterEggAudio.volume = 0.8; // 直接设置较高音量
                
                // 使用新的方式强制播放音频
                const playPromise = easterEggAudio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('[调试] 音频播放成功');
                    }).catch(error => {
                        console.error('[错误] 音频播放失败:', error);
                        
                        // 尝试使用备用方法
                        setTimeout(() => {
                            try {
                                easterEggAudio.play();
                                console.log('[调试] 音频重试播放');
                            } catch (e) {
                                console.error('[错误] 音频重试失败:', e);
                            }
                        }, 500);
                    });
                }
            } else {
                console.error('[错误] 无法找到音频元素');
            }
            
            // 创建锁屏遮罩
            createEasterEggOverlay();
            
            // 创建提示文本反馈音频状态
            const audioStatus = document.createElement('div');
            audioStatus.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0,0,0,0.6);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10000;
            `;
            
            if (easterEggAudio && !easterEggAudio.paused) {
                audioStatus.textContent = '✓ 音频播放中';
            } else {
                audioStatus.textContent = '✗ 音频无法播放';
            }
            
            document.body.appendChild(audioStatus);
            
            // 6秒后移除遮罩并解除锁定
            setTimeout(() => {
                if (easterEggOverlay) {
                    easterEggOverlay.style.opacity = '0';
                    
                    // 音量渐出
                    if (easterEggAudio && !easterEggAudio.paused) {
                        const volumeFadeOut = setInterval(() => {
                            if (easterEggAudio.volume > 0.1) {
                                easterEggAudio.volume -= 0.1;
                            } else {
                                clearInterval(volumeFadeOut);
                                easterEggAudio.pause();
                            }
                        }, 100);
                    }
                    
                    setTimeout(() => {
                        if (easterEggOverlay) {
                            easterEggOverlay.remove();
                            easterEggOverlay = null;
                        }
                        // 移除交互阻止器和音频状态
                        interactionBlocker.remove();
                        if (audioStatus) audioStatus.remove();
                        // 恢复正常滚动
                        document.body.style.overflow = '';
                        isEasterEggActive = false;
                    }, 500);
                }
            }, 6000);
        });
    }

    // 调试信息：检查必要元素是否存在
    console.log('[调试] 发送按钮元素:', !!sendButton);
    console.log('[调试] 发送按钮HTML:', sendButton ? sendButton.outerHTML : '不存在');
    console.log('[调试] messageInput元素:', !!messageInput);
    console.log('[调试] chatMessages元素:', !!chatMessages);
    console.log('[调试] 新对话按钮元素:', !!newChatButton);
    console.log('[调试] 新对话按钮HTML:', newChatButton ? newChatButton.outerHTML : '不存在');

    if (!sendButton) {
        console.error('[错误] 发送按钮未找到！');
        return;
    }

    // 确保即使没有找到newChatButton，也添加一个行内点击事件到任何具有指定选择器的元素
    const initNewChatButton = () => {
        const button = document.getElementById('newChat') || document.querySelector('.new-chat');
        if (button) {
            console.log('[调试] 找到新对话按钮，添加内联点击事件');
            
            // 行内的直接点击事件 (兼容性最强的方式)
            button.onclick = function(e) {
                console.log('[调试] 新对话按钮被点击（行内事件）');
                e.preventDefault();
                window.location.reload(true);
                return false;
            };
            
            // 同时添加标准addEventListener
            button.addEventListener('click', function(e) {
                console.log('[调试] 新对话按钮被点击（添加的事件）');
                createNewChat();
                e.stopPropagation();
            }, true); // 使用捕获阶段
            
            // 添加直接的HTML属性
            button.setAttribute('onclick', "window.location.reload(true); return false;");
        } else {
            console.error('[错误] 无法找到新对话按钮');
        }
    };
    
    // 初始化新对话按钮
    initNewChatButton();
    
    // 5秒后再次尝试初始化，以防DOM延迟加载
    setTimeout(initNewChatButton, 5000);

    // 添加自动滚动控制变量
    let userScrolled = false;
    let scrollTimer = null;
    let lastMessageCount = 0; // 跟踪消息数量，用于检测新消息
    let lastReadMessageCount = 0; // 新增：跟踪用户已读取的消息数量
    
    // 初始化lastMessageCount为当前消息数量
    lastMessageCount = chatMessages.querySelectorAll('.message').length;
    lastReadMessageCount = lastMessageCount; // 初始化已读消息数为当前消息数

    // 监听用户滚动事件
    chatMessages.addEventListener('scroll', function() {
        // 检查是否是用户主动滚动（而不是程序滚动）
        if (chatMessages.scrollTop + chatMessages.clientHeight < chatMessages.scrollHeight - 10) {
            userScrolled = true;
            
            // 清除任何现有的定时器
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            // 当用户向上滚动时，记录当前消息数量为已读消息数
            lastReadMessageCount = chatMessages.querySelectorAll('.message').length;
            
            // 不再自动重置userScrolled状态，只设置一个检测新消息的定时器
            scrollTimer = setTimeout(() => {
                // 检测定时器触发时是否有新消息（与用户已读消息数对比）
                const currentMessageCount = chatMessages.querySelectorAll('.message').length;
                // 只有当有真正的新消息（超过用户已读过的消息）时才重置滚动状态并滚动到底部
                if (currentMessageCount > lastReadMessageCount) {
                    userScrolled = false;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    // 更新已读消息计数
                    lastReadMessageCount = currentMessageCount;
                }
                // 始终更新总消息计数
                lastMessageCount = currentMessageCount;
            }, 2000);
        } else {
            // 当用户滚动到底部或接近底部时，更新已读消息计数
            lastReadMessageCount = chatMessages.querySelectorAll('.message').length;
        }
    });

    // 滚动到底部的安全函数
    function scrollToBottom() {
        // 只有当用户没有主动滚动时，才自动滚动到底部
        if (!userScrolled) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            // 更新已读消息计数
            lastReadMessageCount = chatMessages.querySelectorAll('.message').length;
        } 
        // 更新消息总数
        lastMessageCount = chatMessages.querySelectorAll('.message').length;
    }

    // API配置
    const apiUrl = 'https://api.deepseek.com/chat/completions';
    const apiKey = 'sk-250935b3510c4978a50d340c8bbd07c5';
    
    // 上下文模式配置
    let contextMode = false;
    let lastUserMessage = '';

    // 深度思考模式配置
    let deepThinkingMode = false;
    if (perfectAnswerToggle) {
        console.log('[调试] 初始化深度思考按钮');
        perfectAnswerToggle.addEventListener('click', function() {
            console.log('[调试] 点击深度思考按钮');
            deepThinkingMode = !deepThinkingMode;
            console.log('[调试] 深度思考模式:', deepThinkingMode ? '开启' : '关闭');
            
            this.classList.toggle('active');
            this.title = deepThinkingMode ? '已启用深度思考' : '已关闭深度思考';
            
            // 修改视觉反馈样式
            if (deepThinkingMode) {
                this.style.backgroundColor = '#FF69B4';  // 热粉色
                this.style.color = 'white';
                this.style.borderColor = '#FF69B4';
                const icon = this.querySelector('i');
                if (icon) icon.style.color = 'white';
            } else {
                this.style.backgroundColor = '';
                this.style.color = '';
                this.style.borderColor = '';
                const icon = this.querySelector('i');
                if (icon) icon.style.color = '';
            }
            
            // 触发一个自定义事件，用于调试
            const event = new CustomEvent('deepThinkingModeChange', { 
                detail: { enabled: deepThinkingMode } 
            });
            document.dispatchEvent(event);
        });
    } else {
        console.error('[错误] 未找到深度思考按钮元素');
    }

    // 安全地从localStorage获取数据
    function safeGetFromLocalStorage(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (error) {
            console.error(`[错误] 从localStorage获取${key}失败:`, error);
            return defaultValue;
        }
    }

    // 存储所有对话历史
    let allChats = safeGetFromLocalStorage('allChats', []);
    console.log('[调试] 从localStorage加载聊天记录，条数:', allChats.length);
    
    // 当前对话ID
    let currentChatId = Date.now();
    // 当前对话内容
    let currentChat = {
        id: currentChatId,
        messages: [{
            type: 'ai',
            content: 'Hi，我是SMT-AI，一个AI助手'
        }]
    };

    // 初始化侧边栏状态
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
    }

    // 处理侧边栏折叠/展开
    toggleSidebar.addEventListener('click', () => {
        console.log('Toggle sidebar clicked');
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // 清空聊天记录并更新界面
    function clearChatHistory() {
        localStorage.removeItem('allChats');
        allChats = [];
        chatHistory.innerHTML = '';
        chatMessages.innerHTML = '';
        createNewChat();
        modalOverlay.classList.remove('show');
        confirmDialog.classList.remove('show');
    }

    // 简化创建新对话函数，使用更直接有效的刷新方式
    function createNewChat() {
        console.log('[调试] 创建新对话：通过不同方式刷新页面');
        try {
            // 方法1：使用window.location.reload(true)强制从服务器刷新
            window.location.reload(true);
        } catch (error) {
            console.error('[错误] 刷新方法1失败:', error);
            try {
                // 方法2：替换当前URL（去除可能的哈希部分）
                window.location.href = window.location.href.split('#')[0];
            } catch (error2) {
                console.error('[错误] 刷新方法2失败:', error2);
                try {
                    // 方法3：使用history API
                    window.history.go(0);
                } catch (error3) {
                    console.error('[错误] 所有刷新方法都失败');
                    alert('请手动刷新页面以创建新对话');
                }
            }
        }
    }

    // 添加对话到历史记录栏
    function addChatToHistory(chat) {
        console.log('[调试] 添加对话到历史记录栏, ID:', chat.id);
        
        // 避免重复添加
        const existingItem = document.querySelector(`.history-item[data-chat-id="${chat.id}"]`);
        if (existingItem) {
            console.log('[调试] 历史记录项已存在，跳过添加');
            return;
        }

        // 获取有意义的预览文本
        let previewText = "";
        let previewIcon = "fas fa-comment"; // 默认图标
        
        // 寻找第一条用户消息作为预览
        const firstUserMessage = chat.messages.find(m => m.type === 'user');
        if (firstUserMessage) {
            // 清理消息内容，移除HTML标签和命令代码部分
            let cleanText = firstUserMessage.content;
            
            // 如果是生图命令，提取描述部分并设置特殊图标
            if (cleanText.includes('INPUT = {focus}') && cleanText.includes('pollinations.ai')) {
                const inputIndex = cleanText.lastIndexOf('INPUT =');
                if (inputIndex !== -1) {
                    cleanText = "AI生图: " + cleanText.substring(inputIndex + 8).trim();
                    previewIcon = "fas fa-image"; // 图像图标
                }
            } else if (cleanText.includes('```') || cleanText.includes('代码') || cleanText.includes('编程')) {
                previewIcon = "fas fa-code"; // 代码图标
            } else if (cleanText.includes('翻译')) {
                previewIcon = "fas fa-language"; // 翻译图标
            } else if (cleanText.includes('写作') || cleanText.includes('文章')) {
                previewIcon = "fas fa-pen-fancy"; // 写作图标
            }
            
            // 移除HTML标签
            cleanText = cleanText.replace(/<[^>]*>/g, '');
            
            // 限制长度
            previewText = cleanText.length > 25 ? cleanText.substring(0, 25) + '...' : cleanText;
        } else {
            previewText = "新对话";
        }

        // 创建历史条目
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // 添加图标
        const iconElement = document.createElement('div');
        iconElement.className = 'history-icon';
        iconElement.innerHTML = `<i class="${previewIcon}"></i>`;
        historyItem.appendChild(iconElement);
        
        // 添加内容区域
        const contentElement = document.createElement('div');
        contentElement.className = 'history-content';
        
        // 添加预览文本
        const textElement = document.createElement('div');
        textElement.className = 'history-text';
        textElement.textContent = previewText;
        contentElement.appendChild(textElement);
        
        // 添加时间戳
        const timestamp = document.createElement('div');
        timestamp.className = 'history-timestamp';
        timestamp.textContent = new Date(chat.id).toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
        contentElement.appendChild(timestamp);
        
        historyItem.appendChild(contentElement);
        historyItem.dataset.chatId = chat.id;
        
        // 如果是当前聊天，添加active类
        if (chat.id === currentChat.id) {
            historyItem.classList.add('active');
        }
        
        // 添加点击事件
        historyItem.addEventListener('click', () => {
            loadChat(chat);
        });
        
        // 添加删除按钮
        const deleteButton = document.createElement('div');
        deleteButton.className = 'history-delete';
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';
        deleteButton.title = '删除此对话';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            deleteSingleChat(chat.id);
        });
        historyItem.appendChild(deleteButton);
        
        // 在列表开头插入
        chatHistory.insertBefore(historyItem, chatHistory.firstChild);
    }

    // 删除单个聊天记录
    function deleteSingleChat(chatId) {
        console.log('[调试] 删除单个聊天记录, ID:', chatId);
        
        // 从数组中移除
        allChats = allChats.filter(chat => chat.id !== chatId);
        
        // 更新localStorage
        try {
            localStorage.setItem('allChats', JSON.stringify(allChats));
            console.log('[调试] 删除后保存成功, 剩余条数:', allChats.length);
            
            // 从UI中移除
            const item = document.querySelector(`.history-item[data-chat-id="${chatId}"]`);
            if (item) {
                item.remove();
            }
            
            // 如果删除的是当前聊天，创建新聊天
            if (chatId === currentChat.id) {
                console.log('[调试] 删除的是当前聊天，创建新聊天');
                createNewChat();
            }
        } catch (error) {
            console.error('[错误] 删除聊天记录失败:', error);
        }
    }

    // 加载历史对话
    function loadChat(chat) {
        // 如果当前对话有内容且未保存，先保存它
        if (currentChat.messages.length > 1) {
            saveChatsToStorage();
        }
        
        // 加载选中的历史对话
        chatMessages.innerHTML = '';
        
        // 复制聊天对象以防止直接修改历史记录
        currentChat = JSON.parse(JSON.stringify(chat));
        currentChatId = currentChat.id;
        
        // 显示所有消息
        currentChat.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.type === 'user' ? 'user-message' : 'ai-message'}`;
            
            const formattedMessage = message.type === 'user' ? message.content : replaceAIResponse(message.content);
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${formattedMessage}</div>
                </div>
            `;
            
            chatMessages.appendChild(messageElement);
        });
        
        // 添加高亮样式到当前选中的历史条目
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId == currentChat.id) {
                item.classList.add('active');
            }
        });
        
        // 全部加载完成后再渲染一次数学公式
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([chatMessages]).catch((err) => {
                console.error('MathJax聊天加载渲染错误:', err);
            });
        }
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 保存聊天记录到localStorage
    function saveChatsToStorage() {
        console.log('[调试] 准备保存聊天记录...');
        
        // 只有当当前对话有实际内容时才进行保存
        if (currentChat.messages.length <= 1) {
            console.log('[调试] 当前对话没有实际内容，跳过保存');
            return;
        }
        
        try {
            // 检查当前对话是否已在allChats中
            const existingIndex = allChats.findIndex(c => c.id === currentChat.id);
            
            if (existingIndex !== -1) {
                // 如果已存在，则更新它
                console.log('[调试] 更新现有对话记录，ID:', currentChat.id);
                allChats[existingIndex] = JSON.parse(JSON.stringify(currentChat));
            } else {
                // 如果不存在，则添加它
                console.log('[调试] 添加新对话记录，ID:', currentChat.id);
                // 使用深拷贝确保不会有引用问题
                allChats.push(JSON.parse(JSON.stringify(currentChat)));
                
                // 同时更新UI，在历史记录栏中添加该对话
                addChatToHistory(currentChat);
            }
            
            // 保存到localStorage
            localStorage.setItem('allChats', JSON.stringify(allChats));
            console.log('[调试] 保存聊天记录成功，条数:', allChats.length);
        } catch (error) {
            console.error('[错误] 保存聊天记录失败:', error);
            
            // 如果存储空间不足，清理旧的聊天记录
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.log('[调试] 存储空间不足，清理旧聊天记录');
                
                // 保留最新的10条聊天
                if (allChats.length > 10) {
                    allChats = allChats.slice(-10);
                    
                    try {
                        localStorage.setItem('allChats', JSON.stringify(allChats));
                        console.log('[调试] 清理后重新保存成功');
                        
                        // 重新加载历史记录UI
                        refreshChatHistoryUI();
                    } catch (e) {
                        console.error('[错误] 清理后仍无法保存:', e);
                        
                        // 尝试进一步减少保存的记录
                        if (allChats.length > 5) {
                            allChats = allChats.slice(-5);
                            try {
                                localStorage.setItem('allChats', JSON.stringify(allChats));
                                console.log('[调试] 进一步清理后保存成功');
                                refreshChatHistoryUI();
                            } catch (err) {
                                console.error('[错误] 无法保存聊天记录，即使减少到5条:', err);
                            }
                        }
                    }
                }
            }
        }
    }

    // 重新加载历史记录UI
    function refreshChatHistoryUI() {
        // 清空历史记录UI
        chatHistory.innerHTML = '';
        
        // 重新添加所有聊天到历史记录
        allChats.forEach(chat => {
            addChatToHistory(chat);
        });
        
        // 高亮当前选中的对话
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId == currentChat.id) {
                item.classList.add('active');
            }
        });
    }

    // 处理清空历史记录按钮点击
    clearHistoryButton.addEventListener('click', () => {
        modalOverlay.classList.add('show');
        confirmDialog.classList.add('show');
    });

    confirmDialog.querySelector('.cancel').addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        confirmDialog.classList.remove('show');
    });

    confirmDialog.querySelector('.confirm').addEventListener('click', clearChatHistory);

    modalOverlay.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        confirmDialog.classList.remove('show');
    });

    // 上下文模式切换
    contextToggle.addEventListener('click', function() {
        contextMode = !contextMode;
        this.classList.toggle('active');
        this.title = contextMode ? '已启用上下文关联' : '已关闭上下文关联';
    });

    // 剪切聊天内容
    cutButton.addEventListener('click', () => {
        const chatContent = getChatContent();
        navigator.clipboard.writeText(chatContent).then(() => {
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-content">
                        <h2>Hi，我是SMTAI<span class="candy-loading">🍬</span></h2>
                    </div>
                </div>
            `;
            alert('聊天内容已剪贴到剪贴板');
        });
    });

    // 添加消息到聊天界面
    function addMessage(message, isUser = false, skipAIResponse = false) {
        // 如果是用户发送的第一条消息，清除欢迎卡片
        if (isUser) {
            // 查找并移除欢迎卡片
            const welcomeCard = chatMessages.querySelector('.welcome-card');
            if (welcomeCard) {
                // 找到包含欢迎卡片的消息元素并移除
                const welcomeMessage = welcomeCard.closest('.message');
                if (welcomeMessage) {
                    welcomeMessage.remove();
                }
            }
        }

        // 处理生图命令，隐藏命令部分，只显示用户提供的描述
        let displayMessage = message;
        if (isUser && message.includes('INPUT = {focus}') && message.includes('pollinations.ai')) {
            // 提取用户描述部分（在最后一个INPUT =之后的内容）
            const inputIndex = message.lastIndexOf('INPUT =');
            if (inputIndex !== -1) {
                displayMessage = "生成图片: " + message.substring(inputIndex + 8).trim();
            }
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        // 使用文本处理函数格式化消息内容
        const formattedMessage = isUser ? displayMessage : replaceAIResponse(displayMessage);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${formattedMessage}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        
        // 更新消息计数
        const previousMessageCount = lastMessageCount;
        lastMessageCount = chatMessages.querySelectorAll('.message').length;
        
        // 检测是否有新消息（相比上次记录的消息数）
        const hasNewMessage = lastMessageCount > previousMessageCount;
        
        // 如果有新消息，强制滚动到底部并重置用户滚动状态
        if (hasNewMessage) {
            // 暂时记录用户滚动状态
            const wasUserScrolled = userScrolled;
            
            // 暂时重置用户滚动状态，强制滚动到底部
            userScrolled = false;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            lastReadMessageCount = lastMessageCount;
            console.log('[调试] 检测到新消息，强制滚动到底部');
            
            // 短暂延迟后恢复用户滚动状态
            setTimeout(() => {
                userScrolled = wasUserScrolled;
                console.log('[调试] 恢复用户滚动状态:', userScrolled ? '已滚动' : '未滚动');
            }, 500);
        }
        // 否则使用默认滚动逻辑
        else {
            // 使用改进的滚动函数
            scrollToBottom();
        }
        
        // 添加到当前聊天记录
        currentChat.messages.push({
            type: isUser ? 'user' : 'ai',
            content: message // 保存原始消息，以便保持上下文功能正常
        });
        
        // 每次添加消息后保存聊天记录
        if (!skipAIResponse) {
            saveChatsToStorage();
        }
        
        // 渲染数学公式
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([messageDiv]).catch((err) => {
                console.error('MathJax历史消息渲染错误:', err);
            });
        }
        
        // 如果是用户消息且不跳过AI响应，则获取AI响应
        if (isUser && !skipAIResponse) {
            getAIResponse(message);
        }
    }

    // 添加彩蛋动画样式
    const style = document.createElement('style');
    style.textContent = `
        .candy-heart-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
            transform-style: preserve-3d;
        }
        .candy-heart {
            position: absolute;
            font-size: 45px;
            transform-origin: center;
        }
        @keyframes candyFloat {
            0% { 
                opacity: 0;
                transform: translateY(10px) rotate(0deg) scale(0.5); 
            }
            10% {
                opacity: 1;
                transform: translateY(0) rotate(5deg) scale(1);
            }
            50% { 
                transform: translateY(-15px) rotate(-5deg) scale(1.1);
            }
            90% {
                opacity: 1;
                transform: translateY(0) rotate(5deg) scale(1);
            }
            100% { 
                opacity: 0;
                transform: translateY(10px) rotate(0deg) scale(0.5); 
            }
        }
    `;
    document.head.appendChild(style);

    // 创建彩蛋动画
    function createCandyHeart() {
        const container = document.createElement('div');
        container.className = 'candy-heart-container';
        document.body.appendChild(container);

        // 优化的心形坐标
        const heartCoords = [
            // 顶部
            {x: 0, y: -2.2},
            // 左上弧
            {x: -2, y: -3},
            {x: -3, y: -2},
            {x: -3, y: -1},
            {x: -2, y: 0},
            // 右上弧
            {x: 2, y: -3},
            {x: 3, y: -2},
            {x: 3, y: -1},
            {x: 2, y: 0},
            // 底部尖
            {x: 1, y: 1},
            {x: 0, y: 2},
            {x: -1, y: 1}
        ];

        // 创建每个糖果表情并添加随机延迟
        heartCoords.forEach((coord, index) => {
            const candy = document.createElement('div');
            candy.className = 'candy-heart';
            candy.textContent = '🍬';
            candy.style.left = coord.x * 40 + 'px';
            candy.style.top = coord.y * 40 + 'px';
            
            // 添加随机动画延迟和持续时间
            const randomDelay = Math.random() * 0.8;
            const randomDuration = 2.5 + Math.random() * 1;
            candy.style.animation = `candyFloat ${randomDuration}s ease-in-out ${randomDelay}s infinite`;
            
            container.appendChild(candy);
        });

        // 显示动画
        requestAnimationFrame(() => {
            container.style.opacity = '1';
            setTimeout(() => {
                container.style.opacity = '0';
                setTimeout(() => {
                    container.remove();
                }, 500);
            }, 2000);
        });
    }

    // 记录是否为AI生图模式
    let isGeneratingImage = false;

    // 设置按钮状态（启用/禁用）
    function setButtonState(button, enabled) {
        if (enabled) {
            button.classList.remove('disabled');
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        } else {
            button.classList.add('disabled');
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            // 如果按钮是激活状态，先关闭它
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                if (button === contextToggle) contextMode = false;
                if (button === perfectAnswerToggle) deepThinkingMode = false;
            }
        }
    }

    // 发送消息的统一处理函数
    function handleSendMessage(event) {
        // 阻止默认行为
        if (event) {
            event.preventDefault();
        }
        
        console.log('[调试] 触发发送消息');
        let message = messageInput.value.trim();
        
        // 检查是否是生图模式，如果是则恢复完整命令
        if (isGeneratingImage && messageInput.hasAttribute('data-full-prompt')) {
            const fullPrompt = messageInput.getAttribute('data-full-prompt');
            // 获取用户输入的描述
            const userDescription = message;
            // 将用户描述替换到命令中的INPUT =后面
            message = fullPrompt + userDescription;
            // 清除数据属性
            messageInput.removeAttribute('data-full-prompt');
        }
        
        if (message) {
            console.log('[调试] 发送消息:', message);
            
            // 如果是生图模式，发送后解锁按钮
            if (isGeneratingImage) {
                isGeneratingImage = false;
                // 移除特殊样式类
                messageInput.classList.remove('image-generation-input');
                // 恢复上下文和深度思考按钮的可用状态
                setButtonState(contextToggle, true);
                setButtonState(perfectAnswerToggle, true);
            }
            
            // 检查是否触发彩蛋（匹配SMT或SMTAI，不区分大小写）
            const upperMessage = message.trim().toUpperCase();
            if (upperMessage === 'SMT' || upperMessage === 'SMTAI') {
                createCandyHeart();
            }
            
            // 检查是否有快速回复
            const quickResponse = getQuickResponse(message);
            if (quickResponse) {
                // 如果有快速回复，直接显示，并跳过AI响应
                addMessage(message, true, true); // 添加用户消息，跳过AI响应
                messageInput.value = '';
                messageInput.style.borderColor = '#ccc';
                messageInput.style.borderWidth = '1px';
                messageInput.focus();
                
                // 添加AI的快速回复
                const aiMessage = document.createElement('div');
                aiMessage.className = 'message ai-message';
                aiMessage.innerHTML = `
                    <div class="message-content">
                        <p>${quickResponse}</p>
                    </div>
                `;
                chatMessages.appendChild(aiMessage);
                scrollToBottom(); // 使用改进的滚动函数
                
                // 添加到当前聊天记录
                currentChat.messages.push({
                    type: 'ai',
                    content: quickResponse
                });
                
                // 保存聊天记录
                saveChatsToStorage();
            } else {
                // 如果没有快速回复，走正常的AI响应流程
                addMessage(message, true);
                messageInput.value = '';
                messageInput.style.borderColor = '#ccc';
                messageInput.style.borderWidth = '1px';
                messageInput.focus();
            }
        } else {
            console.log('[调试] 消息为空，不发送');
        }
    }

    // 为发送按钮添加点击事件（使用箭头函数以保持this的指向）
    if (sendButton) {
        sendButton.onclick = (event) => {
            console.log('[调试] 发送按钮被点击');
            handleSendMessage(event);
        };
    }

    // 为输入框添加回车事件
    if (messageInput) {
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                console.log('[调试] 检测到回车键');
                handleSendMessage(event);
            }
        });

        messageInput.addEventListener('input', () => {
            console.log('[调试] 输入框内容变化:', messageInput.value);
            messageInput.style.borderColor = '#FF69B4';
            messageInput.style.borderWidth = '2px';
        });

        messageInput.addEventListener('blur', () => {
            messageInput.style.borderColor = '#ccc';
            messageInput.style.borderWidth = '1px';
        });
    }

    // 复制聊天内容
    function getChatContent() {
        return Array.from(chatMessages.children)
            .map(msg => {
                const content = msg.querySelector('p')?.textContent || msg.querySelector('h2')?.textContent || '';
                return msg.classList.contains('user-message') ? `用户: ${content}` : `AI: ${content}`;
            })
            .join('\n');
    }

    // 初始化按钮事件
    function setupActionButtons() {
        const menuItems = document.querySelectorAll('.menu-item');
        const quickActionButtons = document.querySelectorAll('.quick-actions .action-button');
        
        console.log('[调试] 找到的菜单项数量:', menuItems.length);
        
        // 设置菜单项点击事件
        menuItems.forEach((item, index) => {
            console.log(`[调试] 处理第${index + 1}个菜单项:`, item.outerHTML);
            const prompt = item.getAttribute('data-prompt');
            item.addEventListener('click', () => {
                console.log('[调试] 点击事件触发，当前输入框状态:',
                    messageInput ? '存在' : '不存在',
                    messageInput ? `值: ${messageInput.value}` : ''
                );
                if (messageInput) {
                    // 检查是否为AI生图功能
                    if (prompt.includes('INPUT = {focus}') && prompt.includes('pollinations.ai')) {
                        console.log('[调试] 检测到AI生图功能');
                        // 将完整命令保存为数据属性，在发送时恢复
                        messageInput.setAttribute('data-full-prompt', prompt);
                        // 显示简化版本
                        messageInput.value = "输入描述，生成AI图片...";
                        // 添加样式类
                        messageInput.classList.add('image-generation-input');
                        // 选中全部文本方便用户直接输入
                        messageInput.select();
                        isGeneratingImage = true;
                        // 关闭并锁定上下文和深度思考功能
                        setButtonState(contextToggle, false);
                        setButtonState(perfectAnswerToggle, false);
                    } else {
                    messageInput.value = prompt;
                    }
                    messageInput.focus();
                }
            });
        });

        // 设置快捷功能区按钮点击事件
        quickActionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                switch (index) {
                    case 0: // 问题反馈
                        const feedbackMessage = document.createElement('div');
                        feedbackMessage.className = 'message ai-message';
                        feedbackMessage.innerHTML = `
                            <div class="message-content">
                                <p>问题反馈</p>
                                <div style="font-size:12px;color:#999;margin-top:8px">
                                    很抱歉给您带来不便，如有问题或建议请反馈！
                                </div>
                                <p style="font-size: 12px; color: #999;margin-top:8px">
                                    请联系：qqnlrwzcb@163.com
                                </p>
                            </div>
                        `;
                        chatMessages.appendChild(feedbackMessage);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                        
                        // 添加到当前聊天记录
                        currentChat.messages.push({
                            type: 'ai',
                            content: feedbackMessage.innerHTML
                        });
                        break;
                    case 1: // V3大模型
                        addMessage('你好我是SMT-AI，满血版Deepseek（R1）大模型开发的AI对话智能体！', false, true);
                        break;
                    case 2: // 有彩蛋
                        createCandyHeart();
                        break;
                    case 3: // SMT更多作品
                        window.location.href = 'https://timelist.netlify.app/';
                        break;
                }
            });
        });
    }

    // 加载保存的聊天记录
    allChats.forEach(chat => {
        addChatToHistory(chat);
    });

    setupActionButtons();

    // 添加快速回复功能
    function getQuickResponse(message) {
        const standardMessage = message.trim();
        const timeQuestions = ['几点了', '现在是几点', '现在的时间', '时间'];
        const dateQuestions = ['今天是星期几', '今天几号', '星期几', '日期'];
        
        console.log('[调试] 检查快速回复:', standardMessage);
        
        // SMTAI的随机回复
        const smtaiResponses = [
            '您好！我是SMT-AI智能助手SAI。如您有任何任何问题，我会尽我所能为您提供帮助。',
            '你好！我是SMT-AI大模型R1，专门设计用来提供信息、解答问题、协助学习和执行各种任务。我可以帮助用户获取知识、解决问题、进行语言翻译、提供建议等。我的目标是使信息获取更加便捷，帮助用户更高效地完成任务。如果你有任何问题或需要帮助，随时可以问我！'
        ];
        
        // 添加SMTAI的快捷回复（完全匹配，不区分大小写）
        if (standardMessage.toUpperCase() === 'SMTAI') {
            return smtaiResponses[Math.floor(Math.random() * smtaiResponses.length)];
        }
        
        // 添加SMT彩蛋的快捷回复（匹配SMT，不区分大小写）
        if (standardMessage.toUpperCase() === 'SMT') {
            return '爱心💗🍬送给你，继续和R1大模型的SMTAI聊天吧～';
        }
        
        if (timeQuestions.includes(standardMessage)) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            return `现在是 ${hours}:${minutes}`;
        }
        if (dateQuestions.includes(standardMessage)) {
            const now = new Date();
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            return `今天是 ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`;
        }
        return null;
    }

    // 添加AI回复内容替换功能
    function replaceAIResponse(text) {
        // 保护数学公式，防止其被HTML格式化影响
        // 先临时替换数学公式，之后再还原
        const mathMap = new Map();
        let mathID = 0;
        
        // 保护行内公式 $...$
        text = text.replace(/\$(.+?)\$/g, (match) => {
            const id = `MATH_INLINE_${mathID++}`;
            mathMap.set(id, match);
            return id;
        });
        
        // 保护块级公式 $$...$$
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
            const id = `MATH_BLOCK_${mathID++}`;
            mathMap.set(id, match);
            return id;
        });
        
        // 隐藏生图命令代码部分，但保留图片显示功能
        // 先替换命令部分
        const commandPattern = /INPUT = \{focus\}[\s\S]*?INPUT = ([\s\S]*?)(\n|$)/g;
        text = text.replace(commandPattern, (match, userInput) => {
            return ""; // 移除命令部分
        });
        
        // 处理命令与图片链接之间的内容
        const outputPattern = /OUTPUT = \(description\)[\s\S]*?\{description\} = \{focusDetailed\},[\s\S]*?\{artistReference\}/g;
        text = text.replace(outputPattern, "");
        
        // 处理代码块，保持代码格式和换行
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        let formattedText = text.replace(codeBlockRegex, (match, language, code) => {
            // 对代码内容进行HTML转义
            const escapedCode = code.trim()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            return `<div class="code-block">
                <div class="code-header">
                    <span class="code-language">${language || 'plaintext'}</span>
                    <button class="copy-button" onclick="copyCode(this)">复制代码</button>
                </div>
                <pre><code class="${language}">${escapedCode}</code></pre>
            </div>`;
        });
        
        // 处理AI生图的图片链接
        // 匹配形如 n![MG](https://image.pollinations.ai/prompt/...)
        const imgLinkRegex = /n!\[MG\]\((https:\/\/image\.pollinations\.ai\/prompt\/[^)]+)\)/g;
        formattedText = formattedText.replace(imgLinkRegex, (match, imageUrl) => {
            return `<div class="image-container">
                <a href="${imageUrl}" target="_blank">
                    <img src="${imageUrl}" alt="AI生成图片" style="max-width:100%;border-radius:8px;margin:10px 0;">
                </a>
                <div class="image-caption">AI生成图片</div>
            </div>`;
        });
        
        // 处理普通文本的换行
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // 处理加粗文本
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 还原数学公式
        mathMap.forEach((value, key) => {
            formattedText = formattedText.replace(key, value);
        });
        
        return formattedText;
    }

    // 显示思考时间
    function showThinkingTime(milliseconds) {
        const seconds = (milliseconds / 1000).toFixed(2);
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('ai-message')) {
            const prevTimeDisplay = document.querySelector('.thinking-duration');
            if (prevTimeDisplay) prevTimeDisplay.remove();
            const timeDisplay = document.createElement('div');
            timeDisplay.className = 'thinking-duration';
            timeDisplay.textContent = `思考用时：${seconds}秒`;
            timeDisplay.style.cssText = `
                color: #999;
                font-size: 12px;
                text-align: left;
                padding-left: 20px;
                margin-top: 5px;
                margin-bottom: 10px;
                opacity: 0.7;
                display: block;
                width: 100%;
            `;
            lastMessage.parentNode.insertBefore(timeDisplay, lastMessage.nextSibling);
        }
    }

    // 使用 fetch API 流式获取 AI 回复
    async function getAIResponse(userInput) {
        const tempAiMessage = document.createElement('div');
        tempAiMessage.className = 'message ai-message';
        
        // 根据是否开启深度思考模式显示不同的思考提示
        if (deepThinkingMode) {
            tempAiMessage.innerHTML = `
                <div class="message-content deep-thinking-message">
                    <p>深度思考中 <span class="deep-thinking-candies">
                        <span class="deep-thinking-candy">🍬</span>
                        <span class="deep-thinking-candy">🍬</span>
                        <span class="deep-thinking-candy">🍬</span>
                    </span></p>
                </div>
            `;
        } else {
            tempAiMessage.innerHTML = `
                <div class="message-content">
                    <p>思考中 <span class="candy-loading">🍬</span></p>
                </div>
            `;
        }
        
        chatMessages.appendChild(tempAiMessage);
        
        // 强制滚动到底部，无视用户是否滚动过
        const wasUserScrolled = userScrolled;
        userScrolled = false;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 更新消息计数
        lastMessageCount = chatMessages.querySelectorAll('.message').length;
        lastReadMessageCount = lastMessageCount;
        console.log('[调试] 创建AI响应元素，强制滚动到底部');
        
        // 5秒后恢复用户的滚动状态，避免持续强制滚动
        setTimeout(() => {
            userScrolled = wasUserScrolled;
            console.log('[调试] 恢复用户滚动状态:', userScrolled ? '已滚动' : '未滚动');
        }, 500); // 缩短时间到500ms，确保只滚动一次
        
        let finalUserInput = userInput;
        if (contextMode) {
            const recentMessages = currentChat.messages.slice(-20);
            if (recentMessages.length > 0) {
                const historyText = recentMessages
                    .map(msg => (msg.type === 'user' ? '用户' : 'AI') + '：' + msg.content)
                    .join('。');
                finalUserInput = `上文：${historyText}。本次：${userInput}`;
            }
        }
        lastUserMessage = userInput;
        let thinkingStartTime = Date.now();

        try {
            const data = {
                model: deepThinkingMode ? "deepseek-reasoner" : "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: finalUserInput }
                ],
                stream: true
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! 状态码: ${response.status}`);
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = "";
            let done = false;
            
            // 如果是深度思考模式，添加特效类
            const messageContentClass = deepThinkingMode ? 'message-content deep-thinking-message' : 'message-content';
            
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                const lines = chunkValue.split("\n");
                for (const line of lines) {
                    if (line.trim() === "" || line.includes("keep-alive")) continue;
                    try {
                        const json = JSON.parse(line.replace("data: ", "").trim());
                        if (json.choices && json.choices[0] && json.choices[0].delta) {
                            const newText = json.choices[0].delta.content || "";
                            aiResponseText += newText;
                            const modifiedResponse = replaceAIResponse(aiResponseText);
                            if (modifiedResponse.trim() !== "") {
                                tempAiMessage.innerHTML = `
                                    <div class="${messageContentClass}">
                                        <p>${modifiedResponse}</p>
                                    </div>
                                `;
                                
                                // 使用常规滚动逻辑，不强制滚动
                                // 只有当用户没有主动滚动时，才自动滚动到底部
                                if (!userScrolled) {
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                                
                                // 更新消息计数
                                const currentMessageCount = chatMessages.querySelectorAll('.message').length;
                                lastMessageCount = currentMessageCount;
                                
                                // 触发MathJax重新渲染
                                if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                                    MathJax.typesetPromise([tempAiMessage]).catch((err) => {
                                        console.error('MathJax渲染错误:', err);
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("解析失败：", line);
                    }
                }
            }

            // 如果开启了深度思考模式，添加标签
            if (deepThinkingMode) {
                tempAiMessage.querySelector('.message-content p').innerHTML += `<small class="model-tag deep-thinking">深度思考模式</small>`;
            }

            currentChat.messages.push({
                type: 'ai',
                content: replaceAIResponse(aiResponseText)
            });
            saveChatsToStorage();
            showThinkingTime(Date.now() - thinkingStartTime);
            
            // 整个消息加载完成后，再次触发MathJax渲染
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([tempAiMessage]).catch((err) => {
                    console.error('MathJax最终渲染错误:', err);
                });
            }
        } catch (error) {
            console.error('[错误] AI响应失败:', error);
            console.log('[调试] 错误类型:', error.name);
            console.log('[调试] 错误信息:', error.message);
            console.log('[调试] 错误栈:', error.stack);
            let errorMessage = '服务器繁忙请稍后再试';
            if (error.name === 'AbortError') {
                errorMessage = '请求超时，请检查网络连接';
            } else if (error.message.includes('401')) {
                errorMessage = 'API密钥无效，请检查配置';
            } else if (error.message.includes('429')) {
                errorMessage = '请求过于频繁，请稍后再试';
            }
            
            // 根据是否处于深度思考模式添加不同的样式
            const errorContentClass = deepThinkingMode ? 'message-content deep-thinking-message' : 'message-content';
            
            tempAiMessage.innerHTML = `
                <div class="${errorContentClass}">
                    <p>${errorMessage}</p>
                    <div style="font-size:12px;color:#999;margin-top:8px">
                        原始错误：${error.message || '未知错误'}
                    </div>
                    <p style="font-size: 12px; color: #999;margin-top:8px">
                        如有问题请联系：qqnlrwzcb@163.com
                    </p>
                </div>
            `;
            const retryButton = document.createElement('button');
            retryButton.textContent = '点击重试';
            retryButton.style.cssText = `
                margin-top: 10px;
                padding: 5px 15px;
                background: #FFB6C1;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            retryButton.onclick = () => {
                getAIResponse(userInput);
            };
            tempAiMessage.querySelector('.message-content').appendChild(retryButton);
            showThinkingTime(Date.now() - thinkingStartTime);
        }
    }

    // 复制聊天内容
    copyButton.addEventListener('click', () => {
        const chatContent = getChatContent();
        navigator.clipboard.writeText(chatContent).then(() => {
            alert('聊天内容已复制到剪贴板');
        });
    });

    // 添加全局事件委托，确保即使动态添加的元素也能响应点击
    document.addEventListener('click', function(event) {
        // 检查点击事件是否来自新对话按钮或其子元素
        const target = event.target.closest('#newChat') || 
                      (event.target.closest('.new-chat') && !event.target.closest('.new-chat').id);
        
        if (target) {
            console.log('[调试] 通过全局事件委托捕获到新对话按钮点击');
            event.preventDefault();
            event.stopPropagation();
            
            // 直接刷新页面
            window.location.reload(true);
            return false;
        }
    });
});