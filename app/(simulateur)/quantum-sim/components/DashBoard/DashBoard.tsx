import { useEffect } from "react";
import Chart from "../Ondes/2DChart/Chart";
import styles from "./DashBoard.module.css";

export default function DashBoard() {


    return (
                    <div className={styles.dashboard}>
                        <Chart />
                    </div>
    );

}   