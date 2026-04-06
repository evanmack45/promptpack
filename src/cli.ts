#!/usr/bin/env node

import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { loadIgnoreRules } from "./ignore.js";
import { scanDirectory } from "./scanner.js";
import { formatOutput, type OutputFormat } from "./formatter.js";
import { estimateTokens, formatTokenEstimates } from "./tokens.js";

interface CliArgs {
  dir: string;
  output: string | null;
  format: OutputFormat;
  showTokens: boolean;
  showHelp: boolean;
  showVersion: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dir: ".",
    output: null,
    format: "markdown",
    showTokens: false,
    showHelp: false,
    showVersion: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;

    if (arg === "-h" || arg === "--help") {
      args.showHelp = true;
    } else if (arg === "-v" || arg === "--version") {
      args.showVersion = true;
    } else if (arg === "-o" || arg === "--output") {
      i++;
      args.output = argv[i] ?? null;
    } else if (arg === "-f" || arg === "--format") {
      i++;
      const fmt = argv[i];
      if (fmt === "markdown" || fmt === "xml" || fmt === "plain") {
        args.format = fmt;
      } else {
        console.error(`Unknown format: ${fmt}. Use: markdown, xml, plain`);
        process.exit(1);
      }
    } else if (arg === "-t" || arg === "--tokens") {
      args.showTokens = true;
    } else if (!arg.startsWith("-")) {
      args.dir = arg;
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }

    i++;
  }

  return args;
}

const HELP = `promptpack — Pack your codebase into a single LLM-ready prompt

Usage:
  promptpack [directory] [options]

Options:
  -f, --format <fmt>   Output format: markdown (default), xml, plain
  -o, --output <file>  Write to file instead of stdout
  -t, --tokens         Show estimated token counts
  -h, --help           Show this help
  -v, --version        Show version

Examples:
  promptpack                     Pack current directory
  promptpack ./src               Pack only src/
  promptpack -f xml -o prompt.xml  XML format, write to file
  promptpack -t                  Show token estimates
`;

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.showHelp) {
    console.log(HELP);
    return;
  }

  if (args.showVersion) {
    console.log("promptpack 1.0.0");
    return;
  }

  const rootDir = resolve(args.dir);
  const shouldIgnore = loadIgnoreRules(rootDir);
  const files = scanDirectory(rootDir, shouldIgnore);

  if (files.length === 0) {
    console.error("No files found. Check the directory path and filters.");
    process.exit(1);
  }

  const output = formatOutput(files, rootDir, args.format);

  if (args.showTokens) {
    const estimates = estimateTokens(output);
    console.error(formatTokenEstimates(estimates));
    console.error(`Files: ${files.length}`);
    console.error("");
  }

  if (args.output) {
    writeFileSync(args.output, output, "utf-8");
    console.error(`Written to ${args.output}`);
  } else {
    process.stdout.write(output);
  }
}

main();
