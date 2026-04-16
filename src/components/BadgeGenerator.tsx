'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getSurnomAleatoire } from '@/lib/surnoms'
import BadgeCanvas from './BadgeCanvas'
import {
  Camera, Share2, Download, RefreshCw,
  CheckCircle2, Sparkles, Trophy, Users, Zap, Clock
} from 'lucide-react'

function sanitize(str: string): string {
  return str.replace(/[<>&"'\/\\]/g, '').trim().slice(0, 60)
}

const DUO_INDISPO = '__INDISPO__'

const LS = {
  id:        'jef_user_id',
  prenom:    'jef_prenom',
  nom:       'jef_nom',
  genre:     'jef_genre',
  surnom:    'jef_surnom',
  duoSurnom: 'jef_duo_surnom',
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.jef-root { min-height: 100vh; background: #edf7e8; padding: 20px 16px 56px; font-family: 'Plus Jakarta Sans', sans-serif; }
.jef-inner { max-width: 460px; margin: 0 auto; }

.jef-hero { position: relative; background: #1a6e00; border-radius: 28px; overflow: hidden; padding: 30px 26px 24px; margin-bottom: 16px; box-shadow: 0 12px 40px rgba(26,110,0,.22); }
.jef-hero::after { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; background: rgba(255,255,255,.04); border-radius: 50%; }
.jef-hero-eyebrow { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 100px; padding: 4px 13px; font-size: 10.5px; font-weight: 600; letter-spacing: .9px; text-transform: uppercase; color: rgba(255,255,255,.85); margin-bottom: 14px; }
.jef-hero-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 900; color: #fff; line-height: 1.15; letter-spacing: -.3px; margin-bottom: 4px; }
.jef-hero-route { font-size: 12.5px; color: rgba(255,255,255,.55); margin-bottom: 22px; font-weight: 500; }
.jef-creator { display: flex; align-items: center; gap: 11px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.12); }
.jef-creator-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.3); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.jef-creator-info { flex: 1; line-height: 1.35; }
.jef-creator-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13.5px; color: #fff; }
.jef-creator-role { font-size: 11px; color: rgba(255,255,255,.5); font-style: italic; }
.jef-creator-dot { width: 8px; height: 8px; border-radius: 50%; background: #6ddd1e; box-shadow: 0 0 0 3px rgba(109,221,30,.25); flex-shrink: 0; animation: blink 2.2s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.35; } }

.jef-banner { background: #fff; border-radius: 22px; padding: 20px 22px; margin-bottom: 16px; border-left: 5px solid #2f8b09; box-shadow: 0 3px 16px rgba(0,0,0,.05); }
.jef-banner-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.jef-banner-icon { width: 40px; height: 40px; border-radius: 12px; background: #f0fae8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.jef-banner-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #1a6e00; }
.jef-banner-body { font-size: 13px; line-height: 1.7; color: #555; margin-bottom: 14px; }
.jef-banner-body strong { color: #1a6e00; }
.jef-steps { display: flex; gap: 7px; flex-wrap: wrap; }
.jef-step { display: flex; align-items: center; gap: 5px; background: #f0fae8; border: 1px solid #c8e8b4; border-radius: 100px; padding: 5px 12px; font-size: 11.5px; font-weight: 600; color: #2f8b09; }

.jef-card { background: #fff; border-radius: 26px; padding: 28px 22px 26px; box-shadow: 0 6px 28px rgba(0,0,0,.06); margin-bottom: 16px; }
.jef-card-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #1a6e00; text-align: center; margin-bottom: 24px; }

.jef-returning { background: #f0fae8; border: 2px solid #2f8b09; border-radius: 20px; padding: 20px 18px; margin-bottom: 20px; text-align: center; }
.jef-returning-emoji { font-size: 32px; margin-bottom: 8px; }
.jef-returning-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #1a6e00; margin-bottom: 6px; }
.jef-returning-body { font-size: 13px; color: #3a6e1a; line-height: 1.6; }
.jef-returning-body strong { color: #1a6e00; }

.jef-alert-duo { background: #fff8e8; border: 2px solid #f59e0b; border-radius: 16px; padding: 16px 18px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 12px; }
.jef-alert-duo-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.jef-alert-duo-text { font-size: 13px; color: #92400e; line-height: 1.6; }
.jef-alert-duo-text strong { color: #78350f; }

.jef-photo-label { display: block; cursor: pointer; margin-bottom: 18px; }
.jef-photo-zone { border: 2px dashed #b8dda4; border-radius: 20px; padding: 26px; text-align: center; background: #f8fdf5; transition: border-color .2s, background .2s; }
.jef-photo-zone:hover { border-color: #2f8b09; background: #f1fce8; }
.jef-photo-preview { width: 132px; height: 132px; border-radius: 50%; object-fit: cover; border: 4px solid #2f8b09; display: block; margin: 0 auto; }
.jef-photo-cta { color: #2f8b09; font-weight: 700; font-size: 15px; margin-top: 10px; }
.jef-photo-hint { color: #b0b0b0; font-size: 12px; margin-top: 4px; }

.jef-field { width: 100%; padding: 15px 18px; border: 2px solid #efefef; border-radius: 14px; font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; color: #222; outline: none; transition: border-color .2s; margin-bottom: 12px; background: #fafafa; }
.jef-field:focus { border-color: #2f8b09; background: #fff; }
.jef-field::placeholder { color: #ccc; }

.jef-genre-row { display: flex; gap: 10px; margin-bottom: 20px; }
.jef-genre-btn { flex: 1; padding: 15px 8px; border-radius: 14px; border: 2px solid #efefef; background: #fafafa; color: #777; font-weight: 700; font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .18s; }
.jef-genre-btn:hover { border-color: #b8dda4; }
.jef-genre-btn.active { border-color: #2f8b09; background: #2f8b09; color: #fff; }

.jef-consent-wrap { display: flex; align-items: flex-start; gap: 13px; background: #f8fdf5; border: 1.5px solid #c8e8b4; border-radius: 16px; padding: 16px 18px; margin-bottom: 22px; cursor: pointer; transition: border-color .2s, background .2s; }
.jef-consent-wrap:hover { border-color: #2f8b09; }
.jef-consent-wrap.checked { border-color: #2f8b09; background: #edfae3; }
.jef-check-box { width: 24px; height: 24px; border-radius: 8px; border: 2px solid #c0ddb0; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; transition: all .18s; }
.jef-check-box.checked { background: #2f8b09; border-color: #2f8b09; }
.jef-consent-text { font-size: 12.5px; line-height: 1.65; color: #666; }
.jef-consent-text strong { color: #1a6e00; }

.jef-cta { width: 100%; padding: 19px; border-radius: 16px; border: none; background: #2f8b09; color: #fff; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 17px; letter-spacing: .2px; cursor: pointer; box-shadow: 0 8px 24px rgba(47,139,9,.28); transition: transform .15s, box-shadow .15s, background .15s; }
.jef-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(47,139,9,.35); }
.jef-cta:active:not(:disabled) { transform: translateY(0); }
.jef-cta:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }

.jef-badge-frame { border-radius: 18px; overflow: hidden; border: 1px solid #eee; margin-bottom: 18px; }
.jef-actions { display: flex; gap: 10px; margin-bottom: 20px; }
.jef-btn-dl { flex: 1; padding: 15px; border-radius: 14px; background: #2f8b09; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: opacity .2s; }
.jef-btn-dl:hover { opacity: .88; }
.jef-btn-wa { flex: 1; padding: 15px; border-radius: 14px; background: #25D366; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: opacity .2s; }
.jef-btn-wa:hover { opacity: .88; }

.jef-duo { background: #f8fdf5; border: 2px dashed #b8dda4; border-radius: 22px; padding: 20px; margin-bottom: 16px; }
.jef-duo-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #2f8b09; text-align: center; margin-bottom: 14px; }
.jef-btn-duo { width: 100%; padding: 14px; border-radius: 12px; background: #1a6e00; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: opacity .2s; }
.jef-btn-duo:hover:not(:disabled) { opacity: .88; }
.jef-btn-duo:disabled { opacity: .45; cursor: not-allowed; }
.jef-btn-duo-dl { width: 100%; margin-top: 10px; background: none; border: none; color: #2f8b09; font-size: 12.5px; font-weight: 700; cursor: pointer; text-decoration: underline; font-family: 'Plus Jakarta Sans', sans-serif; }

.jef-duo-indispo { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 16px; padding: 22px 18px; text-align: center; margin-bottom: 14px; }
.jef-duo-indispo-emoji { font-size: 36px; margin-bottom: 10px; }
.jef-duo-indispo-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #92400e; margin-bottom: 8px; }
.jef-duo-indispo-body { font-size: 13px; color: #78350f; line-height: 1.65; margin-bottom: 14px; }
.jef-duo-indispo-body strong { color: #b45309; }
.jef-btn-retry { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; background: #f59e0b; border: none; color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity .2s; }
.jef-btn-retry:hover:not(:disabled) { opacity: .88; }
.jef-btn-retry:disabled { opacity: .5; cursor: not-allowed; }

.jef-loading { text-align: center; padding: 48px 24px; }
.jef-loading-spinner { width: 40px; height: 40px; border: 3px solid #c8e8b4; border-top-color: #2f8b09; border-radius: 50%; margin: 0 auto 16px; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.jef-loading-text { font-size: 14px; color: #888; }

.jef-btn-reset { width: 100%; padding: 15px; border-radius: 14px; background: transparent; color: #2f8b09; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; border: 2px solid #2f8b09; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background .18s, color .18s; }
.jef-btn-reset:hover { background: #2f8b09; color: #fff; }

.jef-footer { text-align: center; font-size: 11.5px; color: #90b880; line-height: 1.7; margin-top: 6px; }
.jef-footer strong { color: #2f8b09; }
`

export default function BadgeGenerator() {
  const [photo, setPhoto]                 = useState<string | null>(null)
  const [nom, setNom]                     = useState('')
  const [prenom, setPrenom]               = useState('')
  const [genre, setGenre]                 = useState<'homme' | 'femme' | null>(null)
  const [surnom, setSurnom]               = useState('')
  const [duoSurnom, setDuoSurnom]         = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentPrenom, setCurrentPrenom] = useState('')
  const [loading, setLoading]             = useState(false)
  const [duoLoading, setDuoLoading]       = useState(false)
  const [duoLocked, setDuoLocked]         = useState(false)
  const [step, setStep]                   = useState<'form' | 'badge'>('form')
  const [consented, setConsented]         = useState(false)
  const [restoring, setRestoring]         = useState(true)
  const [isReturning, setIsReturning]     = useState(false)

  const canvasRef    = useRef<HTMLCanvasElement | null>(null)
  const duoCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // ── Restauration au chargement depuis localStorage + Supabase ────────────
  useEffect(() => {
    const savedId = localStorage.getItem(LS.id)
    if (!savedId) { setRestoring(false); return }

    supabase
      .from('utilisateurs')
      .select('id, prenom, nom_complet, genre, surnom, duo_prenom')
      .eq('id', savedId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          Object.values(LS).forEach(k => localStorage.removeItem(k))
          setRestoring(false)
          return
        }
        applyProfile(data, false)
        setRestoring(false)
      })
  }, [])

  // ── Applique un profil à l'état React ────────────────────────────────────
  const applyProfile = (data: any, returning: boolean) => {
    setCurrentUserId(data.id)
    setCurrentPrenom(data.prenom)
    setPrenom(data.prenom)
    setNom(data.nom_complet.replace(data.prenom + ' ', '').trim())
    setGenre(data.genre as 'homme' | 'femme')
    setSurnom(data.surnom ?? '')
    setIsReturning(returning)

    localStorage.setItem(LS.id,     data.id)
    localStorage.setItem(LS.prenom, data.prenom)
    localStorage.setItem(LS.surnom, data.surnom ?? '')
    localStorage.setItem(LS.genre,  data.genre)

    if (data.duo_prenom) {
      const prefix   = data.genre === 'homme' ? 'LE GARS DE ' : 'LA GO DE '
      const duoLabel = prefix + data.duo_prenom.toUpperCase()
      setDuoSurnom(duoLabel)
      setDuoLocked(true)
      localStorage.setItem(LS.duoSurnom, duoLabel)
    } else {
      setDuoSurnom('')
      setDuoLocked(false)
    }

    setStep('badge')
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Génération via fonction SQL atomique ─────────────────────────────────
  const handleGenerer = async () => {
    if (!photo || !nom || !prenom || !genre) {
      alert('Remplis tous les champs et ajoute ta photo !')
      return
    }
    if (!consented) {
      alert('Merci d\'accepter les conditions avant de continuer.')
      return
    }
    setLoading(true)
    try {
      const nomClean    = sanitize(nom)
      const prenomClean = sanitize(prenom)
      const nomComplet  = `${prenomClean} ${nomClean}`
      const nouveauSurnom = getSurnomAleatoire(genre)

      // Appel à la fonction SQL atomique — gère doublon en une seule transaction
      const { data, error } = await supabase.rpc('inscrire_participant', {
        p_nom_complet: nomComplet,
        p_prenom:      prenomClean,
        p_genre:       genre,
        p_surnom:      nouveauSurnom,
      })

      if (error) throw error

      const result = data?.[0]
      if (!result) throw new Error('Pas de résultat')

      // is_new = false → personne déjà inscrite
      applyProfile(result, !result.is_new)

    } catch (err) {
      console.error(err)
      alert('Erreur lors de la génération. Réessaie !')
    } finally {
      setLoading(false)
    }
  }

  // ── Tirage via fonction SQL atomique ─────────────────────────────────────
  const handleDuo = async () => {
    if (duoLocked) return          // 🔒 verrou absolu côté React
    if (!genre || !currentUserId) return

    setDuoLocked(true)             // 🔒 verrouille immédiatement
    setDuoLoading(true)
    try {
      // Appel à la fonction SQL atomique avec verrou FOR UPDATE SKIP LOCKED
      const { data, error } = await supabase.rpc('tirer_binome', {
        p_user_id: currentUserId,
        p_genre:   genre,
        p_prenom:  currentPrenom,
      })

      if (error) throw error

      const result = data?.[0]

      if (!result || !result.binome_prenom) {
        // Aucun binôme disponible
        setDuoLocked(false)
        setDuoSurnom(DUO_INDISPO)
        return
      }

      const prefix    = genre === 'homme' ? 'LE GARS DE ' : 'LA GO DE '
      const surnomDuo = prefix + result.binome_prenom.toUpperCase()

      localStorage.setItem(LS.duoSurnom, surnomDuo)
      setDuoSurnom(surnomDuo)
      // duoLocked reste true → définitif

    } catch (err) {
      console.error(err)
      setDuoLocked(false)
      alert('Erreur lors du duo. Réessaie !')
    } finally {
      setDuoLoading(false)
    }
  }

  const handleRetryDuo = async () => {
    if (duoLocked) return
    setDuoSurnom('')
    await handleDuo()
  }

  const handleDownload = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return
    const a = document.createElement('a')
    a.download = filename
    a.href = canvas.toDataURL('image/png', 1.0)
    a.click()
  }

  const handleReset = () => {
    Object.values(LS).forEach(k => localStorage.removeItem(k))
    setStep('form'); setSurnom(''); setDuoSurnom('')
    setCurrentUserId(null); setCurrentPrenom('')
    setDuoLocked(false); setPhoto(null)
    setPrenom(''); setNom(''); setGenre(null)
    setConsented(false); setIsReturning(false)
  }

  const duoTrouve  = duoSurnom && duoSurnom !== DUO_INDISPO
  const duoIndispo = duoSurnom === DUO_INDISPO

  // ── Chargement initial ───────────────────────────────────────────────────
  if (restoring) {
    return (
      <>
        <style>{css}</style>
        <div className="jef-root">
          <div className="jef-inner">
            <div className="jef-card" style={{ marginTop: 60 }}>
              <div className="jef-loading">
                <div className="jef-loading-spinner" />
                <div className="jef-loading-text">Chargement de ton badge…</div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="jef-root">
        <div className="jef-inner">

          {/* ════════ HERO ════════ */}
          <div className="jef-hero">
            <div className="jef-hero-eyebrow">
              <Sparkles size={9} /> FLLAC · UAC · Ouidah → Grand‑Popo
            </div>
            <div className="jef-hero-title">JEF 2026 :<br />Le Rendez‑vous de l'Année</div>
            <div className="jef-hero-route">Journée de l'Étudiant de la FLLAC</div>
            <div className="jef-creator">
              <div className="jef-creator-avatar">RT</div>
              <div className="jef-creator-info">
                <div className="jef-creator-name">Rénato TCHOBO</div>
                <div className="jef-creator-role">Développeur web & mobile · Créateur digital</div>
              </div>
              <div className="jef-creator-dot" title="En ligne" />
            </div>
          </div>

          {/* ════════ CHALLENGE ════════ */}
          <div className="jef-banner">
            <div className="jef-banner-head">
              <div className="jef-banner-icon"><Trophy size={21} color="#2f8b09" /></div>
              <div className="jef-banner-title">🎯 Le Challenge JEF 2026</div>
            </div>
            <div className="jef-banner-body">
              C'est le <strong>jeu viral de la JEF 2026</strong> ! Génère ton surnom officiel,
              télécharge ton badge et partage-le autour de toi. Chaque participant
              reçoit un surnom unique — et peut découvrir son <strong>duo mystère exclusif</strong>.
              Qui sera ton binôme JEF ? 👀
            </div>
            <div className="jef-steps">
              <span className="jef-step"><Camera size={11} /> Ajoute ta photo</span>
              <span className="jef-step"><Zap size={11} /> Reçois ton surnom</span>
              <span className="jef-step"><Share2 size={11} /> Partage</span>
              <span className="jef-step"><Users size={11} /> Duo mystère</span>
            </div>
          </div>

          {/* ════════ FORM ════════ */}
          {step === 'form' ? (
            <div className="jef-card">
              <div className="jef-card-title">Génère ton surnom JEF 🏷️</div>

              <label className="jef-photo-label">
                <div className="jef-photo-zone">
                  {photo ? (
                    <img src={photo} alt="preview" className="jef-photo-preview" />
                  ) : (
                    <>
                      <Camera size={46} color="#2f8b09" strokeWidth={1.4} style={{ margin: '0 auto' }} />
                      <div className="jef-photo-cta">Clique pour ajouter ta photo</div>
                      <div className="jef-photo-hint">Portrait JPG / PNG recommandé</div>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>

              <input className="jef-field" type="text" placeholder="Ton prénom"
                value={prenom} onChange={e => setPrenom(e.target.value)} />
              <input className="jef-field" type="text" placeholder="Ton nom de famille"
                value={nom} onChange={e => setNom(e.target.value)} style={{ marginBottom: 20 }} />

              <div className="jef-genre-row">
                <button className={`jef-genre-btn${genre === 'homme' ? ' active' : ''}`}
                  onClick={() => setGenre('homme')}>💪 Je suis un gars</button>
                <button className={`jef-genre-btn${genre === 'femme' ? ' active' : ''}`}
                  onClick={() => setGenre('femme')}>💅 Je suis une go</button>
              </div>

              <div className={`jef-consent-wrap${consented ? ' checked' : ''}`}
                onClick={() => setConsented(v => !v)}>
                <div className={`jef-check-box${consented ? ' checked' : ''}`}>
                  {consented && (
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="jef-consent-text">
                  <CheckCircle2 size={13} color="#2f8b09"
                    style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                  J'accepte que mon <strong>prénom et mon genre</strong> soient enregistrés dans le
                  cadre de ce <strong>jeu challenge JEF 2026</strong>. Ces données sont utilisées
                  uniquement pour la fonctionnalité Duo Mystère et ne seront jamais partagées à des
                  tiers. Ma participation est <strong>volontaire</strong>.
                </div>
              </div>

              <button className="jef-cta" onClick={handleGenerer} disabled={loading || !consented}>
                {loading ? '⏳ Vérification en cours…' : '⚡ GÉNÉRER MON SURNOM JEF'}
              </button>
            </div>

          ) : (

            /* ════════ BADGE STEP ════════ */
            <div className="jef-card">

              {/* Message retour utilisateur */}
              {isReturning && (
                <div className="jef-returning">
                  <div className="jef-returning-emoji">🎉</div>
                  <div className="jef-returning-title">
                    Bienvenue à nouveau, {currentPrenom} !
                  </div>
                  <div className="jef-returning-body">
                    Tu as déjà généré ton surnom JEF 2026.
                    Voici ton badge — il ne changera jamais. 🔒
                    {duoTrouve
                      ? <><br /><strong>Ton binôme est déjà trouvé !</strong> Télécharge ton badge duo ci-dessous.</>
                      : <><br />Tu n'as pas encore de binôme — <strong>trouve-le maintenant !</strong> 👇</>
                    }
                  </div>
                </div>
              )}

              <div className="jef-card-title">
                {isReturning ? '🏷️ Ton badge JEF 2026' : '🎉 Ton badge JEF 2026 !'}
              </div>

              <div className="jef-badge-frame">
                <BadgeCanvas photo={photo} nom={`${prenom} ${nom}`} surnom={surnom}
                  visible={true} onReady={c => { canvasRef.current = c }} />
              </div>

              <div className="jef-actions">
                <button className="jef-btn-dl"
                  onClick={() => handleDownload(canvasRef.current, `badge-jef-${prenom}.png`)}>
                  <Download size={16} /> Télécharger
                </button>
                <button className="jef-btn-wa"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Mon badge JEF 2026 ! 🎓 #JEF2026 #FLLAC')}`)}>
                  <Share2 size={16} /> WhatsApp
                </button>
              </div>

              {/* ── Duo mystère ── */}
              <div className="jef-duo">
                <div className="jef-duo-title">💞 Duo Mystère JEF</div>

                {/* Alerte pas encore de binôme */}
                {isReturning && !duoTrouve && !duoIndispo && (
                  <div className="jef-alert-duo">
                    <div className="jef-alert-duo-icon">⚡</div>
                    <div className="jef-alert-duo-text">
                      Tu n'as pas encore de binôme !<br />
                      <strong>Clique ci-dessous pour trouver ton duo mystère JEF.</strong>
                    </div>
                  </div>
                )}

                {/* Duo trouvé — définitif */}
                {duoTrouve && (
                  <>
                    <div className="jef-badge-frame">
                      <BadgeCanvas photo={photo} nom={`${prenom} ${nom}`} surnom={duoSurnom}
                        visible={true} onReady={c => { duoCanvasRef.current = c }} />
                    </div>
                    <button className="jef-btn-duo-dl"
                      onClick={() => handleDownload(duoCanvasRef.current, `duo-jef-${prenom}.png`)}>
                      ↓ Télécharger le badge Duo
                    </button>
                  </>
                )}

                {/* Aucun binôme dispo */}
                {duoIndispo && (
                  <div className="jef-duo-indispo">
                    <div className="jef-duo-indispo-emoji">⏳</div>
                    <div className="jef-duo-indispo-title">
                      Pas de binôme dispo pour l'instant !
                    </div>
                    <div className="jef-duo-indispo-body">
                      Les inscriptions arrivent <strong>au fur et à mesure</strong> 🔥<br />
                      Reviens dans quelques minutes —{' '}
                      <strong>ton binôme JEF t'attend peut-être déjà !</strong>
                    </div>
                    <button className="jef-btn-retry" onClick={handleRetryDuo} disabled={duoLoading}>
                      <Clock size={13} />
                      {duoLoading ? 'Recherche…' : 'Réessayer'}
                    </button>
                  </div>
                )}

                {/* Bouton initial */}
                {!duoTrouve && !duoIndispo && (
                  <button className="jef-btn-duo" onClick={handleDuo} disabled={duoLoading}>
                    {duoLoading ? '🔍 Recherche…' : '🎲 Trouver mon binôme'}
                  </button>
                )}
              </div>

              <button className="jef-btn-reset" onClick={handleReset}>
                <RefreshCw size={14} /> Recommencer
              </button>
            </div>
          )}

          {/* ════════ FOOTER ════════ */}
          <div className="jef-footer">
            Plateforme JEF 2026 · Conçue &amp; mise en ligne par{' '}
            <strong>Rénato TCHOBO</strong><br />
            Développeur web &amp; mobile · Créateur digital
          </div>

        </div>
      </div>
    </>
  )
}