'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { createHealthRecord, deleteHealthRecord, updateHealthRecord } from '@/app/actions/records'

type RecordType = 'VISIT' | 'DIAGNOSIS' | 'PROCEDURE' | 'VACCINATION' | 'ALLERGY' | 'LAB_RESULT' | 'OTHER'

interface HealthRecord {
  id: string
  title: string
  type: RecordType
  description: string
  diagnosis?: string
  doctorName?: string
  visitDate: string
  createdAt: string
}

const TYPES: { value: RecordType; label: string }[] = [
  { value: 'VISIT', label: 'Doctor Visit' },
  { value: 'DIAGNOSIS', label: 'Diagnosis' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'ALLERGY', label: 'Allergy' },
  { value: 'LAB_RESULT', label: 'Lab Result' },
  { value: 'OTHER', label: 'Other' },
]

const TYPE_COLORS: Record<RecordType, string> = {
  VISIT: 'bg-blue-50 text-blue-700',
  DIAGNOSIS: 'bg-red-50 text-red-700',
  PROCEDURE: 'bg-violet-50 text-violet-700',
  VACCINATION: 'bg-emerald-50 text-emerald-700',
  ALLERGY: 'bg-orange-50 text-orange-700',
  LAB_RESULT: 'bg-cyan-50 text-cyan-700',
  OTHER: 'bg-stone-100 text-stone-600',
}

const empty = { title: '', type: 'VISIT' as RecordType, description: '', diagnosis: '', doctorName: '', visitDate: '' }

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HealthRecord | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/health-records')
      if (!res.ok) throw new Error('Failed to load records')
      const data = await res.json()
      setRecords(data)
    } catch (error) {
      toast.error('Failed to load health records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(empty)
    setShowForm(true)
  }

  function openEdit(r: HealthRecord) {
    setEditing(r)
    setForm({
      title: r.title,
      type: r.type,
      description: r.description,
      diagnosis: r.diagnosis || '',
      doctorName: r.doctorName || '',
      visitDate: r.visitDate.split('T')[0],
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (editing) {
        await updateHealthRecord(editing.id, form)
      }else{
        await createHealthRecord(form)
      }
      setShowForm(false)
      await load()
      toast.success(editing ? 'Record updated' : 'Record added')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return
    setDeleting(id)

    try {
      await deleteHealthRecord(id)
      setRecords((r) => r.filter((x) => x.id !== id))
      toast.success('Record deleted')
    } catch (error) {
      toast.error('Failed to delete record')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = records.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      (r.doctorName || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900">Health Records</h1>
          <p className="text-stone-500 text-sm mt-1">{records.length} record{records.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          + Add Record
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search records..."
          className="w-full sm:max-w-sm px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      {/* Records list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white border border-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">🩺</p>
          <p className="font-medium text-stone-600">{search ? 'No results found' : 'No health records yet'}</p>
          <p className="text-sm mt-1">{!search && 'Click "Add Record" to log your first health event'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-stone-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-stone-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-medium text-stone-900">{r.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[r.type]}`}>
                      {TYPES.find(t => t.value === r.type)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-stone-400 flex-wrap">
                    <span>📅 {formatDate(r.visitDate)}</span>
                    {r.doctorName && <span>👨‍⚕️ {r.doctorName}</span>}
                    {r.diagnosis && <span className="hidden sm:inline">🔍 {r.diagnosis}</span>}
                  </div>
                  {r.diagnosis && <p className="text-xs text-stone-400 mt-1 sm:hidden">🔍 {r.diagnosis}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(r)}
                    className="text-xs text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    {deleting === r.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100 shrink-0">
              <h2 className="font-semibold text-stone-900">{editing ? 'Edit Record' : 'New Health Record'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. Annual checkup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as RecordType }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Visit Date *</label>
                <input
                  type="date"
                  value={form.visitDate}
                  onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                  placeholder="What happened during this visit?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Doctor Name</label>
                <input
                  value={form.doctorName}
                  onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="Dr. Priya Mehta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Diagnosis / Findings</label>
                <input
                  value={form.diagnosis}
                  onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. Mild hypertension"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editing ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
