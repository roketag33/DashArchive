# DashArchive 📂✨

**DashArchive** is an intelligent, privacy-focused file organizer for macOS, Windows, and Linux. It automatically sorts your chaotic downloads and document folders using smart rules and local AI.

![Build Status](https://github.com/roketag33/DashArchive/actions/workflows/build.yml/badge.svg)

## 🚀 Key Features

- **🤖 Local AI Classification**: Uses on-device AI (MobileBERT) to analyze file content and suggest categories without your data ever leaving your computer.
- **📄 Smart Text Extraction**: Reading support for PDFs, DOCX, and Text files.
- **👁️ OCR Integration**: Extract text from images (screenshots, scans) for better sorting.
- **⚡️ Drag & Drop Interface**: Simply drag a folder to scan it instantly.
- **↩️ Safely Undo**: Not happy with a move? One-click undo to revert all changes.
- **🛠️ Flexible Rules**:
  - **Manual**: Sort by extension, name pattern, size, or date.
  - **AI**: Sort by semantic category (e.g., "Finance", "Personal", "Work").
- **🔒 Privacy First**: All processing happens locally. No cloud uploads.

## 📦 Installation

Download the latest version for your OS from the [Releases Page](https://github.com/roketag33/DashArchive/releases).

- **macOS**: Download `.dmg`
- **Windows**: Download `.exe`
- **Linux**: Download `.AppImage` or `.deb`

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/roketag33/DashArchive.git

# Install dependencies
yarn install
```

### Run Locally

```bash
# Start development server
yarn dev
```

### Build for Production

```bash
# Build for your current OS
yarn build
```

## 🏗️ Tech Stack

- **Electron** (v30)
- **React** + **TypeScript**
- **TailwindCSS** + **Shadcn/UI**
- **@xenova/transformers** (Local AI)
- **Tesseract.js** (OCR)
- **Electron Builder** (Packaging)

## 👥 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please check out our [Contributing Guidelines](CONTRIBUTING.md) for details on how to join the project.

## 🤝 Code of Conduct

We are committed to providing a friendly, safe and welcoming environment for all. Please take a moment to read our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🛡️ Security

If you discover a security vulnerability within DashArchive, please check our [Security Policy](SECURITY.md) for reporting instructions.

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
