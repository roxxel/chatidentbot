export const LIST_ITEM = '├'
export const LIST_LAST_ITEM = '└'

export function buildMessage(header: string, data: Record<string, string>): string {
  const messageLines: string[] = [header]
  const entries = Object.entries(data)
  entries.forEach(([key, value], index) => {
    const prefix = index < entries.length - 1 ? LIST_ITEM : LIST_LAST_ITEM
    const formatted = value.startsWith('@') ? value : '`' + value + '`'
    messageLines.push(`  ${prefix} ${key}: ${formatted}`)
  })
  return messageLines.join('\n')
}

export function combineMessages(...messages: string[]): string {
  return messages.join('\n\n')
}
