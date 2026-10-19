import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HTTPWalletJSON, PrivateKey, Utils, WalletClient } from '@bsv/sdk'

// Match the existing endorsement identifier in src/demo/certs.ts. Keep its
// historical bytes intact: this qualification must not migrate the records.
const legacyType = Utils.toBase64(Utils.toArray('peercert-skill-endorsement-v001', 'utf8'))
const canonicalType = Utils.toBase64(Array(32).fill(1))
const publicKey = new PrivateKey(2).toPublicKey().toString()

function certificate(type) {
  return {
    type,
    serialNumber: Utils.toBase64(Array(32).fill(2)),
    subject: publicKey,
    certifier: publicKey,
    revocationOutpoint: `${'00'.repeat(32)}.0`,
    signature: '3006020101020101',
    fields: {}
  }
}

function fixtureWallet(certificates) {
  const requests = []
  const substrate = new HTTPWalletJSON('peercert.io', 'https://wallet.invalid', async (url, init) => {
    requests.push({ url: String(url), args: JSON.parse(init.body) })
    return new Response(JSON.stringify({ totalCertificates: certificates.length, certificates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  })
  return { wallet: new WalletClient(substrate, 'peercert.io'), requests }
}

test('the existing PeerCert endorsement identifier is 31 decoded bytes', () => {
  assert.equal(Utils.toArray(legacyType, 'base64').length, 31)
})

test('the My Certificates unfiltered JSON request accepts canonical certificates', async () => {
  const { wallet, requests } = fixtureWallet([certificate(canonicalType)])
  const result = await wallet.listCertificates({ certifiers: [], types: [] })
  assert.equal(result.certificates[0].type, canonicalType)
  assert.equal(requests.length, 1)
  assert.match(requests[0].url, /\/listCertificates$/)
  assert.deepEqual(requests[0].args, { certifiers: [], types: [] })
})

test('SDK 3.2.1 rejects the whole unfiltered JSON result containing a legacy certificate', async () => {
  const { wallet, requests } = fixtureWallet([
    certificate(canonicalType),
    certificate(legacyType)
  ])
  await assert.rejects(
    wallet.listCertificates({ certifiers: [], types: [] }),
    /certificates\[1\].*canonical signed wallet certificate/
  )
  assert.equal(requests.length, 1, 'the wallet returned data; client result validation rejected it')
})

test('SDK 3.2.1 rejects a legacy type filter before sending a JSON request', async () => {
  const { wallet, requests } = fixtureWallet([])
  await assert.rejects(
    wallet.listCertificates({ certifiers: [], types: [legacyType] }),
    error => error.code === 6 && /types.*32 bytes/.test(error.message)
  )
  assert.equal(requests.length, 0)
})
