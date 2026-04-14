import { ExternalLink, Heart, Code2, Globe, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import logoUrl from "../../dork.png";

export function AboutDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-85">


        <DialogHeader className="items-center text-center">
          <img
            src={logoUrl}
            alt="Dorker"
            className="w-16 h-16 bg-transparent mx-auto"
          />
          <DialogTitle className="text-lg mt-2">Dorker</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Google Dork Assistant v1.0.0
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Info  */}

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bringing Google dorking to everyone — even the forgetful.
          </p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            A fast, elegant side-panel assistant that puts every Google
            search operator and dork template at your fingertips. No more
            memorising obscure syntax.
          </p>
        </div>

        <Separator />

        {/* Credits  */}

        {/* Elm1  */}

        <div className="flex flex-col gap-2 py-8">

          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-secondary">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Built with Claude Opus</p>
              <p className="text-[10px] text-muted-foreground">Wrangled by Gareth Cheyne</p>
            </div>
          </div>

          {/* Elm2  */}
          <a
            href="https://www.err403.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">err403.com</p>
              <p className="text-[10px] text-muted-foreground">Author's site</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>

          {/* Elm3  */}
          <a
            href="https://github.com/garethcheyne/Dorker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Open Source</p>
              <p className="text-[10px] text-muted-foreground">View on GitHub</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>

          {/* Elm4  */}
          <a
            href="https://gist.github.com/sundowndev/283efaddbcf896ab405488330d1bbc06"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Dork Reference</p>
              <p className="text-[10px] text-muted-foreground">sundowndev's cheat sheet (2.5K ★)</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        </div>

        <Separator />

        <p className="text-[10px] text-muted-foreground text-center">
          Made with <span className="text-rose-400">♥</span> — Open source under MIT
        </p>
      </DialogContent>
    </Dialog>
  );
}
