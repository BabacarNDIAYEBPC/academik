import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Button>
    </div>
  );
}
