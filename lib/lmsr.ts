/**
 * LMSR (Logarithmic Market Scoring Rule) Implementation
 * 
 * This automated market maker dynamically adjusts prices based on outstanding shares.
 * See specs/lmsr_algorithm.md for detailed explanation.
 */

export class LMSR {
  private b: number; // liquidity parameter

  constructor(liquidity: number = 100) {
    this.b = liquidity;
  }

  /**
   * Calculate cost function
   * C(q) = b × ln(e^(qYes/b) + e^(qNo/b))
   */
  private cost(qYes: number, qNo: number): number {
    return this.b * Math.log(
      Math.exp(qYes / this.b) + Math.exp(qNo / this.b)
    );
  }

  /**
   * Get current probability of YES
   * P(YES) = e^(qYes/b) / (e^(qYes/b) + e^(qNo/b))
   */
  getProbability(qYes: number, qNo: number): number {
    const expYes = Math.exp(qYes / this.b);
    const expNo = Math.exp(qNo / this.b);
    return expYes / (expYes + expNo);
  }

  /**
   * Calculate cost to buy YES shares
   * Uses binary search to find how many shares can be bought with given tokens
   * Returns: { cost, shares, newQYes, newQNo, newProbability }
   */
  buyYes(
    qYes: number,
    qNo: number,
    tokens: number
  ): {
    cost: number;
    shares: number;
    newQYes: number;
    newQNo: number;
    newProbability: number;
  } {
    // Binary search to find how many shares we can buy
    let low = 0;
    let high = tokens * 10; // upper bound
    let bestShares = 0;

    while (high - low > 0.01) {
      const mid = (low + high) / 2;
      const costBefore = this.cost(qYes, qNo);
      const costAfter = this.cost(qYes + mid, qNo);
      const cost = costAfter - costBefore;

      if (cost <= tokens) {
        bestShares = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    const costBefore = this.cost(qYes, qNo);
    const newQYes = qYes + bestShares;
    const costAfter = this.cost(newQYes, qNo);
    const actualCost = costAfter - costBefore;

    return {
      cost: Math.round(actualCost),
      shares: bestShares,
      newQYes,
      newQNo: qNo,
      newProbability: this.getProbability(newQYes, qNo),
    };
  }

  /**
   * Calculate cost to buy NO shares
   * Similar to buyYes, but for NO outcome
   */
  buyNo(
    qYes: number,
    qNo: number,
    tokens: number
  ): {
    cost: number;
    shares: number;
    newQYes: number;
    newQNo: number;
    newProbability: number;
  } {
    // Binary search to find how many shares we can buy
    let low = 0;
    let high = tokens * 10;
    let bestShares = 0;

    while (high - low > 0.01) {
      const mid = (low + high) / 2;
      const costBefore = this.cost(qYes, qNo);
      const costAfter = this.cost(qYes, qNo + mid);
      const cost = costAfter - costBefore;

      if (cost <= tokens) {
        bestShares = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    const costBefore = this.cost(qYes, qNo);
    const newQNo = qNo + bestShares;
    const costAfter = this.cost(qYes, newQNo);
    const actualCost = costAfter - costBefore;

    return {
      cost: Math.round(actualCost),
      shares: bestShares,
      newQYes: qYes,
      newQNo,
      newProbability: this.getProbability(qYes, newQNo),
    };
  }

  /**
   * Calculate payout for selling YES shares
   * payout = C(qYes, qNo) - C(qYes - shares, qNo)
   */
  sellYes(
    qYes: number,
    qNo: number,
    sharesToSell: number
  ): {
    payout: number;
    newQYes: number;
    newQNo: number;
    newProbability: number;
  } {
    if (sharesToSell > qYes) {
      throw new Error('Cannot sell more YES shares than outstanding');
    }

    const costBefore = this.cost(qYes, qNo);
    const newQYes = qYes - sharesToSell;
    const costAfter = this.cost(newQYes, qNo);
    const payout = costBefore - costAfter;

    return {
      payout: Math.round(payout),
      newQYes,
      newQNo: qNo,
      newProbability: this.getProbability(newQYes, qNo),
    };
  }

  /**
   * Calculate payout for selling NO shares
   * payout = C(qYes, qNo) - C(qYes, qNo - shares)
   */
  sellNo(
    qYes: number,
    qNo: number,
    sharesToSell: number
  ): {
    payout: number;
    newQYes: number;
    newQNo: number;
    newProbability: number;
  } {
    if (sharesToSell > qNo) {
      throw new Error('Cannot sell more NO shares than outstanding');
    }

    const costBefore = this.cost(qYes, qNo);
    const newQNo = qNo - sharesToSell;
    const costAfter = this.cost(qYes, newQNo);
    const payout = costBefore - costAfter;

    return {
      payout: Math.round(payout),
      newQYes: qYes,
      newQNo,
      newProbability: this.getProbability(qYes, newQNo),
    };
  }
}

