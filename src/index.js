import { iniciarBot } from './bot.js';
import { StrategyResolver } from './strategies/index.js';
import { env } from './config/env.js';

const args = process.argv.slice(2);
const withMusic = env.ENABLE_MUSIC_RENDER;
const strategyInfo = StrategyResolver.resolve(args);

// Run the bot with the strategy used by the main workflow.
iniciarBot(strategyInfo, null, withMusic);