import Chart from "../Ondes/2DChart/Chart";
import styles from "./DashBoard.module.css";
import Parametre from "../Ondes/Parametre/Parametre";
import { useNavigationStore } from "../../store/navigation.store";
import Equation from "../Ondes/Equation/Equation";

export default function DashBoard() {

   const { activePage } = useNavigationStore()


    return (
                    <div className={styles.dashboard}>
                        <div className={styles.chartsContainer}>
                                   {activePage === "ondes" &&<><Equation /><Chart /></>}
                       
                        </div>
                        <div className={styles.parametersContainer}>
                             {activePage === "ondes" && <Parametre />}
                        </div>
                    </div>
    );

}   