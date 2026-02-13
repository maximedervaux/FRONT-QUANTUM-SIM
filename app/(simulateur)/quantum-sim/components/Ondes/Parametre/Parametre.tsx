import style from "./Parametre.module.css";
import { Slider } from "@/components/ui/slider"
import { useWaveStore } from "../../../store/onde.store";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const LIMITS = {
    harmonics: { min: 1, max: 100 },
    wavelength: { min: 0.01, max: 100 },
    period: { min: 1, max: 100 }
};


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

    // Fonction helper pour clamper une valeur
    const clamp = (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, value));
    };

    // Gestion de l'animation de la phase
    useEffect(() => {
        if (!isAnimatingPhase) return;

        const interval = setInterval(() => {
            setPhase(0.1);
        }, 50); 

        return () => clearInterval(interval);
    }, [isAnimatingPhase, setPhase]);

    // Gestion de l'animation du temps
    useEffect(() => {
        if (!isAnimatingTime) return;

        const interval = setInterval(() => {
            setTime(0.05);
        }, 50); 

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
            <div className={style.buttonContainer}>
                <p>Phase : {(phase / Math.PI).toFixed(2)} π</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={toggleAnimationPhase}>
                        {isAnimatingPhase ? '⏸️' : '▶️'}
                    </Button>
                    <Button onClick={resetPhase} variant="outline">
                        Reset
                    </Button>
                </div>
            </div>
            <div className={style.buttonContainer}>
                <p>Temps : {time.toFixed(2)} s</p>
                    <Button onClick={toggleAnimationTime}>
                        {isAnimatingTime ? '⏸️' : '▶️'}
                    </Button>
                    <Button onClick={resetTime} variant="outline">
                        Reset
                    </Button>
           
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
                <Input
                    type="number"
                    value={harmonics || ""}
                    min={LIMITS.harmonics.min}
                    max={LIMITS.harmonics.max}
                    onChange={(e) => {
                        const val = e.target.valueAsNumber;
                        setHarmonics(val);
                    }}
                />
            </div>
            <div className={style.buttonContainer}>
                
                <ButtonGroup>
                    <Button>2D</Button>
                    <Button>3D</Button>
                </ButtonGroup>
            </div>       
        </div>
    );
}
