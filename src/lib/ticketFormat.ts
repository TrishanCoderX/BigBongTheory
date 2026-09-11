const QR_PREFIX = "BBT-TICKET:";

export function qrPayload(ticketId: string): string {
  return `${QR_PREFIX}${ticketId}`;
}

export function ticketIdFromScan(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith(QR_PREFIX)) return trimmed.slice(QR_PREFIX.length);
  return null;
}
