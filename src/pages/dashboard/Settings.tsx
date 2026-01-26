import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  KeyRound,
  Layers,
  Tags,
  Plus,
  Save,
} from "lucide-react";

/* ---------------------------------- */

type TabType = "api" | "models" | "tags";

const PRIMARY = "#4D456E";

const PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic (Claude)" },
  { id: "google", name: "Google Gemini" },
  { id: "mistral", name: "Mistral" },
  { id: "cohere", name: "Cohere" },
];

/* ---------------------------------- */

export default function Settings() {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const { projectId } = useParams();

  const [activeTab, setActiveTab] = useState<TabType>("api");

  const [apiKeysStatus, setApiKeysStatus] =
    useState<Record<string, boolean>>({});

  const [apiKeyInputs, setApiKeyInputs] =
    useState<Record<string, string>>({});

  const [savingKey, setSavingKey] = useState<string | null>(null);

  /* ---------------------------------- */
  /* Load API Key Status */

  useEffect(() => {
    if (!projectId) return;

    const loadStatus = async () => {
      try {
        const status = await api.getApiKeysStatus(projectId);
        setApiKeysStatus(status || {});
      } catch (err) {
        console.error("Failed to load key status", err);
      }
    };

    loadStatus();
  }, [projectId]);

  /* ---------------------------------- */
  /* Save Key */

  const handleSaveKey = async (provider: string) => {
    if (!apiKeyInputs[provider] || !projectId) return;

    try {
      setSavingKey(provider);

      await api.updateApiKeys(projectId, {
        [provider]: apiKeyInputs[provider],
      });

      toast({
        title: "Success",
        description: `${provider} key saved`,
      });

      setApiKeyInputs((prev) => ({ ...prev, [provider]: "" }));

      const status = await api.getApiKeysStatus(projectId);
      setApiKeysStatus(status || {});
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save key",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  /* ---------------------------------- */

  return (
    <div className="space-y-8 animate-fade-in">

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
          Manage API keys and models for your projects.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-white/10">

        {[
          { id: "api", label: "API Keys", icon: KeyRound },
          { id: "models", label: "Model Manager", icon: Layers },
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

      {/* ================================================= */}
      {/* API KEYS TAB */}
      {/* ================================================= */}

      {activeTab === "api" && (
        <div
          className="rounded-3xl border p-8"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
              : "#ffffff",
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <KeyRound className="w-5 h-5 text-[#8B7CF6]" />
            <h2
              className="text-xl font-semibold"
              style={{ color: isDark ? "#fff" : "#1f1b2e" }}
            >
              API Keys
            </h2>
          </div>

          <div className="space-y-8">

            {PROVIDERS.map((p) => (
              <div key={p.id} className="space-y-2">

                <div className="flex items-center justify-between">
                  <p
                    className="font-medium"
                    style={{ color: isDark ? "#fff" : "#1f1b2e" }}
                  >
                    {p.name}
                  </p>

                  {apiKeysStatus[p.id] && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Configured
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="password"
                    placeholder={
                      apiKeysStatus[p.id]
                        ? "••••••••••••"
                        : "Enter API key"
                    }
                    value={apiKeyInputs[p.id] || ""}
                    onChange={(e) =>
                      setApiKeyInputs((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    className={cn(
                      "h-11 rounded-xl",
                      isDark &&
                        "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    )}
                  />

                  <Button
                    onClick={() => handleSaveKey(p.id)}
                    disabled={
                      !apiKeyInputs[p.id] ||
                      savingKey === p.id
                    }
                    className="h-11 rounded-xl px-6 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                    }}
                  >
                    {savingKey === p.id ? (
                      <Save className="w-4 h-4 animate-pulse" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>

              </div>
            ))}

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODEL MANAGER */}
      {/* ================================================= */}

      {activeTab === "models" && (
        <div
          className="rounded-3xl border p-12 text-center"
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
            Configure and manage your available models here.
          </p>
        </div>
      )}

      {/* ================================================= */}
      {/* TAG MANAGER */}
      {/* ================================================= */}

      {activeTab === "tags" && (
        <div
          className="rounded-3xl border p-12 text-center"
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
