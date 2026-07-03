import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Award, Globe2, EyeOff, Send, ShieldCheck, ShieldAlert, BadgeCheck, Linkedin, Copy, Check, ExternalLink } from 'lucide-react'
import type { RevocationStatus } from 'peercert'
import { WalletInterface, WalletCertificate, IdentityClient } from '@bsv/sdk'
import { IdentitySearchField, IdentityCard } from '@bsv/identity-react'
import { cn } from '@/lib/utils'
import { isSkillCert, splitSkillFields, levelStyle, truncateKey, certTitle, decryptCertFields, normalizeLevel, makePeerCert } from './certs'
import { ErrorBanner, SuccessBanner, PrimaryButton, SecondaryButton, KeyAvatar, TechnicalDetails, Modal, FieldChips, SealedFields, CardMenu, Disclosure, ProgressBar, useConfirm } from './ui'

interface MySkillsProps {
  wallet: WalletInterface
  identityKey: string | null
  profile: { name: string | null; avatarURLs: string[] }
  refreshToken?: number
  onVouchClick: () => void
}

type ModalKind = 'public' | 'proof' | 'linkedin' | null

const LINKEDIN_SHARE_URL = 'https://www.linkedin.com/sharing/share-offsite/'

export default function MySkills({ wallet, identityKey, profile, refreshToken, onVouchClick }: MySkillsProps) {
  const [certificates, setCertificates] = useState<WalletCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // serialNumber → decrypted fields (null = sealed, undefined = still decrypting)
  const [decrypted, setDecrypted] = useState<Record<string, Record<string, string> | null>>({})
  // serials of certs currently discoverable in public search
  const [publicSerials, setPublicSerials] = useState<Set<string>>(new Set())

  const [modal, setModal] = useState<ModalKind>(null)
  const [activeCert, setActiveCert] = useState<WalletCertificate | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [verifier, setVerifier] = useState<{ identityKey: string; name?: string } | null>(null)
  const [modalBusy, setModalBusy] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalDone, setModalDone] = useState<string | null>(null)

  const [statuses, setStatuses] = useState<Record<string, RevocationStatus>>({})
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  // Resolved display name of the active cert's issuer, for the LinkedIn helper
  const [issuerName, setIssuerName] = useState<string | null>(null)
  const { confirm, confirmDialog } = useConfirm()

  const loadCertificates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await wallet.listCertificates({ certifiers: [], types: [] })
      setCertificates(result.certificates)
      setDecrypted({})
      // Field values arrive encrypted; unlock each cert's fields in the
      // background so cards render immediately and fill in as they decrypt
      result.certificates.forEach(cert => {
        decryptCertFields(wallet, cert).then(fields => {
          setDecrypted(prev => ({ ...prev, [cert.serialNumber]: fields }))
        })
      })
      // Check which of these are already publicly discoverable
      if (identityKey) {
        wallet.discoverByIdentityKey({ identityKey })
          .then(disc => setPublicSerials(new Set(
            (disc.certificates || []).map((c: any) => c.serialNumber)
          )))
          .catch(() => setPublicSerials(new Set()))
      }
    } catch (err) {
      console.error('Error loading certificates:', err)
      setError(err instanceof Error ? err.message : 'Could not load your endorsements.')
    } finally {
      setIsLoading(false)
    }
  }, [wallet, identityKey])

  useEffect(() => {
    loadCertificates()
  }, [loadCertificates, refreshToken])

  const openModal = (kind: ModalKind, cert: WalletCertificate) => {
    setModal(kind)
    setActiveCert(cert)
    setSelectedFields([])
    setVerifier(null)
    setModalError(null)
    setModalDone(null)
    if (kind === 'linkedin') {
      // LinkedIn asks for an "issuing organization" — resolve the issuer's public name
      setIssuerName(null)
      if (identityKey && cert.certifier === identityKey) {
        setIssuerName(profile.name || 'PeerCert')
      } else {
        new IdentityClient(wallet).resolveByIdentityKey({ identityKey: cert.certifier })
          .then(ids => {
            const named = ids.find(i => i.name && i.name !== 'Unknown Identity')
            setIssuerName(named?.name || 'PeerCert')
          })
          .catch(() => setIssuerName('PeerCert'))
      }
    }
  }

  /** LinkedIn-ready details for a credential. */
  const credentialDetails = (cert: WalletCertificate) => {
    const fields = decrypted[cert.serialNumber] || {}
    const skillLike = isSkillCert(fields)
    const { skill, level } = skillLike
      ? splitSkillFields(fields as Record<string, string>)
      : { skill: '', level: undefined }
    const name = skillLike
      ? `${skill}${level ? ` — ${normalizeLevel(level)}` : ''}`
      : certTitle(cert.type)
    const dateValue = Object.values(fields).find(v => /^\d{4}-\d{2}-\d{2}T/.test(String(v)))
    const parsed = dateValue ? new Date(String(dateValue)) : null
    const issued = parsed && !isNaN(parsed.getTime()) ? parsed : null
    const credUrl = `${window.location.origin}/demo?credential=${encodeURIComponent(cert.serialNumber)}`
    return { name, issued, credUrl }
  }

  const linkedInAddUrl = (cert: WalletCertificate) => {
    const { name, issued, credUrl } = credentialDetails(cert)
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name,
      organizationName: issuerName || 'PeerCert',
      certId: cert.serialNumber,
      certUrl: credUrl
    })
    if (issued) {
      params.set('issueYear', String(issued.getFullYear()))
      params.set('issueMonth', String(issued.getMonth() + 1))
    }
    return `https://www.linkedin.com/profile/add?${params.toString()}`
  }

  const shareOnLinkedIn = (cert: WalletCertificate) => {
    const { credUrl } = credentialDetails(cert)
    window.open(`${LINKEDIN_SHARE_URL}?url=${encodeURIComponent(credUrl)}`, '_blank', 'noopener')
  }

  const closeModal = () => {
    setModal(null)
    setActiveCert(null)
  }

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    )
  }

  const handleMakePublic = async () => {
    if (!activeCert || selectedFields.length === 0) return
    try {
      setModalBusy(true)
      setModalError(null)
      const peercert = makePeerCert(wallet)
      const result = await peercert.reveal({
        certificate: activeCert,
        fieldsToReveal: selectedFields
      })
      if (result.status !== 'success') {
        throw new Error(('description' in result && result.description) || 'Could not publish. Try again.')
      }
      setPublicSerials(prev => new Set(prev).add(activeCert.serialNumber))
      setModalDone('Done! Anyone can now find and verify these details about you.')
    } catch (err) {
      console.error('Error making endorsement public:', err)
      setModalError(err instanceof Error ? err.message : 'Could not publish. Try again.')
    } finally {
      setModalBusy(false)
    }
  }

  const handleShareProof = async () => {
    if (!activeCert || selectedFields.length === 0 || !verifier) return
    try {
      setModalBusy(true)
      setModalError(null)
      const peercert = makePeerCert(wallet)
      const verifiableCert = await peercert.createVerifiableCertificate({
        certificate: activeCert,
        verifierPublicKey: verifier.identityKey,
        fieldsToReveal: selectedFields
      })
      await peercert.send({
        recipient: verifier.identityKey,
        serializedCertificate: JSON.stringify(verifiableCert),
        issuance: false
      })
      setModalDone(`Proof sent${verifier.name ? ` to ${verifier.name}` : ''}! Only they can see the details you picked.`)
    } catch (err) {
      console.error('Error sharing proof:', err)
      setModalError(err instanceof Error ? err.message : 'Could not send the proof. Try again.')
    } finally {
      setModalBusy(false)
    }
  }

  const handleMakePrivate = async (cert: WalletCertificate) => {
    const ok = await confirm({
      title: 'Take this off public search?',
      body: 'The endorsement stays valid and stays on your profile — people just won’t find it in searches anymore.',
      confirmLabel: 'Make private'
    })
    if (!ok) return
    try {
      setBusyAction(`hide-${cert.serialNumber}`)
      setActionError(null)
      const identityClient = new IdentityClient(wallet)
      await identityClient.revokeCertificateRevelation(cert.serialNumber)
      setPublicSerials(prev => {
        const next = new Set(prev)
        next.delete(cert.serialNumber)
        return next
      })
    } catch (err) {
      console.error('Error making endorsement private:', err)
      setActionError(err instanceof Error ? err.message : 'Could not take it off public search.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleCheckValidity = async (cert: WalletCertificate) => {
    try {
      setBusyAction(`check-${cert.serialNumber}`)
      setActionError(null)
      const peercert = makePeerCert(wallet)
      const status = await peercert.checkRevocation(cert)
      setStatuses(prev => ({ ...prev, [cert.serialNumber]: status }))
    } catch (err) {
      console.error('Error checking validity:', err)
      setActionError(err instanceof Error ? err.message : 'Could not check validity.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleRemove = async (cert: WalletCertificate) => {
    const ok = await confirm({
      title: 'Remove from your profile?',
      body: 'The endorsement itself still exists — this just takes it off your profile.',
      confirmLabel: 'Remove',
      danger: true
    })
    if (!ok) return
    try {
      setBusyAction(`remove-${cert.serialNumber}`)
      setActionError(null)
      await wallet.relinquishCertificate({
        type: cert.type,
        serialNumber: cert.serialNumber,
        certifier: cert.certifier
      })
      setCertificates(prev =>
        prev.filter(c => !(c.serialNumber === cert.serialNumber && c.certifier === cert.certifier))
      )
    } catch (err) {
      console.error('Error removing endorsement:', err)
      setActionError(err instanceof Error ? err.message : 'Could not remove it. Try again.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleTakeBack = async (cert: WalletCertificate) => {
    const ok = await confirm({
      title: 'Revoke this endorsement?',
      body: 'It will permanently stop being valid — everywhere, for everyone. This cannot be undone.',
      confirmLabel: 'Revoke permanently',
      danger: true
    })
    if (!ok) return
    try {
      setBusyAction(`revoke-${cert.serialNumber}`)
      setActionError(null)
      const peercert = makePeerCert(wallet)
      const result = await peercert.revoke(cert)
      if (!result.success) throw new Error(result.error || 'Could not revoke it.')
      await handleCheckValidity(cert)
    } catch (err) {
      console.error('Error revoking endorsement:', err)
      setActionError(err instanceof Error ? err.message : 'Could not revoke it. Try again.')
    } finally {
      setBusyAction(null)
    }
  }

  // Sort: skill endorsements first, then other apps' credentials
  const displayFields = (cert: WalletCertificate) => decrypted[cert.serialNumber]
  const skillCerts = certificates.filter(c => isSkillCert(displayFields(c) || undefined))
  const otherCerts = certificates.filter(c => !isSkillCert(displayFields(c) || undefined))

  const renderCard = (cert: WalletCertificate, index: number) => {
    const fields = displayFields(cert)
    const skillLike = isSkillCert(fields || undefined)
    const { skill, level, note } = skillLike
      ? splitSkillFields(fields as Record<string, string>)
      : { skill: '', level: undefined, note: undefined }
    const status = statuses[cert.serialNumber]
    const isSelfIssued = identityKey != null && cert.certifier === identityKey
    const isPublic = publicSerials.has(cert.serialNumber)

    return (
      <div key={`${cert.serialNumber}-${index}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Headline — title, level, and status badges inline; menu at right */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">
                {skillLike ? skill : certTitle(cert.type)}
              </h3>
              {skillLike && level && (
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', levelStyle(normalizeLevel(level)))}>
                  {normalizeLevel(level)}
                </span>
              )}
              {isPublic && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  <Globe2 className="w-3.5 h-3.5" />
                  Public
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                <BadgeCheck className="w-3.5 h-3.5" />
                Signed
              </span>
            </div>
            {note && <p className="text-sm text-gray-500 italic mt-1">“{note}”</p>}
          </div>
          <CardMenu items={[
            {
              label: busyAction === `check-${cert.serialNumber}` ? 'Checking…' : 'Check validity',
              onClick: () => handleCheckValidity(cert),
              disabled: busyAction === `check-${cert.serialNumber}`,
              title: "Check on the network that this endorsement hasn't been revoked"
            },
            ...(isSelfIssued ? [{
              label: 'Revoke',
              onClick: () => handleTakeBack(cert),
              danger: true,
              disabled: busyAction === `revoke-${cert.serialNumber}` || status?.isRevoked,
              title: 'Permanently invalidate this endorsement you issued — cannot be undone'
            }] : []),
            {
              label: 'Remove from profile',
              onClick: () => handleRemove(cert),
              danger: true,
              disabled: busyAction === `remove-${cert.serialNumber}`,
              title: "Take this off your profile — it doesn't revoke the endorsement itself"
            }
          ]} />
        </div>

        {/* Voucher — IdentityCard resolves their public name & photo (e.g. X cert) */}
        <div className="mt-3 flex items-center gap-1.5">
          <p className="text-sm text-gray-500 shrink-0">Vouched for by</p>
          {isSelfIssued ? (
            <span className="text-sm font-medium text-gray-700">you</span>
          ) : (
            <div className="identity-chip-sm">
              <IdentityCard identityKey={cert.certifier} themeMode="light" />
            </div>
          )}
        </div>

        {/* Field details — tucked into an accordion to keep cards scannable */}
        <div className="mt-3">
          {fields === undefined ? (
            <div className="h-6 w-48 bg-gray-100 rounded-full animate-pulse" />
          ) : fields === null ? (
            <SealedFields />
          ) : (() => {
            const chipFields = Object.fromEntries(
              Object.entries(fields).filter(([k]) => !(skillLike && ['skill', 'level', 'note'].includes(k)))
            )
            const count = Object.keys(chipFields).length
            if (count === 0) return null
            return (
              <Disclosure label={`Details (${count})`}>
                <FieldChips fields={chipFields} />
              </Disclosure>
            )
          })()}
        </div>

        {/* Validity status */}
        {status && (
          <div className={cn(
            'mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border',
            status.isRevoked ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
          )}>
            {status.isRevoked ? (
              <>
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">No longer valid</p>
                  <p className="text-xs text-red-700 mt-0.5">This endorsement was revoked by whoever issued it.</p>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Still valid</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Checked just now — this endorsement stands.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {isPublic ? (
            <SecondaryButton
              onClick={() => handleMakePrivate(cert)}
              disabled={busyAction === `hide-${cert.serialNumber}`}
              className="px-4 py-2"
            >
              <EyeOff className="w-4 h-4" />
              {busyAction === `hide-${cert.serialNumber}` ? 'Hiding…' : 'Make private'}
            </SecondaryButton>
          ) : (
            <PrimaryButton onClick={() => openModal('public', cert)} className="px-4 py-2">
              <Globe2 className="w-4 h-4" />
              Make public
            </PrimaryButton>
          )}
          <SecondaryButton onClick={() => openModal('proof', cert)} className="px-4 py-2">
            <Send className="w-4 h-4" />
            Share proof
          </SecondaryButton>
          {skillLike ? (
            <SecondaryButton
              onClick={() => shareOnLinkedIn(cert)}
              title="Post a verified proof link to your feed"
              className="px-4 py-2"
            >
              <Linkedin className="w-4 h-4" />
              Share on LinkedIn
            </SecondaryButton>
          ) : (
            <SecondaryButton
              onClick={() => openModal('linkedin', cert)}
              title="Add this to your LinkedIn Licenses & Certifications section"
              className="px-4 py-2"
            >
              <Linkedin className="w-4 h-4" />
              Add to LinkedIn
            </SecondaryButton>
          )}
        </div>

        {/* In-flight feedback for menu actions */}
        {busyAction?.endsWith(cert.serialNumber) && (
          <div className="mt-3">
            <ProgressBar label={
              busyAction.startsWith('check-') ? 'Checking validity on the network…'
                : busyAction.startsWith('revoke-') ? 'Revoking on the network…'
                  : busyAction.startsWith('hide-') ? 'Taking it off public search…'
                    : 'Removing from your profile…'
            } />
          </div>
        )}

        <TechnicalDetails entries={[
          ['Type', cert.type],
          ['Serial number', cert.serialNumber],
          ['Issuer key', cert.certifier],
          ['Your key', cert.subject],
          ['Revocation ref', cert.revocationOutpoint],
          ['Encrypted fields', JSON.stringify(cert.fields)]
        ]} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <KeyAvatar identityKey={identityKey || 'you'} size="lg" imageUrl={profile.avatarURLs} />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{profile.name || 'Your profile'}</h2>
            <p className="text-sm text-gray-500">
              {isLoading
                ? 'Loading your credentials…'
                : certificates.length === 0
                  ? 'No verified skills or endorsements yet'
                  : `${certificates.length} verified ${certificates.length === 1 ? 'credential' : 'skills & endorsements'} — yours to keep, wherever you go`}
            </p>
            {identityKey && (
              <p className="text-xs text-gray-400 font-mono mt-1">Your ID: {truncateKey(identityKey, 12)}</p>
            )}
          </div>
          <SecondaryButton onClick={loadCertificates} disabled={isLoading}>
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </SecondaryButton>
        </div>
      </div>

      {actionError && <div className="mb-4"><ErrorBanner message={actionError} /></div>}
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading your endorsements…</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-700">No endorsements yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Endorsements people give you appear here after you accept them.
            Why not start by vouching for someone you've worked with?
          </p>
          <div className="mt-5">
            <PrimaryButton onClick={onVouchClick}>Vouch for someone</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {skillCerts.map(renderCard)}

          {otherCerts.length > 0 && (
            <>
              {skillCerts.length > 0 && (
                <div className="flex items-center gap-3 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500">Other credentials</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}
              {skillCerts.length > 0 && (
                <p className="text-xs text-gray-400 -mt-2">
                  Credentials other apps stored with you — because your data travels with you, not with the app.
                </p>
              )}
              {otherCerts.map(renderCard)}
            </>
          )}
        </div>
      )}

      {/* Make public modal */}
      {modal === 'public' && activeCert && (
        <Modal
          title="Make this endorsement public"
          subtitle="Pick exactly what the world can see. Everything else stays private."
          onClose={closeModal}
        >
          {modalDone ? (
            <div className="space-y-4">
              <SuccessBanner>{modalDone}</SuccessBanner>
              <SecondaryButton onClick={closeModal} className="w-full">Close</SecondaryButton>
            </div>
          ) : (
            <div className="space-y-4">
              <FieldPicker
                fields={activeCert.fields as Record<string, string>}
                decrypted={decrypted[activeCert.serialNumber] || null}
                selected={selectedFields}
                onToggle={toggleField}
              />
              <p className="text-xs text-gray-400">
                Once public, anyone — on any app — can find and verify the details you pick.
                You can take an endorsement off public search later.
              </p>
              {modalError && <ErrorBanner message={modalError} />}
              {modalBusy && (
                <ProgressBar label="Anchoring on the network — your wallet may ask for approval…" />
              )}
              <div className="flex gap-2.5">
                <SecondaryButton onClick={closeModal} disabled={modalBusy} className="flex-1">
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleMakePublic}
                  loading={modalBusy}
                  disabled={selectedFields.length === 0}
                  className="flex-1"
                >
                  {modalBusy ? 'Publishing…' : `Make ${selectedFields.length || ''} ${selectedFields.length === 1 ? 'detail' : 'details'} public`}
                </PrimaryButton>
              </div>
            </div>
          )}
        </Modal>
      )}

      {confirmDialog}

      {/* Add to LinkedIn modal */}
      {modal === 'linkedin' && activeCert && (() => {
        const { name, issued, credUrl } = credentialDetails(activeCert)
        const issuedLabel = issued
          ? issued.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          : null
        return (
          <Modal
            title="Add to LinkedIn"
            subtitle="LinkedIn asks you to type certification details in yourself — copy them from here."
            onClose={closeModal}
          >
            <div className="space-y-2">
              <CopyRow label="Name" value={name} />
              <CopyRow label="Issuing organization" value={issuerName ?? 'Resolving…'} />
              {issuedLabel && <CopyRow label="Issue date" value={issuedLabel} />}
              <CopyRow label="Credential ID" value={activeCert.serialNumber} mono />
              <CopyRow label="Credential URL" value={credUrl} mono />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Tip: pick the right issuing organization in LinkedIn's dropdown so its logo
              shows on your profile. Anyone with the credential URL can verify this
              endorsement is genuine.
            </p>
            <div className="mt-4 flex gap-2.5">
              <SecondaryButton onClick={closeModal} className="flex-1">Close</SecondaryButton>
              <PrimaryButton
                onClick={() => window.open(linkedInAddUrl(activeCert), '_blank', 'noopener')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                Open LinkedIn
              </PrimaryButton>
            </div>
          </Modal>
        )
      })()}

      {/* Share proof modal */}
      {modal === 'proof' && activeCert && (
        <Modal
          title="Share a private proof"
          subtitle="Send verified details to one specific person. No one else can read them."
          onClose={closeModal}
        >
          {modalDone ? (
            <div className="space-y-4">
              <SuccessBanner>{modalDone}</SuccessBanner>
              <SecondaryButton onClick={closeModal} className="w-full">Close</SecondaryButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Who's checking?</label>
                {verifier ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <KeyAvatar identityKey={verifier.identityKey} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{verifier.name || 'Selected person'}</p>
                      <p className="text-xs text-gray-500 font-mono">{truncateKey(verifier.identityKey, 12)}</p>
                    </div>
                    <button
                      onClick={() => setVerifier(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <IdentitySearchField
                    onIdentitySelected={(identity: any) =>
                      setVerifier({ identityKey: identity.identityKey, name: identity.name })
                    }
                    appName="PeerCert"
                  />
                )}
              </div>
              <FieldPicker
                fields={activeCert.fields as Record<string, string>}
                decrypted={decrypted[activeCert.serialNumber] || null}
                selected={selectedFields}
                onToggle={toggleField}
              />
              {modalError && <ErrorBanner message={modalError} />}
              {modalBusy && (
                <ProgressBar label="Creating the proof and sending it — your wallet may ask for approval…" />
              )}
              <div className="flex gap-2.5">
                <SecondaryButton onClick={closeModal} disabled={modalBusy} className="flex-1">
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleShareProof}
                  loading={modalBusy}
                  disabled={selectedFields.length === 0 || !verifier}
                  className="flex-1"
                >
                  {modalBusy ? 'Sending…' : 'Send proof'}
                </PrimaryButton>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

/** Labeled value with a one-click copy button, for the LinkedIn helper. */
function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={cn('text-sm text-gray-800 truncate', mono && 'font-mono text-xs')}>{value}</p>
      </div>
      <button
        onClick={copy}
        title={`Copy ${label.toLowerCase()}`}
        className="shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

/**
 * Checkbox list for choosing which details to share. Field names come from
 * the certificate; values shown are the decrypted ones (never ciphertext).
 */
function FieldPicker({ fields, decrypted, selected, onToggle }: {
  fields: Record<string, string>
  decrypted: Record<string, string> | null
  selected: string[]
  onToggle: (field: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Which details?</label>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {Object.keys(fields).map(field => (
          <label
            key={field}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              selected.includes(field)
                ? 'border-blue-400 bg-blue-50/60'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <input
              type="checkbox"
              checked={selected.includes(field)}
              onChange={() => onToggle(field)}
              className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{field}</p>
              <p className="text-xs text-gray-500 break-all">
                {decrypted?.[field] ?? '(encrypted)'}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
