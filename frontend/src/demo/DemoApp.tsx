import { useState, useEffect } from 'react'
import { BadgeCheck, Award, Inbox as InboxIcon, HeartHandshake, Search, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IdentityClient } from '@bsv/sdk'
import { cn } from '@/lib/utils'
import { WalletProvider, useWallet } from './WalletContext'
import Welcome from './Welcome'
import Vouch from './Vouch'
import Inbox from './Inbox'
import MySkills from './MySkills'
import Discover from './Discover'
import { KeyAvatar } from './ui'
import { truncateKey } from './certs'

type Tab = 'skills' | 'inbox' | 'vouch' | 'discover'

const TABS: Array<{ id: Tab; label: string; icon: typeof Award }> = [
  { id: 'skills', label: 'My Credentials', icon: Award },
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
  { id: 'vouch', label: 'Vouch', icon: HeartHandshake },
  { id: 'discover', label: 'Discover', icon: Search }
]

export interface OwnProfile {
  name: string | null
  avatarURLs: string[]
}

function DemoAppContent() {
  const { wallet, setWallet } = useWallet()
  const [activeTab, setActiveTab] = useState<Tab>('skills')
  const [identityKey, setIdentityKey] = useState<string | null>(null)
  const [profile, setProfile] = useState<OwnProfile>({ name: null, avatarURLs: [] })
  const [skillsRefreshToken, setSkillsRefreshToken] = useState(0)

  useEffect(() => {
    if (!wallet) {
      setIdentityKey(null)
      setProfile({ name: null, avatarURLs: [] })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { publicKey } = await wallet.getPublicKey({ identityKey: true })
        if (cancelled) return
        setIdentityKey(publicKey)
        // Resolve the user's own public identity (name + photo from e.g. an X cert)
        const identities = await new IdentityClient(wallet).resolveByIdentityKey({ identityKey: publicKey })
        if (cancelled) return
        const named = identities.filter(i => i.name && i.name !== 'Unknown Identity')
        // Collect every candidate photo, https-hosted ones first; the avatar
        // tries them in order since older certs can point at dead URLs
        const avatars = [...new Set(named.map(i => i.avatarURL).filter(Boolean))]
          .sort((a, b) => Number(/^https?:/.test(b)) - Number(/^https?:/.test(a)))
        if (named.length > 0) setProfile({ name: named[0].name, avatarURLs: avatars })
      } catch (err) {
        console.error('Error loading identity:', err)
      }
    })()
    return () => { cancelled = true }
  }, [wallet])

  if (!wallet) {
    return <Welcome onWalletSelected={setWallet} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand — links back to the main site */}
            <Link to="/" className="flex items-center gap-2.5 text-left">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 leading-tight">PeerCert</p>
                <p className="text-[11px] text-gray-400 leading-tight">Skills you own</p>
              </div>
            </Link>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </nav>

            {/* Account */}
            <div className="flex items-center gap-2">
              {identityKey && (
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                  <KeyAvatar identityKey={identityKey} size="sm" imageUrl={profile.avatarURLs} />
                  <span className={profile.name ? 'text-xs font-medium text-gray-600' : 'text-xs font-mono text-gray-500'}>
                    {profile.name || truncateKey(identityKey, 6)}
                  </span>
                </div>
              )}
              <button
                onClick={() => setWallet(null)}
                title="Sign out"
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'skills' ? (
          <MySkills
            wallet={wallet}
            identityKey={identityKey}
            profile={profile}
            refreshToken={skillsRefreshToken}
            onVouchClick={() => setActiveTab('vouch')}
          />
        ) : activeTab === 'inbox' ? (
          <Inbox
            wallet={wallet}
            onAccepted={() => setSkillsRefreshToken(t => t + 1)}
          />
        ) : activeTab === 'vouch' ? (
          <Vouch wallet={wallet} />
        ) : (
          <Discover wallet={wallet} identityKey={identityKey} />
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-gray-300">
          Every endorsement is digitally signed and belongs to the person who received it.
        </p>
      </footer>
    </div>
  )
}

export default function DemoApp() {
  return (
    <WalletProvider>
      <DemoAppContent />
    </WalletProvider>
  )
}
