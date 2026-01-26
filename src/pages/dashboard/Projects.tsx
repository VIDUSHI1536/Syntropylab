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

const PRIMARY = '#4D456E';

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
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-colors duration-300"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(77,69,110,0.35) 0%, rgba(18,16,34,1) 55%, rgba(12,10,22,1) 100%)'
            : 'white',
          boxShadow: isDark
            ? '0px 20px 50px rgba(0,0,0,0.35)'
            : '0px 18px 40px rgba(0,0,0,0.06)',
        }}
      >
        {/* glows */}
        <div
          className="absolute -top-20 -right-20 h-72 w-72 rounded-full blur-3xl opacity-40"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(107,95,197,0.22), transparent 70%)'
              : 'radial-gradient(circle, rgba(77,69,110,0.30), transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(77,69,110,0.22), transparent 70%)'
              : 'radial-gradient(circle, rgba(107,95,197,0.22), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: isDark ? '#fff' : '#1f1b2e' }}
              >
                Projects
              </h1>
              {/* <Sparkles className="w-5 h-5 text-muted-foreground" /> */}
            </div>

            <p
              className="text-sm mt-2 max-w-2xl"
              style={{
                color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
              }}
            >
              Manage your AI evaluation projects, track performance and organize your workspaces.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Select value={selectedOrgId || ''} onValueChange={setSelectedOrgId}>
              <SelectTrigger
                className={cn(
                  'w-full sm:w-[240px] rounded-2xl',
                  isDark && 'bg-white/5 border-white/10 text-white'
                )}
              >
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org._id} value={org._id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

   <DialogContent className="bg-card border-border max-w-3xl rounded-3xl p-8">

  {/* HEADER */}
  <DialogHeader className="text-center space-y-2">
    <DialogTitle className="text-2xl font-bold text-foreground">
      Create a new evaluation project
    </DialogTitle>

    <p className="text-sm text-muted-foreground">
      Choose between a single or side-by-side LLM evaluation
    </p>

    <a
      href="/docs"
      target="_blank"
      className="text-sm text-primary underline"
    >
      View documentation ↗
    </a>
  </DialogHeader>

  {/* PROJECT NAME */}
  <div className="mt-6">
    <label className="text-sm font-medium text-foreground">
      Project Name
    </label>
    <Input
      className="mt-2"
      placeholder="Enter project name"
      value={newProjectName}
      onChange={(e) => setNewProjectName(e.target.value)}
    />
  </div>

  {/* OPTIONS */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

    {/* POINTWISE */}
    <div className="rounded-2xl border bg-background p-6 flex flex-col justify-between hover:shadow-md transition">
      <div className="space-y-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          📊
        </div>

        <h3 className="font-semibold text-lg">
          Pointwise Evaluation
        </h3>

        <p className="text-sm text-muted-foreground">
          Get a metric score for AI performance. Use this to evaluate absolute quality.
        </p>
      </div>

      <Button
        className="mt-6 w-full rounded-xl"
        onClick={() => handleCreateProject("pointwise")}
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
          color: "white",
        }}
      >
        Create project
      </Button>
    </div>

    {/* SIDE BY SIDE */}
    <div className="rounded-2xl border bg-background p-6 flex flex-col justify-between hover:shadow-md transition">
      <div className="space-y-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          🔀
        </div>

        <h3 className="font-semibold text-lg">
          Side-by-Side Comparison
        </h3>

        <p className="text-sm text-muted-foreground">
          Get a preference between two outputs. Compare models or prompts to choose the winner.
        </p>
      </div>

      <Button
        className="mt-6 w-full rounded-xl"
        onClick={() => handleCreateProject("side-by-side")}
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
          color: "white",
        }}
      >
        Create project
      </Button>
    </div>

  </div>
</DialogContent>


            </Dialog>
          </div>
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
                'group cursor-pointer rounded-3xl p-5 transition hover:shadow-xl overflow-hidden border',
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
