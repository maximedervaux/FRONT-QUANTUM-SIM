'use client'

import { useEffect, useState } from 'react'
import { Atom } from 'lucide-react'
import styles from './PythonEngineLoader.module.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const states = [
  {
    emoji: '📦',
    text: "Préparation de la boîte de Schrödinger..."
  },
  {
    emoji: '🐈',
    text: "Insertion du chat. Surtout, ne regardez pas l'écran de trop près."
  },
  {
    emoji: '⚛️',
    text: "Superposition en cours : l'application fonctionne et plante simultanément."
  },
  {
    emoji: '⏱️',
    text: "Principe d'incertitude : on sait que ça charge, mais on ignore à quelle vitesse."
  },
  {
    emoji: '🌌',
    text: "Intrication réussie : si ça bug ici, le serveur de l'univers parallèle plante aussi."
  },
  {
    emoji: '💀/🐈',
    text: "Effondrement de la fonction d'onde... Le chat exige des croquettes quantiques."
  }
]

export default function PythonEngineLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % states.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (

    <div className={styles.loaderContainer}>
      <Card className={styles.loaderCard}>
        <CardHeader className={`${styles.cardHeader} text-center space-y-2`}>
          <div className="flex justify-center mb-2">
            <Atom className="h-10 w-10 text-primary animate-spin-slow" />
          </div>
          <CardTitle className={styles.cardTitle}>
            Initialisation du moteur quantique
          </CardTitle>
        </CardHeader>

        <CardContent className={`${styles.content} text-center`}>
          <div className={`${styles.animationContainer} my-6`}>
            <div className={`${styles.quantumBox} text-6xl animate-bounce`}>
              <span className={styles.emoji} role="img" aria-label="État quantique">
                {states[index].emoji}
              </span>
            </div>
          </div>

          <p className={`${styles.loadingText} text-muted-foreground min-h-[60px] flex items-center justify-center transition-all duration-300`}>
            {states[index].text}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}