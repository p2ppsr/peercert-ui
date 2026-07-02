import { ReactNode, useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, Lock, ExternalLink, User, MoreVertical } from 'lucide-react'
import { Img } from '@bsv/uhrp-react'
import { cn } from '@/lib/utils'
import { avatarColor, truncateKey, humanizeLabel, isLevelValue, normalizeLevel, levelStyle, isImageUrl, isUrl } from './certs'

/**
 * Circular avatar for an identity key. Renders the person's photo when one is
 * known (plain https or UHRP-hosted — Img resolves both), otherwise falls
 * back to a deterministic initials circle.
 */
export function KeyAvatar({ identityKey, size = 'md', imageUrl }: {
  identityKey: string
  size?: 'sm' | 'md' | 'lg'
  /** One or more candidate photo URLs — tried in order until one loads. */
  imageUrl?: string | string[]
}) {
  const [failed, setFailed] = useState(0)
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16' }
  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' }
  const placeholder = (
    <div className={cn(
      sizes[size],
      avatarColor(identityKey),
      'rounded-full flex items-center justify-center text-white select-none shrink-0'
    )}>
      <User className={cn(iconSizes[size], 'opacity-90')} />
    </div>
  )
  const candidates = (Array.isArray(imageUrl) ? imageUrl : imageUrl ? [imageUrl] : []).filter(Boolean)
  const src = candidates[failed]
  if (src) {
    return (
      <Img
        key={src}
        src={src}
        alt=""
        fallback={placeholder}
        onError={() => setFailed(n => n + 1)}
        className={cn(sizes[size], 'rounded-full object-cover shrink-0')}
      />
    )
  }
  return placeholder
}

/** Small monospace chip showing a truncated identity key. */
export function KeyChip({ identityKey, label }: { identityKey: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      {label && <span>{label}</span>}
      <code className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-[11px] text-gray-600">
        {truncateKey(identityKey)}
      </code>
    </span>
  )
}

/** Collapsed-by-default section that hides technical/cryptographic details. */
export function TechnicalDetails({ entries }: { entries: Array<[string, string | undefined]> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        Technical details
      </button>
      {open && (
        <dl className="mt-2 space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {entries.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px,1fr] gap-2 text-xs">
              <dt className="text-gray-500">{k}</dt>
              <dd className="font-mono text-gray-700 break-all">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/**
 * Renders decrypted certificate fields for humans: proficiency values become
 * level pills, image URLs become thumbnails, links become links, everything
 * else a compact chip. `omit` hides fields the caller renders elsewhere.
 */
export function FieldChips({ fields, omit = [] }: {
  fields: Record<string, string>
  omit?: string[]
}) {
  const entries = Object.entries(fields).filter(([k]) => !omit.includes(k))
  if (entries.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entries.map(([key, value]) => {
        const label = humanizeLabel(key)
        if (isLevelValue(value)) {
          return (
            <span
              key={key}
              className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', levelStyle(normalizeLevel(value)))}
            >
              {label}
              <span className="opacity-60">·</span>
              {normalizeLevel(value)}
            </span>
          )
        }
        if (isImageUrl(value)) {
          return (
            <span key={key} className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
              <img src={value} alt="" className="w-5 h-5 rounded-full object-cover" />
              {label}
            </span>
          )
        }
        if (isUrl(value)) {
          return (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-blue-600 hover:text-blue-800 hover:border-blue-200 transition-colors max-w-[240px]"
            >
              <span className="text-gray-400">{label}:</span>
              <span className="truncate">{value.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          )
        }
        const isoDate = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/.test(value.trim())
          ? new Date(value.trim())
          : null
        const display = isoDate && !isNaN(isoDate.getTime())
          ? isoDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          : value
        return (
          <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-700 max-w-[280px]">
            <span className="text-gray-400 whitespace-nowrap">{label}:</span>
            <span className="truncate font-medium">{display}</span>
          </span>
        )
      })}
    </div>
  )
}

/** Shown when a certificate's fields can't be decrypted for display. */
export function SealedFields() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-400">
      <Lock className="w-3 h-3" />
      Details sealed — only you can unlock them, and this app couldn't just now
    </div>
  )
}

/** Inline error banner with plain-language message. */
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

/** Inline success banner. */
export function SuccessBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      <div className="text-sm text-emerald-800">{children}</div>
    </div>
  )
}

/** Centered modal dialog with backdrop. */
export function Modal({ title, subtitle, onClose, children }: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmOptions {
  title: string
  body: string
  confirmLabel?: string
  danger?: boolean
}

/**
 * Promise-based replacement for window.confirm with app-styled UI.
 * Usage: const { confirm, confirmDialog } = useConfirm()
 *        if (!(await confirm({ title, body }))) return
 * Render {confirmDialog} once in the component tree.
 */
export function useConfirm() {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null)

  const confirm = (opts: ConfirmOptions) =>
    new Promise<boolean>(resolve => setPending({ ...opts, resolve }))

  const settle = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
  }

  const confirmDialog = pending ? (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => settle(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center mb-3',
          pending.danger ? 'bg-red-50' : 'bg-blue-50'
        )}>
          <AlertCircle className={cn('w-6 h-6', pending.danger ? 'text-red-500' : 'text-blue-600')} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{pending.title}</h3>
        <p className="text-sm text-gray-500 mt-1.5 whitespace-pre-line">{pending.body}</p>
        <div className="mt-5 flex gap-2.5">
          <SecondaryButton onClick={() => settle(false)} className="flex-1">
            Cancel
          </SecondaryButton>
          <button
            onClick={() => settle(true)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-colors',
              pending.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {pending.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, confirmDialog }
}

export interface CardMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
  title?: string
}

/** Three-dot context menu for secondary card actions. */
export function CardMenu({ items }: { items: CardMenuItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        title="More actions"
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[180px] bg-white border border-gray-100 rounded-xl shadow-lg py-1.5">
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); item.onClick() }}
              disabled={item.disabled}
              title={item.title}
              className={cn(
                'w-full text-left px-4 py-2 text-sm transition-colors disabled:opacity-40',
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Collapsed-by-default section for supplementary content. */
export function Disclosure({ label, children, defaultOpen }: {
  label: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {label}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}

/** Thin indeterminate progress bar for in-flight operations. */
export function ProgressBar({ label }: { label?: string }) {
  return (
    <div className="w-full">
      <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-blue-500 rounded-full animate-progress-slide" />
      </div>
      {label && <p className="mt-1.5 text-xs text-gray-400 text-center">{label}</p>}
    </div>
  )
}

/** Primary action button with loading state. */
export function PrimaryButton({ onClick, disabled, loading, children, className }: {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm',
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

/** Secondary (outline) button. */
export function SecondaryButton({ onClick, disabled, children, className, title }: {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm',
        'border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}
