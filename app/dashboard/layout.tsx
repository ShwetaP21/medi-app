import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar user={session.user} />
      <main className="flex-1 min-h-screen overflow-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
