/**
 * Formatting utilities for display
 */

export function formatTokens(amount: number): string {
  return amount.toLocaleString();
}

export function formatProbability(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMarketId(id: string): string {
  return `#${id}`;
}

