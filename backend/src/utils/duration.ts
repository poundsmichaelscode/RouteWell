const units: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000
};

export function durationToMilliseconds(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) throw new Error(`Unsupported duration: ${value}`);
  return Number(match[1]) * units[match[2]!]!;
}
