import { PeerCert } from 'peercert'

// New issuance only. Legacy signed identifiers must never be rewritten.
export const SKILL_CERT_SCHEMA = 'peercert.io/skill-endorsement/v1'
export const SKILL_CERT_TYPE = PeerCert.certificateTypeFromName(SKILL_CERT_SCHEMA)

export function endorsementTypeFromName(name: string): string {
  return name.trim() ? PeerCert.certificateTypeFromName(name.trim()) : SKILL_CERT_TYPE
}
