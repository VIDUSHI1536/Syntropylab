import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export default function Benchmark() {
  const [loaded, setLoaded] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className="h-[calc(100vh-64px)] w-full relative overflow-hidden">

      {/* ---------- Skeleton ---------- */}
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 p-6 space-y-4",
            isDark ? "bg-[#0c0a16]" : "bg-background"
          )}
        >
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-6 w-96 rounded-lg" />

          <div className="grid grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* ---------- IFRAME ---------- */}
      <iframe
        src="https://artificialanalysis.ai/embed/llm-performance-leaderboard"
        title="LLM Benchmark Leaderboard"
        className={cn(
          "w-full h-full border-0 transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
