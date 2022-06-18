import { app } from './src/app';
import { PORT } from './src/common/config';
import { logger } from './src/common/logger';

if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  app.listen((PORT), () => {
    logger.info(`App listening at http://localhost:${PORT}`)
  })
}
