import { useEffect, useState } from "react";
import {
    Wand2,
    Image as ImageIcon,
    Layers,
    Play,
    Sparkles,
    UploadCloud,
    Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api, Project } from '@/lib/api';
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import UploadChooseFile from "@/components/ui/uploadchoosefile";

const PRIMARY = "#5f3b96";

type Mode = "text" | "image" | "frames";

export default function ProjectImage() {
    const [models, setModels] = useState<{ id: string; name: string }[]>([]);
    const [model, setModel] = useState("");
    const { isDark } = useTheme();
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [loadingModels, setLoadingModels] = useState(false);
    const [mode, setMode] = useState<Mode>("text");
    // const [model, setModel] = useState("veo-3");
    const [prompt, setPrompt] = useState("");
    const [activeMainTab, setActiveMainTab] =
        useState<"generation" | "quality">("generation");
    const [qualityTab, setQualityTab] = useState<
        "upload" | "analyze" | "results" | "history"
    >("upload");
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
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);

    const handleGenerate = async () => {
        try {
            setLoadingImage(true);

            const res = await fetch("/api/image/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt,
                }),
            });

            const data = await res.json();

            // assuming API returns { imageUrl: "..." }
            setGeneratedImage(data.imageUrl);

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingImage(false);
        }
    };


    return (
        <div className="relative min-h-screen overflow-hidden">

            {/* ================= GLOWS ================= */}
            {isDark && (
                <>
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#5f3b96]/25 blur-[160px] rounded-full" />
                    <div className="absolute bottom-[-300px] right-[-300px] w-[700px] h-[700px] bg-[#6B5FC5]/25 blur-[160px] rounded-full" />
                </>
            )}

            <div
                className={cn(
                    "relative z-10 min-h-screen p-6",
                    isDark ? "bg-[#0b0713] text-white" : "bg-background"
                )}
            >

                {/* ================= HEADER ================= */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold pb-4">ImageStudio</h1>

                    {/* TOP MAIN TABS */}
                    <div className="flex gap-8 border-b border-white/10 mb-8">

                        <button
                            onClick={() => setActiveMainTab("generation")}
                            className={cn(
                                "pb-3 text-sm font-medium transition flex items-center gap-2",
                                activeMainTab === "generation"
                                    ? "text-white border-b-2"
                                    : "text-white/50 hover:text-white"
                            )}
                            style={{
                                borderColor:
                                    activeMainTab === "generation" ? "#5f3b96" : "transparent",
                            }}
                        >
                            <ImageIcon className="w-4 h-4" />
                            Image Generation
                        </button>


                        <button
                            onClick={() => setActiveMainTab("quality")}
                            className={cn(
                                "pb-3 text-sm font-medium transition",
                                activeMainTab === "quality"
                                    ? "text-white border-b-2"
                                    : "text-white/50 hover:text-white"
                            )}
                            style={{
                                borderColor:
                                    activeMainTab === "quality" ? "#5f3b96" : "transparent",
                            }}
                        >
                            ✔ Quality Check
                        </button>

                    </div>

                </div>

                {activeMainTab === "generation" && (
                    <>
                        {/* ================= MODE TABS ================= */}
                        <div className="flex gap-3 mb-6">

                            <ModeButton
                                active={mode === "text"}
                                onClick={() => setMode("text")}
                            >
                                <Wand2 className="w-4 h-4" />
                                Text to Image

                            </ModeButton>

                            <ModeButton
                                active={mode === "image"}
                                onClick={() => setMode("image")}
                            >
                                <ImageIcon className="w-4 h-4" />
                                Image to Video
                            </ModeButton>

                            <ModeButton
                                active={mode === "frames"}
                                onClick={() => setMode("frames")}
                            >
                                <Layers className="w-4 h-4" />
                                Frames to Image
                            </ModeButton>

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* ================= LEFT : PROMPT CARD ================= */}
                            <div
                                className={cn(
                                    "rounded-3xl p-6 border",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-black/10"
                                )}
                            >

                                {/* Model */}
                                <div className="flex w-full items-center justify-between mb-4">
                                    <p className="text-sm font-medium">Model</p>

                                    <Select value={selectedModel} onValueChange={setSelectedModel}>

                                        <SelectTrigger
                                            className={cn(
                                                "w-[220px]",
                                                isDark && "bg-white/5 border-white/10 text-white"
                                            )}
                                        >
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>

                                        <SelectContent
                                            className={cn(
                                                "w-[220px] bg-[#140c22] border-white/10 z-[9999]",
                                                isDark && "text-white"
                                            )}
                                        >
                                            {availableModels.map((model) => (
                                                <SelectItem key={model} value={model} className="truncate">

                                                    {model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>

                                </div>

                                {/* Prompt */}
                                <div className="mb-4">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-sm font-medium">Prompt</p>
                                        <span className="text-xs opacity-60">
                                            {prompt.length}/500
                                        </span>
                                    </div>

                                    <Textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        maxLength={500}
                                        placeholder="Describe what you want to create..."
                                        className={cn(
                                            "min-h-[200px] resize-none rounded-2xl",
                                            isDark &&
                                            "bg-[#0f0a1d] border-white/10 text-white placeholder:text-white/40"
                                        )}
                                    />

                                    {/* Clear Button */}
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={() => setPrompt("")}
                                            disabled={!prompt.length}
                                            className={cn(
                                                "flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition",
                                                prompt.length
                                                    ? "text-red-400 hover:bg-red-500/10"
                                                    : "text-white/30 cursor-not-allowed"
                                            )}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 h-12 rounded-xl text-white font-semibold shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
                                        }}
                                        onClick={handleGenerate}
                                    >
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate Image
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "h-12 rounded-xl gap-2",
                                            isDark &&
                                            "bg-white/5 border-white/10 text-green-400 hover:bg-white/10"
                                        )}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Random
                                    </Button>
                                </div>

                            </div>

                            {/* ================= RIGHT : RESULT PANEL ================= */}
                            {/* ================= RIGHT : RESULT PANEL ================= */}
                            <div
                                className={cn(
                                    "rounded-3xl h-[440px] border flex flex-col items-center justify-center overflow-hidden",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-black/10"
                                )}
                            >

                                {loadingImage ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin opacity-60" />
                                        <p className="text-sm opacity-60">Generating image...</p>
                                    </div>
                                ) : generatedImage ? (
                                    <img
                                        src={generatedImage}
                                        alt="Generated"
                                        className="w-full h-full object-contain rounded-3xl"
                                    />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                            <ImageIcon className="w-7 h-7 opacity-60" />
                                        </div>

                                        <h3 className="text-lg font-semibold">
                                            No image generated yet
                                        </h3>

                                        <p className="text-sm opacity-60 mt-1 text-center max-w-sm">
                                            Enter a prompt and choose a model to generate your image.
                                        </p>
                                    </>
                                )}
                            </div>


                        </div>
                    </>
                )}
                {/* ================= QUALITY CHECK ================= */}

                {activeMainTab === "quality" && (
                    <QualityCheck
                        activeTab={qualityTab}
                        setActiveTab={setQualityTab}
                    />
                )}
            </div>
        </div>
    );
}

/* ================= SMALL COMPONENTS ================= */

function TabButton({
    children,
    active,
}: {
    children: React.ReactNode;
    active?: boolean;
}) {
    return (
        <button
            className={cn(
                "pb-3 text-sm font-medium transition border-b-2",
                active
                    ? "text-white border-[#5f3b96]"
                    : "text-white/50 border-transparent hover:text-white"
            )}
        >
            {children}
        </button>
    );
}

function ModeButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition",
                active
                    ? "text-white bg-gradient-to-br from-[#5f3b96] to-[#6B5FC5]"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
            )}
        >
            {children}
        </button>
    );
}

function PresetChip({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition"
        >
            {children}
        </button>
    );
}
function QualityCheck({
    activeTab,
    setActiveTab,
}: {
    activeTab: string;
    setActiveTab: (v: any) => void;
}) {
    return (
        <div className="space-y-6">

            {/* SUB TABS */}
            <div className="flex gap-3 bg-white/5 p-1 rounded-xl w-fit " style={{
                background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
            }}
            >

                <SubTab active={activeTab === "upload"} onClick={() => setActiveTab("upload")}>
                    Upload
                </SubTab>
                <SubTab active={activeTab === "analyze"} onClick={() => setActiveTab("analyze")}>
                    Analyze
                </SubTab>

                <SubTab active={activeTab === "results"} onClick={() => setActiveTab("results")}>
                    Results
                </SubTab>

                <SubTab active={activeTab === "history"} onClick={() => setActiveTab("history")}>
                    History
                </SubTab>

            </div>

            {/* SUB CONTENT */}
            {activeTab === "upload" && <UploadTab />}
            {activeTab === "analyze" && <AnalyzeTab />}
            {activeTab === "results" && <ResultsTab />}
            {activeTab === "history" && <HistoryTab />}

        </div>
    );
}


function UploadTab() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Brand Guidelines */}
            <Card title="Brand Guidelines">
                <UploadChooseFile
                    label="Upload your brand guidelines PDF"
                    accept=".pdf"
                    onFileSelect={(file) => console.log(file)}
                />

            </Card>

            {/* Evaluation Results */}
            <Card title="Evaluation Results">
                <EmptyState text="Select an image and guidelines to see score." />
            </Card>

            {/* Select Video */}
            <Card title="Select Image">
                <EmptyState text="No recent images generated." />
                <Button className="mt-4 w-full flex-1 h-12 rounded-xl text-white font-semibold shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
                    }}>Run Analysis</Button>
            </Card>

        </div>
    );
}

function AnalyzeTab() {
    return <CenteredText text="Ready to analyze uploaded content." />;
}

function ResultsTab() {
    return <CenteredText text="No results yet." />;
}

function HistoryTab() {
    return <CenteredText text="No previous history." />;
}

/* -----------------------------------
 REUSABLE UI
------------------------------------ */

function MainTab({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "pb-3 flex items-center gap-2 font-medium transition",
                active
                    ? "text-white border-b-2"
                    : "text-white/50 hover:text-white"
            )}
            style={{
                borderColor: active ? PRIMARY : "transparent"
            }}
        >
            {children}
        </button>
    );
}

function SubTab({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 rounded-lg text-sm transition",
                active
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
            )}
        >
            {children}
        </button>
    );
}

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl p-6 border border-white/10 bg-white/5 space-y-4">
            <h3 className="font-semibold">{title}</h3>
            {children}
        </div>
    );
}

function UploadBox({ label }: { label: string }) {
    return (
        <div className="border border-dashed border-white/20 rounded-xl p-8 text-center space-y-3">
            <UploadCloud className="w-6 h-6 mx-auto opacity-70" />
            <p className="text-sm">{label}</p>
            <Button variant="outline">Choose File</Button>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <p className="text-sm text-white/50 text-center py-10">
            {text}
        </p>
    );
}

function CenteredText({ text }: { text: string }) {
    return (
        <div className="rounded-2xl p-12 border border-white/10 bg-white/5 text-center text-white/60">
            {text}
        </div>
    );
}
