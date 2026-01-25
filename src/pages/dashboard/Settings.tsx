import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  Info,
  Plus,
  Layers,
  Tags
} from "lucide-react";

const PRIMARY = "#4D456E";

type TabType = "api" | "models" | "tags";

const providers = [
  {
    id: "gemini",
    name: "Google Gemini",
    link: "https://makersuite.google.com/app/apikey",
  },
  {
    id: "openai",
    name: "OpenAI",
    link: "https://platform.openai.com/api-keys",
  },
  {
    id: "claude",
    name: "Claude",
    link: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "mistral",
    name: "Mistral",
    link: "https://console.mistral.ai/api-keys/",
  },
];

export default function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("api");
  const [keys, setKeys] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: string) => {
    setKeys((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: isDark ? "#fff" : "#1f1b2e" }}
        >
          Settings
        </h1>

        <p
          className="mt-2"
          style={{
            color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)",
          }}
        >
          Manage API keys, models and tags
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-white/10">

        {[
          { id: "api", label: "API Keys", icon: KeyRound },
          { id: "models", label: "Model manager", icon: Layers },
          { id: "tags", label: "Tag manager", icon: Tags },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "pb-3 flex items-center gap-2 text-sm font-medium transition",
                active
                  ? "text-[#8B7CF6] border-b-2 border-[#8B7CF6]"
                  : isDark
                  ? "text-white/60 hover:text-white"
                  : "text-muted-foreground hover:text-black"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= API KEYS ================= */}
      {activeTab === "api" && (
        <div
          className="rounded-3xl border p-8 transition-colors"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
              : "#ffffff",
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.08)",
          }}
        >

          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#8B7CF6]" />
            <h2
              className="text-xl font-semibold"
              style={{ color: isDark ? "#fff" : "#1f1b2e" }}
            >
              API Keys
            </h2>
          </div>

          <p
            className="mt-3 flex items-center gap-2 text-sm"
            style={{
              color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)",
            }}
          >
            Stax uses your API keys to interact with AI models on your behalf.
            <Info className="w-4 h-4 opacity-70" />
          </p>

          <div className="mt-8 space-y-8">
            {providers.map((p) => (
              <div key={p.id} className="space-y-2">

                <p
                  className="font-medium"
                  style={{ color: isDark ? "#fff" : "#1f1b2e" }}
                >
                  {p.name}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Add your key"
                    value={keys[p.id] || ""}
                    onChange={(e) =>
                      handleChange(p.id, e.target.value)
                    }
                    className={cn(
                      "h-11 rounded-xl",
                      isDark &&
                        "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    )}
                  />

                  <Button
                    className="h-11 rounded-xl px-6 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add key
                  </Button>
                </div>

                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#8B7CF6] hover:underline"
                >
                  Get {p.name} API Key
                </a>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODEL MANAGER ================= */}
      {activeTab === "models" && (
        <div
          className="rounded-3xl border p-10 text-center"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
              : "#ffffff",
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.08)",
            color: isDark ? "#fff" : "#1f1b2e",
          }}
        >
          <Layers className="w-10 h-10 mx-auto mb-4 text-[#8B7CF6]" />
          <h3 className="text-lg font-semibold">Model Manager</h3>
          <p className="mt-2 opacity-70">
            Configure and manage your available LLM models here.
          </p>
        </div>
      )}

      {/* ================= TAG MANAGER ================= */}
      {activeTab === "tags" && (
        <div
          className="rounded-3xl border p-10 text-center"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
              : "#ffffff",
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.08)",
            color: isDark ? "#fff" : "#1f1b2e",
          }}
        >
          <Tags className="w-10 h-10 mx-auto mb-4 text-[#8B7CF6]" />
          <h3 className="text-lg font-semibold">Tag Manager</h3>
          <p className="mt-2 opacity-70">
            Create and organize tags for datasets and projects.
          </p>
        </div>
      )}
    </div>
  );
}
