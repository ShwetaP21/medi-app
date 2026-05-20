'use client'
import { useEffect, useState } from 'react'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'

interface DashboardData {
  stats: {
    totalRecords: number
    upcomingAppointments: number
    activeMedications: number
    totalDocuments: number
  }
  recentRecords: any[]
  nextAppointment: any
}

const defaultData: DashboardData = {
  stats: { totalRecords: 0, upcomingAppointments: 0, activeMedications: 0, totalDocuments: 0 },
  recentRecords: [],
  nextAppointment: null,
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let retries = 3

    async function load() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        setData(json)
      } catch (e) {
        if (retries > 0) {
          retries--
          setTimeout(load, 1000) // retry after 1s
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const stats = [
    { label: 'Health Records', value: data.stats.totalRecords, icon: '🩺', href: '/dashboard/records', color: 'bg-blue-50 text-blue-700' },
    { label: 'Upcoming Appts.', value: data.stats.upcomingAppointments, icon: '📅', href: '/dashboard/appointments', color: 'bg-violet-50 text-violet-700' },
    { label: 'Active Medications', value: data.stats.activeMedications, icon: '💊', href: '/dashboard/medications', color: 'bg-amber-50 text-amber-700' },
    { label: 'Documents', value: data.stats.totalDocuments, icon: '📄', href: '/dashboard/documents', color: 'bg-emerald-50 text-emerald-700' },
  ]

  const recordTypeLabel: Record<string, string> = {
    VISIT: 'Visit', DIAGNOSIS: 'Diagnosis', PROCEDURE: 'Procedure',
    VACCINATION: 'Vaccination', ALLERGY: 'Allergy', LAB_RESULT: 'Lab Result', OTHER: 'Other',
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Your health at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all group">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.color} mb-3`}>
              <span className="text-lg">{s.icon}</span>
            </div>
            <div className="text-2xl font-semibold text-stone-900 mb-0.5">
              {loading ? <span className="text-stone-300">—</span> : s.value}
            </div>
            <div className="text-xs text-stone-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next appointment */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-stone-900 text-sm">Next appointment</h2>
            <Link href="/dashboard/appointments" className="text-xs text-emerald-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="h-16 bg-stone-100 rounded-lg animate-pulse" />
          ) : data.nextAppointment ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="font-medium text-stone-900 text-sm">{data.nextAppointment.title}</p>
              <p className="text-xs text-stone-500 mt-1">Dr. {data.nextAppointment.doctorName}</p>
              <p className="text-xs text-emerald-700 font-medium mt-2">
                📅 {formatDateTime(data.nextAppointment.appointmentDate)}
              </p>
              {data.nextAppointment.location && (
                <p className="text-xs text-stone-400 mt-1">📍 {data.nextAppointment.location}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-stone-400">
              <p className="text-sm">No upcoming appointments</p>
              <Link href="/dashboard/appointments" className="text-xs text-emerald-600 hover:underline mt-2 block">Book one →</Link>
            </div>
          )}
        </div>

        {/* Recent records */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-stone-900 text-sm">Recent health records</h2>
            <Link href="/dashboard/records" className="text-xs text-emerald-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" />)}
            </div>
          ) : data.recentRecords?.length ? (
            <div className="space-y-2">
              {data.recentRecords.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                  <div>
                    <p className="text-sm text-stone-800 font-medium">{r.title}</p>
                    <p className="text-xs text-stone-400">{recordTypeLabel[r.type]} · {formatDate(r.visitDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-stone-400">
              <p className="text-sm">No records yet</p>
              <Link href="/dashboard/records" className="text-xs text-emerald-600 hover:underline mt-2 block">Add your first →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Add health record', href: '/dashboard/records' },
            { label: 'Book appointment', href: '/dashboard/appointments' },
            { label: 'Log medication', href: '/dashboard/medications' },
            { label: 'Upload document', href: '/dashboard/documents' },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="bg-white border border-stone-200 text-stone-700 text-xs px-4 py-2.5 rounded-lg hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
            >
              + {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}