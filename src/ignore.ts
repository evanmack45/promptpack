import { readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

interface IgnoreRule {
  pattern: RegExp;
  negated: boolean;
}

const DEFAULT_IGNORES = [
  "node_modules",
  ".git",
  ".DS_Store",
  "dist",
  "build",
  "coverage",
  "__pycache__",
  "*.pyc",
  ".env",
  ".env.*",
  "*.lock",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "*.min.js",
  "*.min.css",
  "*.map",
  "*.wasm",
  "*.woff",
  "*.woff2",
  "*.ttf",
  "*.eot",
  "*.ico",
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.svg",
  "*.mp3",
  "*.mp4",
  "*.webm",
  "*.pdf",
  "*.zip",
  "*.tar",
  "*.gz",
  "*.exe",
  "*.dll",
  "*.so",
  "*.dylib",
  ".next",
  ".nuxt",
  ".vercel",
  ".turbo",
  "vendor",
];

function globToRegex(pattern: string): RegExp {
  let regex = "";
  let i = 0;
  while (i < pattern.length) {
    const char = pattern[i]!;
    if (char === "*") {
      if (pattern[i + 1] === "*") {
        if (pattern[i + 2] === "/") {
          regex += "(.+/)?";
          i += 3;
          continue;
        }
        regex += ".*";
        i += 2;
        continue;
      }
      regex += "[^/]*";
    } else if (char === "?") {
      regex += "[^/]";
    } else if (char === ".") {
      regex += "\\.";
    } else {
      regex += char;
    }
    i++;
  }
  return new RegExp(`^${regex}$`);
}

function parseIgnoreLine(line: string): IgnoreRule | null {
  const trimmed = line.trim();
  if (trimmed === "" || trimmed.startsWith("#")) return null;

  let pattern = trimmed;
  let negated = false;

  if (pattern.startsWith("!")) {
    negated = true;
    pattern = pattern.slice(1);
  }

  if (pattern.startsWith("/")) {
    pattern = pattern.slice(1);
  }

  if (pattern.endsWith("/")) {
    pattern = pattern.slice(0, -1) + "/**";
  }

  if (!pattern.includes("/")) {
    pattern = `**/${pattern}`;
  }

  return { pattern: globToRegex(pattern), negated };
}

export function loadIgnoreRules(rootDir: string): (path: string) => boolean {
  const rules: IgnoreRule[] = [];

  for (const pat of DEFAULT_IGNORES) {
    const rule = parseIgnoreLine(pat);
    if (rule) rules.push(rule);
  }

  const gitignorePath = join(rootDir, ".gitignore");
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    for (const line of content.split("\n")) {
      const rule = parseIgnoreLine(line);
      if (rule) rules.push(rule);
    }
  }

  return (filePath: string): boolean => {
    const rel = relative(rootDir, filePath).split(sep).join("/");
    let ignored = false;
    for (const rule of rules) {
      if (rule.pattern.test(rel)) {
        ignored = !rule.negated;
      }
    }
    return ignored;
  };
}
