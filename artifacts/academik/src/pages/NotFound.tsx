import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Cette page n'existe pas.</p>
      <Button onClick={() => setLocation("/")} data-testid="button-go-home">Retour à l'accueil</Button>
    </div>
  );
}
