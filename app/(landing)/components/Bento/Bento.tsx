  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { forwardRef } from "react";
  import styles from './Bento.module.css'
  import Image from "next/image";

  const Bento = forwardRef<HTMLDivElement>((props, ref) => {
    return (
      <section className={`${styles.bento} bento`} ref={ref}>
        <div className={styles.heading}>
          <p className={styles.kicker}>Experience</p>
          <h2>Un laboratoire quantique interactif, pense pour apprendre en manipulant.</h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full ${styles.grid}`}>
          
          <Card className={`md:col-span-2 md:row-span-2 text-white flex flex-col justify-end overflow-hidden border-none ${styles.waveCard}`}>
            <CardHeader>
              <CardTitle className="text-2xl">Ondes</CardTitle>
              <CardDescription className="text-slate-400">Simulation interactive</CardDescription>
            </CardHeader>
          </Card>

          <Card className={`md:col-span-2 border-none ${styles.softCard}`}>
            <CardHeader>
              <CardTitle>Visualisation Scientifique</CardTitle>
              <CardDescription>Observer des phénomènes quantiques en action</CardDescription>
            </CardHeader>
            <CardContent>
              <Image className={styles.previewImage} src="/assets/onde.png" alt="Visualisation d'ondes" width={1000} height={1000} />
            </CardContent>
          </Card>

          <Card className={`text-white border-none ${styles.highlightCard}`}>
            <CardHeader>
              <CardTitle className="text-lg">Package Python</CardTitle>
            </CardHeader>
             <CardContent>
              <p>Un package Python clé en main Toutes les fonctions quantiques fondamentales encapsulées dans un package installable. Intégrez-les dans vos scripts, vos calculs, vos projets personnels en une ligne.</p>
            </CardContent>
          </Card>

          <Card className={`border-none ${styles.softCardAlt}`}>
            <CardHeader>
              <CardTitle className="text-lg">Open source</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Un projet open source dédié à l'éducation en mécanique quantique, accessible à tous.</p>
            </CardContent>
          </Card>

        </div>
      </section>
    )
  });

  Bento.displayName = "Bento";

  export default Bento;