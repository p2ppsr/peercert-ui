import { useState, useEffect } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { PeerCert } from 'peercert'
import { WalletClient, WalletInterface } from '@bsv/sdk'
import { cn } from '@/lib/utils'

interface VerifiableCertificatesProps {
  wallet?: WalletInterface
}

export default function VerifiableCertificates({ wallet: providedWallet }: VerifiableCertificatesProps) {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState<any | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [verifierKey, setVerifierKey] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loadCertificates = async () => {
    try {
      setIsLoading(true)
      const wallet = providedWallet || new WalletClient()

      // Get all certificates (keyring should be available in received certificates)
      const result = await wallet.listCertificates({
        certifiers: [],
        types: []
      })

      setCertificates(result.certificates)
    } catch (err) {
      console.error('Error loading certificates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates()
  }, [])

  const toggleFieldSelection = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const handleCreateAndSend = async () => {
    if (!selectedCert || selectedFields.length === 0) {
      setError('Please select at least one field to reveal')
      return
    }

    if (!verifierKey.trim()) {
      setError('Please enter verifier identity key')
      return
    }

    try {
      setIsCreating(true)
      setError(null)

      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      // Create verifiable certificate with selective field revelation
      const verifiableCert = await peercert.createVerifiableCertificate({
        certificate: selectedCert,
        verifierPublicKey: verifierKey.trim(),
        fieldsToReveal: selectedFields
      })

      // Send to verifier with issuance: false (this is for inspection, not storage)
      await peercert.send({
        recipient: verifierKey.trim(),
        serializedCertificate: JSON.stringify(verifiableCert),
        issuance: false // Important: This is for inspection only!
      })

      setSuccess(true)
      setTimeout(() => {
        setSelectedCert(null)
        setSelectedFields([])
        setVerifierKey('')
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error('Error creating verifiable certificate:', err)
      setError(err instanceof Error ? err.message : 'Failed to create verifiable certificate')
    } finally {
      setIsCreating(false)
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

  if (certificates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No certificates available</p>
          <p className="text-gray-500 text-sm mt-1">
            You need to receive certificates first before you can create verifiable certificates
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Verifiable Certificate
        </h2>
        <p className="text-gray-600 text-sm">
          Share selected certificate fields with a specific verifier. Only the fields you choose will be revealed.
        </p>
      </div>

      {!selectedCert ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Select a Certificate:</h3>
          {certificates.map((cert, index) => (
            <div
              key={`${cert.serialNumber}-${index}`}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    Certificate from {cert.certifier.substring(0, 20)}...
                  </p>
                  <p className="text-sm text-gray-600 font-mono mt-1">
                    Serial: {cert.serialNumber.substring(0, 20)}...
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-3 bg-gray-50 rounded p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Fields:</p>
                <div className="space-y-1">
                  {Object.keys(cert.fields).map(field => (
                    <p key={field} className="text-sm text-gray-600">
                      • {field}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verifier Identity Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verifier Identity Key
            </label>
            <input
              type="text"
              value={verifierKey}
              onChange={(e) => setVerifierKey(e.target.value)}
              placeholder="03abc123..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isCreating || success}
            />
            <p className="mt-1 text-sm text-gray-500">
              The public key of the person who will verify this certificate
            </p>
          </div>

          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Fields to Reveal (Other fields will remain encrypted)
            </label>
            <div className="space-y-2">
              {Object.entries(selectedCert.fields).map(([field, value]) => (
                <label
                  key={field}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleFieldSelection(field)}
                    disabled={isCreating || success}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{field}</p>
                    <p className="text-sm text-gray-600 mt-1">{value as string}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Success!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Verifiable certificate created and sent to verifier. They can now inspect the selected fields.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedCert(null)
                setSelectedFields([])
                setError(null)
              }}
              disabled={isCreating || success}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleCreateAndSend}
              disabled={isCreating || success || selectedFields.length === 0}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium transition-all",
                "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating & Sending...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Sent Successfully!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Create & Send to Verifier ({selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
