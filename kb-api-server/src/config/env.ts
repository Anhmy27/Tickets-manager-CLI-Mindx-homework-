export function readPort(raw: string | undefined, fallback = 4100): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback
  }

  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error('KB_API_PORT must be an integer between 1 and 65535')
  }

  return parsed
}
