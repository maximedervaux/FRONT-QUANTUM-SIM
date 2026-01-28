import { Button } from "@/components/ui/button";
import BentoGrid from "./components/Bento";
import { Code } from "lucide-react";
import CodeButton from "./components/CodeButton";


export default function Home() {
  return (
    <>
    <div className="hero">
      <div className="left">
        <h1>Quantum SIM</h1>
      </div>
      <div className="right">
          <a href="/app">
            <Button size="lg" className="startButton">
              Lancer la simulation
            </Button>
          </a>
      </div>  
    </div>
    
    <BentoGrid />
    
    <div className="notebook">
      <img
        src="/notebook.png"
        alt="notebook"
        width={800}
        height={600}
      />

      <div className="text">
        <h2>Installe notre librairie directement sur ton notebook !</h2>
        <p>
          Installe notre librairie en une seule commande et commence immédiatement à simuler des systèmes quantiques depuis ton notebook. Elle s’intègre sans configuration complexe et te permet de passer rapidement de l’installation à l’expérimentation. Que ce soit pour l’enseignement, la recherche ou le prototypage, tout est prêt pour exécuter tes premières simulations en quelques minutes.
        </p>

        <CodeButton />
      </div>

    </div>
    </>
  );
}