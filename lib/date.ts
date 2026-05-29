export function formatDateBR(dateStr: string, style: 'long' | 'short' = 'long'): string {
  const date = new Date(dateStr)
  if (style === 'long') {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
