// Content script for Text to Knowledge Graph extension
// This script runs on web pages and can interact with the page content

console.log('Text to Knowledge Graph content script loaded');

// Check if Chrome extension APIs are available
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    // Listen for messages from the popup or background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            switch (request.action) {
                case 'getPageInfo':
                    sendResponse({
                        url: window.location.href,
                        title: document.title,
                        domain: window.location.hostname
                    });
                    break;
                
                case 'detectCodeFiles':
                    const codeFiles = detectCodeFiles();
                    sendResponse({ codeFiles });
                    break;
                
                case 'extractCodeContent':
                    const codeContent = extractCodeContent();
                    sendResponse({ codeContent });
                    break;
                
                case 'handleContextMenuFile':
                    handleContextMenuFile(request.url);
                    sendResponse({ success: true });
                    break;
                
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    });
} else {
    console.warn('Chrome extension APIs not available in content script');
}

// Handle context menu file selection
function handleContextMenuFile(url) {
    console.log('Handling context menu file:', url);
    
    // Extract file information
    const fileName = url.split('/').pop();
    const fileType = getFileType(url);
    const fileCategory = getFileCategory(url);
    
    // Send message to popup to handle the file
    chrome.runtime.sendMessage({
        action: 'handleContextMenuFile',
        data: {
            url: url,
            name: fileName,
            type: fileType,
            category: fileCategory
        }
    });
}

// Detect code files and documents on the current page
function detectCodeFiles() {
    const files = [];
    
    // Look for file links with supported extensions
    const fileLinks = document.querySelectorAll('a[href*="."]');
    const supportedExtensions = [
        // Document formats
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.md',
        // Code formats
        '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', 
        '.go', '.rs', '.swift', '.kt', '.jsx', '.tsx', '.vue', '.svelte',
        '.html', '.css', '.scss', '.sass', '.less', '.xml', '.json', '.yaml', '.yml'
    ];
    
    fileLinks.forEach(link => {
        const href = link.href.toLowerCase();
        const hasSupportedExtension = supportedExtensions.some(ext => href.includes(ext));
        
        if (hasSupportedExtension) {
            files.push({
                url: link.href,
                name: link.textContent.trim() || link.href.split('/').pop(),
                type: getFileType(href),
                category: getFileCategory(href)
            });
        }
    });
    
    return files;
}

// Extract code content from the current page
function extractCodeContent() {
    const codeBlocks = [];
    
    // Look for code blocks (pre, code elements)
    const preElements = document.querySelectorAll('pre');
    preElements.forEach((pre, index) => {
        const codeElement = pre.querySelector('code');
        if (codeElement) {
            codeBlocks.push({
                id: index,
                content: codeElement.textContent,
                language: codeElement.className.replace('language-', '') || 'text'
            });
        }
    });
    
    // Look for inline code
    const inlineCode = document.querySelectorAll('code:not(pre code)');
    inlineCode.forEach((code, index) => {
        codeBlocks.push({
            id: `inline-${index}`,
            content: code.textContent,
            language: 'text',
            inline: true
        });
    });
    
    return codeBlocks;
}

// Get file type from URL
function getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const typeMap = {
        // Document formats
        'pdf': 'PDF Document',
        'doc': 'Microsoft Word Document',
        'docx': 'Microsoft Word Document',
        'txt': 'Text Document',
        'rtf': 'Rich Text Document',
        'md': 'Markdown Document',
        // Code formats
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'py': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C',
        'cs': 'C#',
        'php': 'PHP',
        'rb': 'Ruby',
        'go': 'Go',
        'rs': 'Rust',
        'swift': 'Swift',
        'kt': 'Kotlin',
        'jsx': 'React JSX',
        'tsx': 'React TSX',
        'vue': 'Vue',
        'svelte': 'Svelte',
        'html': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
        'sass': 'Sass',
        'less': 'Less',
        'xml': 'XML',
        'json': 'JSON',
        'yaml': 'YAML',
        'yml': 'YAML'
    };
    
    return typeMap[extension] || 'Unknown';
}

// Get file category (document or code)
function getFileCategory(url) {
    const extension = url.split('.').pop().toLowerCase();
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'];
    const codeTypes = ['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'jsx', 'tsx', 'vue', 'svelte', 'html', 'css', 'scss', 'sass', 'less', 'xml', 'json', 'yaml', 'yml'];
    
    if (documentTypes.includes(extension)) {
        return 'document';
    } else if (codeTypes.includes(extension)) {
        return 'code';
    }
    return 'unknown';
}

// Inject custom styles for better integration
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .ttkg-extension-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .ttkg-extension-indicator:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .ttkg-code-highlight {
            background: rgba(102, 126, 234, 0.1) !important;
            border-left: 3px solid #667eea !important;
        }
        
        .ttkg-document-highlight {
            background: rgba(39, 174, 96, 0.1) !important;
            border-left: 3px solid #27ae60 !important;
        }
    `;
    document.head.appendChild(style);
}

// Show extension indicator on document/code-heavy pages
function showExtensionIndicator() {
    const files = detectCodeFiles();
    const codeBlocks = extractCodeContent();
    
    if (files.length > 0 || codeBlocks.length > 0) {
        const documentCount = files.filter(f => f.category === 'document').length;
        const codeCount = files.filter(f => f.category === 'code').length;
        
        const indicator = document.createElement('div');
        indicator.className = 'ttkg-extension-indicator';
        
        let indicatorText = '🧠 ';
        if (documentCount > 0 && codeCount > 0) {
            indicatorText += `${documentCount} docs, ${codeCount} code files, ${codeBlocks.length} code blocks`;
        } else if (documentCount > 0) {
            indicatorText += `${documentCount} documents detected`;
        } else if (codeCount > 0) {
            indicatorText += `${codeCount} files, ${codeBlocks.length} code blocks detected`;
        } else {
            indicatorText += `${codeBlocks.length} code blocks detected`;
        }
        
        indicator.textContent = indicatorText;
        indicator.title = 'Click to analyze with Knowledge Graph';
        
        indicator.addEventListener('click', () => {
            chrome.runtime.sendMessage({
                action: 'openPopup',
                data: { files, codeBlocks }
            });
        });
        
        document.body.appendChild(indicator);
        
        // Remove indicator after 5 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 5000);
    }
}

// Initialize content script
function initialize() {
    injectStyles();
    
    // Show indicator after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showExtensionIndicator);
    } else {
        showExtensionIndicator();
    }
    
    // Listen for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if new content was added
                const hasNewContent = Array.from(mutation.addedNodes).some(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        return node.querySelector('pre, code, a[href*="."]') || 
                               node.tagName === 'PRE' || 
                               node.tagName === 'CODE' ||
                               (node.tagName === 'A' && node.href && node.href.includes('.'));
                    }
                    return false;
                });
                
                if (hasNewContent) {
                    showExtensionIndicator();
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start the content script
initialize(); 