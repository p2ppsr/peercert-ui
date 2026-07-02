import { useState } from 'react'
import { WalletInterface } from '@bsv/sdk'
import { BadgeCheck, UserCheck, Lock, Globe2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import makeWallet from './makeWallet'
import { PrimaryButton } from './ui'

interface WelcomeProps {
  onWalletSelected: (wallet: WalletInterface) => void
}

const VALUE_PROPS = [
  {
    icon: UserCheck,
    title: 'Real people vouch for you',
    text: 'A colleague, mentor, or client personally signs off on a skill they’ve seen you use. No anonymous upvotes — every endorsement has a real person behind it.'
  },
  {
    icon: Lock,
    title: 'You own your endorsements',
    text: 'They live with you, not on some company’s server. No platform can delete them, and you decide what stays private and what goes public.'
  },
  {
    icon: Globe2,
    title: 'Take them anywhere',
    text: 'Any app can plug into your endorsements — if you choose to share them. Prove your skills on a job board, a freelance site, or anywhere else.'
  }
]

export default function Welcome({ onWalletSelected }: WelcomeProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [chain, setChain] = useState<'main' | 'test'>('main')
  const [storageURL, setStorageURL] = useState('https://storage.babbage.systems')
  const [connecting, setConnecting] = useState<'local' | 'custom' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connect = async (type: 'local' | 'custom') => {
    try {
      setConnecting(type)
      setError(null)
      const wallet = await makeWallet(
        type === 'local'
          ? { type: 'local' }
          : { type: 'custom', privateKey, chain, storageURL }
      )
      onWalletSelected(wallet)
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError(err instanceof Error ? err.message : 'Could not connect. Is your wallet running?')
    } finally {
      setConnecting(null)
    }
  }

  const validKey = /^[0-9a-fA-F]{64}$/.test(privateKey)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/25 mb-6">
            <BadgeCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Skills you own.
            <br />
            <span className="text-blue-600">Vouched for by real people.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
            Like endorsements on LinkedIn — except people digitally sign them,
            you keep them forever, and they work everywhere.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <PrimaryButton
              onClick={() => connect('local')}
              loading={connecting === 'local'}
              className="px-8 py-3.5 text-base shadow-lg shadow-blue-600/25"
            >
              {connecting === 'local' ? 'Connecting…' : 'Get started'}
            </PrimaryButton>
            <p className="text-xs text-gray-400">
              Uses your MetaNet wallet to keep your endorsements safe. Nothing to sign up for.
            </p>
          </div>
          {error && (
            <div className="mt-5 max-w-md mx-auto flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-left">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Value props */}
        <div className="grid sm:grid-cols-3 gap-4">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Advanced connection */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Advanced: connect with a private key
          </button>

          {showAdvanced && (
            <div className="mt-4 max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-5 text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Private key (64 hex characters)
                </label>
                <input
                  type="password"
                  value={privateKey}
                  onChange={e => setPrivateKey(e.target.value)}
                  placeholder="Paste your key…"
                  className={cn(
                    'w-full px-3 py-2 border rounded-xl font-mono text-sm',
                    'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
                    privateKey && !validKey ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  )}
                />
                {privateKey && !validKey && (
                  <p className="mt-1 text-xs text-red-600">Must be exactly 64 hexadecimal characters</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Network</label>
                  <select
                    value={chain}
                    onChange={e => setChain(e.target.value as 'main' | 'test')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="main">Mainnet</option>
                    <option value="test">Testnet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Storage URL</label>
                  <input
                    type="url"
                    value={storageURL}
                    onChange={e => setStorageURL(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <PrimaryButton
                onClick={() => connect('custom')}
                disabled={!validKey}
                loading={connecting === 'custom'}
                className="w-full"
              >
                {connecting === 'custom' ? 'Connecting…' : 'Connect with key'}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
