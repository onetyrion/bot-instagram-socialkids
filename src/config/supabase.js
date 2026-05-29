import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env } from './env.js';

// Assign WebSocket globally for Node < 21.
globalThis.WebSocket = WebSocket;

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
