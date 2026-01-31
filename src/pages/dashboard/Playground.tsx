import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Link2,
  ChevronRight,
  Split,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useLocation, useParams } from "react-router-dom";

const PRIMARY = "#5f3b96";

/* -----------------------------------
 Prompt Card
------------------------------------ */
function PromptCard({ label }: { label?: "A" | "B" }) {
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-5",
        isDark
          ? "bg-[#14121f] border-white/10 text-white"
          : "bg-white border-black/10"
      )}
    >
      <div className="flex items-center gap-2">
        {label && (
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center font-semibold text-primary">
            {label}
          </div>
        )}
        <h3 className="font-semibold">Prompt</h3>
      </div>

      <Select>
        <SelectTrigger
          className={cn(isDark && "bg-white/5 border-white/10")}
        >
          <SelectValue placeholder="Select or search model" />
        </SelectTrigger>
        <SelectContent
          className={cn(isDark && "bg-[#1a1625] border-white/10")}
        >
          <SelectItem value="gpt4">GPT-4</SelectItem>
          <SelectItem value="gpt35">GPT-3.5</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <p className="text-sm mb-1">System Instructions</p>
        <Textarea
          placeholder="Enter optional system instructions"
          className={cn(
            "min-h-[90px]",
            isDark && "bg-white/5 border-white/10"
          )}
        />
      </div>

      <div>
        <p className="text-sm mb-1">User Input</p>
        <Textarea
          placeholder="Enter user input"
          className={cn(
            "min-h-[120px]",
            isDark && "bg-white/5 border-white/10"
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button
          style={{
            background: `linear-gradient(135deg, ${PRIMARY}, #818CF8)`,
          }}
        >
          Generate Output
        </Button>
      </div>
    </div>
  );
}

/* -----------------------------------
 Output Card
------------------------------------ */
function OutputCard({ label }: { label?: "A" | "B" }) {
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 min-h-[160px]",
        isDark
          ? "bg-[#14121f] border-white/10 text-white"
          : "bg-white border-black/10"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {label && (
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center font-semibold text-primary">
            {label}
          </div>
        )}
        <h3 className="font-semibold">Output</h3>
      </div>

      <p className={cn("text-sm", isDark && "text-white/60")}>
        Model output will appear here.
      </p>
    </div>
  );
}

/* -----------------------------------
 MAIN PAGE
------------------------------------ */
export default function PlaygroundCompare(props: { projectId: string, projectName: string }) {
  const { isDark } = useTheme();
  const [sideBySide, setSideBySide] = useState(false);
  const { projectId } = useParams();
  const location = useLocation();

  const projectName =
    location.state?.projectName || "Project";


  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER / BREADCRUMB */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-sm">

          <Link
            to="/dashboard/projects"
            className={cn(
              "transition-colors",
              isDark
                ? "text-white/60 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Evaluation Projects
          </Link>

          <ChevronRight
            className={cn(
              "w-4 h-4",
              isDark ? "text-white/40" : "text-muted-foreground"
            )}
          />

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


          <ChevronRight
            className={cn(
              "w-4 h-4",
              isDark ? "text-white/40" : "text-muted-foreground"
            )}
          />

          <span
            className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-foreground"
            )}
          >
            Playground
          </span>

        </div>

        {/* TOGGLE */}
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setSideBySide((p) => !p)}
        >
          <Split className="w-4 h-4" />
          {sideBySide
            ? "Pointwise Evaluation"
            : "Side-by-Side Comparison"}
        </Button>
      </div>

      {/* PROMPTS */}
      <div
        className={cn(
          "grid gap-6",
          sideBySide ? "md:grid-cols-2" : "grid-cols-1"
        )}
      >
        <PromptCard label={sideBySide ? "A" : undefined} />
        {sideBySide && <PromptCard label="B" />}
      </div>

      {/* OUTPUTS */}
      <div
        className={cn(
          "grid gap-6",
          sideBySide ? "md:grid-cols-2" : "grid-cols-1"
        )}
      >
        <OutputCard label={sideBySide ? "A" : undefined} />
        {sideBySide && <OutputCard label="B" />}
      </div>

      {/* COMPARISON */}
      {sideBySide && (
        <div
          className={cn(
            "rounded-2xl border p-4 flex flex-wrap justify-between gap-3",
            isDark
              ? "bg-[#14121f] border-white/10"
              : "bg-white border-black/10"
          )}
        >
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Left is better
          </Button>

          <Button variant="outline" className="gap-2">
            <Link2 className="w-4 h-4" />
            It’s a tie
          </Button>

          <Button variant="outline">Both are bad</Button>

          <Button variant="outline" className="gap-2">
            Right is better
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
