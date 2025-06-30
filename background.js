// Background service worker for Text to Knowledge Graph extension

// Wait for Chrome APIs to be available
function initializeExtension() {
    // Check if Chrome extension APIs are available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.error('Chrome extension APIs not available in background script');
        return;
    }

    // Handle extension installation
    if (chrome.runtime.onInstalled) {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('Text to Knowledge Graph extension installed');
                
                // Set default settings
                if (chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({
                        settings: {
                            autoOpenGraph: false,
                            maxFileSize: 25 * 1024 * 1024, // 25MB for documents
                            maxCodeFileSize: 10 * 1024 * 1024, // 10MB for code files
                            pollingInterval: 5000, // 5 seconds
                            maxPollingAttempts: 60 // 5 minutes
                        }
                    });
                }
                
                // Create context menu for right-click on files
                if (chrome.contextMenus) {
                    try {
                        chrome.contextMenus.create({
                            id: 'uploadToKnowledgeGraph',
                            title: 'Upload to Knowledge Graph',
                            contexts: ['link'],
                            documentUrlPatterns: ['*://github.com/*', '*://gitlab.com/*', '*://bitbucket.org/*']
                        });
                    } catch (error) {
                        console.log('Context menu creation failed:', error);
                    }
                }
            }
        });
    }

    // Handle extension startup
    if (chrome.runtime.onStartup) {
        chrome.runtime.onStartup.addListener(() => {
            console.log('Text to Knowledge Graph extension started');
        });
    }

    // Handle messages from popup or content scripts
    if (chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                switch (request.action) {
                    case 'getSettings':
                        if (chrome.storage && chrome.storage.local) {
                            chrome.storage.local.get(['settings'], (result) => {
                                sendResponse({ settings: result.settings || {} });
                            });
                            return true; // Keep message channel open for async response
                        } else {
                            sendResponse({ settings: {} });
                        }
                        break;
                        
                    case 'updateSettings':
                        if (chrome.storage && chrome.storage.local) {
                            chrome.storage.local.set({ settings: request.settings }, () => {
                                sendResponse({ success: true });
                            });
                            return true;
                        } else {
                            sendResponse({ success: false, error: 'Storage not available' });
                        }
                        break;
                        
                    case 'openGraph':
                        if (chrome.tabs) {
                            chrome.tabs.create({ url: request.url });
                            sendResponse({ success: true });
                        } else {
                            sendResponse({ success: false, error: 'Tabs API not available' });
                        }
                        break;
                        
                    case 'copyToClipboard':
                        // Note: Chrome extensions can't directly access clipboard in service worker
                        // This would need to be handled in the popup or content script
                        sendResponse({ success: false, error: 'Clipboard access not available in service worker' });
                        break;
                        
                    default:
                        sendResponse({ success: false, error: 'Unknown action' });
                }
            } catch (error) {
                console.error('Message handler error:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
    }

    // Handle tab updates (optional - for future features)
    if (chrome.tabs && chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            // Could be used for detecting when user is on a code repository
            // and showing context menu options
        });
    }

    // Handle context menu clicks
    if (chrome.contextMenus && chrome.contextMenus.onClicked) {
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'uploadToKnowledgeGraph') {
                // Handle file upload from context menu
                console.log('Context menu clicked for:', info.linkUrl);
                
                // Send message to content script to handle the file
                if (chrome.tabs && chrome.tabs.sendMessage) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'handleContextMenuFile',
                        url: info.linkUrl
                    });
                }
            }
        });
    }

    // Handle storage changes
    if (chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.settings) {
                console.log('Settings updated:', changes.settings.newValue);
            }
        });
    }

    // Error handling
    if (chrome.runtime.onSuspend) {
        chrome.runtime.onSuspend.addListener(() => {
            console.log('Text to Knowledge Graph extension suspended');
        });
    }

    // Handle extension errors
    if (chrome.runtime.onError) {
        chrome.runtime.onError.addListener((error) => {
            console.error('Extension error:', error);
        });
    }
}

// Initialize the extension (service worker context, no DOM)
initializeExtension(); 