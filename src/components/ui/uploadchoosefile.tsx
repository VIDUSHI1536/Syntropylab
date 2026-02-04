import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
const PRIMARY = "#5f3b96";

export default function UploadChooseFile({
    label = "Upload your brand guidelines PDF",
    accept = ".pdf",
    onFileSelect,
}: {
    label?: string;
    accept?: string;
    onFileSelect?: (file: File) => void;
}) {
    const { isDark } = useTheme();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);

    const handleSelect = (f: File) => {
        setFile(f);
        onFileSelect?.(f);
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files[0]) {
                    handleSelect(e.dataTransfer.files[0]);
                }
            }}
            className={cn(
                "relative cursor-pointer rounded-2xl border border-dashed p-10 text-center transition-all",
                dragging && "scale-[1.02]",
                isDark
                    ? "bg-white/5 border-white/20 hover:bg-white/10"
                    : "bg-white border-black/15"
            )}
        >
            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleSelect(e.target.files[0]);
                    }
                }}
            />

            {!file ? (
                <>
                    <UploadCloud className="w-8 h-8 mx-auto mb-3 opacity-70" />
                    <p className="font-medium">{label}</p>
                    <p className="text-xs opacity-60 mt-1">
                        Drag & drop or click to browse
                    </p>

                    <Button
                        type="button"
                        className="mt-2 px-4 flex-1 h-10 text-white rounded-xl shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
                        }}
                        // variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                    >
                        Choose File
                    </Button>
                </>
            ) : (
                <div className="flex items-center justify-center gap-3">
                    <FileText className="w-5 h-5 text-green-400" />
                    <span className="text-sm truncate max-w-[200px]">
                        {file.name}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}
                        className="p-1 rounded-full hover:bg-white/10"
                    >
                        <X className="w-4 h-4 opacity-70" />
                    </button>
                </div>
            )}
        </div>
    );
}
