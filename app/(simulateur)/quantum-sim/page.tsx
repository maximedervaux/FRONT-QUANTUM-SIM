'use client';
import  Link from "next/link";
import { NavigationTabs} from "./components/MenuBar/MenuBar";
import './styles/style.css'
import DashBoard from "./components/DashBoard/DashBoard";
import { PythonWorkerProvider } from "../core/contexts/PythonWorkerContext";

export default function Simulateur() {

  return (
    <PythonWorkerProvider>
      <div className="content">
        <div className="headerBar">
          <Link href="/"><img src="/logo.png" alt="Quantum Sim Logo" width={80} height={40} /></Link>
          <NavigationTabs />
        </div>

        <DashBoard />
      </div> 
    </PythonWorkerProvider>
  );
}
