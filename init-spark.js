// init-spark.js
// 初始化API配置

document.addEventListener('DOMContentLoaded', () => {
    if (!window.sparkAPI) {
        console.error('错误: sparkAPI对象未定义，无法初始化。请检查 spark-api.js 是否正确加载。');
        // 如果有UI元素显示错误，可以在这里添加
        return;
    }
    
    console.log('开始初始化API配置...');
    // 从.env文件中获取配置
    // 注意：在实际生产环境中，这些值应该从服务器端获取，而不是直接嵌入到前端代码中
    const appId = '3993bebc';
    const apiKey = 'b1ac6aed76cef76575745f348445afdc';
    const apiSecret = 'MGJhNmNhNThlNzQyZmM5MTY5OTRlZjZl';
    const uid = 'SMTLITE';
    const url = 'wss://spark-api.xf-yun.com/v3.5/chat';
    const domain = 'generalv3.5';
    
    try {
        // 初始化API
        window.sparkAPI.init({
            appId,
            apiKey,
            apiSecret,
            uid,
            url,
            domain
        });
        
        console.log('API配置已成功初始化');
    } catch (error) {
        console.error('API初始化失败:', error);
    }
});