import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { useMemo } from "react";
import { usePacketWavesStore } from "../../../store/packet-waves.store";
import styles from "./WavePacketsStats.module.css";
import WavePacketsDrawer from "../../Packets/WavePacketsDrawer/WavePacketsDrawer";

export default function WavePacketsStats() {
  const { waves } = usePacketWavesStore();

  const avgWavelength = useMemo(() => {
    if (!waves.length) return 0;
    return waves.reduce((acc, wave) => acc + wave.wavelength, 0) / waves.length;
  }, [waves]);

  return (
    <Card className={styles.wrapper}>
      <CardHeader>
        <CardTitle className={styles.titleRow}>
          <Waves />
          Packets d&apos;ondes
        </CardTitle>
        <CardDescription>
          Regroupe les ondes ajoutées depuis l&apos;onglet Ondes.
        </CardDescription>
      </CardHeader>
      <CardContent className={styles.content}>
        <div className={styles.stats}>
          <p>{waves.length} onde(s) enregistrée(s)</p>
          <p>λ moyen: {avgWavelength.toFixed(2)}</p>
        </div>

        <WavePacketsDrawer />
      </CardContent>
    </Card>
  );
}
