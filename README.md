# Fonoaudiologa Social Kids - Instagram Bot

Bot automatizado para generar y publicar contenido en Instagram con apoyo de IA.

Uso actual:
Este proyecto se utiliza actualmente en el perfil de una clinica fonoaudiologica infanto-juvenil para publicar contenido orientado a familias, crianza y desarrollo del lenguaje.

## Estado Actual Del Flujo

Pipeline activo:
1. Genera texto con Gemini.
2. Genera imagen con Gemini (obligatoria).
3. (Opcional) Agrega musica y renderiza video MP4.
4. Sube media a Supabase.
5. Publica en historias de Instagram (si esta habilitado).

## Tecnologias

- Runtime: Bun / Node.js 20+
- IA: @google/genai
- Storage: @supabase/supabase-js
- Video: fluent-ffmpeg + ffmpeg-static
- WebSocket runtime compatibility: ws
- CI/CD: GitHub Actions

## Instalacion

1. Clonar repositorio

```bash
git clone https://github.com/tu-usuario/bot-instagram-socialkids.git
cd bot-instagram-socialkids
```

2. Instalar dependencias

```bash
bun install
# o
npm install
```

3. Configurar variables de entorno

Usa env.example como base y crea tu archivo .env.

Variables minimas:

```env
APP_DEV=true
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
JAMENDO_CLIENT_ID=...
ENABLE_INSTAGRAM_POSTING=false
```

Si ENABLE_INSTAGRAM_POSTING=true tambien necesitas:

```env
INSTAGRAM_ID=...
INSTAGRAM_TOKEN=...
```

Variables de personalizacion relevantes:

```env
# Control de pipeline
ENABLE_MUSIC_RENDER=true
ENABLE_AI_BACKGROUND=true

# Modelos
AI_TEXT_MODEL=gemini-2.5-flash
AI_IMAGE_MODEL=imagen-4.0-generate-001

# Prompt y contenido
AI_TEXT_PROMPT=
AI_BG_PROMPT=
AI_BG_PROMPTS=
CONTENT_LANGUAGE=Spanish
CONTENT_AUDIENCE=parents of young children
CONTENT_TOPIC=child language development
CONTENT_TONE=warm, practical, and encouraging

# Overrides directos
CUSTOM_MAIN_TEXT=
CUSTOM_EMPHASIS_TEXT=

# Fallbacks
AI_FALLBACK_MAIN=
AI_FALLBACK_EMPHASIS=

# Musica
JAMENDO_KEYWORDS=children,happy kids,playful,happy ukulele
```

## Uso Local

Ejecucion:

```bash
bun run start
# o
node src/index.js --ai-bg
```

Recomendado para pruebas seguras:
- APP_DEV=true
- ENABLE_INSTAGRAM_POSTING=false

## Automatizacion En GitHub Actions

Workflow actual: .github/workflows/main.yml

- Cron diario: 0 12 * * * (12:00 UTC)
- Ejecucion manual: workflow_dispatch
- Runtime en CI: Bun
- Comando: bun run start

Secrets requeridos en GitHub:
- INSTAGRAM_ID
- INSTAGRAM_TOKEN
- GEMINI_API_KEY
- SUPABASE_URL
- SUPABASE_KEY
- JAMENDO_CLIENT_ID

## Estructura Base

```text
src/
	bot.js
	index.js
	config/
	services/
	strategies/
	utils/
.github/workflows/main.yml
package.json
env.example
```
