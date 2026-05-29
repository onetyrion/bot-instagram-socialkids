import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

async function waitForVideoProcessing(creationId, token, log) {
  log.info('VIDEO_PROCESSING_WAIT', 'Waiting for Instagram video processing', { creationId });
  let isReady = false;
  let attempts = 0;
  const maxAttempts = 12; // 12 attempts * 10 seconds = 2 minutes max

  while (!isReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;

    const statusRes = await fetch(`https://graph.facebook.com/v25.0/${creationId}?fields=status_code`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statusData = await statusRes.json();

    if (statusData.error) throw statusData.error;

    const status = statusData.status_code;
    log.info('VIDEO_PROCESSING_STATUS', 'Instagram processing status polled', {
      attempt: attempts,
      maxAttempts,
      status
    });

    if (status === 'FINISHED') {
      isReady = true;
    } else if (status === 'ERROR') {
      throw new Error('Instagram returned ERROR while processing the video container.');
    } else if (status === 'EXPIRED') {
      throw new Error('Instagram video container has expired.');
    }
  }

  if (!isReady) {
    throw new Error('Timeout while waiting for Instagram video processing.');
  }

  log.info('VIDEO_READY', 'Video processed successfully. Publishing media.');
}

export const InstagramService = {
  /**
  * Create a media container and publish an Instagram story.
   * @param {string} mediaUrl 
   * @param {boolean} isVideo 
   */
  async publishStory(mediaUrl, isVideo = false, logger = null) {
    const log = logger ?? createLogger({ scope: 'INSTAGRAM' });

    const id = env.INSTAGRAM_ID;
    const token = env.INSTAGRAM_TOKEN;

    // Create the media container.
    const bodyPayload = {
      media_type: 'STORIES'
    };

    if (isVideo) {
      bodyPayload.video_url = mediaUrl;
    } else {
      bodyPayload.image_url = mediaUrl;
    }

    const res1 = await fetch(`https://graph.facebook.com/v25.0/${id}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(bodyPayload)
    });
    
    const data1 = await res1.json();
    if (data1.error) throw data1.error;

    const creationId = data1.id;
    log.info('CONTAINER_CREATED', 'Instagram media container created', { creationId, isVideo });

    // For videos, wait until Instagram finishes processing.
    if (isVideo) {
      await waitForVideoProcessing(creationId, token, log);
    } else {
      // A short pause improves reliability for image publishing.
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Publish the media.
    const res2 = await fetch(`https://graph.facebook.com/v25.0/${id}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ creation_id: creationId })
    });
    
    const data2 = await res2.json();
    if (data2.error) throw data2.error;
    log.info('MEDIA_PUBLISHED', 'Instagram story published successfully', {
      mediaId: data2.id || null
    });
    
    return data2;
  }
};
