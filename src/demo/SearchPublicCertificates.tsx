import { useState, useEffect } from 'react'
import { Search, Loader2, Award, Eye, EyeOff, RefreshCw, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react'
import { PeerCert } from 'peercert'
import { WalletClient, WalletInterface, IdentityClient } from '@bsv/sdk'
import { cn } from '@/lib/utils'

interface PublicCertificate {
  type: string
  subject: string
  serialNumber: string
  certifier: string
  certifierInfo: {
    name: string
    iconURL: string
    description: string
    trust: number
  }
  decryptedFields: Record<string, string>
  revocationOutpoint: string
}

interface SearchFilters {
  certificateType?: string
  certifier?: string
  [key: string]: string | undefined
}

interface SearchField {
  id: string
  key: string
  value: string
}

interface SearchPublicCertificatesProps {
  wallet?: WalletInterface
}

export default function SearchPublicCertificates({ wallet: providedWallet }: SearchPublicCertificatesProps) {
  const [searchFields, setSearchFields] = useState<SearchField[]>([
    { id: 'initial', key: '', value: '' }
  ])
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<PublicCertificate[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [myIdentityKey, setMyIdentityKey] = useState<string | null>(null)
  const [revocationStatuses, setRevocationStatuses] = useState<Record<string, any>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [unrevealing, setUnrevealing] = useState<string | null>(null)

  useEffect(() => {
    // Get user's identity key
    const loadIdentityKey = async () => {
      try {
        const wallet = providedWallet || new WalletClient()
        const { publicKey } = await wallet.getPublicKey({ identityKey: true })
        setMyIdentityKey(publicKey)
      } catch (err) {
        console.error('Error loading identity key:', err)
      }
    }
    loadIdentityKey()
  }, [])

  const handleSearch = async () => {
    // Convert searchFields to attributes object
    const attributes: Record<string, string> = {}
    for (const field of searchFields) {
      if (field.key.trim() && field.value.trim()) {
        attributes[field.key.trim()] = field.value.trim()
      }
    }

    if (Object.keys(attributes).length === 0) {
      setError('Please enter at least one search attribute')
      return
    }

    try {
      setIsSearching(true)
      setError(null)
      setHasSearched(true)

      const wallet = providedWallet || new WalletClient()

      // Build search parameters
      const searchParams: any = {
        attributes
      }

      // Add optional filters if provided
      if (searchFilters.certificateType) {
        searchParams.certificateType = searchFilters.certificateType
      }
      if (searchFilters.certifier) {
        searchParams.certifier = searchFilters.certifier
      }

      console.log('🔍 Searching for certificates with:', searchParams)

      // Search for publicly revealed certificates
      const discoveredResult = await wallet.discoverByAttributes(searchParams)

      console.log('📋 Found identities:', discoveredResult)

      // Transform results to our interface - discoverByAttributes returns IdentityCertificate[]
      const certificates: PublicCertificate[] = (discoveredResult.certificates || []).map((cert: any) => ({
        type: cert.type || 'Unknown Type',
        subject: cert.subject || 'Unknown Subject',
        serialNumber: cert.serialNumber || 'Unknown Serial',
        certifier: cert.certifier || 'Unknown Certifier',
        certifierInfo: {
          name: cert.certifierInfo?.name || 'Unknown Certifier',
          iconURL: cert.certifierInfo?.iconURL || '',
          description: cert.certifierInfo?.description || 'No description available',
          trust: cert.certifierInfo?.trust || 0
        },
        decryptedFields: cert.decryptedFields || {},
        revocationOutpoint: cert.revocationOutpoint || 'Unknown'
      }))

      setResults(certificates)

      if (certificates.length === 0) {
        setError('No publicly revealed certificates found matching your search criteria. The certificate may not be published yet or may have different attributes.')
      }

    } catch (searchError) {
      console.error('Error searching for certificates:', searchError)
      setError(`Search failed: ${searchError instanceof Error ? searchError.message : 'Unknown error'}`)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const addSearchField = () => {
    const newField: SearchField = {
      id: `field_${Date.now()}`,
      key: '',
      value: ''
    }
    setSearchFields(prev => [...prev, newField])
  }

  const updateSearchField = (id: string, key: string, value: string) => {
    setSearchFields(prev => prev.map(field =>
      field.id === id ? { ...field, key, value } : field
    ))
  }

  const removeSearchField = (id: string) => {
    setSearchFields(prev => prev.filter(field => field.id !== id))
  }

  const updateFilter = (key: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value.trim() || undefined
    }))
  }

  const handleCheckRevocation = async (cert: PublicCertificate) => {
    try {
      setProcessing(cert.serialNumber)
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      const status = await peercert.checkRevocation({
        revocationOutpoint: cert.revocationOutpoint,
        serialNumber: cert.serialNumber,
        type: cert.type,
        subject: cert.subject,
        certifier: cert.certifier,
        signature: '',
        fields: cert.decryptedFields
      } as any)

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

  const handleRevoke = async (cert: PublicCertificate) => {
    if (!confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      return
    }

    try {
      setRevoking(cert.serialNumber)
      const wallet = providedWallet || new WalletClient()
      const peercert = new PeerCert(wallet)

      const result = await peercert.revoke({
        revocationOutpoint: cert.revocationOutpoint,
        serialNumber: cert.serialNumber,
        type: cert.type,
        subject: cert.subject,
        certifier: cert.certifier,
        signature: '',
        fields: cert.decryptedFields
      } as any)

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

  const handleUnrevealFromPublicLookup = async (cert: PublicCertificate) => {
    if (!confirm('Are you sure you want to remove this certificate from public lookup?\n\nThis will not revoke the certificate itself, but it will no longer be publicly discoverable.')) {
      return
    }

    try {
      setUnrevealing(cert.serialNumber)
      const wallet = providedWallet || new WalletClient()
      const identityClient = new IdentityClient(wallet)

      console.log('🔒 Unrevealing certificate from public lookup:', cert.serialNumber)

      // Revoke the certificate revelation (removes from public lookup)
      const result = await identityClient.revokeCertificateRevelation(cert.serialNumber)

      if ('status' in result && result.status === 'success') {
        alert(`Certificate removed from public lookup!\n\nTransaction ID: ${result.txid}\n\nThe certificate is no longer publicly discoverable, but remains valid for private use.`)
        // Remove from results since it's no longer public
        setResults(prev => prev.filter(c => c.serialNumber !== cert.serialNumber))
      } else {
        const description = 'description' in result ? result.description : 'Unknown error'
        throw new Error(description)
      }
    } catch (error) {
      console.error('Error unrevealing certificate:', error)
      alert(`Failed to remove from public lookup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUnrevealing(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Search Public Certificates
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      <div className="space-y-6">
        {/* Search Attributes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Search by Certificate Fields
          </label>
          <div className="space-y-3">
            {searchFields.map((field) => (
              <div key={field.id} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Field name (e.g., name, skill, level)"
                  value={field.key}
                  onChange={(e) => updateSearchField(field.id, e.target.value, field.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Field value"
                  value={field.value}
                  onChange={(e) => updateSearchField(field.id, field.key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeSearchField(field.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addSearchField}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Search Field
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., professional-endorsement"
                  value={searchFilters.certificateType || ''}
                  onChange={(e) => updateFilter('certificateType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certifier Public Key
                </label>
                <input
                  type="text"
                  placeholder="02abc123..."
                  value={searchFilters.certifier || ''}
                  onChange={(e) => updateFilter('certifier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearching || searchFields.length === 0 || !searchFields.some(f => f.key.trim() && f.value.trim())}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all",
            "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search Public Certificates
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({results.length})
              </h3>
              {results.length > 0 && (
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              )}
            </div>

            {results.length === 0 && !error ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No certificates found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try different search criteria or check if the certificate has been publicly revealed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((cert, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {cert.certifierInfo.iconURL ? (
                          <img
                            src={cert.certifierInfo.iconURL}
                            alt={cert.certifierInfo.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{cert.certifierInfo.name}</h4>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">Trust: {cert.certifierInfo.trust}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">{cert.certifierInfo.description}</p>

                        <div className="space-y-2 mb-3 text-xs text-gray-500 font-mono">
                          <p className="break-all">Type: {cert.type}</p>
                          <p className="break-all">Subject: {cert.subject}</p>
                          <p className="break-all">Serial: {cert.serialNumber}</p>
                          <p className="break-all">Certifier: {cert.certifier}</p>
                          <p className="break-all">Revocation: {cert.revocationOutpoint}</p>
                        </div>

                        {/* Revocation Status */}
                        {revocationStatuses[cert.serialNumber] && (
                          <div className={cn(
                            "mb-3 p-3 rounded-lg border",
                            revocationStatuses[cert.serialNumber].isRevoked
                              ? "bg-red-50 border-red-200"
                              : "bg-green-50 border-green-200"
                          )}>
                            <div className="flex items-start gap-2">
                              {revocationStatuses[cert.serialNumber].isRevoked ? (
                                <>
                                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-red-900">Revoked</p>
                                    <p className="text-xs text-red-700 mt-1">
                                      {revocationStatuses[cert.serialNumber].message}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-green-900">Valid</p>
                                    <p className="text-xs text-green-700 mt-1">
                                      {revocationStatuses[cert.serialNumber].message}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {Object.keys(cert.decryptedFields).length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                            <p className="text-sm font-medium text-blue-900 mb-2">Public Attributes:</p>
                            <div className="space-y-1">
                              {Object.entries(cert.decryptedFields).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-start gap-4">
                                  <span className="text-sm font-medium text-blue-800 capitalize">{key}:</span>
                                  <span className="text-sm text-blue-700 text-right break-all">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCheckRevocation(cert)}
                              disabled={processing === cert.serialNumber}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all",
                                "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              {processing === cert.serialNumber ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4" />
                                  Check Revocation
                                </>
                              )}
                            </button>
                            {myIdentityKey && cert.certifier === myIdentityKey && (
                              <button
                                onClick={() => handleRevoke(cert)}
                                disabled={revoking === cert.serialNumber || revocationStatuses[cert.serialNumber]?.isRevoked}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium transition-all",
                                  "hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                              >
                                {revoking === cert.serialNumber ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Revoking...
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-4 h-4" />
                                    Revoke Certificate
                                  </>
                                )}
                              </button>
                            )}
                            {myIdentityKey && cert.subject === myIdentityKey && (
                              <button
                                onClick={() => handleUnrevealFromPublicLookup(cert)}
                                disabled={unrevealing === cert.serialNumber}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium transition-all",
                                  "hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                              >
                                {unrevealing === cert.serialNumber ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Unrevealing...
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Remove from Public
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {myIdentityKey && cert.certifier === myIdentityKey && (
                            <p className="text-xs text-gray-500 text-center">
                              You issued this certificate
                            </p>
                          )}
                          {myIdentityKey && cert.subject === myIdentityKey && (
                            <p className="text-xs text-gray-500 text-center">
                              You are the subject of this certificate
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
