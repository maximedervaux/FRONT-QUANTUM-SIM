import Chart from "../Ondes/2DChart/Chart";
import styles from "./DashBoard.module.css";
import Parametre from "../Ondes/Parametre/Parametre";
import { useNavigationStore } from "../../store/navigation.store";
import ThreeChart from "../Ondes/3DChart/ThreeChart";

export default function DashBoard() {

   const { activePage } = useNavigationStore()


    return (
                    <div className={styles.dashboard}>
                        <div className={styles.chartsContainer}>
                                   {activePage === "ondes" && <div style={{ display: 'flex', flexDirection: 'column' , margin: '0px', padding: '0px', width: '100%' , height: '100%' }}><Chart /> <ThreeChart/></div>}

                       

                        </div>
                        <div className={styles.parametersContainer}>
                             {activePage === "ondes" && <Parametre />}
                        </div>
                    </div>
    );

}   