import style from "./Parametre.module.css";
import { Slider } from "@/components/ui/slider"
import { useWaveStore } from "../../../store/onde.store";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";



export default function Parametre( ) {
      const {
        amplitude,
        phase,
        harmonics,
        wavelength,
        period,
        time,
        setAmplitude,
        setPhase,
        setFunction,
        setHarmonics,
        setWavelength,
        setPeriod,
        setTime
    } = useWaveStore();

    const handleClickButtonPhase = () => {
        setInterval(() => {
            setPhase(0.1);
        }, 100)
    }

    const handleClickButtonTime = () => {
        setInterval(() => {
            setTime(0.1);
        }, 10)
    }
    
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
            <div className={style.sliderContainer}>
                <p>Phase : {phase} π</p>
                <Button onClick={() => handleClickButtonPhase()}>Animer la phase</Button>
            </div>
            <div className={style.sliderContainer}>
                <p>Temps : {time} s</p>
                <Button onClick={() => handleClickButtonTime()}>Visualiser en fonction du temps</Button>
            </div>
            <div className={style.inputContainer}>
                <p>Longueur d'onde</p>
                <Input
                    placeholder=""
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={wavelength || ""}
                    onChange={(e) => {
                        const val = e.target.valueAsNumber;
                        setWavelength(isNaN(val) ? 0.01 : val);
                    }}
                />
                λ
            </div>

            <div className={style.inputContainer}>
                <p>Harmonique</p>
                {/* Mettre des ptn de useState */}
                <Input
                    type="number"
                    value={harmonics || ""}
                    min={1}
                    max={1000}
                    onChange={(e) => {
                        const val = e.target.valueAsNumber;
                        setHarmonics(val);
                    }}
                />
            </div>
        </div>
    );
}
