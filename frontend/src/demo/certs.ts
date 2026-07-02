import { Utils, MasterCertificate, WalletInterface, WalletCertificate } from '@bsv/sdk'

// Well-known certificate type for skill endorsements issued by this app.
// Must serialize to exactly 32 bytes so every PeerCert user can find each
// other's endorsements under the same type.
export const SKILL_CERT_TYPE = Utils.toBase64(
  Utils.toArray('peercert-skill-endorsement-v001', 'utf8')
)

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

export const LEVEL_STYLES: Record<string, string> = {
  Beginner: 'bg-sky-50 text-sky-700 border-sky-200',
  Intermediate: 'bg-teal-50 text-teal-700 border-teal-200',
  Advanced: 'bg-violet-50 text-violet-700 border-violet-200',
  Expert: 'bg-amber-50 text-amber-800 border-amber-200'
}

export function levelStyle(level?: string): string {
  return (level && LEVEL_STYLES[level]) || 'bg-gray-50 text-gray-700 border-gray-200'
}

/** Fields every skill endorsement carries. Extra fields are allowed. */
export interface SkillFields {
  skill: string
  level?: string
  note?: string
  [key: string]: string | undefined
}

/** True when a certificate's fields look like a skill endorsement. */
export function isSkillCert(fields: Record<string, unknown> | undefined): boolean {
  return !!fields && typeof fields.skill === 'string' && fields.skill.length > 0
}

/** Split fields into the skill trio and any remaining custom attributes. */
export function splitSkillFields(fields: Record<string, string>) {
  const { skill, level, note, ...rest } = fields
  return { skill, level, note, rest }
}

export function truncateKey(key: string, chars = 8): string {
  if (!key) return ''
  if (key.length <= chars * 2 + 1) return key
  return `${key.slice(0, chars)}…${key.slice(-4)}`
}

const AVATAR_PALETTE = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-fuchsia-600'
]

/** Deterministic avatar color from an identity key. */
export function avatarColor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

/** Try to render a base64 certificate type as a human-readable label. */
export function decodeCertTypeLabel(type: string): string | null {
  try {
    const bytes = Utils.toArray(type, 'base64')
    const text = Utils.toUTF8(bytes)
    if (/^[\x20-\x7E]+$/.test(text)) return text
    return null
  } catch {
    return null
  }
}

/** "coding-skills" / "metanet-agent-operator-v1" → "Coding Skills" / "Metanet Agent Operator V1" */
export function humanizeLabel(label: string): string {
  return label
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Human title for a certificate card, derived from its (base64) type. */
export function certTitle(type: string): string {
  const label = decodeCertTypeLabel(type)
  // Random identifiers (UUIDs, hashes) make meaningless titles
  if (!label || /^[0-9a-f-]{20,}$/i.test(label)) return 'Endorsement'
  return humanizeLabel(label)
}

/**
 * Certificates come back from the wallet with encrypted field values plus a
 * keyring only the subject can use. Decrypt them for display; null when the
 * keyring is missing or decryption fails (fields stay sealed).
 */
export async function decryptCertFields(
  wallet: WalletInterface,
  cert: WalletCertificate & { keyring?: Record<string, string> }
): Promise<Record<string, string> | null> {
  if (!cert.keyring || Object.keys(cert.keyring).length === 0) return null
  try {
    return await MasterCertificate.decryptFields(
      wallet,
      cert.keyring,
      cert.fields,
      cert.certifier
    )
  } catch (err) {
    console.warn('Could not decrypt certificate fields:', cert.serialNumber, err)
    return null
  }
}

/** True when a decrypted value is a proficiency level (any casing). */
export function isLevelValue(value: string): boolean {
  return SKILL_LEVELS.some(l => l.toLowerCase() === value.trim().toLowerCase())
}

/** Canonical casing for a level value: "intermediate" → "Intermediate". */
export function normalizeLevel(value: string): string {
  const match = SKILL_LEVELS.find(l => l.toLowerCase() === value.trim().toLowerCase())
  return match || value
}

export function isImageUrl(value: string): boolean {
  return /^https?:\/\/\S+\.(jpe?g|png|gif|webp|svg)(\?\S*)?$/i.test(value.trim()) ||
    (/^https?:\/\/\S+$/i.test(value.trim()) && /(photo|image|avatar|icon)/i.test(value))
}

export function isUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim())
}
