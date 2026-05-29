import { AiService } from './services/ai.service.js';
import { ImageService } from './services/image.service.js';
import { StorageService } from './services/storage.service.js';
import { InstagramService } from './services/instagram.service.js';
import { MusicService } from './services/music.service.js';
import { VideoService } from './services/video.service.js';
import { env } from './config/env.js';
import { createLogger, createRunId } from './utils/logger.js';

export async function iniciarBot(strategyInfo, variantIndex = null, withMusic = false) {
  const logger = createLogger({ scope: 'BOT', runId: createRunId() });
  let step = 1;

  try {
    logger.step(step++, 'Generating advice text', { strategy: strategyInfo.id });
    const textoObj = await AiService.generateAdvice(strategyInfo, logger.child('AI'));
    const finalText = {
      main: env.CUSTOM_MAIN_TEXT || textoObj.main,
      emphasis: env.CUSTOM_EMPHASIS_TEXT || textoObj.emphasis
    };
    logger.info('ADVICE_READY', 'Advice text generated', {
      main: finalText.main,
      emphasis: finalText.emphasis,
      customTextOverride: Boolean(env.CUSTOM_MAIN_TEXT || env.CUSTOM_EMPHASIS_TEXT)
    });

    let customBackground = null;
    if (strategyInfo.requiresAiBackground) {
      logger.step(step++, 'Generating AI background image');
      customBackground = await AiService.generateBackground(
        strategyInfo.getAiBackgroundPrompt(),
        logger.child('AI')
      );
    }

    logger.step(step++, 'Rendering visual asset');
    const bufferImagen = await ImageService.createImage(
      finalText,
      variantIndex,
      strategyInfo,
      customBackground,
      logger.child('IMAGE')
    );

    let finalBuffer = bufferImagen;
    let extension = 'jpg';
    let isVideo = false;

    if (withMusic) {
      try {
        logger.step(step++, 'Preparing soundtrack and rendering video');
        const localAudioPath = await Promise.resolve(
          MusicService.fetchJamendoRandomTrack(logger.child('MUSIC'))
        );

        finalBuffer = await VideoService.renderMusicVideo(bufferImagen, localAudioPath, logger.child('VIDEO'));
        extension = 'mp4';
        isVideo = true;
      } catch (musicError) {
        logger.warn('VIDEO_FALLBACK', 'Music/video pipeline failed. Falling back to static image.', {
          error: musicError.message
        });

        // Ignore media pipeline errors and continue with the generated image.
        finalBuffer = bufferImagen;
        extension = 'jpg';
        isVideo = false;
      }
    }

    logger.step(step++, 'Uploading media to storage');
    // Build a deterministic timestamped file name.
    const dateOpts = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateStr = new Intl.DateTimeFormat('es-CL', dateOpts).format(new Date()).replace(/[- :/,]/g, '_');
    const fileName = `historia_${dateStr}.${extension}`;

    const urlPublica = await StorageService.uploadImage(finalBuffer, 'stories', fileName);
    logger.info('UPLOAD_COMPLETE', 'Media uploaded successfully', { url: urlPublica, fileName });

    // Add run summary for GitHub Actions.
    if (process.env.GITHUB_STEP_SUMMARY) {
      const fs = await import('node:fs');
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### 🌟 Generación Exitosa\n**Media:** [Ver en Supabase](${urlPublica})\n\n**📝 Texto:** ${finalText.main} ${finalText.emphasis}\n`);
    }

    logger.step(step++, 'Publishing to Instagram');
    if (env.ENABLE_INSTAGRAM_POSTING) {
      await InstagramService.publishStory(urlPublica, isVideo, logger.child('INSTAGRAM'));
    } else {
      logger.info('PUBLISH_SKIPPED', 'Instagram publishing is disabled', {
        envVar: 'ENABLE_INSTAGRAM_POSTING'
      });
    }

    logger.step(step++, 'Workflow completed successfully');
  } catch (error) {
    logger.error('WORKFLOW_FAILED', 'Fatal error during workflow execution', {
      error: error.message,
      stack: error.stack
    });
    // Exit explicitly so GitHub Actions marks the job as failed.
    process.exit(1);
  }
}
