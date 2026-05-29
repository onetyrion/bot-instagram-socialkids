import { AiBgStrategy } from './ai-bg.strategy.js';

export const StrategyResolver = {
  /**
   * In production, only the ai-bg strategy is used by the main workflow.
   * @param {string[]} _args CLI args (unused)
   */
  resolve(_args) {
    return AiBgStrategy;
  }
};
