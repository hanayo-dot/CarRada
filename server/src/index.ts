import app from './app';
import { PORT } from './config';
import { runMigrations } from './db';

async function bootstrap() {
  try {
    await runMigrations();
  } catch (error) {
    console.error('[Server] Database migration failed on startup:', error);
  }

  app.listen(PORT, () => {
    console.log(`CarRada server listening on http://localhost:${PORT}`);
  });
}

bootstrap();
