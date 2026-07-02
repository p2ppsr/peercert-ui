import { Wallet, WalletSigner, WalletStorageManager, StorageClient, Services } from '@bsv/wallet-toolbox-client'
import { WalletClient, WalletInterface, KeyDeriver, PrivateKey } from '@bsv/sdk'
import { PrivilegedKeyManager } from '@bsv/wallet-toolbox-client/out/src/sdk'

export interface WalletConfig {
  type: 'local' | 'custom'
  privateKey?: string
  chain?: 'test' | 'main'
  storageURL?: string
}

export default async function makeWallet(config: WalletConfig): Promise<WalletInterface> {
  if (config.type === 'local') {
    // Pin the JSON substrate: the default binary wire assumes spec-compliant
    // 32-byte certificate types, and legacy certs with other type lengths
    // come back corrupted (shifted certifier keys, garbled field names)
    return new WalletClient('json-api')
  }

  if (!config.privateKey) {
    throw new Error('Private key is required for custom wallet')
  }

  const chain = config.chain || 'main'
  const storageURL = config.storageURL || 'https://storage.babbage.systems'

  const keyDeriver = new KeyDeriver(new PrivateKey(config.privateKey, 'hex'))
  const storageManager = new WalletStorageManager(keyDeriver.identityKey)
  const signer = new WalletSigner(chain, keyDeriver, storageManager)
  const services = new Services(chain)

  const wallet = new Wallet(signer, services, undefined, new PrivilegedKeyManager(async (reason) => {
    const key = window.prompt(`Privileged key requested. Privileged keys are not stored in local storage by WUI. You will need to provide it every time. Reason:\n\n${reason}\n\nPaste your privileged key in hex. If no value provided, a random key will be generated instead:`)
    if (!key) {
      return PrivateKey.fromRandom()
    } else {
      return new PrivateKey(key, 'hex')
    }
  }))

  const client = new StorageClient(wallet, storageURL)
  await client.makeAvailable()
  await storageManager.addWalletStorageProvider(client)

  return wallet
}
