import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Link2,
  Shield,
  Workflow,
  ScrollText,
  Package,
  Settings,
  Search,
  Sparkles,
  Bell,
  User,
  Moon,
  Sun,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, keywords: ["home", "workspace", "widgets"] },
  { name: "Connectors", href: "/connectors", icon: Link2, keywords: ["binance", "bank", "broker", "sync"] },
  { name: "Rules & Risk", href: "/rules-risk", icon: Shield, keywords: ["autonomy", "kill switch", "limits"] },
  { name: "Automations", href: "/automations", icon: Workflow, keywords: ["workflows", "triggers", "actions"] },
  { name: "Audit Log", href: "/audit-log", icon: ScrollText, keywords: ["history", "timeline", "events"] },
  { name: "Module Store", href: "/module-store", icon: Package, keywords: ["install", "plugins", "extensions"] },
  { name: "Settings", href: "/settings", icon: Settings, keywords: ["profile", "notifications", "theme"] },
];

const quickActions = [
  { name: "Add Widget", action: "add-widget", icon: LayoutDashboard, keywords: ["create", "new"] },
  { name: "Add Connector", action: "add-connector", icon: Link2, keywords: ["connect", "integrate"] },
  { name: "Create Workflow", action: "create-workflow", icon: Workflow, keywords: ["automation", "new"] },
  { name: "Toggle Kill Switch", action: "kill-switch", icon: Shield, keywords: ["emergency", "stop"] },
];

const searchSuggestions = [
  { name: "Net Worth Widget", type: "widget", icon: Sparkles },
  { name: "Binance Connector", type: "connector", icon: Link2 },
  { name: "Daily Loss Limit", type: "setting", icon: Shield },
  { name: "Portfolio Rebalancer", type: "module", icon: Package },
];

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleSelect = useCallback((value: string) => {
    setOpen(false);

    // Handle navigation
    const navItem = navigationItems.find(item => item.href === value);
    if (navItem) {
      navigate(navItem.href);
      return;
    }

    // Handle quick actions (would trigger modals/actions in real app)
    console.log("Action triggered:", value);
  }, [navigate, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, or settings..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              value={item.href}
              onSelect={handleSelect}
              keywords={item.keywords}
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem
              key={item.action}
              value={item.action}
              onSelect={handleSelect}
              keywords={item.keywords}
            >
              <item.icon className="mr-2 h-4 w-4 text-primary" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Suggestions">
          {searchSuggestions.map((item) => (
            <CommandItem
              key={item.name}
              value={item.name.toLowerCase()}
              onSelect={handleSelect}
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.name}</span>
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                {item.type}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
