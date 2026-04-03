# Resumer

AI-Powered CLI/TUI Resume Tailor.

## How to use

1. **Setup**: Run the init command to set up your API keys and preferred LLM provider.
   ```bash
   npm run dev init
   ```

2. **Tailor Resume**: Provide the path to your current PDF resume and the URL of the job offer.
   ```bash
   npm run dev tailor ./my-resume.pdf "https://jobs.example.com/software-engineer"
   ```

## Status
- **DeepSeek API**: Fully tested and working.
- **OpenAI / Ollama**: Integrated but currently **untested**. Use with caution as their API response handling might need minor tweaks compared to the DeepSeek direct implementation.
- **Jina Reader**: Used as the primary scraping method. No local fallback (like Crawlee) is currently implemented to keep the tool simple and low-resource.

## Tech Stack
- **TypeScript & Node.js**
- **Ink**: For the interactive TUI experience.
- **Vercel AI SDK**: Unified interface for LLM support.
- **Jina Reader**: For clean, Markdown-based web scraping.
- **pdf-parse**: For extracting text from resumes.
- **md-to-pdf**: For generating professional resumes from Markdown.
