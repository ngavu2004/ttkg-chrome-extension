# Text to Knowledge Graph Extension

## Overview

The Text to Knowledge Graph Chrome Extension is a powerful tool that transforms documents and source code into interactive knowledge graphs. It supports multiple file formats and provides real-time processing capabilities.

## Supported File Types

### Document Formats
- **PDF** (.pdf) - Portable Document Format
- **DOC** (.doc) - Microsoft Word Document (legacy)
- **DOCX** (.docx) - Microsoft Word Document (modern)
- **TXT** (.txt) - Plain Text Document
- **RTF** (.rtf) - Rich Text Format
- **MD** (.md) - Markdown Document

### Source Code Formats
- **JavaScript** (.js, .jsx) - Web development
- **TypeScript** (.ts, .tsx) - Typed JavaScript
- **Python** (.py) - Python programming
- **Java** (.java) - Java programming
- **C++** (.cpp, .c) - C and C++ programming
- **C#** (.cs) - C# programming
- **PHP** (.php) - PHP web development
- **Ruby** (.rb) - Ruby programming
- **Go** (.go) - Go programming
- **Rust** (.rs) - Rust programming
- **Swift** (.swift) - iOS development
- **Kotlin** (.kt) - Android development
- **Vue** (.vue) - Vue.js framework
- **Svelte** (.svelte) - Svelte framework

## Features

### Core Capabilities
1. **Multi-format Support** - Handles documents and code files
2. **Large File Processing** - Up to 25MB for documents, 10MB for code
3. **Real-time Progress** - Live status updates during processing
4. **Interactive Graphs** - Clickable, zoomable knowledge visualizations
5. **Share Functionality** - Generate shareable links for collaboration

### Advanced Features
- **Content Script Integration** - Detects files on web pages
- **Drag & Drop Upload** - Intuitive file upload interface
- **Error Handling** - Comprehensive error messages and recovery
- **Responsive Design** - Works on different screen sizes

## How It Works

### Document Processing Pipeline
1. **File Upload** → Secure cloud storage via presigned URLs
2. **Content Extraction** → AI-powered text and structure analysis
3. **Knowledge Mining** → Entity and relationship identification
4. **Graph Generation** → Interactive visualization creation
5. **Result Delivery** → Shareable knowledge graph links

### Technical Architecture
- **Frontend**: Chrome Extension with modern UI
- **Backend**: AWS Lambda with API Gateway
- **Storage**: Amazon S3 for file storage
- **Processing**: AI/ML models for knowledge extraction
- **Visualization**: Interactive graph rendering

## Use Cases

### Academic & Research
- **Research Papers** - Extract key concepts and relationships
- **Literature Reviews** - Map connections between studies
- **Thesis Analysis** - Visualize research structure

### Business & Professional
- **Technical Documentation** - Navigate complex manuals
- **Business Reports** - Understand organizational relationships
- **Legal Documents** - Map legal concepts and precedents

### Education
- **Textbooks** - Interactive learning experiences
- **Course Materials** - Visual concept mapping
- **Study Guides** - Knowledge organization

### Software Development
- **Code Analysis** - Understand codebase structure
- **API Documentation** - Map service relationships
- **Architecture Diagrams** - Visualize system design

## Installation & Setup

### Prerequisites
- Google Chrome browser
- Internet connection
- Valid file formats

### Installation Steps
1. Download the extension files
2. Generate required icons
3. Load as unpacked extension in Chrome
4. Configure permissions if needed

### Configuration
- File size limits can be adjusted
- Processing timeouts are configurable
- API endpoints can be customized

## Best Practices

### File Preparation
- Use well-structured documents with clear headings
- Ensure text is readable and properly formatted
- Keep files under size limits for optimal performance
- Use supported file formats only

### Processing Optimization
- Process documents during off-peak hours
- Break large documents into smaller sections if needed
- Use descriptive file names for better organization
- Review generated graphs for accuracy

## Troubleshooting

### Common Issues
- **Upload Failures** - Check file size and format
- **Processing Errors** - Verify document content quality
- **Graph Display Issues** - Ensure proper browser support
- **Share Link Problems** - Check network connectivity

### Support Resources
- Extension documentation
- API endpoint status
- Community forums
- Developer support channels

## Future Enhancements

### Planned Features
- **Batch Processing** - Multiple file upload support
- **Custom Templates** - Personalized graph layouts
- **Export Options** - Multiple output formats
- **Collaboration Tools** - Team workspace features

### Technology Roadmap
- **Enhanced AI Models** - Improved knowledge extraction
- **Real-time Collaboration** - Live graph editing
- **Mobile Support** - Responsive mobile interface
- **API Integration** - Third-party service connections

---

*This extension represents the future of document analysis and knowledge discovery, making complex information accessible and interactive.* 