import style from "./Parametre.module.css";
import { Slider } from "@/components/ui/slider"
import { useWaveStore } from "../../../store/onde.store";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useState } from "react";
import { Input } from "@/components/ui/input";



export default function Parametre( ) {
      const {
    amplitude,
    phase,
    setAmplitude,
    setPhase,
    setFunction
  } = useWaveStore();

  // TODO Useref temp
   const [longueur, setLongueur] = useState(0.01);
   const [harmonique, setHarmonique] = useState(0.01);
    
    return (
        <div className={style.parametre}>
            <h1>Paramètres de l'onde</h1>
            <div className={style.selectContainer}>
                <NativeSelect defaultValue="" onChange={(value) => setFunction(value.target.value)}>
                        <NativeSelectOption value="">Fonction d'onde</NativeSelectOption>
                        <NativeSelectOption value="gaussienne">Gaussienne</NativeSelectOption>
                        <NativeSelectOption value="sinusoidale">Sinusoidale</NativeSelectOption>
                </NativeSelect>

            </div>
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
                    <p>Phase : {phase} π</p>
                    <Slider
                        defaultValue={[phase]}
                        min={0.01}
                        max={2}
                    step={0.01}
                    onValueChange={(value) => setPhase(value[0])}
                />
            </div>
            <div className={style.inputContainer}>
                    <p>Longueur d'onde</p>
                    <Input
                        placeholder="0"
                        defaultValue={longueur}
                        onChange={(value) => setLongueur(value.target.valueAsNumber)    
                    }
                />
                λ
            </div>
              <div className={style.inputContainer}>
                    <p>Harmonique</p>
                    <Input
                        placeholder="0"
                        defaultValue={harmonique}
                        onChange={(value) => setHarmonique(value.target.valueAsNumber)    
                    }
                />
                
            </div>

            
        </div>
    );
}
