'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { createMedication, deleteMedication, toggleMedicationActive, updateMedication } from '@/app/actions/medications'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy?: string
  notes?: string
  isActive: boolean
}

const empty = { name: '', dosage: '', frequency: '', startDate: '', endDate: '', prescribedBy: '', notes: '' }

const FREQUENCIES = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'Once weekly', 'As needed (PRN)', 'With meals', 'At bedtime',
]

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [showActive, setShowActive] = useState<'active' | 'all'>('active')

  async function load() {
    try {
      const res = await fetch('/api/medications')
      if (!res.ok) throw new Error('Failed to load medications')
      const data = await res.json()
      setMedications(data)
    } catch (error) {
      toast.error('Failed to load medications')
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

  function openEdit(m: Medication) {
    setEditing(m)
    setForm({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.startDate.split('T')[0],
      endDate: m.endDate ? m.endDate.split('T')[0] : '',
      prescribedBy: m.prescribedBy || '',
      notes: m.notes || '',
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {

        if (editing) {
            await updateMedication(editing.id, form)
          } else {
            await createMedication(form)
          }

      setShowForm(false)
      await load()
      toast.success(editing ? 'Medication updated' : 'Medication added')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {

        await toggleMedicationActive(id, isActive)
      setMedications(m => m.map(x => x.id === id ? { ...x, isActive: !isActive } : x))
      toast.success(`Medication marked as ${!isActive ? 'active' : 'inactive'}`)
    } catch (error) {
      toast.error('Failed to update medication status')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this medication?')) return

    try {
      await deleteMedication(id)
      setMedications(m => m.filter(x => x.id !== id))
      toast.success('Medication deleted')
    } catch (error) {
      toast.error('Failed to delete medication')
    }
  }

  const filtered = showActive === 'active' ? medications.filter(m => m.isActive) : medications

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900">Medications</h1>
          <p className="text-stone-500 text-sm mt-1">
            {medications.filter(m => m.isActive).length} active · {medications.length} total
          </p>
        </div>
        <button onClick={openNew} className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium w-full sm:w-auto">
          + Add Medication
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-stone-100 p-1 rounded-xl w-fit">
        {([['active', 'Active'], ['all', 'All']] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setShowActive(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showActive === v ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white border border-stone-200 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">💊</p>
          <p className="font-medium text-stone-600">No medications</p>
          <p className="text-sm mt-1">Add your current medications to track them</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(m => (
            <div key={m.id} className={`bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all ${m.isActive ? 'border-stone-200 hover:border-stone-300' : 'border-stone-100 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-stone-900 truncate">{m.name}</h3>
                  <p className="text-sm text-stone-500 mt-0.5">{m.dosage} · {m.frequency}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                  {m.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="text-xs text-stone-400 space-y-1 mb-4">
                <div>Started: {formatDate(m.startDate)}{m.endDate && ` · Until: ${formatDate(m.endDate)}`}</div>
                {m.prescribedBy && <div>Prescribed by: {m.prescribedBy}</div>}
                {m.notes && <div className="italic">&quot;{m.notes}&quot;</div>}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleActive(m.id, m.isActive)}
                  className="flex-1 text-xs border border-stone-200 text-stone-600 py-1.5 rounded-lg hover:bg-stone-50 transition-colors min-w-0"
                >
                  Mark {m.isActive ? 'inactive' : 'active'}
                </button>
                <button onClick={() => openEdit(m)} className="text-xs border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-50">Edit</button>
                <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100 shrink-0">
              <h2 className="font-semibold text-stone-900">{editing ? 'Edit Medication' : 'Add Medication'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Medication Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. Metformin" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Dosage *</label>
                <input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. 500mg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Frequency *</label>
                <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Select frequency</option>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Prescribed By</label>
                <input value={form.prescribedBy} onChange={e => setForm(f => ({ ...f, prescribedBy: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="Dr. Priya Mehta" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                  placeholder="Take with food, avoid alcohol..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
