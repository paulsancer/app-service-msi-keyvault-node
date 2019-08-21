import { ManagedIdentityCredential } from '@azure/identity';
import { SecretsClient } from '@azure/keyvault-secrets';

const vaultName = process.env.KeyVaultName;
const url = `https://${vaultName}.vault.azure.net`;

const credential = ManagedIdentityCredential();
const client = new SecretsClient(url, credential);

async function getSecret(secretName) {
  try {
    const res = await client.getSecret(secretName);
    console.dir(res);
    return res;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getAllSecrets() {
  try {
    const secrets = [];
    // eslint-disable-next-line
    for await (const secretAttr of client.listSecrets()) {
      const secret = await client.getSecret(secretAttr.name);
      secrets.push(secret);
    }

    console.dir(secrets);
    return secrets;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { getSecret, getAllSecrets };
