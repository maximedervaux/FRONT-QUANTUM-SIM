import { InlineMath } from 'react-katex';
import style from "./Equation.module.css";
import { useWaveStore } from '../../store/onde.store';

export default function Equation() {
  const {
    wavelength,
    time
  } = useWaveStore();

  time.toFixed(2);
  
  const equation = `\\psi(x,${time.toFixed(2)})=A\\exp[i(\\frac{2\\pi n}{${wavelength.toFixed(2)}}(x-x_0)-\\frac{\\hbar}{2m}(\\frac{2\\pi}{${wavelength.toFixed(2)}})^2${time.toFixed(2)}+\\phi)]`;
  
  return (
    <div className={style.equationContainer}>
      <p>
        <span className="latex">
          <InlineMath math={equation} />
        </span>
      </p>
    </div>
  );
}