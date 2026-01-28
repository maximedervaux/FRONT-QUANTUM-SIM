'use client'
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react";
import { toast, Toaster } from "sonner"

export default function CodeButton() {

    const copy = () => {
        return () => {
            navigator.clipboard.writeText("pip install dist/quantum_sim-1.0");
            toast("copiée!");
        };
    };

  return (
    <Button className="code-button" onClick={copy()}>
         pip install dist/quantum_sim-1.0
        <CopyIcon />
    </Button>
  );
}