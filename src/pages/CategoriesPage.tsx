import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { catalogApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../layout/AdminShell'
import type { Category, Subcategory } from '../types'

export function CategoriesPage() {
  const { token } = useAuth()
  const [cats, setCats] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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
    try {
      await catalogApi.create(token, { name: name.trim(), active: true })
      setName('')
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Create failed')
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
                  <th>Name</th>
                  <th>Subs</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.subcategories?.length ?? 0}</td>
                    <td>{c.active === false ? 'No' : 'Yes'}</td>
                    <td>
                      <Link className="btn btn-ghost btn-sm" to={`/categories/${c.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {!cats.length && (
                  <tr>
                    <td colSpan={4} className="empty">
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

  const load = async () => {
    if (!token || !id) return
    setLoading(true)
    try {
      const list = await catalogApi.list(token, true)
      const found = list.find((c) => c.id === id) || null
      setCat(found)
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, id])

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
            <div className="toolbar">
              <span className="muted">
                Status: {cat.active === false ? 'Inactive' : 'Active'}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={toggleActive}>
                {cat.active === false ? 'Activate' : 'Deactivate'}
              </button>
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
