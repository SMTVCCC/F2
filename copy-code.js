function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('code');
    const textToCopy = codeElement.textContent;

    // 使用现代的Clipboard API
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            // 更新按钮文本显示复制成功
            const originalText = button.textContent;
            button.textContent = '复制成功！';
            button.style.backgroundColor = '#FFB6C1';
            button.style.color = 'white';

            // 2秒后恢复原始状态
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.style.color = '';
            }, 2000);
        })
        .catch(err => {
            console.error('复制出错:', err);
            button.textContent = '复制失败';
            button.style.backgroundColor = '#ff0000';
            button.style.color = 'white';
        });
}