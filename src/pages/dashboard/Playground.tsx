import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  Trash2,
  Settings2,
  ChevronLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { api, ChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const PRIMARY = "#4D456E";

export default function Playground() {
  const { projectId } = useParams();
  const { toast } = useToast();
  const { isDark } = useTheme();

  /* ---------------- STATE ---------------- */

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const [model, setModel] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [stream, setStream] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---------------- FETCH MODELS ---------------- */

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const response = await api.getModels();

        let modelList: string[] = [];

        if (Array.isArray(response)) modelList = response;
        else if (response?.data)
          modelList = response.data.flatMap((p: any) => p.models || []);

        if (modelList.length === 0) {
          modelList = ["gpt-4", "gpt-3.5-turbo", "claude-3-opus"];
        }

        setAvailableModels(modelList);
        setModel(modelList[0]);
      } catch {
        setAvailableModels(["gpt-4", "gpt-3.5-turbo", "claude-3-opus"]);
        setModel("gpt-4");
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ---------------- SEND ---------------- */

  const handleSend = async () => {
    if (!input.trim() || !projectId || !model) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    let reqMessages = [...messages, userMsg];

    if (systemPrompt) {
      reqMessages = [
        { role: "system", content: systemPrompt },
        ...reqMessages.filter((m) => m.role !== "system"),
      ];
    }

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (stream) {
        setStreaming(true);
        const assistantMsg: ChatMessage = { role: "assistant", content: "" };
        setMessages((p) => [...p, assistantMsg]);

        await api.streamChatCompletion(
          { projectId, model, messages: reqMessages, temperature, maxTokens },
          (chunk) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + chunk },
                ];
              }
              return prev;
            });
          },
          () => {
            setLoading(false);
            setStreaming(false);
          }
        );
      } else {
        const res = await api.chatCompletion({
          projectId,
          model,
          messages: reqMessages,
          temperature,
          maxTokens,
        });

        setMessages((p) => [...p, res.message]);
        setLoading(false);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to get response",
        variant: "destructive",
      });
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleClear = () => setMessages([]);

  /* ---------------- UI ---------------- */

  return (
    <div
      className={cn(
        "h-[calc(100vh-4rem)] flex flex-col",
        isDark ? "bg-[#0c0a16] text-white" : "bg-background"
      )}
    >
      {/* HEADER */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b",
          isDark ? "border-white/10 bg-[#121022]" : "border-border"
        )}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/projects/${projectId}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Playground</h1>
        </div>

        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <div
          className={cn(
            "w-80 border-r p-4 overflow-y-auto",
            isDark ? "border-white/10 bg-[#121022]" : "border-border bg-muted/10"
          )}
        >
          <div className="space-y-6">

            <div className="flex items-center gap-2 font-medium">
              <Settings2 className="w-4 h-4" />
              Model Settings
            </div>

            {modelsLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger
                    className={cn(isDark && "bg-white/5 border-white/10")}
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent
                    className={cn(isDark && "bg-[#1a1625] border-white/10")}
                  >
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className={cn(isDark && "bg-white/5 border-white/10")}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperature</Label>
                <span className="text-xs">{temperature}</span>
              </div>
              <Slider value={[temperature]} min={0} max={2} step={0.1}
                onValueChange={([v]) => setTemperature(v)} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Max Tokens</Label>
                <span className="text-xs">{maxTokens}</span>
              </div>
              <Slider value={[maxTokens]} min={100} max={4000} step={100}
                onValueChange={([v]) => setMaxTokens(v)} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Stream Response</Label>
              <Switch checked={stream} onCheckedChange={setStream} />
            </div>

          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col">

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">

              {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-24">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Start chatting with the model
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}
                  className={cn("flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : isDark
                        ? "bg-white/5"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center">
                  <Bot className="w-4 h-4" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}

            </div>
          </ScrollArea>

          {/* INPUT */}
          <div
            className={cn(
              "p-4 border-t",
              isDark ? "border-white/10 bg-[#121022]" : "border-border"
            )}
          >
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={cn(isDark && "bg-white/5 border-white/10")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
