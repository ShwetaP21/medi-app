'use client'
import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'

type Status = 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'

interface Appointment {
  id: string
  title: string
  doctorName: string
  specialty?: string
  location?: string
  appointmentDate: string
  duration: number
  status: Status
  notes?: string
}

const STATUS_COLORS: Record<Status, string> = {
  UPCOMING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RESCHEDULED: 'bg-amber-50 text-amber-700',
}

const empty = { title: '', doctorName: '', specialty: '', location: '', appointmentDate: '', duration: 30, notes: '' }

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'ALL' | Status>('ALL')

  async function load() {
    const res = await fetch('/api/appointments')
    const data = await res.json()
    setAppointments(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(empty)
    setError('')
    setShowForm(true)
  }

  function openEdit(a: Appointment) {
    setEditing(a)
    setForm({
      title: a.title,
      doctorName: a.doctorName,
      specialty: a.specialty || '',
      location: a.location || '',
      appointmentDate: a.appointmentDate.slice(0, 16),
      duration: a.duration,
      notes: a.notes || '',
    })
    setError('')
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = editing ? `/api/appointments/${editing.id}` : '/api/appointments'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, duration: Number(form.duration) }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }

    setShowForm(false)
    await load()
    setSaving(false)
  }

  async function updateStatus(id: string, status: Status) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setAppointments(a => a.map(x => x.id === id ? { ...x, status } : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this appointment?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    setAppointments(a => a.filter(x => x.id !== id))
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Appointments</h1>
          <p className="text-stone-500 text-sm mt-1">{appointments.length} total</p>
        </div>
        <button onClick={openNew} className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          + Book Appointment
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-stone-100 p-1 rounded-xl w-fit">
        {(['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-white border border-stone-200 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium text-stone-600">No appointments</p>
          <p className="text-sm mt-1">Click "Book Appointment" to schedule one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium text-stone-900">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}>
                      {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">Dr. {a.doctorName}{a.specialty && ` · ${a.specialty}`}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-stone-400 flex-wrap">
                    <span>📅 {formatDateTime(a.appointmentDate)}</span>
                    <span>⏱ {a.duration} min</span>
                    {a.location && <span>📍 {a.location}</span>}
                  </div>
                  {a.notes && <p className="text-xs text-stone-400 mt-1.5 italic">"{a.notes}"</p>}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {a.status === 'UPCOMING' && (
                    <>
                      <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="text-xs text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">Complete</button>
                      <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
                    </>
                  )}
                  <button onClick={() => openEdit(a)} className="text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">{editing ? 'Edit Appointment' : 'Book Appointment'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

              {[
                { label: 'Title *', key: 'title', placeholder: 'e.g. General checkup' },
                { label: 'Doctor Name *', key: 'doctorName', placeholder: 'Dr. Arjun Kumar' },
                { label: 'Specialty', key: 'specialty', placeholder: 'Cardiology' },
                { label: 'Location', key: 'location', placeholder: 'Apollo Hospital, Mumbai' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{f.label}</label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    required={f.label.includes('*')}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.appointmentDate}
                  onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Duration (minutes)</label>
                <select
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                  placeholder="Any notes for this appointment..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
