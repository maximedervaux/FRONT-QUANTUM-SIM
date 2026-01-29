"use client";

import  Link from "next/link";
import { NavigationTabs} from "./components/MenuBar/MenuBar";

export default function Simulateur() {

  return (
    <div className="content">
      <div className="headerBar">
        <Link href="/"><img src="/logo.png" alt="Quantum Sim Logo" width={80} height={40} /></Link>
        <NavigationTabs />
      </div>
      
    </div> 
  );
}
