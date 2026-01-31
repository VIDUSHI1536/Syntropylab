import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api, Project as ApiProject, Organization } from '@/lib/api';
import {
  Plus,
  Search,
  Users,
  TrendingUp,
  Clock,
  Loader2,
  Trash2,
  FolderKanban,
  // Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface Project extends ApiProject {
  passRate?: number;
  latency?: number;
  evaluations?: number;
  lastUpdated?: Date;
}

const PRIMARY = '#5f3b96';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Global Theme Support
  const { isDark } = useTheme();

  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch Orgs
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);

        const orgs = await api.getOrganizations();
        setOrganizations(orgs);

        if (orgs.length > 0) {
          setSelectedOrgId(orgs[0]._id);
        } else {
          // 👇 no orgs → stop loading so empty screen can appear
          setLoading(false);
        }

      } catch (error) {
        console.error('Failed to fetch organizations', error);
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);


  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedOrgId) return;

      try {
        setLoading(true);
        const projs = await api.getProjects(selectedOrgId);

        const uiProjects = projs.map((p) => ({
          ...p,
          passRate: 0,
          latency: 0,
          evaluations: 0,
          lastUpdated: new Date(p.createdAt),
        }));

        setProjects(uiProjects);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedOrgId, toast]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !selectedOrgId) return;

    try {
      const newProject = await api.createProject(selectedOrgId, newProjectName);
      const uiProject: Project = {
        ...newProject,
        passRate: 0,
        latency: 0,
        evaluations: 0,
        lastUpdated: new Date(newProject.createdAt)
      };

      setProjects([uiProject, ...projects]);
      setNewProjectName('');
      setDialogOpen(false);
      toast({
        title: 'Project created',
        description: `${newProjectName} has been created successfully.`,
      });
      navigate(`/dashboard/projects/${newProject._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };



  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedOrgId) return;

    try {
      await api.deleteProject(selectedOrgId, projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
      toast({ title: 'Project deleted', description: 'The project has been deleted.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  /* ✅ No organization empty state */
  if (!loading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] animate-fade-in">
        <div className="text-center max-w-md">

          <div
            className={cn(
              'w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
            )}
          >
            <Users
              className={cn(
                'w-10 h-10',
                isDark ? 'text-white/70' : 'text-muted-foreground'
              )}
            />
          </div>

          <h2
            className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-foreground'
            )}
          >
            Create an organization first
          </h2>

          <p
            className={cn(
              'mt-2 mb-6',
              isDark ? 'text-white/60' : 'text-muted-foreground'
            )}
          >
            You need an organization before creating your first project.
          </p>

          <button
            onClick={() => navigate('/dashboard/organizations')}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
            }}
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

        {/* LEFT */}
        <div>
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
              }}
            >
              <FolderKanban className="w-5 h-5 text-white" />
            </div>

            <h1
              className={cn(
                "text-3xl sm:text-4xl font-semibold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Projects
            </h1>
          </div>

          <p
            className={cn(
              "mt-2 text-sm max-w-xl",
              isDark ? "text-white/55" : "text-slate-500"
            )}
          >
            Manage and monitor your AI evaluation projects
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3">

          <Select value={selectedOrgId || ""} onValueChange={setSelectedOrgId}>
            <SelectTrigger
              className={cn(
                "w-[220px] rounded-xl",
                isDark && "bg-white/5 border-white/10 text-white"
              )}
            >
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>

            <SelectContent>
              {organizations.map((o) => (
                <SelectItem key={o._id} value={o._id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CREATE PROJECT */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                disabled={!selectedOrgId}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60',
                  !selectedOrgId && 'cursor-not-allowed'
                )}
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </DialogTrigger>
            <DialogContent
              className={cn(
                "max-w-md rounded-3xl backdrop-blur-xl shadow-2xl",
                isDark
                  ? "bg-white/10 border border-white/20"
                  : "bg-white/80 border border-black/10"
              )}
            >
              <DialogHeader className="text-center space-y-2">
                <DialogTitle
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-foreground"
                  )}
                >
                  Create New Project
                </DialogTitle>

                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/60" : "text-muted-foreground"
                  )}
                >
                  Give your project a meaningful name
                </p>
              </DialogHeader>

              <div className="space-y-6 pt-6">

                {/* Project Name */}
                <div className="space-y-2">
                  <label
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-foreground"
                    )}
                  >
                    Project Name
                  </label>

                  <Input
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                    className={cn(
                      "h-12 rounded-xl",
                      isDark
                        ? "bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        : "bg-white border-black/10 text-black placeholder:text-muted-foreground"
                    )}
                  />
                </div>

                {/* Button */}
                <Button
                  onClick={handleCreateProject}
                  className="
        w-full h-12 rounded-2xl
        text-white font-semibold
        transition-all hover:scale-[1.02]
      "
                  variant="accent"
                >
                  Create Project
                </Button>

              </div>
            </DialogContent>



          </Dialog>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'pl-10 rounded-2xl',
            isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
          )}
        />
      </div>

      {/* PROJECT GRID */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              className={cn(
                'group cursor-pointer rounded-3xl p-5 transition-all duration-300 hover:shadow-xl overflow-hidden border hover:-translate-y-1 hover:scale-[1.02]',

                isDark ? 'bg-white/5 border-white/10 hover:bg-white/7' : 'bg-white border-black/10'
              )}
              style={{
                background: isDark
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))'
                  : 'linear-gradient(180deg, #ffffff, #f6f4ff)',
              }}
              onClick={() =>
                navigate(`/dashboard/projects/${project._id}?orgId=${selectedOrgId}`)
              }
            >
              {/* top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(77,69,110,0.30), rgba(107,95,197,0.20))'
                        : 'linear-gradient(135deg, rgba(77,69,110,0.18), rgba(107,95,197,0.18))',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.10)'
                        : '1px solid rgba(77,69,110,0.12)',
                    }}
                  >
                    <Users className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>

                  <div>
                    <h3
                      className={cn(
                        'font-semibold text-base group-hover:underline',
                        isDark ? 'text-white' : 'text-[#1f1b2e]'
                      )}
                    >
                      {project.name}
                    </h3>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        isDark ? 'text-white/60' : 'text-muted-foreground'
                      )}
                    >
                      Created{' '}
                      {project.lastUpdated
                        ? format(project.lastUpdated, 'MMM d, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-10 w-10 rounded-2xl opacity-0 group-hover:opacity-100 transition',
                    isDark ? 'hover:bg-white/10' : 'hover:bg-red-50'
                  )}
                  onClick={(e) => handleDeleteProject(project._id, e)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              {/* stats */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div
                  className={cn(
                    'rounded-2xl border p-3',
                    isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white'
                  )}
                >
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className={cn('font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                      {project.passRate}%
                    </span>
                  </div>
                  <p className={cn('text-[11px] mt-1', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                    Pass Rate
                  </p>
                </div>

                <div
                  className={cn(
                    'rounded-2xl border p-3',
                    isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white'
                  )}
                >
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className={cn('font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                      {project.latency}ms
                    </span>
                  </div>
                  <p className={cn('text-[11px] mt-1', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                    Avg Latency
                  </p>
                </div>

                <div
                  className={cn(
                    'rounded-2xl border p-3',
                    isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white'
                  )}
                >
                  <div className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-foreground')}>
                    {project.evaluations?.toLocaleString() || 0}
                  </div>
                  <p className={cn('text-[11px] mt-1', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                    Evaluations
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className={cn('text-xs', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                  Open project
                </span>
                <span className="text-xs font-semibold" style={{ color: PRIMARY }}>
                  View →
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="text-center py-16">
          <div
            className={cn(
              'w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
            )}
          >
            <Users className={cn('w-8 h-8', isDark ? 'text-white/60' : 'text-muted-foreground')} />
          </div>

          <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-foreground')}>
            No projects found
          </h3>

          <p className={cn('mt-2 mb-4', isDark ? 'text-white/60' : 'text-muted-foreground')}>
            {organizations.length === 0
              ? 'You need to create an organization first.'
              : 'Create your first project to get started.'}
          </p>

          {organizations.length > 0 ? (
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
              }}
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/organizations')}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
              }}
            >
              Go to Organizations
            </button>
          )}
        </div>
      )}
    </div>
  );
}
