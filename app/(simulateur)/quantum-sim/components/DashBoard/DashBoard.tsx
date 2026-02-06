import { useEffect } from "react";
import Chart from "../Ondes/2DChart/Chart";
import styles from "./DashBoard.module.css";
import Parametre from "../Ondes/Parametre/Parametre";

export default function DashBoard() {


    return (
                    <div className={styles.dashboard}>
                        <div className={styles.chartsContainer}>
                         <Chart />
                        </div>
                        <div className={styles.parametersContainer}>
                            <Parametre />
                        </div>
                    </div>
    );

}   