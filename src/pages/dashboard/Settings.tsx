import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api, Organization, Project } from "@/lib/api";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    KeyRound,
    Layers,
    Save,
    Loader2,
    Settings as SettingsIcon,
    Sparkles,
    AlertCircle,
    FolderKanban,
} from "lucide-react";
import ModelManager from "./ModelManager";

const PRIMARY = "#5f3b96";

export default function Settings() {
    const [systemModels, setSystemModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    // custom models
    const [customModels, setCustomModels] = useState<string[]>([]);
    const [customModelName, setCustomModelName] = useState("");
    const [customProvider, setCustomProvider] = useState("");
    const [customDialogOpen, setCustomDialogOpen] = useState(false);

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const { isDark } = useTheme();
    const { toast } = useToast();
    const { projectId: routeProjectId } = useParams();
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState<"api" | "models">("api");

    // Organizations and Projects state (similar to Projects.tsx)
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(routeProjectId || null);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [loadingProjects, setLoadingProjects] = useState(false);

    // Same state structure as ProjectDetail.tsx
    const [apiKeysStatus, setApiKeysStatus] = useState<{ [key: string]: boolean }>({});
    const [apiKeyInputs, setApiKeyInputs] = useState<{ [key: string]: string }>({});
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);
    const [loadingKeys, setLoadingKeys] = useState(false);

    // Fetch Organizations on mount
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                setLoadingOrgs(true);
                const orgs = await api.getOrganizations();
                setOrganizations(orgs);
                if (orgs.length > 0 && !selectedOrgId) {
                    setSelectedOrgId(orgs[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch organizations', error);
                toast({ title: 'Error', description: 'Failed to fetch organizations', variant: 'destructive' });
            } finally {
                setLoadingOrgs(false);
            }
        };
        fetchOrgs();
    }, []);

    // Fetch Projects when org changes
    useEffect(() => {
        const fetchProjects = async () => {
            if (!selectedOrgId) {
                setProjects([]);
                return;
            }

            try {
                setLoadingProjects(true);
                const projs = await api.getProjects(selectedOrgId);
                setProjects(projs);

                // Auto-select first project if none selected
                if (projs.length > 0 && !selectedProjectId) {
                    setSelectedProjectId(projs[0]._id);
                } else if (projs.length === 0) {
                    setSelectedProjectId(null);
                }
            } catch (error) {
                console.error('Failed to fetch projects', error);
                toast({ title: 'Error', description: 'Failed to fetch projects', variant: 'destructive' });
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchProjects();
    }, [selectedOrgId]);

    // Load API Key Status when project changes
    useEffect(() => {
        const loadApiKeysStatus = async () => {
            if (!selectedProjectId) {
                setApiKeysStatus({});
                return;
            }

            try {
                setLoadingKeys(true);
                const status = await api.getApiKeysStatus(selectedProjectId);
                setApiKeysStatus(status as { [key: string]: boolean });
            } catch (err: any) {
                console.error("Failed to load API keys status:", err);
                // Initialize with empty status so UI still renders
                setApiKeysStatus({});
            } finally {
                setLoadingKeys(false);
            }
        };

        loadApiKeysStatus();
    }, [selectedProjectId]);

    // Same handler as ProjectDetail.tsx
    const handleUpdateApiKey = async (provider: string) => {
        if (!selectedProjectId || !apiKeyInputs[provider]) return;
        try {
            setUpdatingKey(provider);
            await api.updateApiKeys(selectedProjectId, { [provider]: apiKeyInputs[provider] });
            toast({ title: 'Success', description: `${provider} key saved` });
            setApiKeyInputs(prev => ({ ...prev, [provider]: '' }));
            const status = await api.getApiKeysStatus(selectedProjectId);
            setApiKeysStatus(status as { [key: string]: boolean });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save key', variant: 'destructive' });
        } finally {
            setUpdatingKey(null);
        }
    };
    useEffect(() => {
        const loadModels = async () => {
            try {
                setLoadingModels(true);

                const modelsResponse = await api.getModels();

                let modelList: string[] = [];

                if (Array.isArray(modelsResponse)) {
                    modelList = modelsResponse;
                } else if (modelsResponse?.data) {
                    modelList = modelsResponse.data.flatMap(
                        (p: any) => p.models || []
                    );
                }

                console.log("MODELS:", modelList);

                setSystemModels(modelList);


                if (modelList.length && !selectedModel) {
                    setSelectedModel(modelList[0]);
                }
            } catch (e) {
                console.error("Failed to fetch models:", e);

                setAvailableModels([
                    "gpt-4",
                    "gpt-4o",
                    "gpt-3.5-turbo",
                    "claude-3-opus-20240229",
                    "claude-3-sonnet-20240229"
                ]);
            } finally {
                setLoadingModels(false);
            }
        };

        loadModels();
    }, [activeTab]);

    // Show loading state for initial org fetch
    if (loadingOrgs) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">

            {/* ================= HEADER ================= */}

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                {/* LEFT */}
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="h-11 w-11 rounded-2xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                            }}
                        >
                            <SettingsIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1
                            className="text-2xl sm:text-3xl font-bold"
                            style={{ color: isDark ? '#fff' : '#1f1b2e' }}
                        >
                            Settings
                        </h1>
                        {/* <Sparkles className="w-5 h-5 text-muted-foreground" /> */}
                    </div>

                    <p
                        className="text-sm mt-2 max-w-2xl"
                        style={{
                            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
                        }}
                    >
                        Configure API keys for different LLM providers to enable model generation and evaluation.
                    </p>
                </div>

                {/* Organization & Project Selectors */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <Select value={selectedOrgId || ''} onValueChange={setSelectedOrgId}>
                        <SelectTrigger
                            className={cn(
                                'w-full sm:w-[200px] rounded-2xl',
                                isDark && 'bg-white/5 border-white/10 text-white'
                            )}
                        >
                            <SelectValue placeholder="Select Organization" />
                        </SelectTrigger>
                        <SelectContent className={cn(isDark && 'bg-[#1a1625] border-white/10')}>
                            {organizations.map((org) => (
                                <SelectItem key={org._id} value={org._id}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedProjectId || ''}
                        onValueChange={setSelectedProjectId}
                        disabled={loadingProjects || projects.length === 0}
                    >
                        <SelectTrigger
                            className={cn(
                                'w-full sm:w-[200px] rounded-2xl',
                                isDark && 'bg-white/5 border-white/10 text-white'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <FolderKanban className="w-4 h-4" />
                                <SelectValue placeholder={loadingProjects ? "Loading..." : "Select Project"} />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={cn(isDark && 'bg-[#1a1625] border-white/10')}>
                            {projects.map((project) => (
                                <SelectItem key={project._id} value={project._id}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* No Project Selected Warning */}
            {!selectedProjectId && (
                <Card className={cn(
                    "rounded-2xl border p-4 flex items-center gap-3",
                    isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
                )}>
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <p className={cn(
                        "text-sm",
                        isDark ? 'text-yellow-400' : 'text-yellow-700'
                    )}>
                        {organizations.length === 0
                            ? "No organizations found. Please create an organization first."
                            : projects.length === 0
                                ? "No projects found in this organization. Please create a project first."
                                : "Please select a project to configure API keys."
                        }
                    </p>
                    {organizations.length === 0 && (
                        <Link to="/dashboard/organizations">
                            <Button
                                size="sm"
                                className="rounded-xl ml-auto"
                                style={{
                                    background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                                    color: 'white',
                                }}
                            >
                                Go to Organizations
                            </Button>
                        </Link>
                    )}
                    {organizations.length > 0 && projects.length === 0 && (
                        <Link to="/dashboard/projects">
                            <Button
                                size="sm"
                                className="rounded-xl ml-auto"
                                style={{
                                    background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                                    color: 'white',
                                }}
                            >
                                Go to Projects
                            </Button>
                        </Link>
                    )}
                </Card>
            )}

            {/* TABS */}
            <div className={cn(
                "flex gap-6 border-b",
                isDark ? 'border-white/10' : 'border-border'
            )}>
                {[
                    { id: "api", label: "API Keys", icon: KeyRound },
                    { id: "models", label: "Model Manager", icon: Layers },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "api" | "models")}
                            className={cn(
                                "pb-3 flex items-center gap-2 text-sm font-medium transition",
                                active
                                    ? "border-b-2"
                                    : isDark
                                        ? "text-white/60 hover:text-white"
                                        : "text-muted-foreground hover:text-foreground"
                            )}
                            style={active ? {
                                color: PRIMARY,
                                borderColor: PRIMARY
                            } : undefined}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* API KEYS TAB */}
            {activeTab === "api" && (
                <Card
                    className={cn(
                        "rounded-3xl border p-6 sm:p-8",
                        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
                    )}
                    style={{
                        background: isDark
                            ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))'
                            : 'linear-gradient(180deg, #ffffff, #f6f4ff)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <KeyRound className="w-5 h-5" style={{ color: PRIMARY }} />
                        <h2
                            className={cn(
                                "text-xl font-semibold",
                                isDark ? 'text-white' : 'text-foreground'
                            )}
                        >
                            API Keys
                        </h2>
                        {loadingKeys && <Loader2 className="w-4 h-4 animate-spin ml-2" style={{ color: PRIMARY }} />}
                    </div>

                    {!selectedProjectId ? (
                        <div className={cn(
                            "text-center py-8",
                            isDark ? 'text-white/60' : 'text-muted-foreground'
                        )}>
                            <KeyRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Select a project above to configure API keys</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Same providers as ProjectDetail.tsx */}
                            {['openai', 'anthropic', 'google', 'mistral', 'cohere'].map(provider => (
                                <div key={provider} className="flex flex-col sm:flex-row sm:items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label className={cn(
                                            "capitalize flex items-center justify-between",
                                            isDark && 'text-white'
                                        )}>
                                            <span className="font-medium">{provider}</span>
                                            {apiKeysStatus[provider] && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600 border-green-600"
                                                >
                                                    Configured
                                                </Badge>
                                            )}
                                        </Label>
                                        <Input
                                            type="password"
                                            placeholder={apiKeysStatus[provider] ? "••••••••" : `Enter ${provider} key`}
                                            value={apiKeyInputs[provider] || ''}
                                            onChange={e => setApiKeyInputs(prev => ({ ...prev, [provider]: e.target.value }))}
                                            className={cn(
                                                "h-11 rounded-xl",
                                                isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                                            )}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => handleUpdateApiKey(provider)}
                                        disabled={!apiKeyInputs[provider] || updatingKey === provider}
                                        className="h-11 rounded-xl px-6"
                                        style={{
                                            background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                                            color: 'white',
                                        }}
                                    >
                                        {updatingKey === provider ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* MODEL MANAGER TAB */}
            {activeTab === "models" && (
                <div className="space-y-10 animate-fade-in">

                    {/* Header */}
                    <div className="flex items-center justify-between">

                        <div>
                            <h2
                                className={cn(
                                    "text-2xl font-semibold",
                                    isDark ? "text-white" : "text-foreground"
                                )}
                            >
                                Model Manager
                            </h2>

                            <p
                                className={cn(
                                    "text-sm mt-1",
                                    isDark ? "text-white/60" : "text-muted-foreground"
                                )}
                            >
                                Manage system and custom models
                            </p>
                        </div>

                        {/* Add Custom Model */}
                        <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="rounded-xl text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,

                                    }}
                                >
                                    + Add custom model
                                </Button>
                            </DialogTrigger>

                            <DialogContent
                                className={cn(
                                    "rounded-2xl",
                                    isDark
                                        ? "bg-[#140c22] border-white/10 text-white"
                                        : "bg-white"
                                )}
                            >
                                <DialogHeader>
                                    <DialogTitle>Add Custom Model</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">

                                    <Input
                                        placeholder="Model nickname"
                                        value={customModelName}
                                        onChange={(e) => setCustomModelName(e.target.value)}
                                    />

                                    <Input
                                        placeholder="Provider (OpenAI, Anthropic...)"
                                        value={customProvider}
                                        onChange={(e) => setCustomProvider(e.target.value)}
                                    />

                                    <Button
                                        className="w-full text-white"
                                        style={{
                                            background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`
                                        }}
                                        onClick={() => {
                                            if (!customModelName) return;

                                            setCustomModels((prev) => [
                                                ...prev,
                                                `${customModelName} (${customProvider})`,
                                            ]);

                                            setCustomModelName("");
                                            setCustomProvider("");
                                            setCustomDialogOpen(false);

                                            toast({ title: "Custom model added" });
                                        }}
                                    >
                                        Save Model
                                    </Button>

                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* ================= CUSTOM MODELS ================= */}

                    <div
                        className={cn(
                            "rounded-3xl p-6 border",
                            isDark ? "bg-white/5 border-white/10" : "bg-white border-black/10"
                        )}
                    >
                        <h3 className="font-semibold mb-4"
                            style={{ color: isDark ? '#fff' : '#1f1b2e' }}>Custom Models</h3>

                        {customModels.length === 0 ? (
                            <p className={cn(
                                "text-sm",
                                isDark ? "text-white/50" : "text-muted-foreground"
                            )}>
                                No custom models yet
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {customModels.map((m) => (
                                    <ModelChip key={m} name={m} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ================= SYSTEM MODELS ================= */}

                    <div
                        className={cn(
                            "rounded-3xl p-6 border",
                            isDark ? "bg-white/5 border-white/10" : "bg-white border-black/10"
                        )}
                    >
                        <h3 className="font-semibold mb-4" style={{ color: isDark ? '#fff' : '#1f1b2e' }}>System Models</h3>

                        {loadingModels ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading models...
                            </div>
                        ) : systemModels.length === 0 ? (
                            <p className={cn(
                                "text-sm",
                                isDark ? "text-white/50" : "text-muted-foreground"
                            )}>
                                No system models available
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {systemModels.map((model) => (
                                    <ModelChip key={model} name={model} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}
function ModelChip({ name }: { name: string }) {
    const { isDark } = useTheme();

    return (
        <div
            className={cn(
                "px-4 py-2 rounded-full border text-sm flex items-center gap-2 transition",
                isDark
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-slate-50 border-black/10 hover:bg-slate-100"
            )}
        >
            {name}

            <button className="opacity-60 hover:opacity-100">
                ⋮
            </button>
        </div>
    );
}

