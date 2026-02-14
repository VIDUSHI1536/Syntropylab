import { useNavigate } from "react-router-dom";
import { Video, Plus, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIMARY = "#5f3b96";

const mockProjects = [
    {
        id: "1",
        name: "Cinematic Trailer",
        createdAt: "Feb 15, 2026",
    },
    {
        id: "2",
        name: "AI Short Film",
        createdAt: "Feb 18, 2026",
    },
];

export default function ProjectVideoFiles() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <div
            className={cn(
                "min-h-screen",
                isDark ? "text-white" : "bg-background"
            )}
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
                            }}
                        >
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        Video Projects
                    </h1>

                    <p className="text-sm opacity-60 mt-2">
                        Manage and monitor your video AI projects
                    </p>
                </div>

                <Button
                    className="rounded-xl text-white"
                    style={{
                        background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* SEARCH */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 opacity-50" />
                    <Input
                        placeholder="Search video projects..."
                        className="pl-9 rounded-xl"
                    />
                </div>
            </div>

            {/* PROJECT GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() =>
                            navigate(`/dashboard/projectvideo`)
                        }
                        className={cn(
                            "rounded-3xl p-6 border cursor-pointer transition hover:scale-[1.02]",
                            isDark
                                ? "bg-white/5 border-white/10 hover:bg-white/10"
                                : "bg-white border-black/10"
                        )}
                    >
                        <h3 className="text-lg font-semibold">
                            {project.name}
                        </h3>

                        <p className="text-sm opacity-60 mt-2">
                            Created {project.createdAt}
                        </p>

                        <div className="mt-6 text-sm text-[#8b5cf6] font-medium">
                            Open project →
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
