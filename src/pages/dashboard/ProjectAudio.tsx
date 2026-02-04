import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import { api, Project } from '@/lib/api';
import {
    Play,
    Upload,
    Trash2,
    Mic,
    Volume2,
    FileText,
    BarChart3,
    TerminalSquare
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
const PRIMARY = "#5f3b96";
const VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

export default function ProjectAudio() {
    const { isDark } = useTheme();

    const [messages, setMessages] = useState<string[]>([]);
    const [newTurn, setNewTurn] = useState("");

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [loadingModels, setLoadingModels] = useState(false);

    const [voice, setVoice] = useState("Kore");
    const [rightTab, setRightTab] = useState<"logs" | "performance">("logs");

    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful customer service agent for TechNova."
    );
    const [knowledgeBase, setKnowledgeBase] = useState("");
    const [toolConfig, setToolConfig] = useState("");
    const { projectId } = useParams();


    useEffect(() => {
        const raw = localStorage.getItem(`audio-session-${projectId}`);
        if (raw) {
            const session = JSON.parse(raw);
            setMessages(session.messages || []);
            setSystemPrompt(session.systemPrompt || "");
        }
    }, [projectId]);

    const handleCSV = (file: File) => {
        Papa.parse(file, {
            complete: (results) => {
                const rows = results.data as string[][];
                const cleaned = rows
                    .flat()
                    .filter((row) => row && row.trim() !== "");
                setMessages(cleaned);
            },
        });
    };

    // const [dragActive, setDragActive] = useState(false);
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

                setAvailableModels(modelList);

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
    }, []);

    return (
        <div className="h-[calc(100vh-4rem)] grid grid-cols-[320px_1fr_320px] bg-[#0a0714] text-white overflow-hidden">


            {/* LEFT */}
            <aside className="border-r border-white/10 bg-[#0f0b1d] flex flex-col overflow-hidden">


                <div className="sticky top-0 z-10 bg-[#0f0b1d] p-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Mic className="text-[#7c6cff]" />
                        <h2 className="font-semibold">Agent Config</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div>
                        <p className="text-sm opacity-60 mb-1">API Key</p>
                        <Input className="bg-white/5 border-white/10" placeholder="Use Env Var (Default)" />
                    </div>

                    <div>
                        <p className="text-sm opacity-60 mb-1">Model Provider</p>

                        <Select value={selectedModel} onValueChange={setSelectedModel}>

                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>

                            <SelectContent
                                className="bg-[#140c22] border-white/10 z-[9999]"
                            >

                                {loadingModels && (
                                    <SelectItem value="loading" disabled>
                                        Loading models...
                                    </SelectItem>
                                )}

                                {availableModels.map((model) => (
                                    <SelectItem key={model} value={model}>
                                        {model}
                                    </SelectItem>
                                ))}

                            </SelectContent>

                        </Select>



                    </div>

                    <div>
                        <p className="text-sm opacity-60 mb-2">Voice Profile</p>
                        <div className="grid grid-cols-2 gap-2">
                            {VOICES.map(v => (
                                <button
                                    key={v}
                                    onClick={() => setVoice(v)}
                                    className={cn(
                                        "rounded-lg px-3 py-2 text-sm border",
                                        voice === v
                                            ? "bg-[#5f3b96]/30 border-[#5f3b96]"
                                            : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <Volume2 className="inline w-4 h-4 mr-1" />
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm opacity-60 mb-1">System Prompt</p>
                        <Textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="bg-white/5 border-white/10 min-h-[140px]"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm opacity-70">Knowledge Base</p>

                            <button
                                onClick={() => document.getElementById("kbUpload")?.click()}
                                className="text-xs text-[#7c6cff] hover:underline"
                            >
                                Upload File
                            </button>
                        </div>

                        <Textarea
                            value={knowledgeBase}
                            onChange={(e) => setKnowledgeBase(e.target.value)}
                            placeholder="Paste knowledge base content here or upload a file..."
                            className="bg-white/5 border-white/10 min-h-[120px]"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm opacity-70">Tool Config</p>

                            <button
                                onClick={() => document.getElementById("toolUpload")?.click()}
                                className="text-xs text-[#7c6cff] hover:underline"
                            >
                                Upload JSON
                            </button>
                        </div>

                        <Textarea
                            value={toolConfig}
                            onChange={(e) => setToolConfig(e.target.value)}
                            placeholder='[{ "functionDeclarations": [...] }]'
                            className="bg-white/5 border-white/10 min-h-[120px] font-mono text-xs"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0f0b1d]">
                    <p className="text-green-400 text-sm">● Ready for evaluation</p>
                </div>
            </aside>


            {/* CENTER */}
            <main className="p-8 relative overflow-y-auto">


                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold">Test Suite</h1>
                        <p className="text-sm opacity-60">Evaluation for Latency, Context and Accuracy</p>
                    </div>

                    <Button className=" gap-2 rounded-xl bg-gradient-to-r from-[#5f3b96] to-[#7c6cff]">
                        <Play className="w-4 h-4" />
                        Run Evaluation
                    </Button>
                </div>

                {/* CSV */}
                <div
                // onDragOver={(e) => e.preventDefault()}
                // onDrop={(e) => {
                //     e.preventDefault();
                //     handleCSV(e.dataTransfer.files[0]);
                // }}
                // className="border border-dashed border-white/20 rounded-2xl p-10 text-center bg-white/5"
                >
                    {/* <FileText className="w-6 h-6 mx-auto mb-3 opacity-70" /> */}

                    {/* <p className="mb-4">Drag & drop CSV or click upload</p> */}
                    {
                        <input
                            type="file"
                            accept=".csv"
                            id="csvInput"
                            hidden
                            onChange={(e) => handleCSV(e.target.files?.[0]!)}
                        />}

                    <button
                        onClick={() => document.getElementById("csvInput")?.click()}
                        className="bg-white text-black px-5 py-2 rounded-lg flex items-center gap-2 mx-auto"
                    >
                        <Upload className="w-4 h-4" />
                        Upload CSV
                    </button>

                </div>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setMessages([])}
                        className="
      flex items-center gap-2
      text-sm text-red-400
      hover:text-red-300
    "
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>

                {/* Messages */}
                <div className="space-y-4 mt-8">

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 relative"
                        >

                            {/* Index */}
                            <span className="absolute -left-8 top-3 text-xs opacity-50">
                                #{i + 1}
                            </span>

                            {/* Delete Button */}
                            <button
                                onClick={() =>
                                    setMessages((prev) => prev.filter((_, idx) => idx !== i))
                                }
                                className="
        absolute right-3 top-3
        opacity-40 hover:opacity-80
      "
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Textarea */}
                            <textarea
                                value={msg}
                                onChange={(e) =>
                                    setMessages((prev) =>
                                        prev.map((m, idx) =>
                                            idx === i ? e.target.value : m
                                        )
                                    )
                                }
                                className="
        w-full bg-transparent resize-none
        outline-none text-white
      "
                            />
                        </div>
                    ))}
                    <input
                        type="file"
                        id="kbUpload"
                        hidden
                        onChange={(e) => console.log("KB File:", e.target.files?.[0])}
                    />

                    <input
                        type="file"
                        id="toolUpload"
                        hidden
                        accept=".json"
                        onChange={(e) => console.log("Tool JSON:", e.target.files?.[0])}
                    />


                </div>
                {/* ADD TURN BAR */}
                <div
                    className="
    mt-8
    flex items-center gap-3
    h-14
    px-5
    rounded-2xl
    bg-white/5
    border border-white/10
  "
                >

                    <input
                        value={newTurn}
                        onChange={(e) => setNewTurn(e.target.value)}
                        placeholder="Add new turn..."
                        className="
      flex-1
      bg-transparent
      outline-none
      text-white
      placeholder:text-white/50
      h-full
    "
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && newTurn.trim()) {
                                setMessages((p) => [...p, newTurn]);
                                setNewTurn("");
                            }
                        }}
                    />

                    <button
                        onClick={() => {
                            if (!newTurn.trim()) return;
                            setMessages((p) => [...p, newTurn]);
                            setNewTurn("");
                        }}
                        className="
      h-10 w-10
      rounded-xl
      bg-white
      text-black
      flex items-center justify-center
      hover:opacity-80
      transition
    "
                    >
                        +
                    </button>

                </div>




            </main>

            {/* RIGHT */}
            <aside className="border-l border-white/10 bg-[#0f0b1d] flex flex-col overflow-hidden">



                {/* Toggle */}
                <div className="sticky top-0 z-10 bg-[#0f0b1d] p-4 border-b border-white/10">
                    <div className="flex bg-white/5 rounded-lg p-1">

                        <button
                            onClick={() => setRightTab("logs")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 rounded-md py-1 text-sm",
                                rightTab === "logs" && "bg-[#5f3b96]"
                            )}
                        >
                            <TerminalSquare className="w-4 h-4" />Logs
                        </button>

                        <button
                            onClick={() => setRightTab("performance")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 rounded-md py-1 text-sm",
                                rightTab === "performance" && "bg-[#5f3b96]"
                            )}
                        >
                            <BarChart3 className="w-4 h-4" />Performance
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">

                    {rightTab === "logs" && (
                        <p className="opacity-40 text-sm text-center mt-20">
                            No logs yet...
                        </p>
                    )}

                    {rightTab === "performance" && (
                        <p className="opacity-40 text-sm text-center mt-20">
                            No performance data yet...
                        </p>
                    )}

                </div>


            </aside>

        </div>
    );
}
