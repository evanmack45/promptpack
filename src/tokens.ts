/**
 * Approximate token counting using character-based heuristics.
 * Good enough for estimation without requiring a tokenizer dependency.
 */

interface TokenEstimate {
  chars: number;
  tokens: number;
  model: string;
}

const MODELS = [
  { name: "Claude (claude-3+)", charsPerToken: 3.5 },
  { name: "GPT-4", charsPerToken: 4.0 },
] as const;

export function estimateTokens(text: string): TokenEstimate[] {
  const chars = text.length;
  return MODELS.map((model) => ({
    chars,
    tokens: Math.ceil(chars / model.charsPerToken),
    model: model.name,
  }));
}

export function formatTokenEstimates(estimates: TokenEstimate[]): string {
  const lines: string[] = ["Token estimates:"];
  for (const est of estimates) {
    lines.push(
      `  ${est.model}: ~${est.tokens.toLocaleString()} tokens (${est.chars.toLocaleString()} chars)`,
    );
  }
  return lines.join("\n");
}
