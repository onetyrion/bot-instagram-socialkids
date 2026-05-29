import { createLogger } from '../utils/logger.js';

export const ImageService = {
  /**
   * Return only the Gemini-generated background image.
   * @param {{ main: string, emphasis: string }} _textData Unused
   * @param {number|null} _variantIndex Unused
   * @param {Object} _strategy Unused
   * @param {Buffer|null} customBackground Gemini-generated image buffer
   * @returns {Promise<Buffer>}
   */
  async createImage(_textData, _variantIndex, _strategy, customBackground = null, logger = null) {
    const log = logger ?? createLogger({ scope: 'IMAGE' });

    if (!customBackground) {
      log.error('BACKGROUND_REQUIRED', 'Gemini image is required but was not generated');
      throw new Error('Gemini image was not generated. Template rendering is disabled.');
    }

    log.info('IMAGE_SELECTED', 'Using Gemini-generated image only');
    return customBackground;
  }
};
