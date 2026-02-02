import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Paperclip,
  Code2,
  Send,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PRIMARY = "#5f3b96";
const MODELS = [
  { id: "gpt-4", name: "GPT-4", tag: "text" },
  { id: "gpt-3.5", name: "GPT-3.5", tag: "text" },
  { id: "claude", name: "Claude", tag: "text" },
  { id: "gemini-pro", name: "Gemini 3 Pro", tag: "text" },
  { id: "grok", name: "Grok 4.1 Thinking", tag: "text" },
];

export default function Playground() {
  const { isDark } = useTheme();

  const [mode, setMode] = useState<"pointwise" | "side">("pointwise");

  const [model, setModel] = useState("gpt-4");
  const [modelA, setModelA] = useState("gpt-4");
  const [modelB, setModelB] = useState("claude");

  const { projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName || "Project";
  const [modelSearch, setModelSearch] = useState("");
  const [modelTab, setModelTab] = useState<"text" | "code" | "search">("text");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <input
        type="file"
        id="fileUpload"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Glow Background */}
      {isDark && (
        <>
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#5f3b96]/30 blur-[140px] rounded-full" />
          <div className="absolute top-1/3 right-[-300px] w-[700px] h-[700px] bg-[#6B5FC5]/25 blur-[160px] rounded-full" />
        </>
      )}

      {/* Main */}
      <div
        className={cn(
          "relative z-10 min-h-screen flex flex-col backdrop-blur-[2px]",
          isDark ? "bg-[#0b0713] text-white" : "bg-background"
        )}
      >

        {/* AI BG IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10))"
          }}
        />

        {/* HEADER */}
        <div
          className={cn(
            "sticky top-0 z-20",
            isDark
              ? "bg-[#0b0713]/70 backdrop-blur-xl border-b border-white/10"
              : "bg-background/70 backdrop-blur-xl border-b"
          )}
        >
          <div className="flex items-center justify-between px-6 h-14">

            {/* LEFT */}
            <div className="flex items-center gap-3 text-sm">
              <Link
                to="/dashboard/projects"
                className={cn(
                  isDark
                    ? "text-white/60 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Projects
              </Link>

              <ChevronRight className="w-4 h-4 opacity-40" />

              <Link
                to={`/dashboard/projects/${projectId}`}
                className={cn(
                  isDark
                    ? "text-white/60 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {projectName}
              </Link>

              <ChevronRight className="w-4 h-4 opacity-40" />

              <span className="font-semibold tracking-wide bg-gradient-to-r from-[#6B5FC5] to-[#9b7cff] bg-clip-text text-transparent">
                Playground
              </span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* MODE */}
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger
                  className="
                      h-9 w-[220px]
                      bg-white/5 border-white/10 text-white
                      flex items-center gap-3 px-3
                      transition-all
                      hover:border-[#6B5FC5]/60
                      hover:shadow-[0_0_0_1px_rgba(107,95,197,0.5)]
                    "
                >
                  {mode === "pointwise" ? (
                    <Send className="w-4 h-4 opacity-80" />
                  ) : (
                    <Code2 className="w-4 h-4 opacity-80" />
                  )}

                  <div className="flex flex-col leading-tight text-left">
                    <span className="text-sm font-medium">
                      {mode === "pointwise" ? "Pointwise Evaluation" : "Side by Side"}
                    </span>

                  </div>
                </SelectTrigger>

                <SelectContent className="bg-[#140c22] border-white/10 animate-dropdown p-2 w-[260px]">
                  <SelectItem value="pointwise" className="rounded-lg p-3 focus:bg-white/10">
                    <div className="flex gap-3">
                      <Send className="w-4 h-4 mt-1 opacity-70" />
                      <div>
                        <p className="font-medium">Pointwise Evalution</p>
                        <p className="text-xs text-white/60">
                          Chat with one model at a time
                        </p>
                      </div>
                    </div>
                  </SelectItem>

                  <SelectItem value="side" className="rounded-lg p-3 focus:bg-white/10">
                    <div className="flex gap-3">
                      <Code2 className="w-4 h-4 mt-1 opacity-70" />
                      <div>
                        <p className="font-medium">Side by Side</p>
                        <p className="text-xs text-white/60">
                          Compare two models of your choice
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* MODEL */}
              {mode === "pointwise" && (
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-9 w-[180px] bg-white/5 border-white/10 text-white">
                    {MODELS.find(m => m.id === model)?.name}
                  </SelectTrigger>

                  <SelectContent className="bg-[#140c22] border-white/10 w-[320px] p-2 animate-dropdown">

                    {/* Search */}
                    <input
                      placeholder="Search models"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="w-full mb-2 px-3 py-2 rounded-lg bg-white/5 outline-none text-sm"
                    />

                    {/* Tabs */}
                    <input
                      placeholder="System instruction..."
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="
      w-full mb-2
      px-3 py-2 rounded-lg
      bg-white/5 border border-white/10
      text-sm outline-none
      placeholder:text-white/40
    "
                    />


                    {/* Models */}
                    <div className="max-h-[260px] overflow-y-auto">
                      {MODELS.filter(
                        m =>
                          m.tag === modelTab &&
                          m.name.toLowerCase().includes(modelSearch.toLowerCase())
                      ).map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id}
                          className="flex justify-between rounded-md p-2"
                        >
                          {m.name}
                          {model === m.id}
                        </SelectItem>
                      ))}
                    </div>

                  </SelectContent>
                </Select>

              )}

              {mode === "side" && (
                <>
                  <Select value={modelA} onValueChange={setModelA}>
                    <SelectTrigger className="h-9 w-[180px] bg-white/5 border-white/10 text-white">
                      {MODELS.find(m => m.id === model)?.name}
                    </SelectTrigger>

                    <SelectContent className="bg-[#140c22] border-white/10 w-[320px] p-2 animate-dropdown">

                      {/* Search */}
                      <input
                        placeholder="Search models"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="w-full mb-2 px-3 py-2 rounded-lg bg-white/5 outline-none text-sm"
                      />

                      {/* Tabs */}
                      <input
                        placeholder="System instruction..."
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="
      w-full mb-2
      px-3 py-2 rounded-lg
      bg-white/5 border border-white/10
      text-sm outline-none
      placeholder:text-white/40
    "
                      />


                      {/* Models */}
                      <div className="max-h-[260px] overflow-y-auto">
                        {MODELS.filter(
                          m =>
                            m.tag === modelTab &&
                            m.name.toLowerCase().includes(modelSearch.toLowerCase())
                        ).map((m) => (
                          <SelectItem
                            key={m.id}
                            value={m.id}
                            className="flex justify-between rounded-md p-2"
                          >
                            {m.name}
                            {model === m.id}
                          </SelectItem>
                        ))}
                      </div>

                    </SelectContent>
                  </Select>

                  <Select value={modelB} onValueChange={setModelB}>
                    <SelectTrigger className="h-9 w-[180px] bg-white/5 border-white/10 text-white">
                      {MODELS.find(m => m.id === model)?.name}
                    </SelectTrigger>

                    <SelectContent className="bg-[#140c22] border-white/10 w-[320px] p-2 animate-dropdown">

                      {/* Search */}
                      <input
                        placeholder="Search models"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="w-full mb-2 px-3 py-2 rounded-lg bg-white/5 outline-none text-sm"
                      />

                      {/* Tabs */}
                      <input
                        placeholder="System instruction..."
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="
      w-full mb-2
      px-3 py-2 rounded-lg
      bg-white/5 border border-white/10
      text-sm outline-none
      placeholder:text-white/40
    "
                      />


                      {/* Models */}
                      <div className="max-h-[260px] overflow-y-auto">
                        {MODELS.filter(
                          m =>
                            m.tag === modelTab &&
                            m.name.toLowerCase().includes(modelSearch.toLowerCase())
                        ).map((m) => (
                          <SelectItem
                            key={m.id}
                            value={m.id}
                            className="flex justify-between rounded-md p-2"
                          >
                            {m.name}
                            {model === m.id}
                          </SelectItem>
                        ))}
                      </div>

                    </SelectContent>
                  </Select>

                </>
              )}

            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-semibold mb-10 bg-gradient-to-r from-white via-[#bda7ff] to-[#7b6cff] bg-clip-text text-transparent">
            What would you like to do?
          </h1>

          <div className="w-full max-w-3xl px-4">
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl px-5 py-4 border backdrop-blur-xl",
                isDark ? "bg-white/5 border-white/10" : "bg-white border-border"
              )}
            >

              {/* PLUS / UPLOAD */}
              <button
                onClick={() => document.getElementById("fileUpload")?.click()}
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition border border-transparent text-2xl",
                  isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                )}
              >
                +
              </button>

              {/* FILE PREVIEW */}
              {file && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-lg text-xs",
                    isDark ? "bg-white/10" : "bg-muted"
                  )}
                >
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button onClick={() => setFile(null)}>✕</button>
                </div>
              )}

              {/* TEXTAREA */}
              <Textarea
                placeholder="Ask anything..."
                className={cn(
                  "flex-1 resize-none min-h-[60px]",
                  "bg-transparent border-none",
                  "outline-none ring-0 focus:ring-0",
                  "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
                  isDark
                    ? "text-white placeholder:text-white/50"
                    : "text-foreground placeholder:text-muted-foreground"
                )}
              />


              {/* SEND */}
              <Button
                className="h-10 w-10 rounded-xl text-white"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`
                }}
              >
                <Send className="w-4 h-4" />
              </Button>

            </div>
          </div>

        </div>
      </div>

    </div>
    // </div>
  );
}
