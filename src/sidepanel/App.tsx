import { useState } from "react";
import { Search, Terminal, LayoutTemplate, ArrowRight, Check, Sparkles, ChevronRight, AlignLeft, Loader2, Globe } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useDorkData } from "@/hooks/useDorkData";
import { useActiveTabGoogle } from "@/hooks/useActiveTabGoogle";
import { CATEGORIES, CATEGORY_ORDER } from "@/store/categories";
import type { Category, DorkOperator, DorkTemplate } from "@/types/types";
import { insertDork, insertTemplate } from "@/hooks/useChromeMessage";

export default function App() {
  const { operators, templates, loading } = useDorkData();
  const isGoogle = useActiveTabGoogle();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [showDescriptions, setShowDescriptions] = useState(true);

  const flash = (id: string) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 600);
  };

  const q = search.toLowerCase();

  const filteredOps = operators.filter(op => {
    if (activeCategory && op.category !== activeCategory) return false;
    if (q && !op.keyword.toLowerCase().includes(q) && !op.description.toLowerCase().includes(q)) return false;
    return true;
  });

  const grouped: Partial<Record<Category, DorkOperator[]>> = {};
  for (const op of filteredOps) (grouped[op.category] ??= []).push(op);

  const filteredTpls = templates.filter(t =>
    !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading operators…</p>
      </div>
    );
  }

  if (!isGoogle) {
    return (
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">Not on Google</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Navigate to a Google search tab to use Dorker.
              Operators and templates will insert directly into the search box.
            </p>
          </div>
          <button
            type="button"
            onClick={() => chrome.tabs.create({ url: "https://www.google.com" })}
            className="mt-2 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Open Google Search
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <Header />

        <Tabs defaultValue="operators" className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="px-4 pt-3 pb-2">
            <TabsList>
              <TabsTrigger value="operators">
                <Terminal className="w-3.5 h-3.5" />
                Operators
                <span className="ml-0.5 text-[9px] bg-background/60 px-1.5 py-0.5 rounded-full font-mono">{operators.length}</span>
              </TabsTrigger>
              <TabsTrigger value="templates">
                <LayoutTemplate className="w-3.5 h-3.5" />
                Templates
                <span className="ml-0.5 text-[9px] bg-background/60 px-1.5 py-0.5 rounded-full font-mono">{templates.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search operators & templates..."
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Operators Tab */}
          <TabsContent value="operators" className="flex-1 overflow-hidden flex flex-col">
            {/* Category pills */}
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5 pb-0.5">
                <Badge variant={activeCategory === null ? "active" : "default"} onClick={() => setActiveCategory(null)}>
                  <Sparkles className="w-3 h-3" /> All
                </Badge>
                {CATEGORY_ORDER.map(cat => {
                  const Icon = CATEGORIES[cat].icon;
                  return (
                    <Badge
                      key={cat}
                      variant={activeCategory === cat ? "active" : "default"}
                      onClick={() => setActiveCategory(prev => prev === cat ? null : cat)}
                    >
                      <Icon className="w-3 h-3" />
                      {CATEGORIES[cat].label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Description toggle */}
            <div className="px-4 pb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDescriptions(prev => !prev)}
                className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg transition-colors cursor-pointer
                  ${showDescriptions ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                <AlignLeft className="w-3 h-3" />
                {showDescriptions ? "Hide descriptions" : "Show descriptions"}
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-4 pb-4 space-y-4">
                {filteredOps.length === 0 ? (
                  <EmptyState />
                ) : (
                  CATEGORY_ORDER.map(cat => {
                    const ops = grouped[cat];
                    if (!ops?.length) return null;
                    const meta = CATEGORIES[cat];
                    return (
                      <div key={cat}>
                        {/* Category header */}
                        <div className="flex items-center gap-2.5 px-1 pt-1 pb-2.5 sticky top-0 bg-background/95 backdrop-blur-md z-10">
                          <div className={`w-2 h-2 rounded-full ${meta.bgColor}`} />
                          <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wider">{meta.label}</span>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] font-mono text-muted-foreground/40">{ops.length}</span>
                        </div>
                        {/* Operator cards */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/50">
                          {ops.map(op => (
                            <OperatorItem key={op.keyword} op={op} flashing={flashId === op.keyword} showDescription={showDescriptions} onInsert={() => { insertDork(op.keyword); flash(op.keyword); }} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="flex-1 overflow-hidden">
            <ScrollArea className="flex-1 h-full">
              <div className="px-4 pb-4 space-y-2">
                {filteredTpls.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredTpls.map(tpl => (
                    <TemplateCard key={tpl.name} tpl={tpl} flashing={flashId === tpl.name} onInsert={() => { insertTemplate(tpl.query); flash(tpl.name); }} />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Footer />
      </div>
    </TooltipProvider>
  );
}

/* Operator Item — row inside a grouped card */
function OperatorItem({ op, flashing, showDescription, onInsert }: { op: DorkOperator; flashing: boolean; showDescription: boolean; onInsert: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onInsert();
    setCopied(true);
    setTimeout(() => setCopied(false), 600);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={`w-full text-left px-3.5 transition-all cursor-pointer group
            ${showDescription ? "py-2.5" : "py-1.5"}
            ${flashing
              ? "bg-primary/10"
              : "hover:bg-secondary/80"}`}
        >
          <div className="flex items-center gap-3">
            <code className="text-[12px] font-bold text-primary font-mono">{op.keyword}</code>
            <span className="flex-1" />
            <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {copied
                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              }
            </span>
          </div>
          {showDescription && (
            <p className="text-[11px] text-muted-foreground leading-snug mt-1">{op.description}</p>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="text-[11px] text-muted-foreground mb-1">{op.description}</p>
        <code className="font-mono text-primary text-[11px]">{op.example}</code>
      </TooltipContent>
    </Tooltip>
  );
}

/* Template Card */
function TemplateCard({ tpl, flashing, onInsert }: { tpl: DorkTemplate; flashing: boolean; onInsert: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onInsert();
    setCopied(true);
    setTimeout(() => setCopied(false), 600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`w-full text-left rounded-xl border transition-all cursor-pointer group
        ${flashing
          ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/25 hover:bg-surface"
        }`}
    >
      <div className="px-3.5 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <LayoutTemplate className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground">{tpl.name}</p>
            <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              {copied
                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              }
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tpl.description}</p>
          {expanded && (
            <code className="block text-[10px] text-muted-foreground/60 font-mono mt-2.5 px-3 py-2 bg-background/80 rounded-lg break-all leading-relaxed border border-border/50">
              {tpl.query}
            </code>
          )}
        </div>
      </div>
    </button>
  );
}

/* Empty State */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center">
        <Search className="w-6 h-6 text-muted-foreground/40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/60">No results found</p>
        <p className="text-xs text-muted-foreground mt-1.5">Try a different search term</p>
      </div>
    </div>
  );
}
