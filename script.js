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

    // 调试信息：检查必要元素是否存在
    console.log('messageInput exists:', !!messageInput);
    console.log('chatMessages exists:', !!chatMessages);

    // API配置
    const apiUrl = 'https://api.deepseek.com/chat/completions';
    const apiKey = 'sk-250935b3510c4978a50d340c8bbd07c5';
    
    // 上下文模式配置
    let contextMode = false;
    let lastUserMessage = '';

    // 存储所有对话历史
    let allChats = JSON.parse(localStorage.getItem('allChats')) || [];
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
        console.log('Toggle sidebar clicked'); // 添加调试日志
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // 清空聊天记录并更新界面
    function clearChatHistory() {
        localStorage.removeItem('allChats');  // 删除 localStorage 中的聊天记录
        allChats = [];  // 清空本地数组
        chatHistory.innerHTML = '';  // 清空聊天历史栏
        chatMessages.innerHTML = '';  // 清空当前聊天框内容
        createNewChat();  // 创建新的对话
        modalOverlay.classList.remove('show');
        confirmDialog.classList.remove('show');
    }

    // 创建新对话
    function createNewChat() {
        // 保存当前对话到历史记录
        if (currentChat.messages.length > 1) {
            allChats.push(currentChat);
            addChatToHistory(currentChat);
            saveChatsToStorage();
        }

        // 清空聊天区域
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <h2>Hi，我是SMTAI<span class="candy-loading">🍬</span></h2>
                </div>
            </div>
        `;

        // 创建新的当前对话
        currentChatId = Date.now();
        currentChat = {
            id: currentChatId,
            messages: [{
                type: 'ai',
                content: 'Hi，我是SMTAI'
            }]
        };
    }

    // 添加对话到历史记录栏
    function addChatToHistory(chat) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = chat.messages[1]?.content.substring(0, 20) + '...';
        historyItem.dataset.chatId = chat.id;
        
        historyItem.addEventListener('click', () => loadChat(chat));
        chatHistory.insertBefore(historyItem, chatHistory.firstChild);
    }

    // 加载历史对话
    function loadChat(chat) {
        // 保存当前对话
        if (currentChat.messages.length > 1) {
            const existingIndex = allChats.findIndex(c => c.id === currentChat.id);
            if (existingIndex === -1) {
                allChats.push(currentChat);
                addChatToHistory(currentChat);
                saveChatsToStorage();
            }
        }

        // 显示选中的对话
        chatMessages.innerHTML = '';
        chat.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.type === 'user' ? 'user-message' : 'ai-message'}`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${message.content}</p>
                </div>
            `;
            chatMessages.appendChild(messageDiv);
        });

        currentChat = chat;
    }

    // 保存聊天记录到localStorage
    function saveChatsToStorage() {
        localStorage.setItem('allChats', JSON.stringify(allChats));
    }

    // 处理清空历史记录按钮点击
    clearHistoryButton.addEventListener('click', () => {
        modalOverlay.classList.add('show');
        confirmDialog.classList.add('show');
    });

    // 处理确认对话框按钮
    confirmDialog.querySelector('.cancel').addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        confirmDialog.classList.remove('show');
    });

    confirmDialog.querySelector('.confirm').addEventListener('click', clearChatHistory);

    // 点击遮罩层关闭对话框
    modalOverlay.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        confirmDialog.classList.remove('show');
    });

    // 上下文模式切换
    contextToggle.addEventListener('click', () => {
        contextMode = !contextMode;
        contextToggle.classList.toggle('active');
        contextToggle.title = contextMode ? '已启用上下文关联' : '已关闭上下文关联';
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
            alert('聊天内容已剪切到剪贴板');
        });
    });

    // 发送消息
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            messageInput.focus(); // 保持输入框焦点
        }
    }

    // 处理发送按钮点击
    sendButton.addEventListener('click', sendMessage);

    // 处理回车键发送
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 获取聊天内容
    function getChatContent() {
        return Array.from(chatMessages.children)
            .map(msg => {
                const content = msg.querySelector('p')?.textContent || msg.querySelector('h2')?.textContent || '';
                return msg.classList.contains('user-message') ? `用户: ${content}` : `AI: ${content}`;
            })
            .join('\n');
    }

    // 加载保存的聊天记录
    allChats.forEach(chat => {
        addChatToHistory(chat);
    });

    // 添加快速回复功能
    function getQuickResponse(message) {
        // 将用户消息转换为标准格式（去除空格、转小写）
        const standardMessage = message.trim().toLowerCase();
        
        // 定义固定的时间问题格式
        const timeQuestions = [
            '几点了',
            '现在是几点',
            '现在的时间',
            '时间'
        ];

        // 定义固定的日期问题格式
        const dateQuestions = [
            '今天是星期几',
            '今天几号',
            '星期几',
            '几号'
        ];

        // 检查时间相关问题
        if (timeQuestions.includes(standardMessage)) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            return `现在是 ${hours}:${minutes}`;
        }
        
        // 检查日期相关问题
        if (dateQuestions.includes(standardMessage)) {
            const now = new Date();
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            return `今天是 ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`;
        }

        // 如果没有匹配的快速回复，返回 null
        return null;
    }

    // 添加AI回复内容替换功能
    function replaceAIResponse(response) {
        // 替换规则
        const replacements = [
            {
                // DeepSeek相关的任何回复都替换
                pattern: /.*DeepSeek.*/g,
                replacement: '您好！我是SMT-AI智能助手SAI。如您有任何任何问题，我会尽我所能为您提供帮助。'
            },
            {
                // OpenAI相关的任何回复都替换
                pattern: /.*OpenAI.*/g,
                replacement: '你好！我是SMT-AI大模型V3，专门设计用来提供信息、解答问题、协助学习和执行各种任务。我可以帮助用户获取知识、解决问题、进行语言翻译、提供建议等。我的目标是使信息获取更加便捷，帮助用户更高效地完成任务。如果你有任何问题或需要帮助，随时可以问我！'
            }
        ];

        let modifiedResponse = response;
        replacements.forEach(rule => {
            modifiedResponse = modifiedResponse.replace(rule.pattern, rule.replacement);
        });

        return modifiedResponse;
    }

    // 显示思考时间的函数
    function showThinkingTime(milliseconds) {
        const seconds = (milliseconds / 1000).toFixed(2);
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('ai-message')) {
            // 移除之前的思考时间显示（如果存在）
            const prevTimeDisplay = document.querySelector('.thinking-duration');
            if (prevTimeDisplay) {
                prevTimeDisplay.remove();
            }

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

    // 修改发送消息的处理
    async function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存消息到当前对话
        currentChat.messages.push({
            type: isUser ? 'user' : 'ai',
            content: content
        });

        // 如果是用户消息，开始计时
        if (isUser) {
            thinkingStartTime = Date.now();
        }

        // 检查是否触发彩蛋
        if (isUser && content.trim().toUpperCase() === 'SMT') {
            showEasterEgg();
            return;
        }

        // 如果是用户消息，检查是否有快速回复
        if (isUser) {
            const quickResponse = getQuickResponse(content);
            if (quickResponse) {
                setTimeout(() => {
                    addMessage(quickResponse, false);
                    // 显示思考时间
                    showThinkingTime(Date.now() - thinkingStartTime);
                }, 500);
            } else {
                await getAIResponse(content);
            }
        }
    }

    // 彩蛋展示函数
    function showEasterEgg() {
        const easterEgg = document.createElement('div');
        easterEgg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatCandy {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                50% {
                    transform: translateY(-20px) rotate(180deg);
                }
                100% {
                    transform: translateY(0) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);

        const candy = document.createElement('span');
        candy.textContent = '🍬';
        candy.style.cssText = `
            font-size: 50px;
            display: inline-block;
            animation: floatCandy 2s ease-in-out infinite;
        `;
        
        easterEgg.appendChild(candy);
        document.body.appendChild(easterEgg);

        setTimeout(() => {
            document.body.removeChild(easterEgg);
            document.head.removeChild(style);
        }, 3000);
    }

    // 修改AI API调用函数
    async function getAIResponse(userInput) {
        const tempAiMessage = document.createElement('div');
        tempAiMessage.className = 'message ai-message';
        tempAiMessage.innerHTML = `
            <div class="message-content">
                <p>思考中 <span class="candy-loading">🍬</span></p>
            </div>
        `;
        chatMessages.appendChild(tempAiMessage);

        // 如果启用了上下文模式，合并上一条消息
        let finalUserInput = userInput;
        if (contextMode && lastUserMessage) {
            finalUserInput = `${lastUserMessage}，${userInput}`;
        }
        lastUserMessage = userInput;

        const data = {
            model: "deepseek-chat",
            messages: [
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": finalUserInput }
            ],
            stream: true
        };

        try {
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
            let isFirstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.trim() === "" || line.includes("keep-alive")) {
                        continue;
                    }

                    try {
                        const json = JSON.parse(line.replace("data: ", "").trim());
                        if (json.choices && json.choices[0] && json.choices[0].delta) {
                            const newText = json.choices[0].delta.content || "";
                            aiResponseText += newText;
                            const modifiedResponse = replaceAIResponse(aiResponseText);
                            
                            // 只有在收到实际回复内容时才更新消息
                            if (modifiedResponse.trim() !== "") {
                                tempAiMessage.innerHTML = `
                                    <div class="message-content">
                                        <p>${modifiedResponse}</p>
                                    </div>
                                `;
                            }
                        }
                    } catch (e) {
                        console.warn("解析失败：", line);
                    }
                }
            }

            const finalResponse = replaceAIResponse(aiResponseText);
            
            // 保存AI回复到当前对话
            currentChat.messages.push({
                type: 'ai',
                content: finalResponse
            });

            // 只在完整回复后显示思考时间
            if (finalResponse.trim() !== "") {
                showThinkingTime(Date.now() - thinkingStartTime);
            }

            // 保存到localStorage
            saveChatsToStorage();

        } catch (error) {
            console.error('发生错误:', error);
            tempAiMessage.innerHTML = `
                <div class="message-content">
                    <p>抱歉，服务器繁忙请稍后再试。如有问题请联系：qqnlrwzcb@163.com</p>
                </div>
            `;
            // 显示错误时的思考时间
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

    // 初始化按钮事件 - 使用更直接的方式
    function setupActionButtons() {
        // 定义按钮配置
        const buttons = [
            { selector: '.ai-search', text: '帮我搜索' },
            { selector: '.ai-write', text: '帮我写作' },
            { selector: '.ai-read', text: '帮我阅读' },
            { selector: '.ai-code', text: '帮我编程' },
            { selector: '.ai-browse', text: '帮我浏览' }
        ];

        // 为每个按钮添加事件监听
        buttons.forEach(({ selector, text }) => {
            const button = document.querySelector(selector);
            console.log(`查找按钮 ${selector}:`, !!button); // 调试信息

            if (button) {
                button.addEventListener('click', function() {
                    console.log(`点击了按钮: ${text}`); // 调试信息
                    if (messageInput) {
                        messageInput.value = text + '：';
                        messageInput.focus();
                        console.log('设置输入框内容为:', messageInput.value); // 调试信息
                    } else {
                        console.error('找不到输入框元素！');
                    }
                });
            } else {
                console.error(`找不到按钮: ${selector}`);
            }
        });
    }

    // 在页面加载完成后设置按钮
    setupActionButtons();
}); 