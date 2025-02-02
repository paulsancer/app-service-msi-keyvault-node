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
  console.error('keyVaultCredentials: ', keyVaultCredentials);
  keyVaultClient = new KeyVault.KeyVaultClient(keyVaultCredentials);
}

async function getKeyVaultSecret(secret) {
  await init();
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
      const isInEnv = process.env.hasOwnProperty(secretName);
      if (!isInEnv) {
        console.log(`Loading secret '${secretName}'...`);
        process.env[secretName] = secret.value;
      }
      return { name: secretName, value: secret.value, loaded: !isInEnv };
    });
    return await Promise.all(secrets);
  } catch (error) {
    console.error(
      'Error loading secrets from Azure Key Vault to process.env:',
      error
    );
    throw error;
  }
}

module.exports = { config, getKeyVaultSecret };
