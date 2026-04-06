import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

export interface FileEntry {
  path: string;
  content: string;
  size: number;
  extension: string;
}

const MAX_FILE_SIZE = 100_000;

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".rb", ".rs", ".go", ".java", ".kt", ".swift", ".c", ".cpp", ".h",
  ".css", ".scss", ".less", ".html", ".vue", ".svelte",
  ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
  ".md", ".mdx", ".txt", ".rst",
  ".sh", ".bash", ".zsh", ".fish",
  ".sql", ".graphql", ".gql",
  ".dockerfile", ".docker-compose.yml",
  ".env.example", ".gitignore", ".editorconfig",
  ".xml", ".csv",
  ".tf", ".hcl",
  ".r", ".R",
  ".lua", ".zig", ".nim", ".ex", ".exs", ".erl",
  ".prisma", ".proto",
]);

const TEXT_FILENAMES = new Set([
  "Makefile", "Dockerfile", "Containerfile",
  "Rakefile", "Gemfile", "Procfile",
  "LICENSE", "CHANGELOG", "README",
  ".gitignore", ".gitattributes", ".dockerignore",
  ".editorconfig", ".prettierrc", ".eslintrc",
]);

function isTextFile(filePath: string, fileName: string): boolean {
  if (TEXT_FILENAMES.has(fileName)) return true;
  const ext = extname(fileName).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function isBinaryContent(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(512, buffer.length));
  let nullBytes = 0;
  for (const byte of sample) {
    if (byte === 0) nullBytes++;
  }
  return nullBytes > 0;
}

export function scanDirectory(
  rootDir: string,
  shouldIgnore: (path: string) => boolean,
): FileEntry[] {
  const files: FileEntry[] = [];

  function walk(dir: string): void {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    const sorted = entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of sorted) {
      const fullPath = join(dir, entry.name);

      if (shouldIgnore(fullPath)) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        try {
          const stat = statSync(fullPath);
          if (stat.size > MAX_FILE_SIZE) continue;
          if (stat.size === 0) continue;

          if (!isTextFile(fullPath, entry.name)) continue;

          const buffer = readFileSync(fullPath);
          if (isBinaryContent(buffer)) continue;

          const content = buffer.toString("utf-8");
          files.push({
            path: fullPath,
            content,
            size: stat.size,
            extension: extname(entry.name).toLowerCase(),
          });
        } catch {
          // Skip files we can't read
        }
      }
    }
  }

  walk(rootDir);
  return files;
}
