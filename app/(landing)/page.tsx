import { Button } from "@/components/ui/button";
import BentoGrid from "./components/Bento";


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

    <div className="bento">
      <BentoGrid />

    </div>
    </>
  );
}