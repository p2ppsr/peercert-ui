import { useState } from 'react'
import { Award, FileText, Search, Shield, Send } from 'lucide-react'
import { WalletProvider, useWallet } from './WalletContext'
import WalletPicker from './WalletPicker'
import CreateCertificate from './CreateCertificate'
import ReceiveCertificates from './ReceiveCertificates'
import MyCertificates from './MyCertificates'
import SearchPublicCertificates from './SearchPublicCertificates'
import VerifiableCertificates from './VerifiableCertificates'
import { cn } from '@/lib/utils'

type TabId = 'create' | 'receive' | 'my-certs' | 'search' | 'verifiable'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
}

const tabs: Tab[] = [
  { id: 'create', label: 'Create Certificate', icon: FileText },
  { id: 'receive', label: 'Receive Certificates', icon: Award },
  { id: 'my-certs', label: 'My Certificates', icon: Shield },
  { id: 'search', label: 'Search Public', icon: Search },
  { id: 'verifiable', label: 'Verifiable Certificates', icon: Send }
]

function DemoContent() {
  const { wallet, setWallet } = useWallet()
  const [activeTab, setActiveTab] = useState<TabId>('create')

  if (!wallet) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to PeerCert Demo</h2>
          <p className="text-gray-600">
            Create your wallet to get started with peer-to-peer certificates
          </p>
        </div>
        <WalletPicker onWalletSelected={setWallet} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'create' && <CreateCertificate wallet={wallet} />}
        {activeTab === 'receive' && <ReceiveCertificates wallet={wallet} />}
        {activeTab === 'my-certs' && <MyCertificates wallet={wallet} />}
        {activeTab === 'search' && <SearchPublicCertificates wallet={wallet} />}
        {activeTab === 'verifiable' && <VerifiableCertificates wallet={wallet} />}
      </div>
    </div>
  )
}

export default function DemoApp() {
  return (
    <WalletProvider>
      <DemoContent />
    </WalletProvider>
  )
}
