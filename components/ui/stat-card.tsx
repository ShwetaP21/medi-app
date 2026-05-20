import Link from 'next/link'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string
  icon: string
  href?: string
  colorClass?: string
  loading?: boolean
}

export function StatCard({ label, value, icon, href, colorClass = 'bg-stone-100 text-stone-600', loading }: StatCardProps) {
  const content = (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all group cursor-pointer">
      <div className={cn('inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3', colorClass)}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-semibold text-stone-900 mb-0.5">
        {loading ? <span className="text-stone-200">—</span> : value}
      </div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}
