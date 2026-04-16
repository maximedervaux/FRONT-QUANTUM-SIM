import style from './Parametre.module.css';
import { Slider } from '@/components/ui/slider';
import { useWaveStore } from '../../../store/onde.store';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { SlidersHorizontal } from 'lucide-react';
import HarmonicsDrawer from '../HarmonicsDrawer/HarmonicsDrawer';

const LIMITS = {
  harmonics: { min: 1, max: 20 },
  wavelength: { min: 0.01, max: 100 },
  period: { min: 1, max: 100 },
};

export default function Parametre() {
  const {
    phase,
    harmonics,
    wavelength,
    period,
    time,
    isAnimatingTime,
    setFunction,
    setHarmonics,
    setWavelength,
    setPeriod,
    setTime,
    toggleAnimationTime,
    toggleHarmonicsDrawer,
    resetTime,
  } = useWaveStore();

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  useEffect(() => {
    if (!isAnimatingTime) return;
    const interval = setInterval(() => setTime(10), 50);
    return () => clearInterval(interval);
  }, [isAnimatingTime, setTime]);

  return (
    <>
      <div className={style.parametre}>
        <h1>Paramètres de l'onde</h1>

        <div className={style.selectContainer}>
          <NativeSelect defaultValue="" onChange={e => setFunction(e.target.value)}>
            <NativeSelectOption value="">Fonction d'onde</NativeSelectOption>
            <NativeSelectOption value="gaussian">Gaussienne</NativeSelectOption>
            <NativeSelectOption value="sinus">Sinusoidale</NativeSelectOption>
          </NativeSelect>
        </div>

        <div className={style.inputContainer}>
          <p>Période</p>
          <Slider
            defaultValue={[period]}
            min={1}
            max={100}
            step={1}
            onValueChange={value => setPeriod(value[0])}
          />
        </div>

        <div className={style.buttonContainer}>
          <p>Temps : {time.toFixed(0)} s</p>
          <Button onClick={toggleAnimationTime}>{isAnimatingTime ? '⏸️' : '▶️'}</Button>
          <Button onClick={resetTime} variant="outline">Reset</Button>
        </div>

        <div className={style.inputContainer}>
          <p>Nombre d'onde</p>
          <Input
            placeholder=""
            type="number"
            min={LIMITS.wavelength.min}
            max={LIMITS.wavelength.max}
            step={0.01}
            value={wavelength || ''}
            onChange={e => {
              const val = e.target.valueAsNumber;
              setWavelength(isNaN(val) ? 0.01 : val);
            }}
          />
          <div className={style.wavelengthContainer}>
            k
          </div>
        </div>

        <div className={style.inputContainer}>
          <div className={style.harmonicHeader}>
            <p>Harmonique</p>
            <Button variant="ghost" size="sm" onClick={toggleHarmonicsDrawer}>
              <SlidersHorizontal size={15} data-icon="inline-start" />
              Amplitudes
            </Button>
          </div>
          <Input
            type="number"
            value={harmonics || ''}
            min={LIMITS.harmonics.min}
            max={LIMITS.harmonics.max}
            onChange={e => {
              const val = e.target.valueAsNumber;
              if (!isNaN(val)) setHarmonics(clamp(val, LIMITS.harmonics.min, LIMITS.harmonics.max));
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

    </>
  );
}