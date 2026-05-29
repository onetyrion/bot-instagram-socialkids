import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLogger } from '../utils/logger.js';

// Configure ffmpeg binary path.
ffmpeg.setFfmpegPath(ffmpegStatic);

export const VideoService = {
  /**
  * Render a 15-second MP4 by looping a still image and adding mp3 audio.
  * @param {Buffer} imageBuffer - JPG image buffer
  * @param {string} audioPath - Source mp3 file path
  * @returns {Promise<Buffer>} - Generated temporary mp4 buffer
   */
  async renderMusicVideo(imageBuffer, audioPath, logger = null) {
    const log = logger ?? createLogger({ scope: 'VIDEO' });

    return new Promise((resolve, reject) => {
      log.info('RENDER_START', 'Starting 15-second video render');
      
      const tempImgPath = path.join(os.tmpdir(), `temp_img_${Date.now()}.jpg`);
      const tempOutPath = path.join(os.tmpdir(), `out_video_${Date.now()}.mp4`);
      
      // Save the image buffer to tmp so ffmpeg can consume it.
      fs.writeFileSync(tempImgPath, imageBuffer);

      ffmpeg()
        // Input 1: image
        .input(tempImgPath)
        .loop(1) // Loop the same image.
        // Input 2: audio
        .input(audioPath)
        // Output options for a 15s Instagram-compatible video.
        .outputOptions([
          '-t 15',                 // Force 15 seconds duration.
          '-c:v libx264',          // H.264 video codec.
          '-tune stillimage',      // Optimize for still images.
          '-c:a aac',              // AAC audio codec.
          '-b:a 192k',             // Audio bitrate.
          '-pix_fmt yuv420p',      // Wide playback compatibility.
          '-shortest',             // Stop encoding when the shortest input stream ends.
        ])
        .save(tempOutPath)
        .on('end', () => {
          log.info('RENDER_COMPLETE', 'Video render completed successfully');
          // Read the generated video as a buffer.
          const videoBuffer = fs.readFileSync(tempOutPath);
          
          // Cleanup temporary files.
          fs.rmSync(tempImgPath, { force: true });
          fs.rmSync(tempOutPath, { force: true });
          fs.rmSync(audioPath, { force: true });

          resolve(videoBuffer);
        })
        .on('error', (err) => {
          log.error('RENDER_FAILED', 'ffmpeg render failed', { error: err.message });
          reject(err);
        });
    });
  }
};