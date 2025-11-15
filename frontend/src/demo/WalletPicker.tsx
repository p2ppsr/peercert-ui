import { useState } from 'react'
import type { WalletInterface } from '@bsv/sdk'
import { Wallet, Key, Settings, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import makeWallet, { WalletConfig } from './makeWallet'

interface WalletPickerProps {
  onWalletSelected: (wallet: WalletInterface) => void
  className?: string
}

export default function WalletPicker({ onWalletSelected, className }: WalletPickerProps) {
  const [walletType, setWalletType] = useState<'local' | 'custom'>('local')
  const [privateKey, setPrivateKey] = useState('')
  const [chain, setChain] = useState<'main' | 'test'>('main')
  const [storageURL, setStorageURL] = useState('https://storage.babbage.systems')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true)
      setError(null)

      const config: WalletConfig = {
        type: walletType,
        privateKey: walletType === 'custom' ? privateKey : undefined,
        chain: walletType === 'custom' ? chain : undefined,
        storageURL: walletType === 'custom' ? storageURL : undefined
      }

      const wallet = await makeWallet(config)
      onWalletSelected(wallet)
    } catch (err) {
      console.error('Error creating wallet:', err)
      setError(err instanceof Error ? err.message : 'Failed to create wallet')
    } finally {
      setIsCreating(false)
    }
  }

  const isValidPrivateKey = (key: string) => {
    return /^[0-9a-fA-F]{64}$/.test(key)
  }

  const canCreateWallet = walletType === 'local' ||
    (walletType === 'custom' && privateKey && isValidPrivateKey(privateKey))

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Select Wallet Type</h3>
      </div>

      <div className="space-y-4">
        {/* Wallet Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Wallet Type
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setWalletType('local')}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-lg text-left transition-all",
                walletType === 'local'
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <Wallet className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-medium">Local Wallet</div>
                <div className="text-sm opacity-75">Use browser-based wallet</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setWalletType('custom')}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-lg text-left transition-all",
                walletType === 'custom'
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <Key className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-medium">Custom Private Key</div>
                <div className="text-sm opacity-75">Use wallet-toolbox with your key</div>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Wallet Configuration */}
        {walletType === 'custom' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-2">
                Private Key (64 hex characters)
              </label>
              <input
                type="password"
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key in hex format..."
                className={cn(
                  "w-full px-3 py-2 border rounded-lg font-mono text-sm",
                  "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  privateKey && !isValidPrivateKey(privateKey)
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                )}
              />
              {privateKey && !isValidPrivateKey(privateKey) && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Private key must be exactly 64 hexadecimal characters
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="chain" className="block text-sm font-medium text-gray-700 mb-2">
                  Network
                </label>
                <select
                  id="chain"
                  value={chain}
                  onChange={(e) => setChain(e.target.value as 'main' | 'test')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="main">Mainnet</option>
                  <option value="test">Testnet</option>
                </select>
              </div>

              <div>
                <label htmlFor="storageURL" className="block text-sm font-medium text-gray-700 mb-2">
                  Storage URL
                </label>
                <input
                  type="url"
                  id="storageURL"
                  value={storageURL}
                  onChange={(e) => setStorageURL(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Create Wallet Button */}
        <button
          onClick={handleCreateWallet}
          disabled={!canCreateWallet || isCreating}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
            canCreateWallet && !isCreating
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {isCreating ? (
            <>
              <Settings className="w-5 h-5 animate-spin" />
              Creating Wallet...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Create Wallet
            </>
          )}
        </button>
      </div>
    </div>
  )
}
