import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import DemoApp from '@/demo/DemoApp'

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 text-center">PeerCert Interactive Demo</h1>
            {/* Spacer for balance */}
            <div className="w-16 sm:w-20 shrink-0"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8">
        <DemoApp />
      </main>
    </div>
  )
}
