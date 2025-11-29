import { app } from './index';
import { API_ROUTES } from './constants';
import { logger } from './utils/logger';
import { env } from './config/env';

app.listen(env.PORT, ({ hostname, port }) => {
  logger.info(`Elysia server running at http://${hostname}:${port}`);
  logger.info(
    `API documentation: http://${hostname}:${port}${API_ROUTES.DOCS}`,
  );
  logger.info(`Health check: http://${hostname}:${port}${API_ROUTES.HEALTH}`);
  if (env.isDev) {
    logger.info('Development mode with HMR enabled');
  }
});
