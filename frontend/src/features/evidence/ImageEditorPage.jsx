import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Crop, Eye, Pencil, RotateCcw, RotateCw, Save, ZoomIn, ZoomOut } from 'lucide-react'
import { Alert, Button, PageHeader } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { getEvidence, saveEvidencePreview } from './evidenceData'
import { canEdit, getCurrentUser } from '../../utils/roles'

const IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'webp']

function ImageEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const { data, loading, error, reload } = useDashboardData(useCallback(() => getEvidence(id), [id]))
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [crop, setCrop] = useState(false)
  const [annotation, setAnnotation] = useState('')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return
    const sourceSize = crop ? Math.min(image.naturalWidth, image.naturalHeight) : Math.max(image.naturalWidth, image.naturalHeight)
    const size = Math.max(240, Math.round(sourceSize * scale))
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, size, size)
    context.save()
    context.translate(size / 2, size / 2)
    context.rotate((rotation * Math.PI) / 180)
    context.drawImage(image, -size / 2, -size / 2, size, size)
    context.restore()
    if (annotation.trim()) {
      context.fillStyle = '#38d9c2'
      context.font = `${Math.max(14, Math.round(size / 28))}px sans-serif`
      context.fillText(annotation.trim(), 20, size - 24)
    }
  }, [annotation, crop, rotation, scale])

  useEffect(() => {
    if (!data?.previewUrl || !IMAGE_TYPES.includes(data.fileType)) return
    const image = new Image()
    image.onload = () => {
      imageRef.current = image
      draw()
    }
    image.src = data.previewUrl
  }, [data, draw])

  const save = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)
    setMessage('')
    await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      .then((blob) => saveEvidencePreview(id, blob))
    setSaving(false)
    navigate(`/evidence/${id}`)
  }

  const user = getCurrentUser()
  if (!canEdit(user)) return <DashboardState error="You do not have permission to edit this image." />

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <PageHeader
            back={{ to: `/evidence/${id}`, label: 'Back to document' }}
            eyebrow={`${data.id} · In-platform image editor`}
            title={data.title}
            actions={
              <>
                <Button variant="secondary" onClick={() => setPreview((value) => !value)}><Eye className="h-4 w-4" /> {preview ? 'Edit' : 'Preview'}</Button>
                <Button onClick={save} loading={saving}><Save className="h-4 w-4" /> Save changes</Button>
              </>
            }
          />

          {!data.previewUrl && <Alert variant="warning">This sample image has no browser file attached. Upload a local image to use the editor.</Alert>}
          {message && <Alert variant="error">{message}</Alert>}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_1fr]">
            <section className="space-y-4 rounded-xl border border-line bg-paper-dark p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Editing tools</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setRotation((value) => value - 90)}><RotateCcw className="h-4 w-4" /> Rotate</Button>
                <Button variant="secondary" onClick={() => setRotation((value) => value + 90)}><RotateCw className="h-4 w-4" /> Rotate</Button>
                <Button variant="secondary" onClick={() => setScale((value) => Math.max(0.5, value - 0.1))}><ZoomOut className="h-4 w-4" /> Smaller</Button>
                <Button variant="secondary" onClick={() => setScale((value) => Math.min(2, value + 0.1))}><ZoomIn className="h-4 w-4" /> Larger</Button>
                <Button variant={crop ? 'primary' : 'secondary'} className="col-span-2" onClick={() => setCrop((value) => !value)}><Crop className="h-4 w-4" /> {crop ? 'Square crop on' : 'Square crop off'}</Button>
              </div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Annotation
                <div className="relative mt-1.5">
                  <Pencil className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-soft" />
                  <input value={annotation} onChange={(event) => setAnnotation(event.target.value)} placeholder="Add a note on the image" className="w-full border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent" />
                </div>
              </label>
              <p className="text-xs text-ink-soft">Changes are kept in browser memory only in this frontend demonstration.</p>
            </section>

            <section className="flex min-h-[520px] items-center justify-center overflow-auto rounded-xl border border-line bg-paper-dark p-4">
              {data.previewUrl ? (
                <canvas ref={canvasRef} className="max-h-[70vh] max-w-full object-contain shadow-xl" aria-label="Image editing canvas" />
              ) : (
                <p className="text-sm text-ink-soft">No local image preview is available.</p>
              )}
            </section>
          </div>
        </>
      )}
    </DashboardState>
  )
}

export default ImageEditorPage
