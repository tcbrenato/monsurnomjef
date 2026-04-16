'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getSurnomAleatoire } from '@/lib/surnoms'
import BadgeCanvas from './BadgeCanvas'
// Ajout des imports manquants pour éviter l'erreur Camera
import { Camera, Share2, Download, RefreshCw, Heart } from 'lucide-react'

function sanitize(str: string): string {
  return str.replace(/[<>&"'\/\\]/g, '').trim().slice(0, 60)
}

export default function BadgeGenerator() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [genre, setGenre] = useState<'homme' | 'femme' | null>(null)
  const [surnom, setSurnom] = useState('')
  const [duoSurnom, setDuoSurnom] = useState('')
  const [loading, setLoading] = useState(false)
  const [duoLoading, setDuoLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'badge'>('form')
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
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
    setLoading(true)
    try {
      const nomClean = sanitize(nom)
      const prenomClean = sanitize(prenom)
      const nouveauSurnom = getSurnomAleatoire(genre)

      // Correction du nom de la table : 'utilisateurs' comme dans ton original
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
        // Backup si base vide
        const backup = genreOppose === 'homme' ? ['RENATO', 'WILFRIED'] : ['MERVEILLE', 'GLORIA']
        const pDuo = backup[Math.floor(Math.random() * backup.length)]
        setDuoSurnom(genre === 'homme' ? `LE GARS DE ${pDuo}` : `LA GO DE ${pDuo}`)
      } else {
        const random = data[Math.floor(Math.random() * data.length)]
        const prefix = genre === 'homme' ? 'LE GARS DE ' : 'LA GO DE '
        setDuoSurnom(prefix + random.prenom.toUpperCase())
      }
    } catch (err) {
      alert('Erreur lors du duo.')
    } finally {
      setDuoLoading(false)
    }
  }

  const handleDownload = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7ee', padding: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        
        {/* Header - Fidèle à ton image */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            background: '#2f8b09', color: 'white',
            padding: '16px 20px', borderRadius: 16,
            fontWeight: 900, fontSize: 18, letterSpacing: 0.5,
            marginBottom: 8, boxShadow: '0 4px 12px rgba(47,139,9,0.2)'
          }}>
            🎓 JEF 2026 : LE RENDEZ-VOUS DE L'ANNÉE
          </div>
          <p style={{ color: '#666', fontSize: 14, fontWeight: 500 }}>FLLAC — UAC | Ouidah → Grand-Popo</p>
        </div>

        {step === 'form' ? (
          <div style={{
            background: 'white', borderRadius: 24,
            padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ color: '#2f8b09', marginBottom: 20, fontSize: 22, fontWeight: 800, textAlign: 'center' }}>
              Génère ton surnom JEF 🏷️
            </h2>

            {/* Photo Upload Area */}
            <label style={{ display: 'block', marginBottom: 20 }}>
              <div style={{
                border: '2px dashed #2f8b09', borderRadius: 18,
                padding: 24, textAlign: 'center', cursor: 'pointer',
                background: photo ? 'transparent' : '#f9fff6',
                transition: 'all 0.3s'
              }}>
                {photo ? (
                  <img src={photo} alt="preview" style={{
                    width: 140, height: 140, borderRadius: '50%',
                    objectFit: 'cover', border: '4px solid #2f8b09', margin: '0 auto'
                  }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', items: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Camera size={48} color="#2f8b09" strokeWidth={1.5} />
                    </div>
                    <p style={{ color: '#2f8b09', fontWeight: 700, fontSize: 16 }}>
                      Clique pour ajouter ta photo
                    </p>
                    <p style={{ color: '#999', fontSize: 12 }}>JPG ou PNG recommandé</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>

            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Ton prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                style={{
                  width: '100%', padding: '16px', boxSizing: 'border-box',
                  border: '2px solid #eee', borderRadius: 14, fontSize: 16,
                  outline: 'none', fontWeight: 500
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Ton nom de famille"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={{
                  width: '100%', padding: '16px', boxSizing: 'border-box',
                  border: '2px solid #eee', borderRadius: 14, fontSize: 16,
                  outline: 'none', fontWeight: 500
                }}
              />
            </div>

            {/* Genre Selector */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => setGenre('homme')}
                style={{
                  flex: 1, padding: '16px 8px', borderRadius: 14,
                  border: `2px solid ${genre === 'homme' ? '#2f8b09' : '#eee'}`,
                  background: genre === 'homme' ? '#2f8b09' : 'white',
                  color: genre === 'homme' ? 'white' : '#555',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}
              >
                💪 Je suis un gars
              </button>
              <button
                onClick={() => setGenre('femme')}
                style={{
                  flex: 1, padding: '16px 8px', borderRadius: 14,
                  border: `2px solid ${genre === 'femme' ? '#2f8b09' : '#eee'}`,
                  background: genre === 'femme' ? '#2f8b09' : 'white',
                  color: genre === 'femme' ? 'white' : '#555',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}
              >
                💅 Je suis une go
              </button>
            </div>

            <button
              onClick={handleGenerer}
              disabled={loading}
              style={{
                width: '100%', padding: '20px', borderRadius: 16,
                background: loading ? '#ccc' : '#2f8b09',
                color: 'white', fontWeight: 900, fontSize: 18,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(47,139,9,0.3)'
              }}
            >
              {loading ? '⏳ GÉNÉRATION...' : '⚡ GÉNÉRER MON SURNOM JEF'}
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 24, padding: 24, textAlign: 'center' }}>
            <h2 style={{ color: '#2f8b09', marginBottom: 16, fontSize: 22, fontWeight: 800 }}>
              🎉 Ton badge JEF 2026 !
            </h2>

            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, border: '1px solid #eee' }}>
              <BadgeCanvas
                photo={photo}
                nom={`${prenom} ${nom}`}
                surnom={surnom}
                visible={true}
                onReady={(canvas) => { canvasRef.current = canvas }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => handleDownload(canvasRef.current, `badge-jef-${prenom}.png`)}
                style={{
                  flex: 1, padding: '16px', borderRadius: 14, background: '#2f8b09',
                  color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Download size={18}/> Télécharger
              </button>
              <button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Mon badge JEF 2026 ! https://monsurnomjef.com")}`)}
                style={{
                  flex: 1, padding: '16px', borderRadius: 14, background: '#25D366',
                  color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Share2 size={18}/> WhatsApp
              </button>
            </div>

            {/* Duo Section - Améliorée visuellement */}
            <div style={{
              background: '#f9fff6', border: '2px dashed #2f8b09', 
              borderRadius: 20, padding: 20, marginBottom: 20
            }}>
              <p style={{ fontWeight: 800, color: '#2f8b09', marginBottom: 12 }}>
                💞 Duo Mystère JEF
              </p>
              
              {duoSurnom && (
                <div style={{ marginBottom: 16 }}>
                   <BadgeCanvas
                    photo={photo}
                    nom={`${prenom} ${nom}`}
                    surnom={duoSurnom}
                    visible={true}
                    onReady={(canvas) => { duoCanvasRef.current = canvas }}
                  />
                </div>
              )}

              <button
                onClick={handleDuo}
                disabled={duoLoading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: '#1a6e00', color: 'white', fontWeight: 700,
                  border: 'none', cursor: 'pointer'
                }}
              >
                {duoLoading ? 'Recherche...' : '🎲 Trouver mon binôme'}
              </button>

              {duoSurnom && (
                <button
                  onClick={() => handleDownload(duoCanvasRef.current, `duo-jef-${prenom}.png`)}
                  style={{
                    width: '100%', marginTop: 10, background: 'none', border: 'none',
                    color: '#2f8b09', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline'
                  }}
                >
                  Télécharger le badge Duo
                </button>
              )}
            </div>

            <button
              onClick={() => { setStep('form'); setSurnom(''); setDuoSurnom('') }}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, background: 'none',
                color: '#2f8b09', fontWeight: 700, border: '2px solid #2f8b09', cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} style={{ marginRight: 6 }}/> Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}