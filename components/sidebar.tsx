'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { getInitials } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/dashboard/records', label: 'Health Records', icon: '🩺' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { href: '/dashboard/medications', label: 'Medications', icon: '💊' },
  { href: '/dashboard/documents', label: 'Documents', icon: '📄' },
]

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-stone-200 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-stone-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-semibold">M</span>
        </div>
        <span className="font-semibold text-stone-900">MediVault</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User area */}
      <div className="px-3 py-4 border-t border-stone-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-xs shrink-0">
            {getInitials(user.name || user.email || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{user.name || 'User'}</p>
            <p className="text-xs text-stone-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-1 w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <span>↩</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
