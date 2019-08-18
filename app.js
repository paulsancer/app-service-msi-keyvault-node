const express = require('express');
const msRestAzure = require('ms-rest-azure');
const KeyVault = require('azure-keyvault');
const bodyParser = require('body-parser');

const azKeyVault = require('./azKeyVault');

const KEY_VAULT_URI = null || process.env['KEY_VAULT_URI'];

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function getKeyVaultCredentials() {
  return msRestAzure.loginWithAppServiceMSI({
    resource: 'https://vault.azure.net'
  });
}

function getKeyVaultSecret(secret, credentials) {
  let keyVaultClient = new KeyVault.KeyVaultClient(credentials);
  return keyVaultClient.getSecret(KEY_VAULT_URI, secret, '');
}

function getKeyVaultSecrets(credentials) {
  let keyVaultClient = new KeyVault.KeyVaultClient(credentials);
  return keyVaultClient.getSecrets(KEY_VAULT_URI);
}

app.get('/', function(req, res) {
  const { secret } = req.query;

  getKeyVaultCredentials()
    .then(credentials => getKeyVaultSecret(secret, credentials))
    .then(function(secret) {
      res.send(`Your secret value is: ${secret.value}.`);
    })
    .catch(function(err) {
      res.send(err);
    });
});
app.get('/api/secrets', function(req, res) {
  const { secret } = req.query;
  if (secret)
    getKeyVaultCredentials()
      .then(credentials => getKeyVaultSecret(secret, credentials))
      .then(function(secret) {
        res.send(`Your secret value is: ${secret.value}.`);
      })
      .catch(function(err) {
        res.send(err);
      });
  else
    getKeyVaultCredentials()
      .then(credentials => getKeyVaultSecrets(credentials))
      .then(function(secrets) {
        res.json(secrets);
      })
      .catch(function(err) {
        res.send(err);
      });
});

app.get('/api/appsettings', function(req, res) {
  const { key } = req.query;

  if (!key) return res.json(process.env);

  const settingValue = process.env[key];
  if (settingValue) res.send(settingValue);
  else res.status(404).send(`Not Found: '${key}'.`);
});

app.get('/ping', function(req, res) {
  res.send('Hello World!!!');
});

module.exports = app;
