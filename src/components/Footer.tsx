import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <div className="border-t border-border bg-card">
      <div className="px-4 py-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-background border border-border rounded text-[10px] font-mono text-muted-foreground">/</kbd>
            <span>autocomplete</span>
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-background border border-border rounded text-[10px] font-mono text-muted-foreground">Tab</kbd>
            <span>templates</span>
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-mono">v1.0</span>
      </div>
    </div>
  );
}
