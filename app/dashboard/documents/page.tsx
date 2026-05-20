'use client'
import { useEffect, useState, useRef } from 'react'
import { formatDate } from '@/lib/utils'

type DocType = 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'DISCHARGE_SUMMARY' | 'INSURANCE' | 'OTHER'

interface Document {
  id: string
  title: string
  type: DocType
  fileUrl: string
  fileSize?: number
  mimeType?: string
  summary?: string
  uploadedAt: string
}

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'LAB_REPORT', label: 'Lab Report' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'IMAGING', label: 'Imaging / Scan' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'OTHER', label: 'Other' },
]

const TYPE_ICONS: Record<DocType, string> = {
  LAB_REPORT: '🧪', PRESCRIPTION: '📋', IMAGING: '🔬',
  DISCHARGE_SUMMARY: '🏥', INSURANCE: '📑', OTHER: '📄',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'LAB_REPORT' as DocType })
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [summarising, setSummarising] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Document | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch('/api/documents')
    const data = await res.json()
    setDocuments(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setFileContent(text)
      if (!form.title) {
        setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '') }))
      }
    }
    reader.readAsText(file)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        type: form.type,
        fileUrl: fileContent || 'manual-entry',
        mimeType: 'text/plain',
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }

    setShowForm(false)
    setForm({ title: '', type: 'LAB_REPORT' })
    setFileContent('')
    setFileName('')
    await load()
    setSaving(false)
  }

  async function handleSummarise(doc: Document) {
    if (!doc.fileUrl || doc.fileUrl === 'manual-entry') {
      alert('No document text to summarise. Please upload a text file.')
      return
    }
    setSummarising(doc.id)

    const res = await fetch('/api/ai/summarise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id, text: doc.fileUrl }),
    })

    const data = await res.json()
    if (res.ok) {
      setDocuments(d => d.map(x => x.id === doc.id ? { ...x, summary: data.summary } : x))
      setViewing({ ...doc, summary: data.summary })
    } else {
      alert(data.error || 'Failed to summarise')
    }
    setSummarising(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return
    setDeleting(id)
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocuments(d => d.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Documents</h1>
          <p className="text-stone-500 text-sm mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setError('') }}
          className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          + Upload Document
        </button>
      </div>

      {/* AI banner */}
      <div className="mb-6 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🤖</span>
        <div>
          <p className="text-sm font-medium text-stone-900">AI Lab Report Summariser</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload a text-based lab report and click "AI Summary" — our AI will explain the results in plain English.
            Always consult your doctor for medical advice.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-stone-200 rounded-2xl animate-pulse" />)}</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">📄</p>
          <p className="font-medium text-stone-600">No documents yet</p>
          <p className="text-sm mt-1">Upload lab reports, prescriptions and more</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">{TYPE_ICONS[doc.type]}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 truncate">{doc.title}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {DOC_TYPES.find(t => t.value === doc.type)?.label} · {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>

              {doc.summary && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-3">
                  <p className="text-xs font-medium text-violet-700 mb-1">🤖 AI Summary</p>
                  <p className="text-xs text-stone-600 line-clamp-3">{doc.summary}</p>
                  {doc.summary.length > 150 && (
                    <button onClick={() => setViewing(doc)} className="text-xs text-violet-600 hover:underline mt-1">Read full →</button>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSummarise(doc)}
                  disabled={summarising === doc.id}
                  className="flex-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 py-1.5 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50 font-medium"
                >
                  {summarising === doc.id ? '⏳ Summarising...' : doc.summary ? '🔄 Re-summarise' : '🤖 AI Summary'}
                </button>
                <button onClick={() => setViewing(doc)} className="text-xs border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-50">View</button>
                <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                  className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40">
                  {deleting === doc.id ? '...' : 'Del'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Upload Document</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Document Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. CBC Blood Test Jan 2025" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Document Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DocType }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Upload File (text files for AI summarising)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                >
                  {fileName ? (
                    <div>
                      <p className="text-sm font-medium text-stone-900">📄 {fileName}</p>
                      <p className="text-xs text-stone-400 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-stone-400 text-sm">Click to upload .txt file</p>
                      <p className="text-xs text-stone-300 mt-1">Text files can be AI-summarised</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".txt,.csv" onChange={handleFile} className="hidden" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                  {saving ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 shrink-0">
              <div>
                <h2 className="font-semibold text-stone-900">{viewing.title}</h2>
                <p className="text-xs text-stone-400 mt-0.5">{DOC_TYPES.find(t => t.value === viewing.type)?.label}</p>
              </div>
              <button onClick={() => setViewing(null)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {viewing.summary ? (
                <div>
                  <h3 className="text-sm font-semibold text-violet-700 mb-3 flex items-center gap-2">
                    🤖 AI-Generated Summary
                  </h3>
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {viewing.summary}
                  </div>
                  <p className="text-xs text-stone-400 mt-3 italic">
                    ⚠️ This is an AI-generated summary for informational purposes only. Always consult your doctor.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <p>No AI summary yet. Click "AI Summary" to generate one.</p>
                </div>
              )}

              {viewing.fileUrl && viewing.fileUrl !== 'manual-entry' && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-stone-700 mb-2">Document Content</h3>
                  <pre className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 overflow-x-auto whitespace-pre-wrap">
                    {viewing.fileUrl.slice(0, 2000)}{viewing.fileUrl.length > 2000 ? '\n...(truncated)' : ''}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
