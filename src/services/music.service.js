import { env } from '../config/env.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLogger } from '../utils/logger.js';

export const MusicService = {
  /**
  * Fetch a random Jamendo track by keyword and store it as a temporary mp3.
  * @returns {Promise<string>} Absolute path to the downloaded local file
   */
  async fetchJamendoRandomTrack(logger = null) {
    const log = logger ?? createLogger({ scope: 'MUSIC' });

    if (env.APP_DEV) {
      log.info('DEV_FALLBACK_MUSIC', 'Using local placeholder track in development mode');
      return path.resolve(process.cwd(), 'src/assets/music/placeholder-bgm.mp3');
    }

    if (!env.JAMENDO_CLIENT_ID) {
      throw new Error("No hay JAMENDO_CLIENT_ID configurada. No se puede traer música.");
    }

    // Default music styles for child-focused content.
    const defaultKeywords = [
      'children',
      'happy kids',
      'playful',
      'happy ukulele',
    ];
    const keywords = env.JAMENDO_KEYWORDS.length > 0 ? env.JAMENDO_KEYWORDS : defaultKeywords;
    
    // Pick a random style to keep outputs varied.
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];

    // Jamendo endpoints document reference
    log.info('JAMENDO_SEARCH', 'Searching tracks in Jamendo', { keyword });
    const encodedKeyword = encodeURIComponent(keyword);
    // Use Jamendo tracks endpoint for music lookup.
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${env.JAMENDO_CLIENT_ID}&format=json&limit=50&search=${encodedKeyword}`;

    try {
      const resp = await fetch(url);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Jamendo rechazó la solicitud (HTTP ${resp.status}): ${errorText}. Revisa que tu JAMENDO_CLIENT_ID sea válida.`);
      }
      
      const data = await resp.json();

      // Check results
      if (!data.results || data.results.length === 0) {
        throw new Error("Jamendo no retornó canciones para ese keyword.");
      }

      // Select a random track.
      const randomTrack = data.results[Math.floor(Math.random() * data.results.length)];
      log.info('TRACK_SELECTED', 'Track selected successfully', { trackName: randomTrack.name });

      // Prefer audiodownload, fallback to audio URL.
      const downloadUrl = randomTrack.audiodownload || randomTrack.audio;
      if (!downloadUrl) throw new Error("No se encontró url de descarga del audio en el objeto.");
      
      const fetchBuffer = await fetch(downloadUrl);
      const arrayBuffer = await fetchBuffer.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Store the downloaded mp3 in the OS temp directory.
      const tempMp3Path = path.join(os.tmpdir(), `music_${Date.now()}.mp3`);
      fs.writeFileSync(tempMp3Path, buffer);
      
      return tempMp3Path;
    } catch (e) {
      log.error('TRACK_DOWNLOAD_FAILED', 'Failed to fetch or download track from Jamendo', {
        error: e.message
      });
      throw e;
    }
  }
};