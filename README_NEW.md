# PDFly - Professional PDF Processing Platform

A modern, full-stack PDF processing application built with Next.js 15, featuring real-time PDF manipulation, compression, conversion, and more.

## 🚀 Features

### Core PDF Tools

- **📝 PDF Compression** - Reduce file sizes with multiple quality levels (low, medium, high)
- **🔄 PDF Conversion** - Convert to Word, Excel, PowerPoint, images, and text
- **📑 PDF Merge** - Combine multiple PDFs with drag-and-drop interface
- **✂️ PDF Split** - Extract pages or split into multiple documents

### Key Capabilities

- **Real PDF Processing** - Uses industry-standard libraries (pdf-lib, pdf-parse)
- **Server-Side Processing** - Handles large files efficiently on Node.js backend
- **Browser-Compatible** - No software installation required
- **Modern UI** - Futuristic glassmorphism design with smooth animations
- **Progress Tracking** - Real-time processing feedback
- **File Validation** - Comprehensive PDF validation and error handling

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern styling with custom utilities
- **Framer Motion** - Advanced animations and micro-interactions
- **Lucide React** - Beautiful icon system

### Backend & Processing

- **Next.js API Routes** - Server-side PDF processing endpoints
- **pdf-lib** - PDF creation, modification, and compression
- **pdf-parse** - Server-side text extraction
- **Canvas** - Node.js canvas for server-side rendering
- **Buffer/Stream Processing** - Efficient file handling

### Database & Auth

- **Prisma** - Type-safe database ORM
- **NextAuth.js** - Authentication system
- **PostgreSQL** - Primary database (configured for Prisma)

## 🏗️ Architecture

### Client-Server Separation

```
Client (Browser)          Server (Next.js API)
├── UI Components    ←→   ├── /api/pdf/compress
├── PDF Preview           ├── /api/pdf/convert
├── File Validation       ├── /api/pdf/merge
├── Progress Tracking     └── /api/pdf/split
└── Download Manager
```

### PDF Processing Flow

1. **Client Upload** - File validation and preview generation
2. **API Request** - FormData sent to appropriate API endpoint
3. **Server Processing** - Real PDF manipulation using pdf-lib/pdf-parse
4. **Response** - Processed file returned as downloadable blob

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (for database features)

### Installation

```bash
# Clone the repository
git clone https://github.com/DiwanMalla/PDFly.git
cd PDFly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pdfly"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/pdf/           # PDF processing API endpoints
│   │   ├── compress/      # POST /api/pdf/compress
│   │   ├── convert/       # POST /api/pdf/convert
│   │   ├── merge/         # POST /api/pdf/merge
│   │   └── split/         # POST /api/pdf/split
│   ├── tools/             # Tool pages with UI
│   │   ├── compress/      # Compression interface
│   │   ├── convert/       # Conversion interface
│   │   ├── merge/         # Merge interface
│   │   └── split/         # Split interface
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage with ToolSelector
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx     # Custom button component
│   │   ├── Card.tsx       # Card wrapper component
│   │   └── Icons.tsx      # Icon components
│   ├── Navigation.tsx     # Main navigation bar
│   ├── ToolSelector.tsx   # Tool selection grid
│   ├── HeroSection.tsx    # Landing hero section
│   ├── FeaturesSection.tsx # Features showcase
│   └── Footer.tsx         # Site footer
├── lib/
│   ├── pdf-client.ts      # Client-side PDF service abstraction
│   ├── pdf-utils.ts       # Shared PDF utilities
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   └── utils.ts           # General utilities
└── types/
    └── pdfjs.d.ts         # TypeScript PDF type definitions
```

## 🔧 API Endpoints

### PDF Processing APIs

#### Compress PDF

```typescript
POST /api/pdf/compress
Content-Type: multipart/form-data

FormData: {
  file: File,           // PDF file to compress
  quality: 'low' | 'medium' | 'high'  // Compression level
}

Response: Compressed PDF file (application/pdf)
```

#### Convert PDF

```typescript
POST /api/pdf/convert
Content-Type: multipart/form-data

FormData: {
  file: File,           // PDF file to convert
  format: 'text' | 'word' | 'excel' | 'powerpoint' | 'images'
}

Response: Converted file with appropriate MIME type
```

#### Merge PDFs

```typescript
POST /api/pdf/merge
Content-Type: multipart/form-data

FormData: {
  files: File[]         // Array of PDF files to merge
}

Response: Merged PDF file (application/pdf)
```

#### Split PDF

```typescript
POST /api/pdf/split
Content-Type: multipart/form-data

FormData: {
  file: File,           // PDF file to split
  pageRanges?: string   // Optional: "1-3,5,7-9" format
}

Response: ZIP file containing split PDFs
```

## 🎨 Component Architecture

### ToolSelector Component

```typescript
// Located at /src/components/ToolSelector.tsx
export default function ToolSelector() {
  // Displays grid of available tools with:
  // - Tool icons and descriptions
  // - Feature lists for each tool
  // - Navigation to tool pages
  // - Hover animations and visual feedback
}
```

### PDFClientService

```typescript
// Located at /src/lib/pdf-client.ts
class PDFClientService {
  // Provides abstraction for all PDF operations:
  // - compressPDF(file, quality)
  // - convertPDF(file, format)
  // - mergePDFs(files)
  // - splitPDF(file, pageRanges?)
  // - Handles API communication and file downloads
}
```

## 🧪 Testing the Application

### Manual Testing Workflow

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Test Compression**:

   - Go to http://localhost:3000/tools/compress
   - Upload a PDF file
   - Select quality level (low/medium/high)
   - Verify download of compressed file

3. **Test Conversion**:

   - Go to http://localhost:3000/tools/convert
   - Upload a PDF file
   - Select output format (text/word/excel/powerpoint/images)
   - Verify download of converted file

4. **Test Merge**:

   - Go to http://localhost:3000/tools/merge
   - Upload multiple PDF files using drag-and-drop
   - Verify download of merged PDF

5. **Test Split**:
   - Go to http://localhost:3000/tools/split
   - Upload a PDF file
   - Optionally specify page ranges
   - Verify download of split files

### API Health Check

```bash
# Check if APIs are responding
curl -X GET http://localhost:3000/api/health

# Test compression endpoint (with a PDF file)
curl -X POST -F "file=@test.pdf" -F "quality=medium" \
  http://localhost:3000/api/pdf/compress --output compressed.pdf
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Docker Deployment

```dockerfile
# Use the official Node.js image
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **File Type Validation** - Only accepts valid PDF files
- **File Size Limits** - Prevents oversized uploads
- **Input Sanitization** - Protects against malicious content
- **Environment Variables** - Secure configuration management
- **CORS Protection** - API route security
- **TypeScript** - Compile-time type safety

## 📈 Performance Optimizations

### Server-Side Processing

- PDF operations run on Node.js backend for better performance
- No client-side resource limitations
- Efficient memory management with streams

### Frontend Optimizations

- **Code Splitting** - Dynamic imports for tool pages
- **Image Optimization** - Next.js Image component
- **Bundle Analysis** - Webpack bundle analyzer
- **Lazy Loading** - Components loaded on demand

### File Handling

- **Streaming** - Large file support with stream processing
- **Progress Tracking** - Real-time upload/processing feedback
- **Error Recovery** - Graceful error handling and retry logic

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **TypeScript** - All code must be typed
- **ESLint** - Follow the configured linting rules
- **Prettier** - Use consistent code formatting
- **Testing** - Add tests for new features

## 📊 Current Status

### ✅ Completed Features

- [x] Full-stack PDF compression with quality levels
- [x] Real text extraction using pdf-parse
- [x] PDF merge functionality with multiple files
- [x] PDF split with page range support
- [x] Modern UI with tool selector and navigation
- [x] Server-side API architecture
- [x] Client-side service abstraction
- [x] Error handling and validation
- [x] Progress tracking and user feedback

### 🚧 In Progress

- [ ] Advanced image conversion (pdf2pic integration)
- [ ] Batch processing capabilities
- [ ] User authentication integration
- [ ] Cloud storage integration

### 🔮 Future Enhancements

- [ ] OCR text recognition
- [ ] Digital signature support
- [ ] Collaborative editing
- [ ] API rate limiting
- [ ] Advanced compression algorithms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **pdf-lib** - Comprehensive PDF manipulation
- **pdf-parse** - Reliable text extraction
- **Next.js** - Excellent full-stack framework
- **Tailwind CSS** - Beautiful utility-first styling
- **Framer Motion** - Smooth animations

## 📞 Support

- **Email**: support@pdfly.com
- **GitHub Issues**: [Create an issue](https://github.com/DiwanMalla/PDFly/issues)
- **Documentation**: [Full documentation](https://pdfly.com/docs)

---

**PDFly** - Professional PDF processing made simple, fast, and beautiful. 🚀

_Built with ❤️ using Next.js, TypeScript, and modern web technologies._
