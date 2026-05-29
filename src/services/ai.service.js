import path from 'node:path';
import { ai } from "../config/gemini.js";
import { env } from "../config/env.js";
import { createLogger } from '../utils/logger.js';

export const AiService = {
  /**
   * Request structured text from AI based on the selected strategy.
   * @param {Object} strategy Strategy object
   * @returns {Promise<{main: string, emphasis: string}>}
   */
  async generateAdvice(strategy, logger = null) {
    const log = logger ?? createLogger({ scope: 'AI' });

    // In development mode, skip Gemini text API calls.
    if (env.APP_DEV) {
      log.info('DEV_FALLBACK_TEXT', 'Using local fallback text in development mode');
      return strategy.getFallback();
    }

    try {
      const prompt = strategy.getPrompt();

      const respuestaIA = await ai.models.generateContent({
          model: env.AI_TEXT_MODEL,
          contents: prompt
      });
      
      let rawText = respuestaIA.text.trim();
      // Sanitize markdown-wrapped JSON if the model returns code fences.
      if (rawText.startsWith('```json')) {
        rawText = rawText.substring(7, rawText.length - 3).trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.substring(3, rawText.length - 3).trim();
      }

      return JSON.parse(rawText);
    } catch(e) {
      log.warn('TEXT_GENERATION_FAILED', 'Gemini text generation failed. Using strategy fallback.', {
        error: e.message
      });
      // Delegate fallback behavior to the strategy.
      return strategy.getFallback();
    }
  },

  /**
   * Generate an abstract background with Gemini Image API.
   * @param {string} prompt Image generation prompt
   * @returns {Promise<Buffer|null>}
   */
  async generateBackground(prompt, logger = null) {
    const log = logger ?? createLogger({ scope: 'AI' });

    if (env.APP_DEV) {
      log.info('DEV_FALLBACK_BACKGROUND', 'Using local background in development mode');
      const fs = await import('node:fs');
      return fs.readFileSync(path.resolve(process.cwd(), 'src/assets/images/placeholder-bg.jpg'));
    }

    try {
      const response = await ai.models.generateImages({
        model: env.AI_IMAGE_MODEL,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '9:16',
          personGeneration: 'ALLOW_ALL'
        }
      });
      log.info('BACKGROUND_GENERATED', 'AI background generated successfully');
      const base64Bytes = response.generatedImages[0].image.imageBytes;
      return Buffer.from(base64Bytes, 'base64');
    } catch (e) {
      log.warn('BACKGROUND_GENERATION_FAILED', 'Failed to generate AI background. Falling back to gradient.', {
        status: e.status || 'Unknown',
        error: e.message
      });
      return null;
    }
  }
};
