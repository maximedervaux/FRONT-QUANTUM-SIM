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
        harmonics,
        wavelength,
        period,
        setAmplitude,
        setPhase,
        setFunction,
        setHarmonics,
        setWavelength,
        setPeriod
    } = useWaveStore();
    
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
                    type="number"
                    value={wavelength || ""}
                    onChange={(e) => {
                        const val = e.target.valueAsNumber;
                        setWavelength(isNaN(val) ? 1 : val);
                    }}
                />
                λ
            </div>

            <div className={style.inputContainer}>
                <p>Harmonique</p>
                <Input
                    placeholder="0"
                    type="number"
                    value={harmonics || ""}
                    onChange={(e) => {
                        const val = e.target.valueAsNumber;
                        setHarmonics(val);
                    }}
                />
            </div>
            
            <div className={style.inputContainer}>
                <p>Période</p>
                <Slider
                    defaultValue={[period]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => setPeriod(value[0])}
                />
            </div>


            
        </div>
    );
}
