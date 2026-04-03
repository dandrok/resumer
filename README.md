# Resumer

AI-Powered CLI/TUI Resume Tailor. Built with TypeScript, Node.js, and React (Ink).

## Installation

### Global Installation
Install the tool globally to use it anywhere on your system:
```bash
# Clone the repository
git clone git@github.com:name/resumer.git
cd resumer

# Build and install
npm run build
sudo npm install -g .
```

### Development
```bash
npm run dev
```

## How to use

Simply run `resumer` (or `npm run dev`) to start the interactive wizard.

1. **Setup**: Go to `App Settings` to configure your LLM provider (DeepSeek, OpenAI, or Ollama) and your Jina Reader API key.
2. **Tailor Resume**: Select `Tailor Resume`, navigate to your `.pdf` file using the built-in file explorer, and provide the job offer URL.
3. **Interview**: Answer a few questions about missing skills to help the AI refine your resume without hallucinating.
4. **Result**: Your tailored resume will be saved as `your-cv_tailored.pdf` in the same directory.

## Tech Stack
- **Ink**: React-based Terminal UI.
- **Vercel AI SDK**: Unified interface for DeepSeek, OpenAI, and Ollama.
- **Jina Reader**: Markdown-based web scraping.
- **pdf-parse**: PDF text extraction.
- **md-to-pdf**: Professional PDF generation from Markdown.
