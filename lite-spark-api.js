// spark-api.js
// 星火API通信模块

// 防止重复定义，检查是否已存在liteSparkAPI对象
if (!window.liteSparkAPI) {
    console.log('创建新的 liteSparkAPI 对象');
    // 创建一个全局对象来处理lite版星火API的通信
    window.liteSparkAPI = {
        ws: null,
        appId: '',
        apiKey: '',
        apiSecret: '',
        uid: '',
        url: '',
        domain: '',
        responseCallback: null,
        messageBuffer: '', // 添加消息缓冲区
        isFirstConnect: true, // 新增标记，用于跟踪是否是首次连接
        hasConnected: false, // 跟踪是否成功连接过
        
        // 初始化API配置
        init(config) {
            this.appId = config.appId;
            this.apiKey = config.apiKey;
            this.apiSecret = config.apiSecret;
            this.uid = config.uid;
            this.url = config.url;
            this.domain = config.domain;
            console.log('星火API初始化完成');
            
            // 初始化时预先连接WebSocket，但不显示错误
            this.connect(true);
        },
        
        // 设置响应回调函数
        setResponseCallback(callback) {
            this.responseCallback = callback;
        },
        
        // 生成认证URL
        generateAuthUrl() {
            const date = new Date().toGMTString();
            const signatureOrigin = `host: spark-api.xf-yun.com\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
            const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
            const signature = CryptoJS.enc.Base64.stringify(signatureSha);
            const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
            const authorization = btoa(authorizationOrigin);
            
            return `${this.url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=spark-api.xf-yun.com`;
        },
        
        // 连接WebSocket
        async connect(silent = false) {
            // 如果已经有连接且状态正常，则不需要重新连接
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                console.log('WebSocket已连接，无需重新连接');
                return true;
            }
            
            // 关闭现有连接
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            
            try {
                const url = this.generateAuthUrl();
                this.ws = new WebSocket(url);
                
                // 等待连接打开或失败
                const connectionPromise = new Promise((resolve) => {
                    this.ws.onopen = () => {
                        console.log('WebSocket连接已建立');
                        this.isFirstConnect = false; // 连接成功后更新标记
                        resolve(true);
                    };
                    
                    this.ws.onerror = (error) => {
                        console.error('WebSocket错误:', error);
                        if (!silent && this.responseCallback) {
                            this.responseCallback('连接星火API时出现错误，请稍后再试', 'error');
                        }
                        resolve(false);
                    };
                    
                    this.ws.onclose = () => {
                        console.log('WebSocket连接已关闭');
                        resolve(false);
                    };
                    
                    this.ws.onmessage = (event) => {
                        try {
                            const response = JSON.parse(event.data);
                            this.handleResponse(response);
                        } catch (error) {
                            console.error('解析响应失败:', error);
                            if (!silent && this.responseCallback) {
                                this.responseCallback('抱歉，处理响应时出现错误', 'error');
                            }
                        }
                    };
                    
                    // 设置超时
                    setTimeout(() => {
                        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
                            resolve(false);
                        }
                    }, 5000); // 5秒超时
                });
                
                const connected = await connectionPromise;
                return connected;
                
            } catch (error) {
                console.error('创建WebSocket连接失败:', error);
                if (!silent && this.responseCallback) {
                    this.responseCallback('无法连接到星火API，请检查网络连接', 'error');
                }
                return false;
            }
        },
        
        // 处理API响应
        handleResponse(response) {
            if (response.header.code !== 0) {
                console.error('API错误:', response.header.message);
                if (this.responseCallback) {
                    this.responseCallback(`API错误: ${response.header.message}`, 'error');
                }
                return;
            }
            
            // 检查是否有文本内容
            if (response.payload && response.payload.choices && response.payload.choices.text && response.payload.choices.text.length > 0) {
                const content = response.payload.choices.text[0].content;
                
                // 将新内容添加到缓冲区
                this.messageBuffer += content;
                
                // 检查会话状态
                const status = response.payload.choices.status;
                
                // 使用延迟输出机制，让文字逐步显示
                this.simulateTypingEffect(this.messageBuffer, status === 2);
                
                // 如果会话结束，清空缓冲区
                if (status === 2) {
                    this.messageBuffer = '';
                }
            }
        },
        
        // 模拟打字效果的延迟输出
        simulateTypingEffect(fullText, isComplete) {
            // 如果已经有正在进行的打字效果，清除它
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
            }
            
            // 初始化显示文本
            if (!this.displayedText) {
                this.displayedText = '';
            }
            
            // 如果显示的文本已经是完整文本，直接返回
            if (this.displayedText === fullText) {
                if (isComplete && this.responseCallback) {
                    this.responseCallback(fullText, 'assistant', true);
                }
                return;
            }
            
            // 计算需要添加的新字符
            const newChars = fullText.slice(this.displayedText.length);
            
            // 逐字符显示
            let charIndex = 0;
            const typeNextChar = () => {
                if (charIndex < newChars.length) {
                    this.displayedText += newChars[charIndex];
                    charIndex++;
                    
                    // 更新显示
                    if (this.responseCallback) {
                        this.responseCallback(this.displayedText, 'assistant', false);
                    }
                    
                    // 设置下一个字符的延迟
                    const delay = this.getTypingDelay(newChars[charIndex - 1]);
                    this.typingTimer = setTimeout(typeNextChar, delay);
                } else {
                    // 所有字符都显示完毕
                    if (isComplete && this.responseCallback) {
                        this.responseCallback(this.displayedText, 'assistant', true);
                        this.displayedText = ''; // 重置显示文本
                    }
                }
            };
            
            // 开始打字效果
            typeNextChar();
        },
        
        // 根据字符类型返回不同的延迟时间
        getTypingDelay(char) {
            if (!char) return 30;
            
            // 中文字符稍慢一些
            if (/[\u4e00-\u9fa5]/.test(char)) {
                return 50 + Math.random() * 25; // 50-75ms
            }
            // 标点符号停顿稍长
            else if (/[。！？；，、：]/.test(char)) {
                return 120 + Math.random() * 60; // 120-180ms
            }
            // 英文字符和数字
            else if (/[a-zA-Z0-9]/.test(char)) {
                return 20 + Math.random() * 15; // 20-35ms
            }
            // 空格和换行
            else if (/\s/.test(char)) {
                return 30 + Math.random() * 20; // 30-50ms
            }
            // 其他字符
            else {
                return 40 + Math.random() * 25; // 40-65ms
            }
        },
        
        // 发送消息到API
        async sendMessage(message) {
            // 清空消息缓冲区和显示状态
            this.messageBuffer = '';
            this.displayedText = '';
            
            // 清除可能存在的打字定时器
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
                this.typingTimer = null;
            }
            
            // 确保WebSocket连接已建立
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                const connected = await this.connect();
                if (!connected) {
                    if (this.responseCallback) {
                        this.responseCallback('发送消息失败，请稍后再试', 'error');
                    }
                    return;
                }
            }
            
            const data = {
                header: {
                    app_id: this.appId,
                    uid: this.uid
                },
                parameter: {
                    chat: {
                        domain: this.domain,
                        temperature: 0.5,
                        max_tokens: 2048
                    }
                },
                payload: {
                    message: {
                        text: [{ role: 'user', content: message }]
                    }
                }
            };
            
            try {
                this.ws.send(JSON.stringify(data));
            } catch (error) {
                console.error('发送消息失败:', error);
                
                // 尝试重新连接并发送
                const reconnected = await this.connect();
                if (reconnected) {
                    try {
                        this.ws.send(JSON.stringify(data));
                        return;
                    } catch (e) {
                        console.error('重试发送消息失败:', e);
                    }
                }
                
                if (this.responseCallback) {
                    this.responseCallback('发送消息失败，请稍后再试', 'error');
                }
            }
        }
    };
}