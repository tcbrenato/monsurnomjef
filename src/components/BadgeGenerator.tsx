'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getSurnomAleatoire } from '@/lib/surnoms'
import BadgeCanvas from './BadgeCanvas'
import { Camera, Share2, Download, RefreshCw, CheckCircle2, Sparkles, Trophy, Users, Code2, Zap } from 'lucide-react'

function sanitize(str: string): string {
  return str.replace(/[<>&"'\/\\]/g, '').trim().slice(0, 60)
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.jef-root {
  min-height: 100vh;
  background: #edf7e8;
  padding: 20px 16px 56px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.jef-inner { max-width: 460px; margin: 0 auto; }

/* ── HERO ───────────────────────────────────────────────── */
.jef-hero {
  position: relative;
  background: #1a6e00;
  border-radius: 28px;
  overflow: hidden;
  padding: 30px 26px 24px;
  margin-bottom: 16px;
  box-shadow: 0 12px 40px rgba(26,110,0,.22);
}
.jef-hero::after {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 220px; height: 220px;
  background: rgba(255,255,255,.04);
  border-radius: 50%;
}
.jef-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 100px;
  padding: 4px 13px;
  font-size: 10.5px; font-weight: 600; letter-spacing: .9px;
  text-transform: uppercase; color: rgba(255,255,255,.85);
  margin-bottom: 14px;
}
.jef-hero-title {
  font-family: 'Syne', sans-serif;
  font-size: 24px; font-weight: 900; color: #fff;
  line-height: 1.15; letter-spacing: -.3px;
  margin-bottom: 4px;
}
.jef-hero-route {
  font-size: 12.5px; color: rgba(255,255,255,.55);
  margin-bottom: 22px; font-weight: 500;
}

/* creator strip */
.jef-creator {
  display: flex; align-items: center; gap: 11px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.12);
}
.jef-creator-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  border: 1.5px solid rgba(255,255,255,.3);
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 14px; color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.jef-creator-info { flex: 1; line-height: 1.35; }
.jef-creator-name {
  font-family: 'Syne', sans-serif;
  font-weight: 700; font-size: 13.5px; color: #fff;
}
.jef-creator-role {
  font-size: 11px; color: rgba(255,255,255,.5);
  font-style: italic;
}
.jef-creator-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #6ddd1e;
  box-shadow: 0 0 0 3px rgba(109,221,30,.25);
  flex-shrink: 0;
  animation: blink 2.2s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: .35; }
}

/* ── CHALLENGE BANNER ────────────────────────────────────── */
.jef-banner {
  background: #fff;
  border-radius: 22px;
  padding: 20px 22px;
  margin-bottom: 16px;
  border-left: 5px solid #2f8b09;
  box-shadow: 0 3px 16px rgba(0,0,0,.05);
}
.jef-banner-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 10px;
}
.jef-banner-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: #f0fae8;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.jef-banner-title {
  font-family: 'Syne', sans-serif;
  font-size: 15px; font-weight: 800; color: #1a6e00;
}
.jef-banner-body {
  font-size: 13px; line-height: 1.7; color: #555;
  margin-bottom: 14px;
}
.jef-banner-body strong { color: #1a6e00; }
.jef-steps {
  display: flex; gap: 7px; flex-wrap: wrap;
}
.jef-step {
  display: flex; align-items: center; gap: 5px;
  background: #f0fae8; border: 1px solid #c8e8b4;
  border-radius: 100px; padding: 5px 12px;
  font-size: 11.5px; font-weight: 600; color: #2f8b09;
}

/* ── FORM CARD ────────────────────────────────────────────── */
.jef-card {
  background: #fff;
  border-radius: 26px;
  padding: 28px 22px 26px;
  box-shadow: 0 6px 28px rgba(0,0,0,.06);
  margin-bottom: 16px;
}
.jef-card-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px; font-weight: 800; color: #1a6e00;
  text-align: center; margin-bottom: 24px;
}

/* photo zone */
.jef-photo-label {
  display: block; cursor: pointer; margin-bottom: 18px;
}
.jef-photo-zone {
  border: 2px dashed #b8dda4;
  border-radius: 20px; padding: 26px;
  text-align: center; background: #f8fdf5;
  transition: border-color .2s, background .2s;
}
.jef-photo-zone:hover { border-color: #2f8b09; background: #f1fce8; }
.jef-photo-preview {
  width: 132px; height: 132px; border-radius: 50%;
  object-fit: cover; border: 4px solid #2f8b09;
  display: block; margin: 0 auto;
}
.jef-photo-cta { color: #2f8b09; font-weight: 700; font-size: 15px; margin-top: 10px; }
.jef-photo-hint { color: #b0b0b0; font-size: 12px; margin-top: 4px; }

/* inputs */
.jef-field {
  width: 100%; padding: 15px 18px;
  border: 2px solid #efefef; border-radius: 14px;
  font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500; color: #222; outline: none;
  transition: border-color .2s; margin-bottom: 12px;
  background: #fafafa;
}
.jef-field:focus { border-color: #2f8b09; background: #fff; }
.jef-field::placeholder { color: #ccc; }

/* genre */
.jef-genre-row { display: flex; gap: 10px; margin-bottom: 20px; }
.jef-genre-btn {
  flex: 1; padding: 15px 8px; border-radius: 14px;
  border: 2px solid #efefef; background: #fafafa;
  color: #777; font-weight: 700; font-size: 13.5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer; transition: all .18s;
}
.jef-genre-btn:hover { border-color: #b8dda4; }
.jef-genre-btn.active { border-color: #2f8b09; background: #2f8b09; color: #fff; }

/* ── CONSENT ─────────────────────────────────────────────── */
.jef-consent-wrap {
  display: flex; align-items: flex-start; gap: 13px;
  background: #f8fdf5;
  border: 1.5px solid #c8e8b4;
  border-radius: 16px; padding: 16px 18px;
  margin-bottom: 22px; cursor: pointer;
  transition: border-color .2s, background .2s;
}
.jef-consent-wrap:hover    { border-color: #2f8b09; }
.jef-consent-wrap.checked  { border-color: #2f8b09; background: #edfae3; }

.jef-check-box {
  width: 24px; height: 24px; border-radius: 8px;
  border: 2px solid #c0ddb0; background: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  transition: all .18s;
}
.jef-check-box.checked { background: #2f8b09; border-color: #2f8b09; }

.jef-consent-text { font-size: 12.5px; line-height: 1.65; color: #666; }
.jef-consent-text strong { color: #1a6e00; }
.jef-consent-text .shield {
  display: inline-block; width: 14px; height: 14px;
  vertical-align: middle; margin-right: 4px;
}

/* ── CTA ─────────────────────────────────────────────────── */
.jef-cta {
  width: 100%; padding: 19px;
  border-radius: 16px; border: none;
  background: #2f8b09; color: #fff;
  font-family: 'Syne', sans-serif;
  font-weight: 900; font-size: 17px; letter-spacing: .2px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(47,139,9,.28);
  transition: transform .15s, box-shadow .15s, background .15s;
}
.jef-cta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(47,139,9,.35);
}
.jef-cta:active:not(:disabled) { transform: translateY(0); }
.jef-cta:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }

/* ── BADGE STEP ───────────────────────────────────────────── */
.jef-badge-frame {
  border-radius: 18px; overflow: hidden;
  border: 1px solid #eee; margin-bottom: 18px;
}
.jef-actions { display: flex; gap: 10px; margin-bottom: 20px; }
.jef-btn-dl {
  flex: 1; padding: 15px; border-radius: 14px;
  background: #2f8b09; color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 14px; border: none;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 7px;
  transition: opacity .2s;
}
.jef-btn-dl:hover { opacity: .88; }
.jef-btn-wa {
  flex: 1; padding: 15px; border-radius: 14px;
  background: #25D366; color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 14px; border: none;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 7px;
  transition: opacity .2s;
}
.jef-btn-wa:hover { opacity: .88; }

/* duo */
.jef-duo {
  background: #f8fdf5;
  border: 2px dashed #b8dda4;
  border-radius: 22px; padding: 20px;
  margin-bottom: 16px;
}
.jef-duo-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 15px; color: #2f8b09;
  text-align: center; margin-bottom: 14px;
}
.jef-btn-duo {
  width: 100%; padding: 14px; border-radius: 12px;
  background: #1a6e00; color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 14px; border: none;
  cursor: pointer; transition: opacity .2s;
}
.jef-btn-duo:hover { opacity: .88; }
.jef-btn-duo-dl {
  width: 100%; margin-top: 10px; background: none; border: none;
  color: #2f8b09; font-size: 12.5px; font-weight: 700;
  cursor: pointer; text-decoration: underline;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.jef-btn-reset {
  width: 100%; padding: 15px; border-radius: 14px;
  background: transparent; color: #2f8b09;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 14px;
  border: 2px solid #2f8b09; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: background .18s, color .18s;
}
.jef-btn-reset:hover { background: #2f8b09; color: #fff; }

/* ── FOOTER ──────────────────────────────────────────────── */
.jef-footer {
  text-align: center;
  font-size: 11.5px; color: #90b880; line-height: 1.7;
  margin-top: 6px;
}
.jef-footer strong { color: #2f8b09; }
`

export default function BadgeGenerator() {
  const [photo, setPhoto]           = useState<string | null>(null)
  const [nom, setNom]               = useState('')
  const [prenom, setPrenom]         = useState('')
  const [genre, setGenre]           = useState<'homme' | 'femme' | null>(null)
  const [surnom, setSurnom]         = useState('')
  const [duoSurnom, setDuoSurnom]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [duoLoading, setDuoLoading] = useState(false)
  const [step, setStep]             = useState<'form' | 'badge'>('form')
  const [consented, setConsented]   = useState(false)

  const canvasRef    = useRef<HTMLCanvasElement | null>(null)
  const duoCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

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
      const nouveauSurnom = getSurnomAleatoire(genre)

      const { error } = await supabase
        .from('utilisateurs')
        .insert({ nom_complet: `${prenomClean} ${nomClean}`, prenom: prenomClean, genre })
      if (error) throw error

      setSurnom(nouveauSurnom)
      setStep('badge')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la génération. Réessaie !')
    } finally {
      setLoading(false)
    }
  }

  const handleDuo = async () => {
    if (!genre) return
    setDuoLoading(true)
    try {
      const genreOppose = genre === 'homme' ? 'femme' : 'homme'
      const { data } = await supabase
        .from('utilisateurs')
        .select('prenom')
        .eq('genre', genreOppose)
        .limit(50)

      if (!data || data.length === 0) {
        const backup = genreOppose === 'homme' ? ['RENATO', 'WILFRIED'] : ['MERVEILLE', 'GLORIA']
        const pDuo   = backup[Math.floor(Math.random() * backup.length)]
        setDuoSurnom(genre === 'homme' ? `LE GARS DE ${pDuo}` : `LA GO DE ${pDuo}`)
      } else {
        const random = data[Math.floor(Math.random() * data.length)]
        setDuoSurnom((genre === 'homme' ? 'LE GARS DE ' : 'LA GO DE ') + random.prenom.toUpperCase())
      }
    } catch {
      alert('Erreur lors du duo.')
    } finally {
      setDuoLoading(false)
    }
  }

  const handleDownload = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return
    const a = document.createElement('a')
    a.download = filename
    a.href = canvas.toDataURL('image/png', 1.0)
    a.click()
  }

  return (
    <>
      <style>{css}</style>
      <div className="jef-root">
        <div className="jef-inner">

          {/* ════════════════ HERO ════════════════ */}
          <div className="jef-hero">

            <div className="jef-hero-eyebrow">
              <Sparkles size={9} /> FLLAC · UAC · Ouidah → Grand‑Popo
            </div>

            <div className="jef-hero-title">JEF 2026 :<br />Le Rendez‑vous de l'Année</div>
            <div className="jef-hero-route">Journée de l'Étudiant de la FLLAC</div>

            {/* ── Signature créateur ── */}
            <div className="jef-creator">
              <div className="jef-creator-avatar">RT</div>
              <div className="jef-creator-info">
                <div className="jef-creator-name">Rénato TCHOBO</div>
                <div className="jef-creator-role">Développeur web & mobile · Créateur digital</div>
              </div>
              <div className="jef-creator-dot" title="En ligne" />
            </div>

          </div>

          {/* ════════════════ CHALLENGE ════════════════ */}
          <div className="jef-banner">
            <div className="jef-banner-head">
              <div className="jef-banner-icon">
                <Trophy size={21} color="#2f8b09" />
              </div>
              <div className="jef-banner-title">🎯 Le Challenge JEF 2026</div>
            </div>
            <div className="jef-banner-body">
              C'est le <strong>jeu viral de la JEF 2026</strong> ! Génère ton surnom officiel,
              télécharge ton badge personnalisé et partage-le autour de toi. Chaque
              participant reçoit un surnom unique — et peut découvrir son <strong>duo mystère</strong>.
              Qui sera ton binôme JEF ? 👀
            </div>
            <div className="jef-steps">
              <span className="jef-step"><Camera size={11} /> Ajoute ta photo</span>
              <span className="jef-step"><Zap size={11} /> Reçois ton surnom</span>
              <span className="jef-step"><Share2 size={11} /> Partage</span>
              <span className="jef-step"><Users size={11} /> Duo mystère</span>
            </div>
          </div>

          {/* ════════════════ FORM ════════════════ */}
          {step === 'form' ? (
            <div className="jef-card">
              <div className="jef-card-title">Génère ton surnom JEF 🏷️</div>

              {/* Photo */}
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
                value={nom} onChange={e => setNom(e.target.value)}
                style={{ marginBottom: 20 }} />

              {/* Genre */}
              <div className="jef-genre-row">
                <button className={`jef-genre-btn${genre === 'homme' ? ' active' : ''}`}
                  onClick={() => setGenre('homme')}>💪 Je suis un gars</button>
                <button className={`jef-genre-btn${genre === 'femme' ? ' active' : ''}`}
                  onClick={() => setGenre('femme')}>💅 Je suis une go</button>
              </div>

              {/* ── Consentement ── */}
              <div className={`jef-consent-wrap${consented ? ' checked' : ''}`}
                onClick={() => setConsented(v => !v)}>

                <div className={`jef-check-box${consented ? ' checked' : ''}`}>
                  {consented && (
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M1.5 5L5 8.5L11.5 1.5"
                        stroke="white" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div className="jef-consent-text">
                  <CheckCircle2 size={13} color="#2f8b09" style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />
                  J'accepte que mon <strong>prénom et mon genre</strong> soient enregistrés dans le
                  cadre de ce <strong>jeu challenge JEF 2026</strong>. Ces données sont utilisées
                  uniquement pour la fonctionnalité Duo Mystère et ne seront
                  jamais partagées à des tiers. Ma participation est <strong>volontaire</strong>.
                </div>
              </div>

              <button className="jef-cta" onClick={handleGenerer}
                disabled={loading || !consented}>
                {loading ? '⏳ Génération en cours…' : '⚡ GÉNÉRER MON SURNOM JEF'}
              </button>
            </div>

          ) : (

          /* ════════════════ BADGE STEP ════════════════ */
            <div className="jef-card">
              <div className="jef-card-title">🎉 Ton badge JEF 2026 !</div>

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

              {/* Duo mystère */}
              <div className="jef-duo">
                <div className="jef-duo-title">💞 Duo Mystère JEF</div>

                {duoSurnom && (
                  <div className="jef-badge-frame" style={{ marginBottom: 14 }}>
                    <BadgeCanvas photo={photo} nom={`${prenom} ${nom}`} surnom={duoSurnom}
                      visible={true} onReady={c => { duoCanvasRef.current = c }} />
                  </div>
                )}

                <button className="jef-btn-duo" onClick={handleDuo} disabled={duoLoading}>
                  {duoLoading ? '🔍 Recherche…' : '🎲 Trouver mon binôme'}
                </button>

                {duoSurnom && (
                  <button className="jef-btn-duo-dl"
                    onClick={() => handleDownload(duoCanvasRef.current, `duo-jef-${prenom}.png`)}>
                    ↓ Télécharger le badge Duo
                  </button>
                )}
              </div>

              <button className="jef-btn-reset"
                onClick={() => { setStep('form'); setSurnom(''); setDuoSurnom('') }}>
                <RefreshCw size={14} /> Recommencer
              </button>
            </div>
          )}

          {/* ════════════════ FOOTER ════════════════ */}
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