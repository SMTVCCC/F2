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

    // 调试信息：检查必要元素是否存在
    console.log('[调试] 发送按钮元素:', !!sendButton);
    console.log('[调试] 发送按钮HTML:', sendButton ? sendButton.outerHTML : '不存在');
    console.log('[调试] messageInput元素:', !!messageInput);
    console.log('[调试] chatMessages元素:', !!chatMessages);

    if (!sendButton) {
        console.error('[错误] 发送按钮未找到！');
        return;
    }

    // API配置
    const apiUrl = 'https://api.deepseek.com/chat/completions';
    const apiKey = 'sk-250935b3510c4978a50d340c8bbd07c5';
    
    // 上下文模式配置
    let contextMode = false;
    let lastUserMessage = '';

    // 完美回答模式配置
    let perfectAnswerMode = false;
    if (perfectAnswerToggle) {
        console.log('[调试] 初始化完美回答按钮');
        perfectAnswerToggle.addEventListener('click', function() {
            console.log('[调试] 点击完美回答按钮');
            perfectAnswerMode = !perfectAnswerMode;
            console.log('[调试] 完美回答模式:', perfectAnswerMode ? '开启' : '关闭');
            
            this.classList.toggle('active');
            this.title = perfectAnswerMode ? '已启用完美回答' : '已关闭完美回答';
            
            // 修改视觉反馈样式
            if (perfectAnswerMode) {
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
            const event = new CustomEvent('perfectAnswerModeChange', { 
                detail: { enabled: perfectAnswerMode } 
            });
            document.dispatchEvent(event);
        });
    } else {
        console.error('[错误] 未找到完美回答按钮元素');
    }

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

    // 创建新对话
    function createNewChat() {
        if (currentChat.messages.length > 1) {
            allChats.push(currentChat);
            addChatToHistory(currentChat);
            saveChatsToStorage();
        }
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <h2>Hi，我是SMTAI<span class="candy-loading">🍬</span></h2>
                </div>
            </div>
        `;
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
        if (currentChat.messages.length > 1) {
            const existingIndex = allChats.findIndex(c => c.id === currentChat.id);
            if (existingIndex === -1) {
                allChats.push(currentChat);
                addChatToHistory(currentChat);
                saveChatsToStorage();
            }
        }
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
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        // 使用文本处理函数格式化消息内容
        const formattedMessage = replaceAIResponse(message);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${formattedMessage}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 添加到当前聊天记录
        currentChat.messages.push({
            type: isUser ? 'user' : 'ai',
            content: message
        });
        
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

    // 发送消息的统一处理函数
    function handleSendMessage(event) {
        // 阻止默认行为
        if (event) {
            event.preventDefault();
        }
        
        console.log('[调试] 触发发送消息');
        const message = messageInput.value.trim();
        
        if (message) {
            console.log('[调试] 发送消息:', message);
            
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
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // 添加到当前聊天记录
                currentChat.messages.push({
                    type: 'ai',
                    content: quickResponse
                });
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
                    messageInput.value = prompt;
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
                        addMessage('你好我是SMT-AI，基于V3大模型开发的Ai对话智能体！', false, true);
                        break;
                    case 2: // 有彩蛋
                        createCandyHeart();
                        break;
                    case 3: // SMT更多作品
                        window.location.href = 'https://smtchat.netlify.app/';
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
            '你好！我是SMT-AI大模型V3，专门设计用来提供信息、解答问题、协助学习和执行各种任务。我可以帮助用户获取知识、解决问题、进行语言翻译、提供建议等。我的目标是使信息获取更加便捷，帮助用户更高效地完成任务。如果你有任何问题或需要帮助，随时可以问我！'
        ];
        
        // 添加SMTAI的快捷回复（完全匹配，不区分大小写）
        if (standardMessage.toUpperCase() === 'SMTAI') {
            return smtaiResponses[Math.floor(Math.random() * smtaiResponses.length)];
        }
        
        // 添加SMT彩蛋的快捷回复（匹配SMT，不区分大小写）
        if (standardMessage.toUpperCase() === 'SMT') {
            return '爱心💗🍬送给你，继续和V3大模型的SMTAI聊天吧～';
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
        
        // 处理普通文本的换行
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // 处理加粗文本
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
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
        tempAiMessage.innerHTML = `
            <div class="message-content">
                <p>思考中 <span class="candy-loading">🍬</span></p>
            </div>
        `;
        chatMessages.appendChild(tempAiMessage);

        let finalUserInput = userInput;
        if (contextMode) {
            const recentMessages = currentChat.messages.slice(-4);
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
                model: "deepseek-chat",
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
                                    <div class="message-content">
                                        <p>${modifiedResponse}</p>
                                    </div>
                                `;
                                // 自动滚动到最新消息
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        }
                    } catch (e) {
                        console.warn("解析失败：", line);
                    }
                }
            }

            // 如果开启了完美回答模式，进行二次审阅
            if (perfectAnswerMode) {
                const reviewPrompt = `请对以下AI回答进行全面审阅和优化：

原始回答：
${aiResponseText}

要求：
1. 检查内容的准确性和完整性
2. 优化文字表达，使其更加清晰易懂
3. 改进段落结构和排版格式
4. 添加适当的分点或分段
5. 确保专业术语使用准确

请按照以上要求提供优化后的完整回答。`;
                tempAiMessage.innerHTML = `
                    <div class="message-content">
                        <p>正在优化回答 <span class="candy-loading">🍬</span></p>
                    </div>
                `;
                const reviewData = {
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: reviewPrompt }
                    ],
                    stream: false
                };
                const reviewResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(reviewData)
                });
                if (!reviewResponse.ok) {
                    throw new Error(`HTTP error! 状态码: ${reviewResponse.status}`);
                }
                const reviewJson = await reviewResponse.json();
                const reviewedText = reviewJson.choices[0].message.content;
                const finalResponse = replaceAIResponse(reviewedText);
                aiResponseText = finalResponse;
                tempAiMessage.innerHTML = `
                    <div class="message-content">
                        <p>${finalResponse}</p>
                    </div>
                `;
            }

            currentChat.messages.push({
                type: 'ai',
                content: replaceAIResponse(aiResponseText)
            });
            saveChatsToStorage();
            showThinkingTime(Date.now() - thinkingStartTime);
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
            tempAiMessage.innerHTML = `
                <div class="message-content">
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

    newChatButton.addEventListener('click', () => {
        console.log('[调试] 点击新建聊天按钮');
        createNewChat();
    });

    if (messageInput) {
        messageInput.addEventListener('input', () => {
            console.log('[调试] 输入框内容变化:', messageInput.value);
        });
    }
});