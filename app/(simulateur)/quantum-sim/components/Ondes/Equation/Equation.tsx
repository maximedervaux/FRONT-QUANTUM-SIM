import { InlineMath } from 'react-katex';
import style from "./Equation.module.css";
import { useWaveStore } from '../../../store/onde.store';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function Equation() {
  const {
    wavelength,
    time
  } = useWaveStore();
  
  const [showValues, setShowValues] = useState(false);
  
  // Formule symbolique (brute)
  const symbolicEquation = `\\psi(x,t)=A\\exp[i(\\frac{2\\pi n}{\\lambda}(x-x_0)-\\frac{\\hbar}{2m}(\\frac{2\\pi}{\\lambda})^2t+\\phi)]`;
  
  // Formule avec valeurs en temps réel
  const numericEquation = `\\psi(x,${time.toFixed(2)})=A\\exp[i(\\frac{2\\pi n}{${wavelength.toFixed(2)}}(x-x_0)-\\frac{\\hbar}{2m}(\\frac{2\\pi}{${wavelength.toFixed(2)}})^2${time.toFixed(2)}+\\phi)]`;
  
  return (
    <Card className={style.equationContainer}>
      <CardContent className={style.equationContent}>
        <p className={style.equationText}>
          <span className="latex">
            <InlineMath math={showValues ? numericEquation : symbolicEquation} />
          </span>
        </p>
         <Button
          onClick={() => setShowValues(!showValues)}
          size="sm"
          title={showValues ? "Afficher la formule symbolique" : "Afficher les valeurs en temps réel"}
          className={style.toggleButton}
        >
          {showValues ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
        </Button>
      </CardContent>
      
    </Card>
  );
}