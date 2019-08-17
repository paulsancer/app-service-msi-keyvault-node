const msRestAzure = require('ms-rest-azure');
const KeyVault = require('azure-keyvault');

const { KEY_VAULT_URI } = process.env;

let keyVaultCredentials;
let keyVaultClient;

async function init() {
  keyVaultCredentials = await msRestAzure.loginWithAppServiceMSI({
    // it is not going to change, so I guess we can keep it hard-coded
    // to avoid more app settings?
    resource: 'https://vault.azure.net'
  });
  keyVaultClient = new KeyVault.KeyVaultClient(keyVaultCredentials);
}

async function getKeyVaultSecret(secret) {
  keyVaultClient = new KeyVault.KeyVaultClient(keyVaultCredentials);
  return keyVaultClient.getSecret(KEY_VAULT_URI, secret, '');
}

async function config() {
  try {
    await init();
    const secretsListResult = await keyVaultClient.getSecrets(KEY_VAULT_URI);

    const secrets = secretsListResult.map(async secretObject => {
      // get secret name from secret url azure-key-vault-name.vault.azure.net/secrets/SECRET-NAME
      const secretName = secretObject.id.split('/secrets/')[1];
      // fetch secret value
      const secret = await getKeyVaultSecret(secretName);
      // load into env
      process.env[secret.name] = secret.value;
      return secret;
    });
    return secrets;
  } catch (error) {
    console.error(
      'Error loading secrets from Azure Key Vault to process.env:',
      error
    );
    throw error;
  }
}

module.exports = { config };
