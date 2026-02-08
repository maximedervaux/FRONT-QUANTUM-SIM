import { forwardRef } from "react";
import CodeButton from "../CodeButton/CodeButton";
import { Toaster } from "sonner";
import styles from './Notebook.module.css'

const Notebook = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={styles.notebook} ref={ref}>
      <img src="/assets/notebook.png" alt="notebook" width={800} height={600} />
      <div className="text">
        <h2>Installe notre librairie directement sur ton notebook !</h2>
        <p>
            Installe notre librairie en une seule commande et commence immédiatement
            à simuler des systèmes quantiques depuis ton notebook. Elle s’intègre
            sans configuration complexe et te permet de passer rapidement de
            l’installation à l’expérimentation. Que ce soit pour l’enseignement,
            la recherche ou le prototypage, tout est prêt pour exécuter tes premières
            simulations en quelques minutes.
        </p>
        <CodeButton />
        <Toaster />
      </div>
    </div>
  );
});

Notebook.displayName = "Notebook";

export default Notebook;
