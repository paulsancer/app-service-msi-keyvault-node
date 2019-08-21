const express = require('express');
// const msRestAzure = require('ms-rest-azure');
// const KeyVault = require('azure-keyvault');
const bodyParser = require('body-parser');
const keyVault = require('./azKeyVault');

// const { KeyVaultName } = process.env;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// function getKeyVaultCredentials() {
//   return msRestAzure.loginWithAppServiceMSI({
//     resource: 'https://vault.azure.net'
//   });
// }

// function getKeyVaultSecret(secret, credentials) {
//   let keyVaultClient = new KeyVault.KeyVaultClient(credentials);
//   return keyVaultClient.getSecret(KEY_VAULT_URI, secret, '');
// }

// function getKeyVaultSecrets(credentials) {
//   let keyVaultClient = new KeyVault.KeyVaultClient(credentials);
//   return keyVaultClient.getSecrets(KEY_VAULT_URI);
// }

// app.get('/', (req, res) => {
//   const { secret } = req.query;

//   getKeyVaultCredentials()
//     .then(credentials => getKeyVaultSecret(secret, credentials))
//     .then(function(secret) {
//       res.send(`Your secret value is: ${secret.value}.`);
//     })
//     .catch(function(err) {
//       res.send(err);
//     });
// });

app.get('/api/secrets', async (req, res) => {
  const { secret } = req.query;
  if (secret) {
    try {
      const secretRes = keyVault.getKeyVaultSecret(secret);
      console.log(secretRes);
      return res.json(secretRes);
    } catch (error) {
      console.error('getKeyVaultSecret: ', error);
      return res.status(500).json(error);
    }
  } else {
    return res.status(400).send('NOT IMPLEMENTED');
    // try {
    //   const secrets = keyVault.getAllSecrets();
    //   return res.json(secrets);
    // } catch (error) {
    //   console.error(error);
    //   return res.status(500).json(error);
    // }
  }
});

app.get('/api/appsettings', (req, res) => {
  const { key } = req.query;

  if (!key) return res.json(process.env);

  const settingValue = process.env[key];
  if (!settingValue) return res.status(404).send(`Not Found: '${key}'.`);

  return res.send(settingValue);
});

app.get('/ping', (req, res) => {
  res.send('Hello World!!!');
});

module.exports = app;
