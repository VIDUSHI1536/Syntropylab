// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { api, Project as ApiProject, Organization } from "@/lib/api";
// import {
//     Plus,
//     Search,
//     Users,
//     Loader2,
//     Trash2,
//     Mic,
// } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useTheme } from "@/hooks/useTheme";

// interface Project extends ApiProject {
//     lastUpdated?: Date;
// }

// const PRIMARY = "#5f3b96";

// export default function ProjectAudio() {
//     const { isDark } = useTheme();
//     const navigate = useNavigate();
//     const { toast } = useToast();

//     const [projects, setProjects] = useState<Project[]>([]);
//     const [organizations, setOrganizations] = useState<Organization[]>([]);
//     const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

//     const [loading, setLoading] = useState(true);
//     const [newProjectName, setNewProjectName] = useState("");
//     const [dialogOpen, setDialogOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");

//     /* ---------------- Fetch Orgs ---------------- */

//     useEffect(() => {
//         const fetchOrgs = async () => {
//             try {
//                 const orgs = await api.getOrganizations();
//                 setOrganizations(orgs);
//                 if (orgs.length) setSelectedOrgId(orgs[0]._id);
//             } catch {
//                 toast({ title: "Error", description: "Failed to load orgs" });
//             }
//         };
//         fetchOrgs();
//     }, []);

//     /* ---------------- Fetch Audio Projects ---------------- */

//     useEffect(() => {
//         if (!selectedOrgId) return;

//         const fetchProjects = async () => {
//             try {
//                 setLoading(true);
//                 const all = await api.getProjects(selectedOrgId);

//                 // ✅ only audio
//                 const audioProjects = all.filter((p: any) => p.type === "audio");

//                 setProjects(
//                     audioProjects.map((p) => ({
//                         ...p,
//                         lastUpdated: new Date(p.createdAt),
//                     }))
//                 );
//             } catch {
//                 toast({
//                     title: "Error",
//                     description: "Failed to fetch projects",
//                     variant: "destructive",
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProjects();
//     }, [selectedOrgId]);

//     /* ---------------- Create Audio Project ---------------- */

//     const handleCreateProject = async () => {
//         if (!newProjectName || !selectedOrgId) return;

//         try {
//             const newProject = await api.createProject(selectedOrgId, {
//                 name: newProjectName,
//             });

//             setProjects((p) => [
//                 { ...newProject, lastUpdated: new Date(newProject.createdAt) },
//                 ...p,
//             ]);

//             setDialogOpen(false);
//             setNewProjectName("");

//             toast({
//                 title: "Audio Project Created",
//                 description: newProjectName,
//             });

//             // Temporary session (frontend only)
//             localStorage.setItem(
//                 `audio-session-${newProject._id}`,
//                 JSON.stringify({
//                     projectId: newProject._id,
//                     messages: [],
//                     systemPrompt: "You are a helpful customer service agent for TechNova.",
//                 })
//             );

//             navigate(`/dashboard/projectaudioplay/${newProject._id}`);

//         } catch (err) {
//             console.error(err);
//             toast({
//                 title: "Error",
//                 description: "Failed to create project",
//                 variant: "destructive",
//             });
//         }
//     };


//     /* ---------------- Delete ---------------- */

//     const handleDelete = async (id: string, e: any) => {
//         e.stopPropagation();
//         if (!selectedOrgId) return;

//         try {
//             await api.deleteProject(selectedOrgId, id);
//             setProjects((p) => p.filter((x) => x._id !== id));
//         } catch {
//             toast({
//                 title: "Error",
//                 description: "Delete failed",
//                 variant: "destructive",
//             });
//         }
//     };

//     const filtered = projects.filter((p) =>
//         p.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-[400px]">
//                 <Loader2 className="w-7 h-7 animate-spin text-primary" />
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-8 animate-fade-in">

//             {/* HEADER */}
//             <div className="flex items-center justify-between">

//                 <div className="flex items-center gap-3">
//                     <div
//                         className="w-11 h-11 rounded-2xl flex items-center justify-center"
//                         style={{
//                             background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
//                         }}
//                     >
//                         <Mic className="w-5 h-5 text-white" />
//                     </div>

//                     <div>
//                         <h1
//                             className={cn(
//                                 "text-3xl font-semibold",
//                                 isDark ? "text-white" : "text-black"
//                             )}
//                         >
//                             Projects – Audio
//                         </h1>
//                         <p className={cn(isDark ? "text-white/60" : "text-muted-foreground")}>
//                             Audio based AI projects
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex gap-3">

//                     <Select value={selectedOrgId || ""} onValueChange={setSelectedOrgId}>
//                         <SelectTrigger
//                             className={cn(
//                                 "w-[200px]",
//                                 isDark && "bg-white/5 border-white/10 text-white"
//                             )}
//                         >
//                             <SelectValue placeholder="Organization" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {organizations.map((o) => (
//                                 <SelectItem key={o._id} value={o._id}>
//                                     {o.name}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>

//                     <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//                         <DialogTrigger asChild>
//                             <Button
//                                 className="text-white"
//                                 style={{
//                                     background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
//                                 }}
//                             >
//                                 <Plus className="w-4 h-4 mr-1" />
//                                 New Audio Project
//                             </Button>
//                         </DialogTrigger>

//                         <DialogContent
//                             className={cn(
//                                 "rounded-3xl",
//                                 isDark
//                                     ? "bg-white/10 border-white/20"
//                                     : "bg-white border-black/10"
//                             )}
//                         >
//                             <DialogHeader>
//                                 <DialogTitle>Create Audio Project</DialogTitle>
//                             </DialogHeader>

//                             <Input
//                                 placeholder="Project name"
//                                 value={newProjectName}
//                                 onChange={(e) => setNewProjectName(e.target.value)}
//                                 className={cn(
//                                     isDark && "bg-white/5 border-white/10 text-white"
//                                 )}
//                             />

//                             <Button
//                                 onClick={handleCreateProject}
//                                 className="w-full text-white mt-4"
//                                 style={{
//                                     background: `linear-gradient(135deg, ${PRIMARY}, #6B5FC5)`,
//                                 }}
//                             >
//                                 Create
//                             </Button>
//                         </DialogContent>
//                     </Dialog>

//                 </div>
//             </div>

//             {/* SEARCH */}
//             <div className="relative max-w-sm">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
//                 <Input
//                     className={cn(
//                         "pl-9",
//                         isDark && "bg-white/5 border-white/10 text-white"
//                     )}
//                     placeholder="Search audio projects..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//             </div>

//             {/* GRID */}
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

//                 {filtered.map((p) => (
//                     <Card
//                         key={p._id}
//                         onClick={() => navigate(`/dashboard/projects/${p._id}`)}
//                         className={cn(
//                             "p-5 rounded-3xl cursor-pointer group transition hover:-translate-y-1",
//                             isDark
//                                 ? "bg-white/5 border-white/10"
//                                 : "bg-white border-black/10"
//                         )}
//                     >
//                         <div className="flex justify-between">

//                             <div>
//                                 <h3
//                                     className={cn(
//                                         "font-semibold",
//                                         isDark ? "text-white" : "text-black"
//                                     )}
//                                 >
//                                     {p.name}
//                                 </h3>
//                                 <p className="text-xs text-muted-foreground mt-1">
//                                     {p.lastUpdated
//                                         ? format(p.lastUpdated, "MMM d, yyyy")
//                                         : ""}
//                                 </p>
//                             </div>

//                             <Button
//                                 size="icon"
//                                 variant="ghost"
//                                 onClick={(e) => handleDelete(p._id, e)}
//                             >
//                                 <Trash2 className="w-4 h-4 text-red-500" />
//                             </Button>

//                         </div>
//                     </Card>
//                 ))}

//             </div>
//         </div>
//     );
// }
import { useNavigate } from "react-router-dom";
import { Mic, Plus, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIMARY = "#5f3b96";

const mockProjects = [
    {
        id: "1",
        name: "Podcast Demo",
        createdAt: "Feb 15, 2026",
    },
    {
        id: "2",
        name: "Voice AI Test",
        createdAt: "Feb 18, 2026",
    },
];

export default function ProjectAudiofile() {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    return (
        <div
            className={cn(
                "min-h-screen",
                isDark ? " text-white" : "bg-background"
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
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        Audio Projects
                    </h1>
                    <p className="text-sm opacity-60 mt-2">
                        Manage and monitor your audio AI projects
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
                        placeholder="Search projects..."
                        className="pl-9 rounded-xl"
                    />
                </div>
            </div>

            {/* PROJECT GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => navigate(`/dashboard/projectaudioplay`)}
                        className={cn(
                            "rounded-3xl p-6 border cursor-pointer transition hover:scale-[1.02]",
                            isDark
                                ? "bg-white/5 border-white/10 hover:bg-white/10"
                                : "bg-white border-black/10"
                        )}
                    >
                        <h3 className="text-lg font-semibold">{project.name}</h3>
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
