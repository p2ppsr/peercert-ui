import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, Inbox, Eye, ShieldCheck, ShieldAlert, Download } from 'lucide-react'
import { PeerCert } from 'peercert'
import type { IncomingCertificate } from 'peercert'
import { WalletClient, WalletInterface } from '@bsv/sdk'
import { cn } from '@/lib/utils'

interface ReceiveCertificatesProps {
  wallet?: WalletInterface
}

export default function ReceiveCertificates({ wallet: providedWallet }: ReceiveCertificatesProps) {
  const [certificates, setCertificates] = useState<IncomingCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({})
  const [manualInput, setManualInput] = useState('')
  const [manualProcessing, setManualProcessing] = useState(false)
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  const loadCertificates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      const incoming = await peercert.listIncomingCertificates()
      setCertificates(incoming)
    } catch (err) {
      console.error('Error loading certificates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load certificates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates()
  }, [])

  const handleVerify = async (cert: IncomingCertificate) => {
    try {
      setVerifying(cert.messageId)

      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      // Verify with automatic revocation checking
      const result = await peercert.verifyVerifiableCertificate(
        cert.serializedCertificate,
        { checkRevocation: true }
      )

      setVerificationResults(prev => ({
        ...prev,
        [cert.messageId]: result
      }))
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setVerificationResults(prev => ({
        ...prev,
        [cert.messageId]: { verified: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }))
    } finally {
      setVerifying(null)
    }
  }

  const handleAccept = async (cert: IncomingCertificate) => {
    try {
      setProcessing(cert.messageId)

      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      // Receive, verify, and store the certificate
      const result = await peercert.receive(cert.serializedCertificate)

      if (!result.success) {
        throw new Error(result.error || 'Failed to receive certificate')
      }

      // Acknowledge the message
      await peercert.acknowledgeCertificate(cert.messageId)

      // Remove from list
      setCertificates(prev => prev.filter(c => c.messageId !== cert.messageId))

      alert(`Certificate accepted and stored in your wallet!`)
    } catch (error) {
      console.error('Error accepting certificate:', error)
      alert(`Failed to accept certificate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (cert: IncomingCertificate) => {
    try {
      setProcessing(cert.messageId)
      const peercert = new PeerCert(providedWallet || new WalletClient())
      await peercert.acknowledgeCertificate(cert.messageId)
      setCertificates(prev => prev.filter(c => c.messageId !== cert.messageId))
    } catch (error) {
      console.error('Error rejecting certificate:', error)
      alert(`Failed to reject certificate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleManualReceive = async () => {
    if (!manualInput.trim()) {
      setManualError('Please paste certificate data')
      return
    }

    try {
      setManualProcessing(true)
      setManualError(null)
      setManualSuccess(false)

      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      // Try to detect if it's compact base64 format or JSON
      let certData: string
      const input = manualInput.trim()

      // If it starts with '{' it's likely JSON
      if (input.startsWith('{')) {
        certData = input
      } else {
        // Assume it's compact base64 format
        try {
          const decoded = PeerCert.decodeCertificate(input)
          certData = JSON.stringify(decoded)
        } catch (decodeError) {
          throw new Error('Invalid certificate format. Please paste either compact base64 or JSON certificate data.')
        }
      }

      // Receive and store the certificate
      const result = await peercert.receive(certData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to receive certificate')
      }

      setManualSuccess(true)
      setManualInput('')

      // Reset success message after 3 seconds
      setTimeout(() => setManualSuccess(false), 3000)
    } catch (error) {
      console.error('Error receiving manual certificate:', error)
      setManualError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setManualProcessing(false)
    }
  }


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error Loading Certificates</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadCertificates}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Receive Certificates
        </h2>
        <button
          onClick={loadCertificates}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Manual Certificate Input */}
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Paste Certificate Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Paste compact base64 certificate data (from QR codes, URLs, or files) or JSON certificate data
        </p>
        <textarea
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Paste certificate data here..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          disabled={manualProcessing || manualSuccess}
        />

        {manualError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{manualError}</p>
            </div>
          </div>
        )}

        {manualSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Certificate received and stored in your wallet!</p>
            </div>
          </div>
        )}

        <button
          onClick={handleManualReceive}
          disabled={manualProcessing || manualSuccess || !manualInput.trim()}
          className={cn(
            "mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all",
            "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {manualProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : manualSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Received!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Receive Certificate
            </>
          )}
        </button>
      </div>

      {/* MessageBox Certificates Section */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">From MessageBox</h3>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No pending certificates</p>
          <p className="text-gray-500 text-sm mt-1">
            When someone sends you a certificate, it will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => {
            // Parse the serialized certificate (it's a JSON string)
            const parsedCert = typeof cert.serializedCertificate === 'string'
              ? JSON.parse(cert.serializedCertificate)
              : cert.serializedCertificate
            const verificationResult = verificationResults[cert.messageId]

            return (
              <div
                key={cert.messageId}
                className="border border-gray-200 rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {cert.issuance ? 'Certificate Issued to You' : 'Certificate for Inspection'}
                      </h3>
                      {cert.issuance && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">For Storage</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-mono">
                      From: {cert.sender.substring(0, 20)}...
                    </p>
                  </div>
                </div>

                {/* Verification Status */}
                {verificationResult && (
                  <div className={cn(
                    "mb-4 p-4 rounded-lg border",
                    verificationResult.verified && !verificationResult.revocationStatus?.isRevoked
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}>
                    <div className="flex items-start gap-3">
                      {verificationResult.verified && !verificationResult.revocationStatus?.isRevoked ? (
                        <>
                          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-green-900">Certificate Verified ✓</p>
                            <p className="text-sm text-green-700 mt-1">Signature is valid and certificate is not revoked</p>
                            {verificationResult.fields && (
                              <div className="mt-3 bg-white p-3 rounded border border-green-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">Revealed Fields:</p>
                                {Object.entries(verificationResult.fields).map(([key, value]) => (
                                  <div key={key} className="flex gap-2 text-sm">
                                    <span className="font-medium text-gray-600">{key}:</span>
                                    <span className="text-gray-900">{value as string}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-900">
                              {verificationResult.revocationStatus?.isRevoked ? 'Certificate Revoked!' : 'Verification Failed'}
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                              {verificationResult.revocationStatus?.message || verificationResult.error || 'Certificate could not be verified'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-4">

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Serial Number:</p>
                    <p className="text-xs text-gray-600 font-mono break-all">
                      {parsedCert?.serialNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Revocation Outpoint:</p>
                    <p className="text-xs text-gray-600 font-mono break-all">
                      {parsedCert?.revocationOutpoint || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (DID token - spending it revokes this certificate)
                    </p>
                  </div>

                  {parsedCert?.fields && Object.keys(parsedCert.fields).length > 0 && !verificationResult && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-3">Encrypted Fields (verify to decrypt):</p>
                      <div className="space-y-2">
                        {Object.entries(parsedCert.fields).map(([key, value]) => (
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

                <div className="flex flex-col gap-3">
                  {/* Verify Button (for inspection certificates) */}
                  {!cert.issuance && !verificationResult && (
                    <button
                      onClick={() => handleVerify(cert)}
                      disabled={verifying === cert.messageId}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all",
                        "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {verifying === cert.messageId ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying with Revocation Check...
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5" />
                          Verify Certificate (Check Revocation)
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex gap-3">
                    {cert.issuance && (
                      <button
                        onClick={() => handleAccept(cert)}
                        disabled={processing === cert.messageId}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium transition-all",
                          "hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {processing === cert.messageId ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Accept & Store
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(cert)}
                      disabled={processing === cert.messageId}
                      className={cn(
                        cert.issuance ? "flex-1" : "w-full",
                        "flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium transition-all",
                        "hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {processing === cert.messageId ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          {cert.issuance ? 'Reject' : 'Dismiss'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
