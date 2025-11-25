/**
 * Validation utilities for user inputs
 */

export function validateBetAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (amount < 1) {
    return { valid: false, error: 'Bet amount must be at least 1 token' };
  }
  if (amount > 500) {
    return { valid: false, error: 'Bet amount cannot exceed 500 tokens' };
  }
  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Bet amount must be a whole number' };
  }
  return { valid: true };
}

export function validateMarketQuestion(question: string): {
  valid: boolean;
  error?: string;
} {
  if (question.length < 10) {
    return {
      valid: false,
      error: 'Question must be at least 10 characters long',
    };
  }
  if (question.length > 100) {
    return { valid: false, error: 'Question must be at most 100 characters' };
  }
  return { valid: true };
}

export function parseMarketId(input: string): string | null {
  // Extract market ID from formats like "#cm123" or "cm123"
  const match = input.match(/#?(cm[a-z0-9]+)/i);
  return match ? match[1] : null;
}

