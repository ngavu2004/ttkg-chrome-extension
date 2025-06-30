# Text-to-Knowledge Graph Chrome Extension

A Chrome extension that allows you to upload documents and source code files to generate interactive knowledge graphs. The extension integrates with the [Text-to-Knowledge Graph Frontend](https://text-to-knowledge-graph-frontend.vercel.app) for visualization.

## Features

- **File Upload**: Support for multiple file types including:
  - **Documents**: PDF, DOC, DOCX, TXT, RTF, MD (max 25MB)
- **Smart Processing**: Intelligent polling system that waits for file processing completion
- **Frontend Integration**: Seamlessly redirects to the frontend for graph visualization
- **Context Menu Integration**: Right-click on files to upload them directly
- **Modern UI**: Beautiful interface matching the frontend design system

## Installation

1. **Download the Extension**:
   - Clone or download this repository
   - Navigate to the `ttkg-chrome-extension` folder

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `ttkg-chrome-extension` folder

3. **Verify Installation**:
   - The extension icon should appear in your Chrome toolbar
   - Click the icon to open the popup interface

## Usage

### Basic Upload
1. Click the extension icon in your Chrome toolbar
2. Drag and drop a file or click "Browse Files"
3. Select your document or source code file
4. Click "Upload & Generate Mind Map"
5. Wait for processing (the extension will poll the backend)
6. Once complete, click "View Graph" to open in the frontend

### Context Menu Upload
1. Right-click on any supported file in your file explorer
2. Select "Upload to Knowledge Graph" from the context menu
3. The extension will open and start processing the file

### Supported File Types

**Documents (max 25MB)**:
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Text files (.txt)
- Rich Text (.rtf)
- Markdown (.md)

## Technical Details

### API Integration
- **Backend API**: `https://rj66xwfu1d.execute-api.us-east-1.amazonaws.com`
- **Frontend**: `https://text-to-knowledge-graph-frontend.vercel.app`
- **File Processing**: Uses presigned URLs for secure S3 uploads
- **Polling Strategy**: Smart adaptive polling with exponential backoff

### Architecture
- **Popup**: Main UI for file upload and processing status
- **Background Script**: Handles context menu and extension lifecycle
- **Content Script**: Detects files on web pages
- **Service Worker**: Manages extension state and API calls

### Processing Flow
1. **File Selection**: User selects or drops a file
2. **Validation**: File type and size validation
3. **Upload**: Get presigned URL and upload to S3
4. **Processing**: Poll backend for processing status
5. **Completion**: Redirect to frontend for visualization

## Development

### Project Structure
```
ttkg-chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI
├── popup.css             # Styling
├── popup.js              # Main logic
├── background.js         # Background service worker
├── content.js            # Content script
├── icons/                # Extension icons
├── package.json          # Dependencies
└── README.md            # This file
```

### Key Files
- **manifest.json**: Extension permissions and configuration
- **popup.js**: Main upload and processing logic
- **background.js**: Context menu and message handling
- **content.js**: Web page file detection

### API Endpoints Used
- `GET /get_presigned_url` - Get S3 upload URL
- `GET /get_saved_graph/{file_id}` - Check processing status
- `POST /generate-share-link` - Generate shareable links

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Check that Developer mode is enabled
   - Reload the extension from chrome://extensions/
   - Check browser console for errors

2. **File upload fails**:
   - Verify file type is supported
   - Check file size limits
   - Ensure stable internet connection

3. **Processing timeout**:
   - Large files may take longer to process
   - Try with a smaller file first
   - Check backend service status

4. **Graph not loading**:
   - Verify the frontend URL is accessible
   - Check if the file_id is valid
   - Try refreshing the page

### Debug Mode
- Open Chrome DevTools for the popup (right-click extension icon → Inspect)
- Check the console for detailed error messages
- Monitor network requests in the Network tab

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the browser console for error messages
- Ensure all dependencies are properly installed
- Verify API endpoints are accessible
