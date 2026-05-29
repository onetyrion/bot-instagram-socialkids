import { env } from '../config/env.js';

export const AiBgStrategy = {
  id: 'ai-bg',

  requiresAiBackground: true,
  
  getPrompt() {
    if (env.AI_TEXT_PROMPT) {
      return env.AI_TEXT_PROMPT;
    }

    return `You are an expert content writer for ${env.CONTENT_AUDIENCE}. ` +
      `Create one short social message about ${env.CONTENT_TOPIC} using a ${env.CONTENT_TONE} tone. ` +
      `Write the text in ${env.CONTENT_LANGUAGE}.\n\n` +
      'Return ONLY valid JSON with this exact shape:\n' +
      '{"main":"Main idea, max 15 words","emphasis":"Motivational ending, max 5 words, include exactly one emoji"}\n' +
      'Do not include markdown code fences.';
  },

  getAiBackgroundPrompt() {
    if (env.AI_BG_PROMPTS.length > 0) {
      return env.AI_BG_PROMPTS[Math.floor(Math.random() * env.AI_BG_PROMPTS.length)];
    }

    if (env.AI_BG_PROMPT) {
      return env.AI_BG_PROMPT;
    }

    const prompts = [
      "Fotografía de una madre y su hijo pequeño armando bloques de juguete sobre una manta de textura suave junto a una ventana con luz matutina. Paleta de colores en tonos pastel predominando el lavanda, menta y crema. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño leyendo un cuento riendo sobre una cama muy mullida con iluminación natural suave. Paleta de colores en tonos pastel predominando el durazno, amarillo suave y blanco roto. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño abrazándose cariñosamente en el centro de una sala de estar iluminada por el sol natural. Paleta de colores en tonos pastel predominando el celeste claro, rosa palo y crema. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre haciéndole cosquillas a su hijo pequeño sobre una alfombra peluda blanca con luz natural entrando por la ventana. Paleta de colores en tonos pastel predominando el verde agua, rosa suave y beige. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño dibujando juntos en el suelo sobre un tapete suave, rodeados de abundante luz natural. Paleta de colores en tonos pastel predominando el lila, amarillo pálido y crema. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre levantando por los aires a su hijo pequeño mientras ríen, sobre un piso cubierto de cojines suaves bajo la luz natural del atardecer. Paleta de colores en tonos pastel predominando el coral suave, lavanda y crema. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño jugando con osos de peluche sobre una colcha de textura suave en una habitación muy iluminada. Paleta de colores en tonos pastel predominando el verde menta, rosa suave y marfil. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño compartiendo un momento tierno de juego con burbujas en una habitación con grandes ventanales y luz natural. Paleta de colores en tonos pastel predominando el azul bebé, lila y crema. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño descansando y sonriendo después de jugar, recostados sobre una alfombra muy suave con luz natural difuminada. Paleta de colores en tonos pastel predominando el rosa rubor, verde claro y blanco. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto.",
      "Fotografía de una madre y su hijo pequeño bailando tomados de la mano sobre una alfombra de textura suave bajo la luz natural y suave de la mañana. Paleta de colores en tonos pastel predominando el durazno, celeste y crema. Toda la imagen, incluyendo a los sujetos y el entorno, tiene aplicado un filtro de desenfoque (blur) suave y uniforme para crear una atmósfera etérea, relajante, soñadora y hermosa. Cero texto."
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  getFallback() {
    return {
      main: env.AI_FALLBACK_MAIN || 'Play is one of the purest ways children learn.',
      emphasis: env.AI_FALLBACK_EMPHASIS || 'Keep playing! 🚀'
    };
  },

  renderGraphicElements(ctx, width, height) {
    // Add a soft panel to keep text readable over generated backgrounds.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(80, height / 2 - 400, width - 160, 800);
    
    // Decorative quote mark.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600px "FredokaBold"`;
    ctx.fillText('“', width / 2, height / 2 - 350);
  }
};
