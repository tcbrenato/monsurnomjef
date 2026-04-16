'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import {
  Users, UserCheck, UserX, Trash2, RefreshCw,
  Download, TrendingUp, Clock, Zap, AlertTriangle,
  CheckCircle, ChevronDown, ChevronUp, Activity
} from 'lucide-react'

/* ─── Types ── */
type Participant = {
  id: string
  full_name: string
  "first name": string
  genre: 'homme' | 'femme'
  date_inscription: string
  duo_prenom: string | null
  duo_id: string | null
  duo_price: boolean
}

type Stats = {
  total: number
  hommes: number
  femmes: number
  today: number
  lastHour: number
}

/* ─── CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.adm-root { min-height: 100vh; background: #0d1117; font-family: 'Plus Jakarta Sans', sans-serif; color: #e6edf3; padding: 28px 20px 60px; }
.adm-inner { max-width: 900px; margin: 0 auto; }

.adm-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 14px; }
.adm-brand { display: flex; align-items: center; gap: 12px; }
.adm-brand-dot { width: 10px; height: 10px; border-radius: 50%; background: #2f8b09; box-shadow: 0 0 0 4px rgba(47,139,9,.2); animation: pulse 2s ease-in-out infinite; flex-shrink: 0; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 4px rgba(47,139,9,.2); } 50% { box-shadow: 0 0 0 8px rgba(47,139,9,.05); } }
.adm-brand-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 900; color: #fff; letter-spacing: -.3px; }
.adm-brand-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2f8b09; font-weight: 600; letter-spacing: .5px; }

.adm-refresh-btn { display: flex; align-items: center; gap: 7px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 9px 16px; color: #8b949e; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .18s; font-family: 'Plus Jakarta Sans', sans-serif; }
.adm-refresh-btn:hover { border-color: #2f8b09; color: #2f8b09; }
.adm-refresh-btn.spinning svg { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.adm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
.adm-stat { background: #161b22; border: 1px solid #21262d; border-radius: 16px; padding: 18px 20px; transition: border-color .2s; }
.adm-stat:hover { border-color: #30363d; }
.adm-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.adm-stat-icon.green  { background: rgba(47,139,9,.15); }
.adm-stat-icon.blue   { background: rgba(56,139,253,.12); }
.adm-stat-icon.pink   { background: rgba(219,97,162,.12); }
.adm-stat-icon.amber  { background: rgba(210,153,34,.12); }
.adm-stat-icon.teal   { background: rgba(34,197,196,.12); }
.adm-stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 4px; }
.adm-stat-label { font-size: 12px; color: #8b949e; font-weight: 500; }

.adm-section-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #8b949e; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
.adm-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.adm-action-btn { display: flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 12px; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .18s; border: 1px solid transparent; }
.adm-action-btn.export { background: #1c2e1c; border-color: #2f8b09; color: #6ddd1e; }
.adm-action-btn.export:hover { background: #2f8b09; color: #fff; }
.adm-action-btn.reset { background: #2d1515; border-color: #b91c1c; color: #f87171; }
.adm-action-btn.reset:hover { background: #b91c1c; color: #fff; }
.adm-action-btn:disabled { opacity: .45; cursor: not-allowed; }

.adm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.adm-modal { background: #161b22; border: 1px solid #30363d; border-radius: 20px; padding: 32px 28px; max-width: 400px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,.5); }
.adm-modal-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(185,28,28,.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
.adm-modal-title { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 10px; }
.adm-modal-body { font-size: 13.5px; color: #8b949e; text-align: center; line-height: 1.65; margin-bottom: 24px; }
.adm-modal-body strong { color: #f87171; }
.adm-modal-btns { display: flex; gap: 10px; }
.adm-modal-cancel { flex: 1; padding: 13px; border-radius: 12px; background: #21262d; border: 1px solid #30363d; color: #8b949e; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .15s; }
.adm-modal-cancel:hover { border-color: #8b949e; color: #e6edf3; }
.adm-modal-confirm { flex: 1; padding: 13px; border-radius: 12px; background: #b91c1c; border: none; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .15s; }
.adm-modal-confirm:hover { background: #dc2626; }

.adm-toast { position: fixed; bottom: 28px; right: 28px; background: #161b22; border: 1px solid #30363d; border-radius: 14px; padding: 14px 20px; display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 600; color: #e6edf3; box-shadow: 0 8px 32px rgba(0,0,0,.4); animation: slideIn .3s ease; z-index: 200; }
.adm-toast.success { border-color: #2f8b09; }
.adm-toast.error   { border-color: #b91c1c; }
@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.adm-table-wrap { background: #161b22; border: 1px solid #21262d; border-radius: 18px; overflow: hidden; margin-bottom: 24px; }
.adm-table-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #21262d; flex-wrap: wrap; gap: 10px; }
.adm-table-head-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
.adm-search { background: #0d1117; border: 1px solid #30363d; border-radius: 10px; padding: 8px 14px; color: #e6edf3; font-size: 13px; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; width: 200px; transition: border-color .18s; }
.adm-search:focus { border-color: #2f8b09; }
.adm-search::placeholder { color: #484f58; }

table { width: 100%; border-collapse: collapse; }
thead th { padding: 10px 22px; text-align: left; font-size: 11px; font-weight: 600; color: #8b949e; letter-spacing: .8px; text-transform: uppercase; background: #0d1117; border-bottom: 1px solid #21262d; cursor: pointer; user-select: none; }
thead th:hover { color: #e6edf3; }
tbody tr { border-bottom: 1px solid #21262d; transition: background .12s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(255,255,255,.025); }
tbody td { padding: 13px 22px; font-size: 13.5px; color: #c9d1d9; font-weight: 500; }
.adm-badge-genre { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; font-size: 11.5px; font-weight: 700; }
.adm-badge-genre.homme { background: rgba(56,139,253,.1); color: #79c0ff; }
.adm-badge-genre.femme { background: rgba(219,97,162,.1); color: #f778ba; }
.adm-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8b949e; }
.adm-delete-row { background: none; border: none; color: #484f58; cursor: pointer; padding: 5px; border-radius: 6px; transition: color .15s, background .15s; display: flex; align-items: center; }
.adm-delete-row:hover { color: #f87171; background: rgba(185,28,28,.1); }
.adm-empty { text-align: center; padding: 48px; color: #484f58; font-size: 14px; }

.adm-pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid #21262d; font-size: 12.5px; color: #8b949e; }
.adm-page-btns { display: flex; gap: 6px; }
.adm-page-btn { padding: 5px 12px; border-radius: 8px; background: #21262d; border: 1px solid #30363d; color: #8b949e; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif; }
.adm-page-btn:hover:not(:disabled) { border-color: #2f8b09; color: #6ddd1e; }
.adm-page-btn:disabled { opacity: .35; cursor: not-allowed; }
.adm-page-btn.active { background: #2f8b09; border-color: #2f8b09; color: #fff; }

.adm-feed-wrap { background: #161b22; border: 1px solid #21262d; border-radius: 18px; overflow: hidden; }
.adm-feed-head { padding: 16px 22px; border-bottom: 1px solid #21262d; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
.adm-feed-item { display: flex; align-items: center; gap: 12px; padding: 12px 22px; border-bottom: 1px solid #21262d; font-size: 13px; }
.adm-feed-item:last-child { border-bottom: none; }
.adm-feed-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.adm-feed-dot.homme { background: #388bfd; }
.adm-feed-dot.femme { background: #d961a2; }
.adm-feed-name { font-weight: 600; color: #e6edf3; flex: 1; }
.adm-feed-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #484f58; }
`

const PER_PAGE = 10

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return `il y a ${Math.floor(diff)}s`
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return `il y a ${Math.floor(diff / 86400)}j`
}

export default function AdminDashboard() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [stats, setStats]               = useState<Stats>({ total: 0, hommes: 0, femmes: 0, today: 0, lastHour: 0 })
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [search, setSearch]             = useState('')
  const [sortField, setSortField]       = useState<'first name' | 'genre' | 'date_inscription'>('date_inscription')
  const [sortAsc, setSortAsc]           = useState(false)
  const [page, setPage]                 = useState(1)
  const [showReset, setShowReset]       = useState(false)
  const [resetting, setResetting]       = useState(false)
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .order('date_inscription', { ascending: false })

      if (error) throw error

      const list = (data || []) as Participant[]
      setParticipants(list)

      const now   = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const hour  = new Date(now.getTime() - 3_600_000)

      setStats({
        total:    list.length,
        hommes:   list.filter(p => p.genre === 'homme').length,
        femmes:   list.filter(p => p.genre === 'femme').length,
        today:    list.filter(p => new Date(p.date_inscription) >= today).length,
        lastHour: list.filter(p => new Date(p.date_inscription) >= hour).length,
      })
    } catch (err) {
      console.error(err)
      showToast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const deleteOne = async (id: string, prenom: string) => {
    if (!confirm(`Supprimer ${prenom} ?`)) return
    const { error } = await supabase.from('utilisateurs').delete().eq('id', id)
    if (error) { showToast('Erreur suppression', 'error'); return }
    showToast(`${prenom} supprimé`)
    fetchAll()
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const { error } = await supabase
        .from('utilisateurs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      setParticipants([])
      setStats({ total: 0, hommes: 0, femmes: 0, today: 0, lastHour: 0 })
      setShowReset(false)
      showToast('Base réinitialisée avec succès ✓')
    } catch {
      showToast('Erreur lors de la réinitialisation', 'error')
    } finally {
      setResetting(false)
    }
  }

  const exportCSV = () => {
    const header = 'Prénom,Nom complet,Genre,Duo,Date inscription'
    const rows   = participants.map(p =>
      `"${p["first name"]}","${p.full_name}","${p.genre}","${p.duo_prenom ?? ''}","${formatDate(p.date_inscription)}"`
    )
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `jef2026-participants-${Date.now()}.csv`
    a.click()
    showToast(`Export CSV · ${participants.length} participants`)
  }

  const handleSort = (field: 'first name' | 'genre' | 'date_inscription') => {
    if (field === sortField) setSortAsc(v => !v)
    else { setSortField(field); setSortAsc(true) }
    setPage(1)
  }

  const filtered = participants
    .filter(p =>
      p["first name"].toLowerCase().includes(search.toLowerCase()) ||
      p.full_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = String(a[sortField] ?? '')
      const vb = String(b[sortField] ?? '')
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const SortIcon = ({ field }: { field: 'first name' | 'genre' | 'date_inscription' }) =>
    sortField === field
      ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
      : null

  return (
    <>
      <style>{css}</style>
      <div className="adm-root">
        <div className="adm-inner">

          {/* TOP BAR */}
          <div className="adm-topbar">
            <div className="adm-brand">
              <div className="adm-brand-dot" />
              <div>
                <div className="adm-brand-title">Dashboard JEF 2026</div>
                <div className="adm-brand-sub">ADMIN · RÉNATO TCHOBO</div>
              </div>
            </div>
            <button
              className={`adm-refresh-btn${refreshing ? ' spinning' : ''}`}
              onClick={() => fetchAll(true)}
            >
              <RefreshCw size={14} />
              {refreshing ? 'Actualisation…' : 'Actualiser'}
            </button>
          </div>

          {/* STATS */}
          <div className="adm-stats">
            <div className="adm-stat">
              <div className="adm-stat-icon green"><Users size={18} color="#2f8b09" /></div>
              <div className="adm-stat-value">{stats.total}</div>
              <div className="adm-stat-label">Total participants</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-icon blue"><UserCheck size={18} color="#388bfd" /></div>
              <div className="adm-stat-value">{stats.hommes}</div>
              <div className="adm-stat-label">Gars</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-icon pink"><UserX size={18} color="#d961a2" /></div>
              <div className="adm-stat-value">{stats.femmes}</div>
              <div className="adm-stat-label">Go</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-icon amber"><TrendingUp size={18} color="#d29922" /></div>
              <div className="adm-stat-value">{stats.today}</div>
              <div className="adm-stat-label">Aujourd'hui</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-icon teal"><Zap size={18} color="#22c5c4" /></div>
              <div className="adm-stat-value">{stats.lastHour}</div>
              <div className="adm-stat-label">Cette heure</div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="adm-section-title">Actions rapides</div>
          <div className="adm-actions">
            <button className="adm-action-btn export" onClick={exportCSV}
              disabled={participants.length === 0}>
              <Download size={15} /> Exporter CSV ({participants.length})
            </button>
            <button className="adm-action-btn reset" onClick={() => setShowReset(true)}
              disabled={participants.length === 0}>
              <Trash2 size={15} /> Réinitialiser la base
            </button>
          </div>

          {/* TABLE */}
          <div className="adm-table-wrap">
            <div className="adm-table-head">
              <div className="adm-table-head-title">
                <Activity size={16} color="#2f8b09" />
                Participants
                <span style={{ background: '#21262d', borderRadius: 6, padding: '2px 8px', fontSize: 12, color: '#8b949e' }}>
                  {filtered.length}
                </span>
              </div>
              <input
                className="adm-search"
                placeholder="Rechercher…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            {loading ? (
              <div className="adm-empty">Chargement…</div>
            ) : paginated.length === 0 ? (
              <div className="adm-empty">Aucun participant trouvé</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('first name')}>Prénom <SortIcon field="first name" /></th>
                    <th>Nom complet</th>
                    <th onClick={() => handleSort('genre')}>Genre <SortIcon field="genre" /></th>
                    <th>Duo</th>
                    <th onClick={() => handleSort('date_inscription')}>Inscrit <SortIcon field="date_inscription" /></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: '#e6edf3' }}>{p["first name"]}</td>
                      <td>{p.full_name}</td>
                      <td>
                        <span className={`adm-badge-genre ${p.genre}`}>
                          {p.genre === 'homme' ? '💪 Gars' : '💅 Go'}
                        </span>
                      </td>
                      <td style={{ color: p.duo_prenom ? '#6ddd1e' : '#484f58', fontSize: 13 }}>
                        {p.duo_prenom ?? '—'}
                      </td>
                      <td className="adm-mono">{formatDate(p.date_inscription)}</td>
                      <td>
                        <button className="adm-delete-row"
                          onClick={() => deleteOne(p.id, p["first name"])}
                          title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filtered.length > PER_PAGE && (
              <div className="adm-pagination">
                <span>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}</span>
                <div className="adm-page-btns">
                  <button className="adm-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .map((n, i, arr) => (
                      <>
                        {i > 0 && arr[i - 1] !== n - 1 && (
                          <span key={`d${n}`} style={{ color: '#484f58', padding: '0 4px' }}>…</span>
                        )}
                        <button key={n}
                          className={`adm-page-btn${n === page ? ' active' : ''}`}
                          onClick={() => setPage(n)}>{n}</button>
                      </>
                    ))}
                  <button className="adm-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVITÉ RÉCENTE */}
          {participants.length > 0 && (
            <div className="adm-feed-wrap">
              <div className="adm-feed-head">
                <Clock size={15} color="#2f8b09" /> Activité récente
              </div>
              {participants.slice(0, 8).map(p => (
                <div key={p.id} className="adm-feed-item">
                  <div className={`adm-feed-dot ${p.genre}`} />
                  <div className="adm-feed-name">
                    {p["first name"]}&nbsp;
                    <span style={{ color: '#8b949e', fontWeight: 400, fontSize: 12 }}>
                      {p.genre === 'homme' ? '💪' : '💅'}
                    </span>
                  </div>
                  <div className="adm-feed-time">{timeAgo(p.date_inscription)}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODAL RESET */}
      {showReset && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-icon"><AlertTriangle size={26} color="#f87171" /></div>
            <div className="adm-modal-title">Réinitialiser la base ?</div>
            <div className="adm-modal-body">
              Cette action va <strong>supprimer définitivement</strong> les{' '}
              <strong>{stats.total} participants</strong> enregistrés.
              Cette opération est <strong>irréversible</strong>.
            </div>
            <div className="adm-modal-btns">
              <button className="adm-modal-cancel" onClick={() => setShowReset(false)}>Annuler</button>
              <button className="adm-modal-confirm" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Suppression…' : '🗑️ Tout supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`adm-toast ${toast.type}`}>
          {toast.type === 'success'
            ? <CheckCircle size={16} color="#2f8b09" />
            : <AlertTriangle size={16} color="#f87171" />}
          {toast.msg}
        </div>
      )}
    </>
  )
}