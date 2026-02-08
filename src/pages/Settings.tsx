import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="finance-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Profile</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
            <Input defaultValue="Alex Chen" className="bg-muted border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <Input defaultValue="alex@financeos.io" className="bg-muted border-border" />
          </div>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
      </div>

      {/* Notifications */}
      <div className="finance-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        {[
          { label: "Email notifications", desc: "Receive alerts via email", on: true },
          { label: "Push notifications", desc: "Browser push alerts", on: false },
          { label: "Telegram bot", desc: "Get alerts on Telegram", on: true },
          { label: "SMS alerts", desc: "Critical alerts via SMS", on: false },
        ].map((n) => (
          <div key={n.label} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground">{n.label}</div>
              <div className="text-xs text-muted-foreground">{n.desc}</div>
            </div>
            <Switch defaultChecked={n.on} />
          </div>
        ))}
      </div>

      {/* Theme */}
      <div className="finance-card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        </div>
        <div className="flex gap-3">
          {["Dark", "Light", "System"].map((t) => (
            <button
              key={t}
              className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                t === "Dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="finance-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground">Two-Factor Authentication</div>
              <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground">API Keys</div>
              <div className="text-xs text-muted-foreground">Manage your API access tokens</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Key className="h-3 w-3" /> Manage
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
