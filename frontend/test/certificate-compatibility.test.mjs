import { PeerCert, assertCertificateType } from 'peercert'
import { SKILL_CERT_TYPE, endorsementTypeFromName } from '../src/demo/certificateTypes.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HTTPWalletJSON, MasterCertificate, ProtoWallet, PrivateKey, Utils, WalletClient } from '@bsv/sdk'

// Historical endorsement identifier, no longer used for new issuance. Keep its
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

test('new default and custom schema names produce stable canonical 32-byte types', () => {
  for (const name of ['', 'work', 'example.org/qualification/v1', 'A'.repeat(100), '資格']) {
    const type = endorsementTypeFromName(name)
    assertCertificateType(type)
    assert.equal(Utils.toArray(type, 'base64').length, 32)
    assert.equal(type, endorsementTypeFromName(name))
  }
  assert.equal(endorsementTypeFromName(''), SKILL_CERT_TYPE)
  assert.equal(SKILL_CERT_TYPE, 'IquX7sgfOFEgE0K9I213atYLo331ZW1wiqjMg0RtKs4=')
  assert.notEqual(SKILL_CERT_TYPE, legacyType)
})

test('the packaged library signs, compact-round-trips and verifies new website types', async () => {
  const issuer = new ProtoWallet(new PrivateKey(2))
  const subject = new PrivateKey(3).toPublicKey().toString()
  const type = endorsementTypeFromName('work')
  const cert = await MasterCertificate.issueCertificateForSubject(
    issuer, subject, { skill: 'TypeScript' }, type, async () => `${'ab'.repeat(32)}.0`
  )
  assert.equal(await cert.verify(), true)
  const decoded = PeerCert.decodeCertificate(PeerCert.encodeCertificate(cert))
  assert.equal(decoded.type, type)
  const restored = new MasterCertificate(decoded.type, decoded.serialNumber, decoded.subject,
    decoded.certifier, decoded.revocationOutpoint, decoded.fields, decoded.masterKeyring, decoded.signature)
  assert.equal(await restored.verify(), true)
})

test('an explicit current-type filter is valid with the strict wallet client', async () => {
  const { wallet, requests } = fixtureWallet([certificate(SKILL_CERT_TYPE)])
  const result = await wallet.listCertificates({ certifiers: [], types: [SKILL_CERT_TYPE] })
  assert.equal(result.certificates.length, 1)
  assert.deepEqual(requests[0].args.types, [SKILL_CERT_TYPE])
})
