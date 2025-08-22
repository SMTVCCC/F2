function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('code');
    
    if (!codeElement) {
        console.error('未找到代码元素');
        return;
    }
    
    // 获取代码内容，优先使用textContent，如果为空则尝试innerText
    let textToCopy = codeElement.textContent || codeElement.innerText || '';
    
    // 如果还是为空，尝试从innerHTML中提取纯文本
    if (!textToCopy.trim()) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = codeElement.innerHTML;
        textToCopy = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    // 清理多余的空白字符，但保留代码格式
    textToCopy = textToCopy.replace(/^\s+|\s+$/g, ''); // 去除首尾空白
    
    if (!textToCopy.trim()) {
        console.error('代码内容为空');
        button.textContent = '内容为空';
        button.style.backgroundColor = '#ff9800';
        button.style.color = 'white';
        setTimeout(() => {
            button.textContent = '复制代码';
            button.style.backgroundColor = '';
            button.style.color = '';
        }, 2000);
        return;
    }

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
            
            // 如果Clipboard API失败，尝试使用传统方法
            try {
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                button.textContent = '复制成功！';
                button.style.backgroundColor = '#FFB6C1';
                button.style.color = 'white';
                
                setTimeout(() => {
                    button.textContent = '复制代码';
                    button.style.backgroundColor = '';
                    button.style.color = '';
                }, 2000);
            } catch (fallbackErr) {
                console.error('备用复制方法也失败:', fallbackErr);
                button.textContent = '复制失败';
                button.style.backgroundColor = '#ff0000';
                button.style.color = 'white';
                
                setTimeout(() => {
                    button.textContent = '复制代码';
                    button.style.backgroundColor = '';
                    button.style.color = '';
                }, 2000);
            }
        });
}