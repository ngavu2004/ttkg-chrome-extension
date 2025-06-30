// API Configuration
const API_BASE_URL = 'https://rj66xwfu1d.execute-api.us-east-1.amazonaws.com/Prod';
const FRONTEND_URL = 'https://text-to-knowledge-graph-frontend.vercel.app';

// Test Chrome extension APIs availability
console.log('Popup script loading...');
console.log('Chrome object available:', typeof chrome !== 'undefined');
console.log('Chrome runtime available:', typeof chrome !== 'undefined' && chrome.runtime);

// DOM Elements
const uploadSection = document.getElementById('upload-section');
const processingSection = document.getElementById('processing-section');
const errorSection = document.getElementById('error-section');
const graphSection = document.getElementById('graph-section');

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const processingMessage = document.getElementById('processing-message');
const progressFill = document.getElementById('progress-fill');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const nodeCount = document.getElementById('node-count');
const relationshipCount = document.getElementById('relationship-count');
const viewGraphBtn = document.getElementById('view-graph-btn');
const shareBtn = document.getElementById('share-btn');
const newFileBtn = document.getElementById('new-file-btn');
const status = document.getElementById('status');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const fileInfo = document.getElementById('file-info');

// State
let currentFile = null;
let currentFileId = null;
let currentGraphData = null;
let shareUrl = null;
let uploadProgress = 0;
let pollingAbortController = null;
let uploadCompleted = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', initialize);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
retryBtn.addEventListener('click', retryUpload);
viewGraphBtn.addEventListener('click', viewGraph);
shareBtn.addEventListener('click', shareGraph);
newFileBtn.addEventListener('click', resetToUpload);

// Listen for messages from background script and content script
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    console.log('Chrome APIs available, setting up message listener...');
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            switch (request.action) {
                case 'handleContextMenuFile':
                    handleContextMenuFile(request.data);
                    sendResponse({ success: true });
                    break;
                    
                case 'openPopup':
                    // Handle opening popup with pre-loaded data
                    if (request.data && request.data.files) {
                        // Could be used to pre-populate with detected files
                        console.log('Popup opened with detected files:', request.data.files);
                    }
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Popup message handler error:', error);
            sendResponse({ success: false, error: error.message });
        }
    });
} else {
    console.warn('Chrome extension APIs not available - extension may not be properly loaded');
    updateStatus('Extension not properly loaded. Please reload the extension.');
}

function initialize() {
    console.log('Initializing popup...');
    updateStatus('Ready to upload');
    showSection(uploadSection);
    addAnimations();
    
    // Add click handler for initial upload state only
    uploadArea.addEventListener('click', handleUploadAreaClick);
    
    // Test API connection on startup
    testApiConnection();
}

// Add smooth animations
function addAnimations() {
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });
    
    // Add hover effects to upload area
    uploadArea.addEventListener('mouseenter', () => {
        uploadArea.style.transform = 'translateY(-2px)';
    });
    
    uploadArea.addEventListener('mouseleave', () => {
        uploadArea.style.transform = 'translateY(0)';
    });
}

// File Upload Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
    uploadArea.querySelector('h3').textContent = 'Drop your file here';
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    uploadArea.querySelector('h3').textContent = 'Upload Your Document';
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    uploadArea.querySelector('h3').textContent = 'Upload Your Document';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const allowedTypes = [
        // Document formats
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.md',
        // Source code formats
        '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', 
        '.go', '.rs', '.swift', '.kt', '.jsx', '.tsx', '.vue', '.svelte'
    ];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
        showError('Unsupported file type. Please upload a document or source code file.');
        return;
    }

    // Validate file size (max 25MB for documents, 10MB for code files)
    const maxSize = isDocumentFile(fileExtension) ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        showError(`File too large. Please upload a file smaller than ${maxSizeMB}MB.`);
        return;
    }

    currentFile = file;
    showFileSelected();
}

function showFileSelected() {
    // Show file selected state
    uploadArea.innerHTML = `
        <div class="upload-content">
            <div class="upload-icon">📄</div>
            <h3>File Ready to Generate</h3>
            <p>${currentFile.name} (${formatFileSize(currentFile.size)})</p>
            <div class="space-y-3">
                <button class="btn btn-primary btn-lg" id="upload-file-btn">
                    🚀 Generate
                </button>
                <button class="btn btn-secondary" id="choose-different-btn">
                    Choose Different File
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to the new buttons
    const uploadFileBtn = uploadArea.querySelector('#upload-file-btn');
    const chooseDifferentBtn = uploadArea.querySelector('#choose-different-btn');
    
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', startFullProcess);
    }
    
    if (chooseDifferentBtn) {
        chooseDifferentBtn.addEventListener('click', resetToUpload);
    }
}

function isDocumentFile(fileExtension) {
    const documentTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md'];
    return documentTypes.includes(fileExtension);
}

function getFileTypeDescription(fileExtension) {
    const typeMap = {
        '.pdf': 'PDF Document',
        '.doc': 'Microsoft Word Document',
        '.docx': 'Microsoft Word Document',
        '.txt': 'Text Document',
        '.rtf': 'Rich Text Document',
        '.md': 'Markdown Document',
        '.js': 'JavaScript File',
        '.ts': 'TypeScript File',
        '.py': 'Python File',
        '.java': 'Java File',
        '.cpp': 'C++ File',
        '.c': 'C File',
        '.cs': 'C# File',
        '.php': 'PHP File',
        '.rb': 'Ruby File',
        '.go': 'Go File',
        '.rs': 'Rust File',
        '.swift': 'Swift File',
        '.kt': 'Kotlin File',
        '.jsx': 'React JSX File',
        '.tsx': 'React TSX File',
        '.vue': 'Vue File',
        '.svelte': 'Svelte File'
    };
    
    return typeMap[fileExtension] || 'Unknown File Type';
}

async function startFullProcess() {
    try {
        // Cancel any existing polling
        if (pollingAbortController) {
            pollingAbortController.abort();
        }
        
        // Create new abort controller for this upload session
        pollingAbortController = new AbortController();
        
        showSection(processingSection);
        updateStatus('Generating knowledge graph...');
        uploadProgress = 0;
        
        const fileExtension = '.' + currentFile.name.split('.').pop().toLowerCase();
        const fileType = getFileTypeDescription(fileExtension);
        
        updateProcessingMessage(`Uploading ${fileType}...`);
        
        // Test API connectivity first
        console.log('🧪 Testing API connectivity...');
        try {
            const testResponse = await fetch(`${API_BASE_URL}/health_check`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            console.log('✅ API connectivity test result:', testResponse.status);
        } catch (testError) {
            console.warn('⚠️ API connectivity test failed:', testError.message);
        }
        
        // Step 1: Get presigned URL
        updateProgress(10);
        console.log('🔄 Step 1: Getting presigned URL...');
        const presignedResponse = await getPresignedUrl(currentFile.name, currentFile.type);
        currentFileId = presignedResponse.file_id;
        console.log('✅ Step 1 complete: Got presigned URL and file_id:', currentFileId);
        
        // Step 2: Upload file to S3
        updateProgress(50);
        updateProcessingMessage('Uploading file to cloud storage...');
        console.log('🔄 Step 2: Uploading to S3...');
        await uploadFileToS3(presignedResponse.upload_url, currentFile, currentFile.type);
        console.log('✅ Step 2 complete: File uploaded to S3');
        
        // Step 3: Wait 15 minutes for processing to complete
        updateProgress(70);
        updateProcessingMessage('File uploaded successfully. Processing in background...');
        console.log('🔄 Step 3: Starting 15-minute polling...');
        
        // Wait for 15 minutes with progress updates
        await waitForProcessing(15 * 60 * 1000); // 15 minutes in milliseconds
        
        // Note: waitForProcessing now handles the frontend checking internally
        
    } catch (error) {
        console.error('❌ Process error:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        // Provide more specific error messages
        let userMessage = 'Failed to process file';
        
        if (error.message.includes('Failed to get upload URL')) {
            userMessage = 'Failed to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('Failed to upload file')) {
            userMessage = 'Failed to upload file to cloud storage. Please try again.';
        } else if (error.message.includes('Network error')) {
            userMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('CORS')) {
            userMessage = 'Server connection error. Please try again later.';
        } else if (error.message.includes('Failed to fetch')) {
            userMessage = 'Unable to reach the server. Please check your internet connection and try again.';
        }
        
        showError(userMessage);
    } finally {
        // Clean up abort controller
        pollingAbortController = null;
    }
}

async function waitForProcessing(totalWaitTime) {
    const startTime = Date.now();
    const pollInterval = 30000; // Poll every 30 seconds
    let elapsedTime = 0;
    let pollAttempts = 0;
    const maxAttempts = Math.floor(totalWaitTime / pollInterval); // 30 attempts in 15 minutes
    
    while (elapsedTime < totalWaitTime) {
        // Check if cancelled
        if (pollingAbortController?.signal.aborted) {
            return;
        }
        
        // Calculate remaining time
        const remainingTime = totalWaitTime - elapsedTime;
        const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
        
        // Update progress and message
        const progressPercent = 70 + (elapsedTime / totalWaitTime) * 20; // 70% to 90%
        updateProgress(Math.round(progressPercent));
        updateProcessingMessage(`Checking processing status... (${remainingMinutes} minutes remaining, attempt ${pollAttempts + 1}/${maxAttempts})`);
        
        // Try to check processing status from backend API
        try {
            console.log(`🔍 Polling attempt ${pollAttempts + 1}/${maxAttempts}: Checking backend status`);
            
            const response = await fetch(`${API_BASE_URL}/get_saved_graph/${currentFileId}`);
            
            if (response.status === 404) {
                // Still processing - this is expected
                console.log(`⚠️ Graph still processing (attempt ${pollAttempts + 1}): 404 - not ready yet`);
            } else if (response.ok) {
                const data = await response.json();
                console.log(`📊 Backend response (attempt ${pollAttempts + 1}):`, data);
                
                if (data.status === 'completed' && data.graph_data) {
                    // Check if graph has content (nodes and relationships)
                    const nodes = data.graph_data.nodes || [];
                    const relationships = data.graph_data.edges || data.graph_data.relationships || [];
                    
                    console.log(`📈 Graph stats: ${nodes.length} nodes, ${relationships.length} relationships`);
                    
                    if (nodes.length > 0 || relationships.length > 0) {
                        // Graph is ready with content!
                        currentGraphData = data.graph_data;
                        updateProgress(100);
                        updateProcessingMessage('Graph generated successfully!');
                        showGraphSection();
                        return; // Exit the polling loop
                    } else {
                        console.log(`⚠️ Graph completed but empty (attempt ${pollAttempts + 1}): continuing to poll...`);
                    }
                } else if (data.status === 'error') {
                    throw new Error(data.error || 'Failed to process file');
                } else {
                    console.log(`⚠️ Graph still processing (attempt ${pollAttempts + 1}): status = ${data.status}`);
                }
            } else {
                console.log(`⚠️ Backend error (attempt ${pollAttempts + 1}):`, response.status, response.statusText);
            }
        } catch (error) {
            console.log(`⚠️ Polling error (attempt ${pollAttempts + 1}):`, error.message);
        }
        
        pollAttempts++;
        
        // Wait for next poll (or until timeout)
        const waitTime = Math.min(pollInterval, remainingTime);
        await new Promise(resolve => {
            const timeoutId = setTimeout(resolve, waitTime);
            if (pollingAbortController) {
                pollingAbortController.signal.addEventListener('abort', () => {
                    clearTimeout(timeoutId);
                    resolve();
                });
            }
        });
        
        elapsedTime = Date.now() - startTime;
    }
    
    // If we reach here, the graph wasn't ready after 15 minutes
    console.log('⏰ 15 minutes elapsed, graph not ready');
    updateProgress(100);
    updateProcessingMessage('Processing may still be in progress. You can try viewing the graph manually.');
    showManualCheckSection();
}

function showManualCheckSection() {
    // Show a section that allows manual checking
    processingSection.innerHTML = `
        <div class="processing-content">
            <div class="spinner"></div>
            <h3>Processing Complete</h3>
            <p id="processing-message">Your file has been uploaded and is being processed.</p>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill" style="width: 100%"></div>
            </div>
            <div class="space-y-3 mt-4">
                <button class="btn btn-primary btn-lg" id="try-view-graph-btn">
                    🧠 Try View Graph
                </button>
                <button class="btn btn-secondary" id="check-later-btn">
                    📁 Upload New File
                </button>
            </div>
            <p class="text-xs text-gray-500 text-center mt-4">
                If the graph isn't ready yet, you can try again later or upload a new file.
            </p>
        </div>
    `;
    
    const tryViewBtn = processingSection.querySelector('#try-view-graph-btn');
    const checkLaterBtn = processingSection.querySelector('#check-later-btn');
    
    if (tryViewBtn) {
        tryViewBtn.addEventListener('click', () => {
            // Try to open the graph directly
            const graphUrl = `${FRONTEND_URL}/graph/${currentFileId}`;
            chrome.tabs.create({ url: graphUrl });
            window.close();
        });
    }
    
    if (checkLaterBtn) {
        checkLaterBtn.addEventListener('click', resetToUpload);
    }
}

function showGraphSection() {
    // Update file info
    fileName.textContent = currentFile.name;
    fileSize.textContent = formatFileSize(currentFile.size);
    
    // Update graph stats
    if (currentGraphData && currentGraphData.nodes) {
        nodeCount.textContent = `${currentGraphData.nodes.length} nodes`;
    }
    
    if (currentGraphData && currentGraphData.edges) {
        relationshipCount.textContent = `${currentGraphData.edges.length} relationships`;
    }
    
    showSection(graphSection);
    updateStatus('Graph generated successfully');
}

async function viewGraph() {
    try {
        // Redirect to the frontend graph page with the file_id
        const graphUrl = `${FRONTEND_URL}/graph/${currentFileId}`;
        chrome.tabs.create({ url: graphUrl });
        
        // Close the popup after opening the graph
        window.close();
    } catch (error) {
        console.error('Error opening graph:', error);
        showError('Failed to open graph');
    }
}

async function shareGraph() {
    try {
        if (!shareUrl) {
            const response = await fetch(`${API_BASE_URL}/generate-share-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_id: currentFileId })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate share link');
            }
            
            const data = await response.json();
            shareUrl = data.share_url;
        }
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Show success message
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<span>✅</span> Copied!';
        shareBtn.disabled = true;
        
        setTimeout(() => {
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error sharing graph:', error);
        showError('Failed to share graph');
    }
}

function retryUpload() {
    if (currentFile) {
        startFullProcess();
    } else {
        resetToUpload();
    }
}

function resetToUpload() {
    // Cancel any ongoing polling
    if (pollingAbortController) {
        pollingAbortController.abort();
        pollingAbortController = null;
    }
    
    currentFile = null;
    currentFileId = null;
    currentGraphData = null;
    shareUrl = null;
    uploadProgress = 0;
    uploadCompleted = false;
    
    // Reset upload area
    uploadArea.innerHTML = `
        <div class="upload-content">
            <div class="upload-icon">📁</div>
            <h3>Upload Your Document</h3>
            <p>Drag and drop a file here or click to browse</p>
            <p class="file-types">Supports: PDF, DOC, DOCX, TXT, RTF, MD, and source code files • Max 25MB</p>
            <input type="file" id="file-input" accept=".pdf,.doc,.docx,.txt,.rtf,.md,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.jsx,.tsx,.vue,.svelte" hidden>
            <button class="btn btn-primary btn-lg" id="upload-btn">Browse Files</button>
        </div>
    `;
    
    // Re-attach event listeners for initial state
    uploadArea.addEventListener('click', handleUploadAreaClick);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    showSection(uploadSection);
    updateStatus('Ready to upload');
}

function showError(message) {
    errorMessage.textContent = message;
    showSection(errorSection);
    updateStatus('Error occurred');
}

function showSection(section) {
    // Hide all sections
    uploadSection.classList.add('hidden');
    processingSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    graphSection.classList.add('hidden');
    
    // Show target section
    section.classList.remove('hidden');
    section.classList.add('fade-in');
}

function updateStatus(message) {
    status.textContent = message;
}

function updateProcessingMessage(message) {
    processingMessage.textContent = message;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle context menu file selection
function handleContextMenuFile(fileData) {
    console.log('Handling context menu file:', fileData);
    
    // Create a file-like object from the URL
    const fileName = fileData.name || fileData.url.split('/').pop();
    const fileType = fileData.type || 'text/plain';
    
    // For now, we'll show a message that direct URL uploads need to be implemented
    showError('Direct file upload from URLs is not yet supported. Please download the file and upload it manually.');
    
    // TODO: Implement direct file download and upload from URLs
    // This would require:
    // 1. Downloading the file from the URL
    // 2. Creating a File object from the downloaded data
    // 3. Processing it through the normal upload flow
}

function updateProgress(progress) {
    uploadProgress = progress;
    progressFill.style.width = `${progress}%`;
}

async function getPresignedUrl(fileName, contentType) {
    try {
        console.log('🔍 Getting presigned URL for:', { fileName, contentType });
        console.log('🌐 API Base URL:', API_BASE_URL);
        
        const url = `${API_BASE_URL}/get_presigned_url?file_name=${encodeURIComponent(fileName)}&content_type=${encodeURIComponent(contentType)}`;
        console.log('📡 Request URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            let errorText = '';
            try {
                const errorData = await response.text();
                errorText = errorData;
                console.error('❌ Error response body:', errorData);
            } catch (e) {
                errorText = 'No error details available';
            }
            
            throw new Error(`Failed to get upload URL: ${response.status} ${response.statusText}. ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Presigned URL response:', data);
        
        // Validate required fields
        if (!data.file_id) {
            throw new Error('No file_id received from presigned URL endpoint');
        }
        
        // Check for upload URL - it might be in different fields
        const uploadUrl = data.upload_url || data.presigned_url || data.url;
        if (!uploadUrl) {
            console.error('❌ No upload URL found in response. Available fields:', Object.keys(data));
            throw new Error('No upload URL received from presigned URL endpoint');
        }
        
        console.log('✅ Upload URL found:', uploadUrl);
        
        return {
            file_id: data.file_id,
            upload_url: uploadUrl
        };
        
    } catch (error) {
        console.error('❌ getPresignedUrl error:', error);
        
        // Check for specific error types
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
        }
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
        }
        
        if (error.message.includes('CORS')) {
            throw new Error('CORS error: The server is not allowing requests from this extension. Please contact support.');
        }
        
        // Re-throw the original error if it's already formatted
        if (error.message.includes('Failed to get upload URL:')) {
            throw error;
        }
        
        throw new Error(`Failed to get upload URL: ${error.message}`);
    }
}

async function uploadFileToS3(uploadUrl, file, contentType) {
    try {
        console.log('🔄 Uploading to S3 with URL:', uploadUrl);
        console.log('📁 File details:', { name: file.name, size: file.size, type: contentType });
        
        if (!uploadUrl || uploadUrl === 'undefined') {
            throw new Error('Invalid upload URL received from server');
        }
        
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': contentType }
        });
        
        console.log('📤 S3 upload response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            throw new Error(`Failed to upload file to S3: ${response.status} ${response.statusText}. ${errorText}`);
        }
        
        console.log('✅ S3 upload successful');
        
    } catch (error) {
        console.error('❌ S3 upload error:', error);
        
        if (error.message.includes('Invalid upload URL')) {
            throw new Error('Server returned an invalid upload URL. Please try again.');
        }
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error during file upload. Please check your internet connection.');
        }
        
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}

// Handle upload area click only in initial state
function handleUploadAreaClick(e) {
    // Only trigger file dialog if we're in the initial upload state (no file selected)
    if (!currentFile) {
        fileInput.click();
    }
}

// Test API connection to help debug issues
async function testApiConnection() {
    try {
        console.log('🧪 Testing API connection...');
        const response = await fetch(`${API_BASE_URL}/health_check`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ API connection successful');
        } else {
            console.warn('⚠️ API health check failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ API connection test failed:', error);
    }
} 