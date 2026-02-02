import { useState } from "react";
import Papa from "papaparse";

import {
    Play,
    Upload,
    Trash2,
    Mic,
    Plus,
    Volume2,
    FileText,
    BarChart3,
    TerminalSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";

const PRIMARY = "#5f3b96";
const VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];

export default function ProjectAudio() {
    const { isDark } = useTheme();
    const [messages, setMessages] = useState<string[]>([]);
    const [newTurn, setNewTurn] = useState("");

    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful customer service agent for TechNova."
    );
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

    const [rightTab, setRightTab] = useState<"logs" | "performance">("logs");
    const [model, setModel] = useState("gemini-2.5-flash-audio-preview");
    const [voice, setVoice] = useState("Kore");
    const [dragActive, setDragActive] = useState(false);

    return (
        <div className="h-[calc(100vh-4rem)] grid grid-cols-[320px_1fr_320px] bg-[#0a0714] text-white">

            {/* LEFT */}
            <aside className="border-r border-white/10 bg-[#0f0b1d] p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Mic className="text-[#7c6cff]" />
                    <h2 className="font-semibold">Agent Config</h2>
                </div>

                <div>
                    <p className="text-sm opacity-60 mb-1">API Key</p>
                    <Input className="bg-white/5 border-white/10" placeholder="Use Env Var (Default)" />
                </div>

                <div>
                    <p className="text-sm opacity-60 mb-1">Model Provider</p>
                    <Input value={model} onChange={(e) => setModel(e.target.value)} className="bg-white/5 border-white/10" />
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

                <p className="text-green-400 text-sm">● Ready for evaluation</p>
            </aside>

            {/* CENTER */}
            <main className="p-8 overflow-y-auto relative">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold">Test Suite</h1>
                        <p className="text-sm opacity-60">Evaluation for Latency, Context and Accuracy</p>
                    </div>

                    <Button className="gap-2 bg-gradient-to-r from-[#5f3b96] to-[#7c6cff]">
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


                </div>
                {/* ADD TURN BAR */}
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
            <aside className="border-l border-white/10 bg-[#0f0b1d] p-4">

                {/* Toggle */}
                <div className="flex bg-white/5 rounded-lg p-1 mb-6">
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

            </aside>

        </div>
    );
}
