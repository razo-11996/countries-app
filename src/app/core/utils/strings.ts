export function normalizeCountryCode(input: string | null | undefined): string {
  return (input ?? '').trim().toUpperCase();
}

export function escapeRegexLiteral(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

