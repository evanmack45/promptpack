# promptpack

Pack your codebase into a single LLM-ready prompt file.

Stop copy-pasting files into ChatGPT/Claude. `promptpack` bundles your project into one clean, structured file that AI assistants can read immediately.

## Install

Install from GitHub:

```bash
npm install -g etm-industries/promptpack
```

Or run without installing:

```bash
npx etm-industries/promptpack
```

Or clone and build locally:

```bash
git clone https://github.com/etm-industries/promptpack.git
cd promptpack
npm install && npm run build
node dist/cli.js .
```

## Usage

```bash
# Pack current directory (markdown format, stdout)
promptpack

# Pack specific directory
promptpack ./src

# XML format (optimized for Claude)
promptpack -f xml

# Write to file with token estimates
promptpack -t -o prompt.md

# Plain text format
promptpack -f plain -o prompt.txt
```

## Options

| Flag | Description |
|------|-------------|
| `-f, --format <fmt>` | Output format: `markdown` (default), `xml`, `plain` |
| `-o, --output <file>` | Write to file instead of stdout |
| `-t, --tokens` | Show estimated token counts per model |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## What it does

1. Recursively scans your project directory
2. Respects `.gitignore` and skips binaries, lock files, `node_modules`, etc.
3. Outputs a clean, structured file with:
   - File tree overview
   - Each file's contents with syntax highlighting hints
   - Optional token count estimates for Claude and GPT-4

## Output formats

- **Markdown** (default) — Great for pasting into chat interfaces
- **XML** — Optimized for Claude's XML tag parsing
- **Plain** — Simple text, works everywhere

## Web version

Try it in your browser at **[promptpack-three.vercel.app](https://promptpack-three.vercel.app)** — drag and drop files, get a prompt instantly.

## License

MIT
