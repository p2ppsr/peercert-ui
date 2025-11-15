import { useState, useEffect } from 'react'
import { Globe, Loader2, RefreshCw, Award, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react'
import { PeerCert } from 'peercert'
import { WalletClient, WalletInterface } from '@bsv/sdk'
import { cn } from '@/lib/utils'

interface StoredCertificate {
  type: string
  subject: string
  serialNumber: string
  certifier: string
  revocationOutpoint: string
  signature: string
  fields: Record<string, string>
}

interface MyCertificatesProps {
  wallet?: WalletInterface
}

export default function MyCertificates({ wallet: providedWallet }: MyCertificatesProps) {
  const [certificates, setCertificates] = useState<StoredCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revealing, setRevealing] = useState<StoredCertificate | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [processing, setProcessing] = useState<string | null>(null)
  const [revocationStatuses, setRevocationStatuses] = useState<Record<string, any>>({})
  const [revoking, setRevoking] = useState<string | null>(null)
  const [relinquishing, setRelinquishing] = useState<string | null>(null)

  const loadCertificates = async () => {
    try {
      setIsLoading(true)
      const wallet = providedWallet || new WalletClient()

      // Get all certificates from wallet
      const result = await wallet.listCertificates({
        certifiers: [], // Empty array means all certifiers
        types: [] // Empty array means all types
      })

      setCertificates(result.certificates as StoredCertificate[])
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates()
  }, [])

  const handleCheckRevocation = async (cert: StoredCertificate) => {
    try {
      setProcessing(cert.serialNumber)
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      const status = await peercert.checkRevocation(cert)
      setRevocationStatuses(prev => ({
        ...prev,
        [cert.serialNumber]: status
      }))
    } catch (error) {
      console.error('Error checking revocation:', error)
      alert(`Failed to check revocation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleRevoke = async (cert: StoredCertificate) => {
    if (!confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      return
    }

    try {
      setRevoking(cert.serialNumber)
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      const result = await peercert.revoke(cert)

      if (result.success) {
        alert(`Certificate revoked!\n\nTransaction ID: ${result.txid}\n\nThe certificate can no longer be verified as valid.`)
        // Refresh the revocation status
        await handleCheckRevocation(cert)
      } else {
        throw new Error(result.error || 'Failed to revoke certificate')
      }
    } catch (error) {
      console.error('Error revoking certificate:', error)
      alert(`Failed to revoke certificate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRevoking(null)
    }
  }

  const handleRelinquish = async (cert: StoredCertificate) => {
    if (!confirm('Remove this certificate from My Certificates?\n\nThis does not revoke the certificate on-chain; it only removes it from your local wallet storage.')) {
      return
    }

    try {
      setRelinquishing(cert.serialNumber)
      const wallet = providedWallet || new WalletClient()

      await wallet.relinquishCertificate({
        type: cert.type,
        serialNumber: cert.serialNumber,
        certifier: cert.certifier
      })

      setCertificates(prev =>
        prev.filter(c => !(c.serialNumber === cert.serialNumber && c.certifier === cert.certifier))
      )
    } catch (error) {
      console.error('Error relinquishing certificate:', error)
      alert(`Failed to remove certificate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRelinquishing(null)
    }
  }

  const handlePublicReveal = async () => {
    if (!revealing || selectedFields.length === 0) {
      alert('Please select at least one field to reveal')
      return
    }

    try {
      setProcessing(revealing.serialNumber)
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      const result = await peercert.reveal({
        certificate: revealing,
        fieldsToReveal: selectedFields
      })

      if (result.status === 'success') {
        alert(`Certificate publicly revealed!\n\nTransaction ID: ${result.txid}\n\nAnyone can now verify the selected fields on the BSV overlay network.`)
      } else {
        throw new Error(result.description || 'Failed to publicly reveal certificate')
      }

      setRevealing(null)
      setSelectedFields([])
    } catch (error) {
      console.error('Error publicly revealing certificate:', error)
      alert(`Failed to publicly reveal certificate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(null)
    }
  }

  const toggleFieldSelection = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6" />
          My Certificates
        </h2>
        <button
          onClick={loadCertificates}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No certificates yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Accept certificates from peers to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert, index) => (
            <div
              key={`${cert.serialNumber}-${index}`}
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Certificate from {cert.certifier.substring(0, 20)}...
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    Type: {cert.type}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Serial Number:</p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {cert.serialNumber}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Revocation Outpoint:</p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {cert.revocationOutpoint}
                  </p>
                </div>

                {cert.fields && Object.keys(cert.fields).length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-3">Certified Fields:</p>
                    <div className="space-y-2">
                      {Object.entries(cert.fields).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start gap-4">
                          <span className="text-sm font-medium text-blue-800 capitalize">{key}:</span>
                          <span className="text-sm text-blue-700 font-mono text-right break-all">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Revocation Status */}
              {revocationStatuses[cert.serialNumber] && (
                <div className={cn(
                  "mb-4 p-4 rounded-lg border",
                  revocationStatuses[cert.serialNumber].isRevoked
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                )}>
                  <div className="flex items-start gap-3">
                    {revocationStatuses[cert.serialNumber].isRevoked ? (
                      <>
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-900">Certificate Revoked</p>
                          <p className="text-sm text-red-700 mt-1">
                            {revocationStatuses[cert.serialNumber].message}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-900">Certificate Valid</p>
                          <p className="text-sm text-green-700 mt-1">
                            {revocationStatuses[cert.serialNumber].message}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {/* Check Revocation & Revoke Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCheckRevocation(cert)}
                    disabled={processing === cert.serialNumber}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all",
                      "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {processing === cert.serialNumber ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Check Revocation
                      </>
                    )}
                  </button>
                  {cert.certifier === cert.subject && (
                    <button
                      onClick={() => handleRevoke(cert)}
                      disabled={revoking === cert.serialNumber || revocationStatuses[cert.serialNumber]?.isRevoked}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium transition-all",
                        "hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {revoking === cert.serialNumber ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Revoking...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5" />
                          Revoke Certificate
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setRevealing(cert)
                      setSelectedFields([])
                    }}
                    disabled={!!processing}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all",
                      "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <Globe className="w-5 h-5" />
                    Publicly Reveal Fields
                  </button>
                  <button
                    onClick={() => handleRelinquish(cert)}
                    disabled={relinquishing === cert.serialNumber || isLoading}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium transition-all",
                      "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {relinquishing === cert.serialNumber ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Remove from My Certificates
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Reveal Modal */}
      {revealing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Publicly Reveal Certificate Fields
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Select which fields to publicly reveal on the BSV overlay network. Anyone will be able to verify these fields.
            </p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {Object.keys(revealing.fields).map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleFieldSelection(field)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 capitalize">{field}:</span>
                    <span className="text-sm text-gray-600 ml-2">{revealing.fields[field]}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRevealing(null)
                  setSelectedFields([])
                }}
                disabled={processing === revealing?.serialNumber}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublicReveal}
                disabled={selectedFields.length === 0 || processing === revealing?.serialNumber}
                className={cn(
                  "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all",
                  "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Revealing...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Reveal {selectedFields.length} Field{selectedFields.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
