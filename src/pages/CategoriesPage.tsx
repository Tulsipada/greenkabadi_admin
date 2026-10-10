import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { catalogApi } from '../api/adminApi'
import { mediaUrl } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../layout/AdminShell'
import type { Category, Subcategory } from '../types'

export function CategoriesPage() {
  const { token } = useAuth()
  const [cats, setCats] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      setCats(await catalogApi.list(token, true))
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !name.trim()) return
    setError('')
    try {
      const created = await catalogApi.create(token, { name: name.trim(), active: true })
      if (image) await catalogApi.uploadImage(token, created.id, image)
      setName('')
      setImage(null)
      if (imageRef.current) imageRef.current.value = ''
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Create failed')
    }
  }

  const deleteCategory = async (category: Category) => {
    setError('')
    if (category.subcategories?.length) {
      setError('Delete all subcategories before deleting this category.')
      return
    }
    if (!window.confirm(`Delete category "${category.name}"?`)) return
    if (!token) return
    setDeletingId(category.id)
    try {
      await catalogApi.remove(token, category.id)
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader title="Categories" />
      <div className="admin-content">
        <form className="card row" onSubmit={onCreate} style={{ marginBottom: 16 }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>New category</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>Image</label>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ marginTop: 18 }}>
            Add
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Subs</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.imageUrl ? (
                        <img className="cat-thumb" src={mediaUrl(c.imageUrl)} alt="" />
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>{c.name}</td>
                    <td>{c.subcategories?.length ?? 0}</td>
                    <td>{c.active === false ? 'No' : 'Yes'}</td>
                    <td>
                      <Link className="btn btn-ghost btn-sm" to={`/categories/${c.id}`}>
                        Open
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === c.id}
                        onClick={() => void deleteCategory(c)}
                        style={{ marginLeft: 8 }}
                      >
                        {deletingId === c.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!cats.length && (
                  <tr>
                    <td colSpan={5} className="empty">
                      No categories
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [cat, setCat] = useState<Category | null>(null)
  const [subName, setSubName] = useState('')
  const [rate, setRate] = useState('')
  const [unit, setUnit] = useState('kg')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null)

  const load = async () => {
    if (!token || !id) return
    setLoading(true)
    try {
      setCat(await catalogApi.get(token, id))
    } catch (e: unknown) {
      const apiError = e as { status?: number; message?: string }
      if (apiError.status === 404) {
        setCat(null)
        setError('')
      } else {
        setError(apiError.message || 'Failed to load')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, id])

  const onImage = async (file: File | null) => {
    if (!token || !cat || !file) return
    setError('')
    setUploading(true)
    try {
      await catalogApi.uploadImage(token, cat.id, file)
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = async () => {
    if (!token || !cat) return
    await catalogApi.patch(token, cat.id, { active: cat.active === false })
    await load()
  }

  const addSub = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !id) return
    try {
      await catalogApi.addSub(token, id, {
        name: subName.trim(),
        rate: rate ? Number(rate) : undefined,
        unit,
        active: true,
      })
      setSubName('')
      setRate('')
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Add failed')
    }
  }

  const saveSub = async (s: Subcategory, patch: Partial<Subcategory>) => {
    if (!token) return
    await catalogApi.patchSub(token, s.id, patch)
    await load()
  }

  const deleteSub = async (sub: Subcategory) => {
    if (!token) return
    if (!window.confirm(`Delete subcategory "${sub.name}"?`)) return
    setError('')
    setDeletingSubId(sub.id)
    try {
      await catalogApi.removeSub(token, sub.id)
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Subcategory delete failed')
    } finally {
      setDeletingSubId(null)
    }
  }

  return (
    <>
      <PageHeader
        title={cat?.name || 'Category'}
        actions={
          <Link className="btn btn-ghost btn-sm" to="/categories">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {cat && (
          <>
            <div className="card row" style={{ marginBottom: 16, alignItems: 'center' }}>
              {cat.imageUrl ? (
                <img className="cat-preview" src={mediaUrl(cat.imageUrl)} alt="" />
              ) : (
                <div className="cat-preview" />
              )}
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => void onImage(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <span className="muted">
                  Status: {cat.active === false ? 'Inactive' : 'Active'}
                </span>
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={toggleActive}>
                    {cat.active === false ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            </div>
            <form className="card row" onSubmit={addSub} style={{ marginBottom: 16 }}>
              <div className="field" style={{ flex: 2, marginBottom: 0 }}>
                <label>Subcategory</label>
                <input value={subName} onChange={(e) => setSubName(e.target.value)} required />
              </div>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label>Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label>Unit</label>
                <input value={unit} onChange={(e) => setUnit(e.target.value)} />
              </div>
              <button className="btn btn-primary" type="submit" style={{ marginTop: 18 }}>
                Add
              </button>
            </form>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Rate</th>
                    <th>Unit</th>
                    <th>Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(cat.subcategories || []).map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>
                        <input
                          style={{ width: 90 }}
                          type="number"
                          defaultValue={s.rate ?? ''}
                          onBlur={(e) =>
                            saveSub(s, { rate: e.target.value ? Number(e.target.value) : 0 })
                          }
                        />
                      </td>
                      <td>{s.unit || 'kg'}</td>
                      <td>{s.active === false ? 'No' : 'Yes'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => saveSub(s, { active: s.active === false })}
                        >
                          Toggle
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={deletingSubId === s.id}
                          onClick={() => void deleteSub(s)}
                          style={{ marginLeft: 8 }}
                        >
                          {deletingSubId === s.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!(cat.subcategories || []).length && (
                    <tr>
                      <td colSpan={5} className="empty">
                        No subcategories
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        {!loading && !cat && (
          <p className="error">
            Category not found.{' '}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/categories')}>
              Back
            </button>
          </p>
        )}
      </div>
    </>
  )
}
