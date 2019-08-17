const app = require('./app');
// const dotenv = require('dotenv');
const azKeyVault = require('./azKeyVault');

function start() {
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    logger.info(`App listening on port ${port}`);
  });
}

if (process.env.NODE_ENV === 'production') {
  (async () => {
    try {
      const secrets = await azKeyVault.config();
      console.dir(secrets);
      start();
    } catch (error) {
      throw error;
    }
  })();
} else {
  // dotenv.config();
  console.log('WOULD LOAD DOTENV HERE BEFORE STARTING THE SERVER');
  start();
}
