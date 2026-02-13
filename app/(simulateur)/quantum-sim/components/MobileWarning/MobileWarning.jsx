// MobileWarning.jsx
import style from "./MobileWarning.module.css";

export default function MobileWarning() {
  return (
    <div className={style.mobileWarning}>
      <div className={style.content}>
        <h1>📱</h1>
        <h2>Non disponible sur mobile</h2>
        <p>Cette application n'est pas disponible sur les appareils mobiles.</p>
        <p>Veuillez utiliser un ordinateur pour une meilleure expérience.</p>
      </div>
    </div>
  );
}