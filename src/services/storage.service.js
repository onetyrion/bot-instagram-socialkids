import { supabase } from '../config/supabase.js';

export const StorageService = {
  /**
  * Upload media to a Supabase bucket and return the public URL.
   * @param {Buffer} buffer 
   * @param {string} bucketName 
   * @param {string} fileName 
   * @returns {Promise<string>}
   */
  async uploadImage(buffer, bucketName = 'stories', fileName = 'daily_story.jpg') {
    const contentType = fileName.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
    
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, { contentType: contentType, upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  }
};
