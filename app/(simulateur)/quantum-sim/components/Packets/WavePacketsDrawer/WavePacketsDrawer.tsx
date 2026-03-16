import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ListPlus, Trash2, Waves } from "lucide-react";
import { usePacketWavesStore } from "../../../store/packet-waves.store";
import styles from "./WavePacketsDrawer.module.css";

interface WavePacketsDrawerProps {
  showTrigger?: boolean;
}

export default function WavePacketsDrawer({ showTrigger = true }: WavePacketsDrawerProps) {
  const { waves, removeWave, clearWaves, isDrawerOpen, setDrawerOpen } = usePacketWavesStore();
  
  return (
    <Drawer
      direction="bottom"
      modal={false}
      open={isDrawerOpen}
      onOpenChange={setDrawerOpen}
    >
      {showTrigger && (
        <DrawerTrigger asChild>
          <Button>
            <ListPlus data-icon="inline-start" />
            Ouvrir le drawer des ondes
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent className={styles.drawerContent}>
        <DrawerHeader className={styles.header}>
          <div className={styles.headerTop}>
            <DrawerTitle className={styles.title}>
              <Waves className={styles.titleIcon} />
              Ondes en mémoire
            </DrawerTitle>
            <span className={styles.count}>{waves.length} onde{waves.length !== 1 ? 's' : ''}</span>
          </div>
        </DrawerHeader>

        {!waves.length ? (
          <div className={styles.emptyState}>
            <Waves className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              Aucune onde pour le moment.
            </p>
            <p className={styles.emptyHint}>
              Va dans l&apos;onglet Ondes puis clique sur &quot;Ajouter aux packets&quot;.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.waveTable}>
              <thead>
                <tr>
                  <th className={styles.thSticky}>#</th>
                  <th className={styles.thSticky}>Amplitude</th>
                  <th className={styles.thSticky}>Phase</th>
                  <th className={styles.thSticky}>Harmoniques</th>
                  <th className={styles.thSticky}>λ (nm)</th>
                  <th className={styles.thSticky}>Période (s)</th>
                  <th className={styles.thSticky}>Temps (s)</th>
                  <th className={styles.thSticky}>Ajoutée</th>
                  <th className={styles.thSticky}></th>
                </tr>
              </thead>
              <tbody>
                {waves.map((wave, index) => (
                  <tr key={wave.id} className={styles.waveRow}>
                    <td className={styles.waveNumber}>
                      <div className={styles.numberBadge}>{index + 1}</div>
                    </td>
                    <td className={styles.valueCell}>{wave.amplitude.toFixed(2)}</td>
                    <td className={styles.valueCell}>
                      <span className={styles.phaseValue}>
                        {(wave.phase / Math.PI).toFixed(2)}π
                      </span>
                    </td>
                    <td className={styles.valueCell}>{wave.harmonics}</td>
                    <td className={styles.valueCell}>{wave.wavelength.toFixed(2)}</td>
                    <td className={styles.valueCell}>{wave.period.toFixed(2)}</td>
                    <td className={styles.valueCell}>{wave.time.toFixed(2)}</td>
                    <td className={styles.timeCell}>
                      {new Date(wave.createdAt).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className={styles.actionCell}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.deleteBtn}
                        onClick={() => removeWave(wave.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DrawerFooter className={styles.footer}>
          {waves.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={clearWaves}
              className={styles.clearBtn}
            >
              <Trash2 data-icon="inline-start" />
              Tout supprimer ({waves.length})
            </Button>
          )}
          <DrawerClose asChild>
            <Button>Fermer</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}