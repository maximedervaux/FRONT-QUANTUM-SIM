import style from "./Parametre.module.css";
import { Slider } from "@/components/ui/slider"
import { useWaveStore } from "../../../store/onde.store";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useEffect } from "react";
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
        isAnimatingPhase,
        isAnimatingTime,
        setAmplitude,
        setPhase,
        setFunction,
        setHarmonics,
        setWavelength,
        setPeriod,
        setTime,
        toggleAnimationPhase,
        toggleAnimationTime,
        resetPhase,
        resetTime
    } = useWaveStore();

    // Gestion de l'animation de la phase
    useEffect(() => {
        if (!isAnimatingPhase) return;

        const interval = setInterval(() => {
            setPhase(0.1);
        }, 100);

        return () => clearInterval(interval);
    }, [isAnimatingPhase, setPhase]);

    // Gestion de l'animation du temps
    useEffect(() => {
        if (!isAnimatingTime) return;

        const interval = setInterval(() => {
            setTime(0.1);
        }, 10);

        return () => clearInterval(interval);
    }, [isAnimatingTime, setTime]);

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
                <p>Phase : {(phase / Math.PI).toFixed(2)} π</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={toggleAnimationPhase}>
                        {isAnimatingPhase ? 'Pause Phase' : 'Animer la phase'}
                    </Button>
                    <Button onClick={resetPhase} variant="outline">
                        Reset
                    </Button>
                </div>
            </div>
            <div className={style.sliderContainer}>
                <p>Temps : {time.toFixed(2)} s</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={toggleAnimationTime}>
                        {isAnimatingTime ? 'Pause Temps' : 'Visualiser en fonction du temps'}
                    </Button>
                    <Button onClick={resetTime} variant="outline">
                        Reset
                    </Button>
                </div>
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
