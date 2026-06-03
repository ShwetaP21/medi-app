'use client'
import { useEffect, useState, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

type DocType = 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'DISCHARGE_SUMMARY' | 'INSURANCE' | 'OTHER'

interface Document {
  id: string
  title: string
  type: DocType
  fileUrl: string
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
  const [fileBase64, setFileBase64] = useState('')
  const [fileMime, setFileMime] = useState('image/jpeg')
  const [filePreview, setFilePreview] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [summarising, setSummarising] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Document | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileMime(file.type || 'image/jpeg')

    if (!form.title) {
      setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '') }))
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setFileBase64(result.split(',')[1])
      setFilePreview(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fileBase64) { toast.error('Please select an image'); return }
    setUploading(true)

    try {
      const uploadRes = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: fileBase64, mimeType: fileMime, fileName }),
      })

      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        toast.error(uploadData.error || 'Upload failed')
        setUploading(false)
        return
      }

      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          fileUrl: uploadData.url,   
          mimeType: fileMime,
        }),
      })

      const docData = await docRes.json()
      if (!docRes.ok) {
        toast.error(docData.error || 'Failed to save document')
        setUploading(false)
        return
      }

      toast.success('Document uploaded successfully')
      setShowForm(false)
      setForm({ title: '', type: 'LAB_REPORT' })
      setFileBase64('')
      setFilePreview('')
      setFileName('')
      await load()
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  async function handleSummarise(doc: Document) {
    if (!doc.fileUrl) {
      toast.error('No image found for this document')
      return
    }
    setSummarising(doc.id)

    const res = await fetch('/api/ai/summarise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: doc.id,
        imageUrl: doc.fileUrl,  
      }),
    })

    const data = await res.json()

    if (res.status === 422 && data.notMedical) {
      toast.error(data.error) 
      setSummarising(null)
      return
    }

    if (!res.ok) {
      toast.error(data.error || 'Failed to analyse')
      setSummarising(null)
      return
    }

    setDocuments(d => d.map(x => x.id === doc.id ? { ...x, summary: data.summary } : x))
    setViewing({ ...doc, summary: data.summary })
    toast.success('AI analysis complete')
    setSummarising(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return
    setDeleting(id)
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocuments(d => d.filter(x => x.id !== id))
    toast.success('Document deleted')
    setDeleting(null)
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Documents</h1>
          <p className="text-stone-500 text-sm mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          + Upload Document
        </button>
      </div>

      <div className="mb-6 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🤖</span>
        <div>
          <p className="text-sm font-medium text-stone-900">AI Lab Report Analyser</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload a photo of your lab report — AI will identify each test value, flag abnormal results, and explain in plain English. Only medical documents are accepted.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-stone-200 rounded-2xl animate-pulse" />)}
        </div>
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

              {doc.fileUrl && doc.fileUrl.startsWith('http') && (
                <div className="mb-3 rounded-xl overflow-hidden border border-stone-100 h-24 bg-stone-50">
                  <img
                    src={doc.fileUrl}
                    alt={doc.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}

              {doc.summary && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-3">
                  <p className="text-xs font-medium text-violet-700 mb-1">🤖 AI Analysis</p>
                  <p className="text-xs text-stone-600 line-clamp-3">{doc.summary}</p>
                  <button
                    onClick={() => setViewing(doc)}
                    className="text-xs text-violet-600 hover:underline mt-1"
                  >
                    Read full →
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSummarise(doc)}
                  disabled={summarising === doc.id}
                  className="flex-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 py-1.5 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50 font-medium"
                >
                  {summarising === doc.id ? '⏳ Analysing...' : doc.summary ? '🔄 Re-analyse' : '🤖 AI Analyse'}
                </button>
                <button onClick={() => setViewing(doc)} className="text-xs border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-50">View</button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40"
                >
                  {deleting === doc.id ? '...' : 'Del'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Upload Document</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Document Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. CBC Blood Test May 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Document Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as DocType }))}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Upload Image * <span className="text-stone-400 font-normal">(JPG, PNG)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                >
                  {filePreview ? (
                    <div>
                      <img src={filePreview} alt="preview" className="max-h-32 mx-auto rounded-lg mb-2 object-contain" />
                      <p className="text-xs text-stone-400">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl mb-2">📷</p>
                      <p className="text-stone-500 text-sm">Click to upload image</p>
                      <p className="text-xs text-stone-300 mt-1">Stored securely on Cloudinary</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-200 text-stone-700 py-2.5 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button
                  type="submit"
                  disabled={uploading || !fileBase64}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                >
                  {uploading ? '⏳ Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 shrink-0">
              <div>
                <h2 className="font-semibold text-stone-900">{viewing.title}</h2>
                <p className="text-xs text-stone-400 mt-0.5">{DOC_TYPES.find(t => t.value === viewing.type)?.label}</p>
              </div>
              <button onClick={() => setViewing(null)} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {viewing.fileUrl && viewing.fileUrl.startsWith('http') && (
                <div>
                  <h3 className="text-sm font-medium text-stone-700 mb-2">Document</h3>
                  <img
                    src={viewing.fileUrl}
                    alt={viewing.title}
                    className="w-full rounded-xl border border-stone-200 object-contain max-h-72"
                  />
                </div>
              )}

              {viewing.summary ? (
                <div>
                  <h3 className="text-sm font-semibold text-violet-700 mb-3">🤖 AI Analysis</h3>
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {viewing.summary}
                  </div>
                 
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <p className="text-sm">No AI analysis yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}