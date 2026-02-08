import Link from "next/link";
import { forwardRef } from "react";
import styles from './Hero.module.css';
import StartIcon from "../../assets/start-button.svg";


const Hero = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={styles.hero} ref={ref}>
      <div className={styles.left}>
        <img src="/assets/logo.png" alt="Quantum SIM" width={600} height={500} />
      </div>
      <div className={styles.right}>
        <Link href="/quantum-sim" className={styles.startButton}>
          <h2>Lancer</h2>
          <StartIcon className={styles.startIcon}/>
        </Link>
      </div>
    </div>
  );
});

Hero.displayName = "Hero";

export default Hero
