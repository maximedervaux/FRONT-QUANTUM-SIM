import Link from "next/link";
import Image from "next/image";
import { forwardRef } from "react";
import styles from './Hero.module.css';
import StartIcon from "../../assets/start-button.svg";


const Hero = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={`hero ${styles.hero}`} ref={ref}>
      <div className={`left ${styles.left}`}>
        <Image
          src="/assets/logo.png"
          alt="Quantum SIM"
          width={600}
          height={500}
          loading="eager"
          style={{ height: 'auto' }}
        />
      </div>
      <div className={`right ${styles.right}`}>
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
