import { Hono } from 'hono';

export const mediaRouter = new Hono();

// Friendly 405 for any method on /api/media/*
mediaRouter.all('/api/media/*', (c) => {
  return c.json({
    ok: false,
    message:
      'Media generation (audio/video) is not supported on this edge runtime. ' +
      'Use an async job service (e.g., ElevenLabs, OpenAI, Runway) and call back when done.',
    docs: '/README#media-generation-audiovideo'
  }, 405);
});

export default mediaRouter;
