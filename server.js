const app = require("./app");
// const dotenv = require('dotenv');
const azKeyVault = require("./azKeyVault");

function start() {
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
}

if (process.env.MSI_ENDPOINT) {
  (async () => {
    try {
      const secrets = await azKeyVault.config();
      console.dir(secrets);
    } catch (error) {
      console.error(error);
    }
    start();
  })();
} else {
  // dotenv.config();
  console.log("WOULD LOAD DOTENV HERE BEFORE STARTING THE SERVER");
  start();
}
