import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, Plus, Trash2, Send, Link2 } from 'lucide-react'
import { PeerCert } from 'peercert'
import { WalletInterface, Utils } from '@bsv/sdk'
import { IdentitySearchField } from '@bsv/identity-react'
import { cn } from '@/lib/utils'
import { SKILL_CERT_TYPE, SKILL_LEVELS, levelStyle, truncateKey } from './certs'
import { ErrorBanner, PrimaryButton, KeyAvatar, ProgressBar } from './ui'

interface VouchProps {
  wallet: WalletInterface
}

interface ExtraField {
  id: string
  key: string
  value: string
}

interface SelectedPerson {
  identityKey: string
  name?: string
  avatarURL?: string
}

export default function Vouch({ wallet }: VouchProps) {
  const [person, setPerson] = useState<SelectedPerson | null>(null)
  const [skill, setSkill] = useState('')
  const [level, setLevel] = useState<string>('')
  const [note, setNote] = useState('')
  const [sendDirectly, setSendDirectly] = useState(true)

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [extraFields, setExtraFields] = useState<ExtraField[]>([])
  const [customType, setCustomType] = useState('')

  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setPerson(null)
    setSkill('')
    setLevel('')
    setNote('')
    setExtraFields([])
    setCustomType('')
    setSent(false)
    setShareCode(null)
    setCopied(false)
    setError(null)
  }

  const handleVouch = async () => {
    setError(null)
    if (!person) {
      setError('Choose who you want to vouch for first.')
      return
    }
    if (!skill.trim()) {
      setError('What skill are you vouching for? Enter a skill name.')
      return
    }

    const fields: Record<string, string> = { skill: skill.trim() }
    if (level) fields.level = level
    if (note.trim()) fields.note = note.trim()
    for (const f of extraFields) {
      if (f.key.trim() && f.value.trim()) fields[f.key.trim()] = f.value.trim()
    }

    const certificateType = customType.trim()
      ? Utils.toBase64(Utils.toArray(customType.trim(), 'utf8'))
      : SKILL_CERT_TYPE

    try {
      setIsSending(true)
      const peercert = new PeerCert(wallet)
      const masterCert = await peercert.issue({
        certificateType,
        subjectIdentityKey: person.identityKey,
        fields,
        autoSend: sendDirectly
      })

      if (!sendDirectly) {
        const compact = PeerCert.encodeCertificate(masterCert, 'base64')
        setShareCode(compact as string)
      }
      setSent(true)
    } catch (err) {
      console.error('Error issuing endorsement:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const copyCode = async () => {
    if (!shareCode) return
    await navigator.clipboard.writeText(shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Success state
  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            You vouched for {person?.name || 'them'}!
          </h2>

          {shareCode ? (
            <div className="mt-4 text-left">
              <p className="text-sm text-gray-500 text-center mb-4">
                Since you chose a shareable code, send them this code any way you like —
                message, email, or a QR code. When they paste it into their inbox, the
                endorsement lands on their profile.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Endorsement code
                  </span>
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy code'}
                  </button>
                </div>
                <p className="font-mono text-[11px] text-gray-600 break-all max-h-28 overflow-y-auto">
                  {shareCode}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Your signed endorsement of <span className="font-medium text-gray-700">{skill}</span> is
              on its way. It will show up in their inbox, and they choose whether to add it to
              their profile.
            </p>
          )}

          <div className="mt-6">
            <PrimaryButton onClick={reset}>Vouch for someone else</PrimaryButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Vouch for someone</h2>
        <p className="text-gray-500 mt-1">
          Seen someone do great work? Put your name behind their skill.
          Your endorsement is personally signed by you — it can't be faked.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
        {/* Who */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Who are you vouching for?</label>
          {person ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <KeyAvatar identityKey={person.identityKey} imageUrl={person.avatarURL} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{person.name || 'Selected person'}</p>
                <p className="text-xs text-gray-500 font-mono">{truncateKey(person.identityKey, 12)}</p>
              </div>
              <button
                onClick={() => setPerson(null)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <IdentitySearchField
                onIdentitySelected={(identity: any) =>
                  setPerson({
                    identityKey: identity.identityKey,
                    name: identity.name,
                    avatarURL: identity.avatarURL
                  })
                }
                appName="PeerCert"
              />
              <p className="mt-1.5 text-xs text-gray-400">Search by name, or paste their ID.</p>
            </>
          )}
        </div>

        {/* Skill */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">What skill?</label>
          <input
            type="text"
            value={skill}
            onChange={e => setSkill(e.target.value)}
            placeholder="e.g. TypeScript, Public speaking, Carpentry…"
            disabled={isSending}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SKILL_LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(level === l ? '' : l)}
                disabled={isSending}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm border transition-all',
                  level === l
                    ? cn(levelStyle(l), 'ring-2 ring-offset-1 ring-blue-400 font-medium')
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">How good are they? (optional)</p>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Add a note <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder='e.g. "Worked with them for 2 years — best engineer on the team."'
            disabled={isSending}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Delivery */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">How should they get it?</label>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => setSendDirectly(true)}
              disabled={isSending}
              className={cn(
                'flex items-start gap-3 p-4 border rounded-xl text-left transition-all',
                sendDirectly ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Send className={cn('w-5 h-5 mt-0.5 shrink-0', sendDirectly ? 'text-blue-600' : 'text-gray-400')} />
              <div>
                <p className="font-medium text-gray-900 text-sm">Send it to them</p>
                <p className="text-xs text-gray-500 mt-0.5">Lands in their PeerCert inbox automatically</p>
              </div>
            </button>
            <button
              onClick={() => setSendDirectly(false)}
              disabled={isSending}
              className={cn(
                'flex items-start gap-3 p-4 border rounded-xl text-left transition-all',
                !sendDirectly ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Link2 className={cn('w-5 h-5 mt-0.5 shrink-0', !sendDirectly ? 'text-blue-600' : 'text-gray-400')} />
              <div>
                <p className="font-medium text-gray-900 text-sm">Get a shareable code</p>
                <p className="text-xs text-gray-500 mt-0.5">Copy a code to send however you like</p>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Advanced options
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Extra attributes</label>
                <div className="space-y-2">
                  {extraFields.map(f => (
                    <div key={f.id} className="flex gap-2">
                      <input
                        type="text"
                        value={f.key}
                        onChange={e => setExtraFields(prev => prev.map(x => x.id === f.id ? { ...x, key: e.target.value } : x))}
                        placeholder="Name"
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        value={f.value}
                        onChange={e => setExtraFields(prev => prev.map(x => x.id === f.id ? { ...x, value: e.target.value } : x))}
                        placeholder="Value"
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        onClick={() => setExtraFields(prev => prev.filter(x => x.id !== f.id))}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setExtraFields(prev => [...prev, { id: crypto.randomUUID(), key: '', value: '' }])}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add attribute
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Custom certificate type</label>
                <input
                  type="text"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  placeholder="Leave empty for the standard skill endorsement type"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {error && <ErrorBanner message={error} />}

        {isSending && (
          <ProgressBar label="Signing, anchoring on the network, and delivering — your wallet may ask for approval. This can take a few seconds…" />
        )}

        <PrimaryButton
          onClick={handleVouch}
          loading={isSending}
          disabled={!person || !skill.trim()}
          className="w-full py-3"
        >
          {isSending
            ? (sendDirectly ? 'Signing & sending…' : 'Signing…')
            : (sendDirectly ? 'Sign & send endorsement' : 'Sign & create code')}
        </PrimaryButton>
        <p className="text-center text-xs text-gray-400 -mt-3">
          They'll review your endorsement and choose whether to add it to their profile.
        </p>
      </div>
    </div>
  )
}
