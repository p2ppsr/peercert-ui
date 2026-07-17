import { useState, useCallback } from 'react'
import { Search, ChevronDown, ChevronRight, Plus, Trash2, ShieldCheck, ShieldAlert, BadgeCheck, EyeOff } from 'lucide-react'
import type { RevocationStatus } from 'peercert'
import { WalletInterface, IdentityClient } from '@bsv/sdk'
import { IdentityCard } from '@bsv/identity-react'
import { certTitle, makePeerCert, searchRevealedCerts } from './certs'
import { ErrorBanner, PrimaryButton, TechnicalDetails, FieldChips, useConfirm } from './ui'

interface DiscoverProps {
  wallet: WalletInterface
  identityKey: string | null
}

interface PublicCertificate {
  type: string
  subject: string
  serialNumber: string
  certifier: string
  decryptedFields: Record<string, string>
  revocationOutpoint: string
}

interface FilterField {
  id: string
  key: string
  value: string
}

export default function Discover({ wallet, identityKey }: DiscoverProps) {
  const [query, setQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filterFields, setFilterFields] = useState<FilterField[]>([])
  const [certifierFilter, setCertifierFilter] = useState('')

  const [results, setResults] = useState<PublicCertificate[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [statuses, setStatuses] = useState<Record<string, RevocationStatus>>({})
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const { confirm, confirmDialog } = useConfirm()

  const runSearch = useCallback(async (rawQuery: string) => {
    const attributes: Record<string, string> = {}
    // "any" fuzzy-matches across every publicly revealed attribute value —
    // the same mechanism the people-search field uses
    if (rawQuery.trim()) attributes.any = rawQuery.trim()
    for (const f of filterFields) {
      if (f.key.trim() && f.value.trim()) attributes[f.key.trim()] = f.value.trim()
    }
    if (Object.keys(attributes).length === 0) {
      setError('Type a name, skill, or anything else to search for.')
      return
    }

    try {
      setIsSearching(true)
      setError(null)
      setHasSearched(true)

      // Query the identity overlay directly: unlike wallet.discoverByAttributes,
      // results aren't filtered by the viewer's trusted-certifier settings, so
      // peer-issued endorsements from any certifier are discoverable.
      let preset: 'mainnet' | 'testnet' = 'mainnet'
      try {
        const { network } = await wallet.getNetwork({})
        preset = network === 'testnet' ? 'testnet' : 'mainnet'
      } catch {
        // No wallet connected — public search works without one
      }
      let certs: PublicCertificate[] = await searchRevealedCerts(attributes, preset)
      if (certifierFilter.trim()) {
        certs = certs.filter(c => c.certifier === certifierFilter.trim())
      }
      setResults(certs)
    } catch (err) {
      console.error('Error searching:', err)
      setError(err instanceof Error ? err.message : 'Search failed. Try again.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [wallet, filterFields, certifierFilter])

  const handleCheckValidity = async (cert: PublicCertificate) => {
    try {
      setBusyAction(`check-${cert.serialNumber}`)
      const peercert = makePeerCert(wallet)
      const status = await peercert.checkRevocation({
        revocationOutpoint: cert.revocationOutpoint,
        serialNumber: cert.serialNumber,
        type: cert.type,
        subject: cert.subject,
        certifier: cert.certifier,
        signature: '',
        fields: cert.decryptedFields
      } as any)
      setStatuses(prev => ({ ...prev, [cert.serialNumber]: status }))
    } catch (err) {
      console.error('Error checking validity:', err)
      setError(err instanceof Error ? err.message : 'Could not check validity.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleTakeBack = async (cert: PublicCertificate) => {
    const ok = await confirm({
      title: 'Revoke this endorsement?',
      body: 'It will permanently stop being valid — everywhere, for everyone. This cannot be undone.',
      confirmLabel: 'Revoke permanently',
      danger: true
    })
    if (!ok) return
    try {
      setBusyAction(`revoke-${cert.serialNumber}`)
      const peercert = makePeerCert(wallet)
      const result = await peercert.revoke({
        revocationOutpoint: cert.revocationOutpoint,
        serialNumber: cert.serialNumber,
        type: cert.type,
        subject: cert.subject,
        certifier: cert.certifier,
        signature: '',
        fields: cert.decryptedFields
      } as any)
      if (!result.success) throw new Error(result.error || 'Could not revoke it.')
      await handleCheckValidity(cert)
    } catch (err) {
      console.error('Error revoking:', err)
      setError(err instanceof Error ? err.message : 'Could not revoke it.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleMakePrivate = async (cert: PublicCertificate) => {
    const ok = await confirm({
      title: 'Take this off public search?',
      body: 'The endorsement stays valid and stays on your profile — people just won’t find it in searches anymore.',
      confirmLabel: 'Make private'
    })
    if (!ok) return
    try {
      setBusyAction(`hide-${cert.serialNumber}`)
      const identityClient = new IdentityClient(wallet)
      await identityClient.revokeCertificateRevelation(cert.serialNumber)
      setResults(prev => prev.filter(c => c.serialNumber !== cert.serialNumber))
    } catch (err) {
      console.error('Error removing from public search:', err)
      setError(err instanceof Error ? err.message : 'Could not take it off public search.')
    } finally {
      setBusyAction(null)
    }
  }

  const searchFor = (q: string) => {
    setQuery(q)
    runSearch(q)
  }

  // Group results into one card per person
  const people = [...new Set(results.map(c => c.subject))].map(subject => ({
    subject,
    certs: results.filter(c => c.subject === subject)
  }))

  return (
    <div className="max-w-2xl mx-auto">
      {confirmDialog}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Discover people</h2>
        <p className="text-gray-500 mt-1">
          Search anything people have chosen to make public — names, skills, handles —
          from any app, not just this one.
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <form
          className="flex gap-2.5"
          onSubmit={e => { e.preventDefault(); runSearch(query) }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              id="discover-search"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Try a name, a skill, an email, a handle…"
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <PrimaryButton loading={isSearching} className="!px-6" onClick={() => runSearch(query)}>
            {isSearching ? 'Searching…' : 'Search'}
          </PrimaryButton>
        </form>

        {/* Advanced filters */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          Advanced search
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Match a specific attribute exactly
              </label>
              <div className="space-y-2">
                {filterFields.map(f => (
                  <div key={f.id} className="flex gap-2">
                    <input
                      type="text"
                      value={f.key}
                      onChange={e => setFilterFields(prev => prev.map(x => x.id === f.id ? { ...x, key: e.target.value } : x))}
                      placeholder="Attribute (e.g. skill)"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={f.value}
                      onChange={e => setFilterFields(prev => prev.map(x => x.id === f.id ? { ...x, value: e.target.value } : x))}
                      placeholder="Value (e.g. TypeScript)"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => setFilterFields(prev => prev.filter(x => x.id !== f.id))}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFilterFields(prev => [...prev, { id: crypto.randomUUID(), key: '', value: '' }])}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add filter
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Only endorsements signed by (ID)
              </label>
              <input
                type="text"
                value={certifierFilter}
                onChange={e => setCertifierFilter(e.target.value)}
                placeholder="Paste an ID to filter by who vouched…"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {/* Results — one card per person */}
      {hasSearched && !isSearching && (
        people.length === 0 && !error ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-gray-700">No one found</p>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              No public details match that. Try another word, or ask a friend
              to make one of their endorsements public.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              {people.length} {people.length === 1 ? 'person' : 'people'} found
            </p>
            {people.map(({ subject, certs }) => {
              const isMe = identityKey != null && subject === identityKey

              return (
                <div key={subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  {/* Person header — resolves name, photo & certifier badge */}
                  <div className="flex items-center gap-2 -ml-2">
                    <IdentityCard identityKey={subject} themeMode="light" />
                    {isMe && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        You
                      </span>
                    )}
                    <div className="flex-1" />
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {certs.length === 1 ? 'Verified public' : `${certs.length} public credentials`}
                    </span>
                  </div>

                  {/* Their matching credentials */}
                  <div className="mt-4 space-y-3">
                    {certs.map(cert => {
                      const status = statuses[cert.serialNumber]
                      const iVouched = identityKey != null && cert.certifier === identityKey

                      return (
                        <div key={cert.serialNumber} className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-800">{certTitle(cert.type)}</p>
                            {status && (
                              status.status === 'revoked' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Revoked
                                </span>
                              ) : status.status === 'unknown' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Couldn't check
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Still valid
                                </span>
                              )
                            )}
                          </div>

                          {cert.decryptedFields.note && (
                            <p className="text-sm text-gray-500 italic mt-1">“{cert.decryptedFields.note}”</p>
                          )}
                          <div className="mt-2.5">
                            <FieldChips fields={cert.decryptedFields} omit={['note']} />
                          </div>

                          {/* Vouched by — IdentityCard resolves the certifier's public name/photo */}
                          <div className="mt-3 flex items-center gap-2">
                            <p className="text-xs text-gray-500 shrink-0">Vouched for by</p>
                            {iVouched ? (
                              <span className="text-xs font-medium text-gray-700">you</span>
                            ) : (
                              <div className="identity-chip-sm">
                                <IdentityCard identityKey={cert.certifier} themeMode="light" />
                              </div>
                            )}
                            <div className="flex-1" />
                            <button
                              onClick={() => handleCheckValidity(cert)}
                              disabled={busyAction === `check-${cert.serialNumber}`}
                              title="Check on the network that this endorsement hasn't been revoked"
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                            >
                              {busyAction === `check-${cert.serialNumber}` ? 'Checking…' : 'Check validity'}
                            </button>
                            {iVouched && (
                              <button
                                onClick={() => handleTakeBack(cert)}
                                disabled={busyAction === `revoke-${cert.serialNumber}` || status?.status === 'revoked'}
                                title="Permanently invalidate this endorsement you issued — everywhere, for everyone. Cannot be undone."
                                className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              >
                                {busyAction === `revoke-${cert.serialNumber}` ? 'Revoking…' : 'Revoke'}
                              </button>
                            )}
                            {isMe && (
                              <button
                                onClick={() => handleMakePrivate(cert)}
                                disabled={busyAction === `hide-${cert.serialNumber}`}
                                title="Hide from public search — the endorsement stays valid and stays on your profile"
                                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                {busyAction === `hide-${cert.serialNumber}` ? 'Hiding…' : 'Make private'}
                              </button>
                            )}
                          </div>

                          <TechnicalDetails entries={[
                            ['Type', cert.type],
                            ['Serial number', cert.serialNumber],
                            ['Subject key', cert.subject],
                            ['Issuer key', cert.certifier],
                            ['Revocation ref', cert.revocationOutpoint]
                          ]} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Empty pre-search hint */}
      {!hasSearched && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">
            Try searching for{' '}
            <button onClick={() => searchFor('TypeScript')} className="text-blue-500 hover:underline">TypeScript</button>,{' '}
            <button onClick={() => searchFor('Design')} className="text-blue-500 hover:underline">Design</button>, or
            a friend's name.
          </p>
        </div>
      )}
    </div>
  )
}
