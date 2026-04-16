'use client'
import { useEffect, useRef } from 'react'

interface BadgeCanvasProps {
  photo: string | null
  nom: string
  surnom: string
  visible: boolean
  onReady: (canvas: HTMLCanvasElement) => void
}

export default function BadgeCanvas({ photo, nom, surnom, visible, onReady }: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!

    // Canvas 1080×1350 — résolution Instagram vertical, identique au document Canva
    canvas.width  = 1080
    canvas.height = 1350

    const template = new Image()
    template.src = '/template.png'

    template.onload = () => {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      ctx.clearRect(0, 0, 1080, 1350)
      ctx.drawImage(template, 0, 0, 1080, 1350)

      if (!photo || !surnom) return

      const userPhoto = new Image()
      userPhoto.src = photo

      userPhoto.onload = () => {

        // ╔══════════════════════════════════════════════════════════╗
        // ║  PHOTO — valeurs issues directement de Canva "Avancé"   ║
        // ║  X=280.7  Y=202.8  W=471.2  H=471.2  (document 1080px) ║
        // ║  → centerX = 280.7 + 471.2/2 = 516                     ║
        // ║  → centerY = 202.8 + 471.2/2 = 438                     ║
        // ║  → radius  = 471.2 / 2       = 236                     ║
        // ╚══════════════════════════════════════════════════════════╝
        const centerX = 516
        const centerY = 438
        const radius  = 236

        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        // Object-fit: cover — remplit le cercle sans déformer l'image
        const imgRatio = userPhoto.width / userPhoto.height
        let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number

        if (imgRatio > 1) {
          // Image paysage → ajuste sur la hauteur
          drawHeight = radius * 2
          drawWidth  = drawHeight * imgRatio
          offsetX    = centerX - drawWidth / 2
          offsetY    = centerY - radius
        } else {
          // Image portrait → ajuste sur la largeur, cadrage haut (visage)
          drawWidth  = radius * 2
          drawHeight = drawWidth / imgRatio
          offsetX    = centerX - radius
          offsetY    = centerY - drawHeight * 0.35  // 35% → cadre le visage
        }

        ctx.drawImage(userPhoto, offsetX, offsetY, drawWidth, drawHeight)
        ctx.restore()

        // ╔═══════════════════════════════════════════════════════╗
        // ║  NOM — rectangle blanc à bordure verte               ║
        // ║  Mesuré : top=719, bottom=849, left=125, right=970   ║
        // ║  centerX=547  centerY=784  maxWidth=805              ║
        // ╚═══════════════════════════════════════════════════════╝
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle    = '#2f8b09'
        ctx.font         = 'bold 52px sans-serif'
        ctx.fillText(nom.toUpperCase(), 547, 784, 805)

        // ╔══════════════════════════════════════════════════════════╗
        // ║  SURNOM — rectangle vert foncé                         ║
        // ║  Mesuré : top=954, bottom=1099, left=125, right=971    ║
        // ║  centerX=548  centerY=1026  maxWidth=806               ║
        // ╚══════════════════════════════════════════════════════════╝
        ctx.fillStyle = '#FFFFFF'
        ctx.font      = '900 70px sans-serif'
        // maxWidth=806 → le texte ne déborde JAMAIS hors du cadre vert
        ctx.fillText(surnom.toUpperCase(), 548, 1026, 806)

        onReady(canvas)
      }

      userPhoto.onerror = () => {
        console.error('[BadgeCanvas] Impossible de charger la photo utilisateur')
      }
    }

    template.onerror = () => {
      console.error('[BadgeCanvas] Impossible de charger /template.png')
    }
  }, [photo, nom, surnom, onReady])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl shadow-2xl"
      style={{
        display:  visible ? 'block' : 'none',
        width:    '100%',
        maxWidth: '420px',
        margin:   '0 auto',
      }}
    />
  )
}