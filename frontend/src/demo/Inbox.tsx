import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Inbox as InboxIcon, ChevronDown, ChevronRight, BadgeCheck, ShieldAlert, ShieldCheck, ClipboardPaste } from 'lucide-react'
import type { IncomingCertificate, VerifyVerifiableCertificateResult } from 'peercert'
import { WalletInterface, MasterCertificate } from '@bsv/sdk'
import { IdentityCard } from '@bsv/identity-react'
import { cn } from '@/lib/utils'
import { isSkillCert, levelStyle, normalizeLevel, makePeerCert } from './certs'
import { ErrorBanner, SuccessBanner, PrimaryButton, SecondaryButton, TechnicalDetails, FieldChips, SealedFields } from './ui'

interface InboxProps {
  wallet: WalletInterface
  onAccepted?: () => void
}

export default function Inbox({ wallet, onAccepted }: InboxProps) {
  const [certificates, setCertificates] = useState<IncomingCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verifyResults, setVerifyResults] = useState<Record<string, VerifyVerifiableCertificateResult>>({})
  const [actionError, setActionError] = useState<string | null>(null)
  // messageId → decrypted preview fields (null = couldn't decrypt)
  const [previews, setPreviews] = useState<Record<string, Record<string, string> | null>>({})

  const [showPaste, setShowPaste] = useState(false)
  const [pasteInput, setPasteInput] = useState('')
  const [pasteBusy, setPasteBusy] = useState(false)
  const [pasteSuccess, setPasteSuccess] = useState(false)
  const [pasteError, setPasteError] = useState<string | null>(null)

  const loadCertificates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const peercert = makePeerCert(wallet)
      const incoming = await peercert.listIncomingCertificates()
      setCertificates(incoming)
      // Incoming certs carry their master keyring — decrypt fields in the
      // background so recipients can see what they're being vouched for
      setPreviews({})
      incoming.forEach(async cert => {
        let fields: Record<string, string> | null = null
        try {
          const parsed = JSON.parse(cert.serializedCertificate)
          if (cert.issuance && parsed?.masterKeyring && parsed?.fields) {
            fields = await MasterCertificate.decryptFields(
              wallet, parsed.masterKeyring, parsed.fields, parsed.certifier
            )
          }
        } catch {
          fields = null
        }
        setPreviews(prev => ({ ...prev, [cert.messageId]: fields }))
      })
    } catch (err) {
      console.error('Error loading inbox:', err)
      setError(err instanceof Error ? err.message : 'Could not load your inbox. Try refreshing.')
    } finally {
      setIsLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    loadCertificates()
  }, [loadCertificates])

  const handleAccept = async (cert: IncomingCertificate) => {
    try {
      setProcessing(cert.messageId)
      setActionError(null)
      const peercert = makePeerCert(wallet)
      const result = await peercert.receive(cert.serializedCertificate)
      if (!result.success) throw new Error(result.error || 'Could not add this endorsement.')
      await peercert.acknowledgeCertificate(cert.messageId)
      setCertificates(prev => prev.filter(c => c.messageId !== cert.messageId))
      onAccepted?.()
    } catch (err) {
      console.error('Error accepting endorsement:', err)
      setActionError(err instanceof Error ? err.message : 'Could not add this endorsement.')
    } finally {
      setProcessing(null)
    }
  }

  const handleDecline = async (cert: IncomingCertificate) => {
    try {
      setProcessing(cert.messageId)
      setActionError(null)
      const peercert = makePeerCert(wallet)
      await peercert.acknowledgeCertificate(cert.messageId)
      setCertificates(prev => prev.filter(c => c.messageId !== cert.messageId))
    } catch (err) {
      console.error('Error declining endorsement:', err)
      setActionError(err instanceof Error ? err.message : 'Could not decline. Try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleVerify = async (cert: IncomingCertificate) => {
    try {
      setVerifying(cert.messageId)
      const peercert = makePeerCert(wallet)
      const result = await peercert.verifyVerifiableCertificate(cert.serializedCertificate, {
        checkRevocation: true
      })
      setVerifyResults(prev => ({ ...prev, [cert.messageId]: result }))
    } catch (err) {
      console.error('Error verifying proof:', err)
      setVerifyResults(prev => ({
        ...prev,
        [cert.messageId]: {
          verified: false,
          error: err instanceof Error ? err.message : 'Could not check this proof.'
        }
      }))
    } finally {
      setVerifying(null)
    }
  }

  const handlePaste = async () => {
    if (!pasteInput.trim()) {
      setPasteError('Paste the code you received first.')
      return
    }
    try {
      setPasteBusy(true)
      setPasteError(null)
      const peercert = makePeerCert(wallet)
      // receive() accepts both certificate JSON and compact share codes
      const result = await peercert.receive(pasteInput.trim())
      if (!result.success) {
        const err = result.error || ''
        throw new Error(/malformed|unsupported|unexpected|json/i.test(err)
          ? "That code doesn't look right. Double-check you copied the whole thing."
          : err || 'Could not add this endorsement.')
      }
      setPasteSuccess(true)
      setPasteInput('')
      onAccepted?.()
      setTimeout(() => setPasteSuccess(false), 4000)
    } catch (err) {
      console.error('Error receiving pasted endorsement:', err)
      setPasteError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setPasteBusy(false)
    }
  }

  const parseCert = (cert: IncomingCertificate): Record<string, any> => {
    try {
      return typeof cert.serializedCertificate === 'string'
        ? JSON.parse(cert.serializedCertificate)
        : cert.serializedCertificate
    } catch {
      return {}
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
          <p className="text-gray-500 mt-1">Endorsements waiting for your approval.</p>
        </div>
        <SecondaryButton onClick={loadCertificates} disabled={isLoading}>
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </SecondaryButton>
      </div>

      {actionError && <div className="mb-4"><ErrorBanner message={actionError} /></div>}
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {/* Pending items */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Checking for new endorsements…</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <InboxIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-700">You're all caught up</p>
          <p className="text-sm text-gray-400 mt-1">
            When someone vouches for you, it shows up here for your approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map(cert => {
            const parsed = parseCert(cert)
            const fields = previews[cert.messageId]
            const skillLike = isSkillCert(fields || undefined)
            const verifyResult = verifyResults[cert.messageId]
            const busy = processing === cert.messageId

            return (
              <div key={cert.messageId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* IdentityCard resolves the sender's public name & photo */}
                    <div className="-ml-2 identity-chip-sm">
                      <IdentityCard identityKey={cert.sender} themeMode="light" />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {cert.issuance ? 'vouched for you' : 'shared a proof with you'}
                    </p>
                  </div>
                  {cert.issuance ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Endorsement
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Proof to check
                    </span>
                  )}
                </div>

                {/* Endorsement contents, decrypted for preview before accepting */}
                {cert.issuance && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    {fields && skillLike ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-semibold text-gray-900">{fields.skill}</span>
                        {fields.level && (
                          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', levelStyle(normalizeLevel(fields.level)))}>
                            {normalizeLevel(fields.level)}
                          </span>
                        )}
                        {fields.note && (
                          <p className="w-full text-sm text-gray-500 italic mt-1">“{fields.note}”</p>
                        )}
                        <div className="w-full mt-1">
                          <FieldChips fields={fields} omit={['skill', 'level', 'note']} />
                        </div>
                      </div>
                    ) : fields ? (
                      <FieldChips fields={fields} />
                    ) : fields === undefined ? (
                      <div className="h-6 w-48 bg-gray-200/60 rounded-full animate-pulse" />
                    ) : (
                      <SealedFields />
                    )}
                  </div>
                )}

                {/* Verification result for shared proofs.
                    Revoked proofs fail closed (verified: false); a verified
                    proof whose revocation lookup failed shows as amber. */}
                {verifyResult && (
                  <div className={cn(
                    'mt-4 p-4 rounded-xl border',
                    !verifyResult.verified ? 'bg-red-50 border-red-100'
                      : verifyResult.revocationStatus?.status === 'unknown'
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-emerald-50 border-emerald-100'
                  )}>
                    {verifyResult.verified ? (
                      <div className="flex items-start gap-2.5">
                        {verifyResult.revocationStatus?.status === 'unknown' ? (
                          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={cn(
                            'text-sm font-semibold',
                            verifyResult.revocationStatus?.status === 'unknown' ? 'text-amber-900' : 'text-emerald-900'
                          )}>
                            {verifyResult.revocationStatus?.status === 'unknown'
                              ? 'Signed correctly, but…'
                              : 'This proof checks out'}
                          </p>
                          <p className={cn(
                            'text-xs mt-0.5',
                            verifyResult.revocationStatus?.status === 'unknown' ? 'text-amber-700' : 'text-emerald-700'
                          )}>
                            {verifyResult.revocationStatus?.status === 'unknown'
                              ? "We couldn't confirm it hasn't been revoked — the network didn't answer. Try again in a moment."
                              : 'Genuinely signed and still valid.'}
                          </p>
                          {verifyResult.fields && Object.keys(verifyResult.fields).length > 0 && (
                            <div className="mt-3 bg-white rounded-lg p-3 border border-emerald-100 space-y-1">
                              {Object.entries(verifyResult.fields).map(([k, v]) => (
                                <div key={k} className="flex gap-2 text-sm">
                                  <span className="text-gray-500 capitalize">{k}:</span>
                                  <span className="text-gray-900 font-medium">{v}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">
                            {verifyResult.revocationStatus?.status === 'revoked'
                              ? 'This endorsement was revoked'
                              : "This proof doesn't check out"}
                          </p>
                          <p className="text-xs text-red-700 mt-0.5">
                            {verifyResult.revocationStatus?.message || verifyResult.error ||
                              "Don't rely on this one."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2.5">
                  {cert.issuance ? (
                    <>
                      <PrimaryButton
                        onClick={() => handleAccept(cert)}
                        loading={busy}
                        className="flex-1"
                      >
                        Add to my profile
                      </PrimaryButton>
                      <SecondaryButton onClick={() => handleDecline(cert)} disabled={busy}>
                        No thanks
                      </SecondaryButton>
                    </>
                  ) : (
                    <>
                      {!verifyResult && (
                        <PrimaryButton
                          onClick={() => handleVerify(cert)}
                          loading={verifying === cert.messageId}
                          className="flex-1"
                        >
                          {verifying === cert.messageId ? 'Checking…' : 'Check this proof'}
                        </PrimaryButton>
                      )}
                      <SecondaryButton
                        onClick={() => handleDecline(cert)}
                        disabled={busy}
                        className={verifyResult ? 'flex-1' : ''}
                      >
                        Dismiss
                      </SecondaryButton>
                    </>
                  )}
                </div>

                <TechnicalDetails entries={[
                  ['Sender key', cert.sender],
                  ['Serial number', parsed?.serialNumber],
                  ['Revocation ref', parsed?.revocationOutpoint],
                  ['Message ID', cert.messageId]
                ]} />
              </div>
            )
          })}
        </div>
      )}

      {/* Paste a code */}
      <div className="mt-6">
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPaste ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <ClipboardPaste className="w-4 h-4" />
          Got an endorsement code? Paste it here
        </button>
        {showPaste && (
          <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="text-sm text-gray-500">
              If someone sent you a code (by message, email, or QR), paste it below to add
              their endorsement to your profile.
            </p>
            <textarea
              value={pasteInput}
              onChange={e => setPasteInput(e.target.value)}
              placeholder="Paste the code…"
              rows={3}
              disabled={pasteBusy}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            {pasteError && <ErrorBanner message={pasteError} />}
            {pasteSuccess && (
              <SuccessBanner>Endorsement added! Check it out on your profile.</SuccessBanner>
            )}
            <PrimaryButton
              onClick={handlePaste}
              loading={pasteBusy}
              disabled={!pasteInput.trim()}
              className="w-full"
            >
              {pasteBusy ? 'Adding…' : 'Add endorsement'}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  )
}
