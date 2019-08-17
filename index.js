const express = require('express');
const msRestAzure = require('ms-rest-azure');
const KeyVault = require('azure-keyvault');
const bodyParser = require('body-parser');

const KEY_VAULT_URI = null || process.env['KEY_VAULT_URI'];

let app = express();
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

// This endpoint is only for testing whether an app setting was present or not, please ignore
app.get('/appsettings', function(req, res) {
  const { setting } = req.query;
  const settingValue = process.env[setting];
  if (settingValue) res.send(settingValue);
  else res.status(404).send(`Not Found: '${setting}'.`);
});

app.get('/ping', function(req, res) {
  res.send('Hello World!!!');
});

let port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log(`Server running at http://localhost:${port}`);
});
