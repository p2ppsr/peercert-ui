import { useState } from 'react'
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react'
import { PeerCert } from 'peercert'
import { WalletClient, WalletInterface, Utils } from '@bsv/sdk'
import { IdentitySearchField } from '@bsv/identity-react'
import { cn } from '@/lib/utils'

interface Field {
  id: string
  key: string
  value: string
}

interface CreateCertificateProps {
  wallet?: WalletInterface
}

export default function CreateCertificate({ wallet: providedWallet }: CreateCertificateProps) {
  const [recipientKey, setRecipientKey] = useState('')
  const [certificateType, setCertificateType] = useState('')
  const [useCustomType, setUseCustomType] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<'messagebox' | 'manual'>('messagebox')
  const [fields, setFields] = useState<Field[]>([
    { id: crypto.randomUUID(), key: '', value: '' }
  ])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdCert, setCreatedCert] = useState<any | null>(null)
  const [compactCertData, setCompactCertData] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const addField = () => {
    setFields([...fields, { id: crypto.randomUUID(), key: '', value: '' }])
  }

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter(f => f.id !== id))
    }
  }

  const updateField = (id: string, key: string, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, key, value } : f))
  }

  const createCertificate = async () => {
    try {
      setIsCreating(true)
      setSuccess(false)
      setError(null)
      setCompactCertData(null)

      // Validate inputs
      if (!recipientKey.trim()) {
        setError('Please enter recipient identity key')
        return
      }

      const validFields = fields.filter(f => f.key.trim() && f.value.trim())
      if (validFields.length === 0) {
        setError('Please add at least one attribute')
        return
      }

      // Create fields object
      const certFields: Record<string, string> = {}
      validFields.forEach(f => {
        certFields[f.key.trim()] = f.value.trim()
      })

      // Use custom certificate type or generate random one
      const finalCertificateType = useCustomType && certificateType.trim()
        ? Utils.toBase64(Utils.toArray(certificateType.trim(), 'utf8'))
        : Utils.toBase64(Utils.toArray(crypto.randomUUID(), 'utf8'))

      // Issue certificate
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)
      const masterCert = await peercert.issue({
        certificateType: finalCertificateType,
        subjectIdentityKey: recipientKey.trim(),
        fields: certFields,
        autoSend: deliveryMethod === 'messagebox' // Auto-send only if messagebox selected
      })

      setCreatedCert(masterCert)
      setSuccess(true)

      // If manual delivery, encode as compact base64
      if (deliveryMethod === 'manual') {
        const compact = PeerCert.encodeCertificate(masterCert, 'base64')
        setCompactCertData(compact as string)
      } else {
        // Reset form after 3 seconds for messagebox delivery
        setTimeout(() => {
          setRecipientKey('')
          setCertificateType('')
          setFields([{ id: crypto.randomUUID(), key: '', value: '' }])
          setCreatedCert(null)
          setSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Error creating certificate:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async () => {
    if (compactCertData) {
      await navigator.clipboard.writeText(compactCertData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetForm = () => {
    setRecipientKey('')
    setCertificateType('')
    setFields([{ id: crypto.randomUUID(), key: '', value: '' }])
    setCreatedCert(null)
    setCompactCertData(null)
    setSuccess(false)
    setCopied(false)
  }


  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Certificate
      </h2>

      {/* Recipient */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipient
        </label>
        <IdentitySearchField
          onIdentitySelected={(identity) => setRecipientKey(identity.identityKey)}
          appName="PeerCert"
        />
        {recipientKey && (
          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs font-medium text-gray-700">Selected Identity Key:</p>
            <p className="text-xs font-mono text-gray-900 break-all">{recipientKey}</p>
          </div>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Search for someone by name or paste their BSV identity key
        </p>
      </div>

      {/* Delivery Method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Delivery Method
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="deliveryMethod"
              value="messagebox"
              checked={deliveryMethod === 'messagebox'}
              onChange={(e) => setDeliveryMethod(e.target.value as 'messagebox' | 'manual')}
              disabled={isCreating || success}
              className="mt-0.5 w-4 h-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary"
            />
            <div>
              <div className="font-medium text-gray-900">Auto-send via MessageBox</div>
              <div className="text-sm text-gray-500">Certificate will be sent directly to recipient's MessageBox</div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="deliveryMethod"
              value="manual"
              checked={deliveryMethod === 'manual'}
              onChange={(e) => setDeliveryMethod(e.target.value as 'messagebox' | 'manual')}
              disabled={isCreating || success}
              className="mt-0.5 w-4 h-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary"
            />
            <div>
              <div className="font-medium text-gray-900">Get compact data to copy</div>
              <div className="text-sm text-gray-500">Generate base64 certificate data for QR codes, URLs, or manual delivery</div>
            </div>
          </label>
        </div>
      </div>

      {/* Certificate Type */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="useCustomType"
            checked={useCustomType}
            onChange={(e) => setUseCustomType(e.target.checked)}
            disabled={isCreating || success}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="useCustomType" className="text-sm font-medium text-gray-700">
            Use Custom Certificate Type
          </label>
        </div>
        {useCustomType && (
          <div>
            <input
              type="text"
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
              placeholder="e.g., my-custom-cert"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isCreating || success}
            />
            <p className="mt-1 text-sm text-gray-500">
              Custom certificate type identifier (will be base64 encoded). Leave unchecked to auto-generate.
            </p>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certificate Attributes
        </label>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField(field.id, e.target.value, field.value)}
                placeholder="Attribute name (e.g., name)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isCreating || success}
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateField(field.id, field.key, e.target.value)}
                placeholder="Value (e.g., Bob)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isCreating || success}
              />
              <button
                onClick={() => removeField(field.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                disabled={fields.length <= 1 || isCreating || success}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        {!success && !isCreating && (
          <button
            onClick={addField}
            className="mt-3 flex items-center gap-2 px-4 py-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message with Certificate Details */}
      {success && createdCert && deliveryMethod === 'messagebox' && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Certificate Created & Sent!</p>
              <p className="text-sm text-green-700 mt-1">
                Your certificate has been created, signed, and automatically sent to the recipient via MessageBox.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 bg-white p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-3">Certificate Details:</h3>

            {(() => {
              return (
                <>
                  <div className="grid grid-cols-[120px,1fr] gap-2 text-sm">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="text-gray-900 font-mono text-xs break-all">{createdCert.type}</span>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] gap-2 text-sm">
                    <span className="font-medium text-gray-700">Serial Number:</span>
                    <span className="text-gray-900 font-mono text-xs break-all">{createdCert.serialNumber}</span>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] gap-2 text-sm">
                    <span className="font-medium text-gray-700">Subject:</span>
                    <span className="text-gray-900 font-mono text-xs break-all">{createdCert.subject}</span>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] gap-2 text-sm">
                    <span className="font-medium text-gray-700">Certifier:</span>
                    <span className="text-gray-900 font-mono text-xs break-all">{createdCert.certifier}</span>
                  </div>

                  <div className="grid grid-cols-[120px,1fr] gap-2 text-sm">
                    <span className="font-medium text-gray-700">Revocation:</span>
                    <span className="text-gray-900 font-mono text-xs break-all">{createdCert.revocationOutpoint}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700 text-sm">Fields:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(createdCert.fields).map(([key, value]) => (
                        <div key={key} className="flex gap-2 text-sm pl-2">
                          <span className="font-medium text-gray-600 min-w-[100px]">{key}:</span>
                          <span className="text-gray-900">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700 text-sm">Signature:</span>
                    <div className="mt-1 text-xs font-mono text-gray-600 break-all">
                      {createdCert.signature}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Compact Certificate Data Display */}
      {success && compactCertData && deliveryMethod === 'manual' && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Certificate Created!</p>
              <p className="text-sm text-blue-700 mt-1">
                Your certificate has been encoded to compact base64 format (~50-70% smaller than JSON). Copy this data for QR codes, URLs, or manual delivery.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Compact Certificate Data:</label>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={compactCertData}
                className="w-full h-32 px-3 py-2 font-mono text-xs bg-gray-50 border border-gray-300 rounded resize-none focus:outline-none"
              />
              <p className="mt-2 text-xs text-gray-600">
                Size: {compactCertData.length} characters • Use in QR codes, URLs (peercert:{compactCertData.slice(0, 20)}...), or save to file
              </p>
            </div>

            <button
              onClick={resetForm}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Create Another Certificate
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={createCertificate}
          disabled={isCreating || success}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium transition-all",
            "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {deliveryMethod === 'messagebox' ? 'Creating & Sending...' : 'Creating...'}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              {deliveryMethod === 'messagebox' ? 'Sent Successfully!' : 'Created!'}
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {deliveryMethod === 'messagebox' ? 'Create & Send Certificate' : 'Create Certificate'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
