import 'dotenv/config';

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value).toLowerCase() === 'true';
};

const parseList = (value, separator = ',') => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(separator)
    .map(item => item.trim())
    .filter(Boolean);
};

export const env = {
  APP_DEV: parseBoolean(process.env.APP_DEV),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  INSTAGRAM_ID: process.env.INSTAGRAM_ID,
  INSTAGRAM_TOKEN: process.env.INSTAGRAM_TOKEN,
  ENABLE_INSTAGRAM_POSTING: parseBoolean(process.env.ENABLE_INSTAGRAM_POSTING),
  JAMENDO_CLIENT_ID: process.env.JAMENDO_CLIENT_ID,
  ENABLE_MUSIC_RENDER: parseBoolean(process.env.ENABLE_MUSIC_RENDER, true),
  ENABLE_AI_BACKGROUND: parseBoolean(process.env.ENABLE_AI_BACKGROUND, true),
  AI_TEXT_MODEL: process.env.AI_TEXT_MODEL || 'gemini-2.5-flash',
  AI_IMAGE_MODEL: process.env.AI_IMAGE_MODEL || 'imagen-4.0-generate-001',
  AI_TEXT_PROMPT: process.env.AI_TEXT_PROMPT,
  AI_BG_PROMPT: process.env.AI_BG_PROMPT,
  AI_BG_PROMPTS: parseList(process.env.AI_BG_PROMPTS, '||'),
  AI_FALLBACK_MAIN: process.env.AI_FALLBACK_MAIN,
  AI_FALLBACK_EMPHASIS: process.env.AI_FALLBACK_EMPHASIS,
  CUSTOM_MAIN_TEXT: process.env.CUSTOM_MAIN_TEXT,
  CUSTOM_EMPHASIS_TEXT: process.env.CUSTOM_EMPHASIS_TEXT,
  CONTENT_LANGUAGE: process.env.CONTENT_LANGUAGE || 'Spanish',
  CONTENT_AUDIENCE: process.env.CONTENT_AUDIENCE || 'parents of young children',
  CONTENT_TOPIC: process.env.CONTENT_TOPIC || 'child language development',
  CONTENT_TONE: process.env.CONTENT_TONE || 'warm, practical, and encouraging',
  JAMENDO_KEYWORDS: parseList(process.env.JAMENDO_KEYWORDS),
};

// Validate required environment variables.
const requeridas = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];

if (env.ENABLE_INSTAGRAM_POSTING) {
  requeridas.push('INSTAGRAM_ID', 'INSTAGRAM_TOKEN');
}

const missingVars = requeridas.filter((key) => !env[key]);

if (missingVars.length > 0) {
  throw new Error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
}
