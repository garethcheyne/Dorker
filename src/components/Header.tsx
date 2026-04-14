import { Info } from "lucide-react";
import { Button } from "./ui/button";
import { AboutDialog } from "./AboutDialog";
import logoUrl from "../../dork.png";

export function Header() {
  return (
    <div className="px-4 py-3.5 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={logoUrl} alt="Dorker" className="w-10 h-10 rounded-xl ring-1 ring-border shadow-lg" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-bold tracking-tight text-foreground">Dorker</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Google Dork Assistant</p>
        </div>
        <AboutDialog>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8 rounded-lg">
            <Info className="w-4 h-4" />
          </Button>
        </AboutDialog>
      </div>
    </div>
  );
}
