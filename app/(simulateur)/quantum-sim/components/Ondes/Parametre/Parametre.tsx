import style from "./Parametre.module.css";
import { Slider } from "@/components/ui/slider"
import { useWaveStore } from "../../../store/onde.store";



export default function Parametre( ) {
      const {
    amplitude,
    phase,
    setAmplitude,
    setPhase
  } = useWaveStore();

    
    return (
        <div className={style.parametre}>
            <h1>Paramètres de l'onde</h1>
            <div className={style.sliderContainer}>
                <p>Amplitude : {amplitude}</p>
                <Slider
                    defaultValue={[amplitude]}
                    min={0.01}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setAmplitude(value[0])}
                />
            </div>
            <div className={style.sliderContainer}>
                    <p>Phase : {phase}</p>
                    <Slider
                        defaultValue={[phase]}
                        min={0.01}
                        max={2 * Math.PI}
                    step={0.01}
                    onValueChange={(value) => setPhase(value[0])}
                />
            </div>
        </div>
    );
}
