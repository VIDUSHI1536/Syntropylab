import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api, Organization, Project } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

import {
  Plus,
  Building2,
  Users,
  FolderKanban,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Search,
  ChevronRight,
  Loader2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

const PRIMARY = '#4D456E';

const roleConfig: Record<string, { icon: any; badge: string }> = {
  Owner: {
    icon: Crown,
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  Admin: {
    icon: Shield,
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  Member: {
    icon: User,
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export default function Organizations() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);

  const [newOrgName, setNewOrgName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('Member');
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ global theme from hook
  const { isDark } = useTheme();

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchOrgDetails = async (orgId: string) => {
    try {
      const details = await api.getOrganization(orgId);
      setSelectedOrg(details);
      const orgProjects = await api.getProjects(orgId);
      setProjects(orgProjects);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch organization details',
        variant: 'destructive',
      });
    }
  };

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const data = await api.getOrganizations();
      setOrgs(data);

      if (data.length > 0 && !selectedOrg) {
        await fetchOrgDetails(data[0]._id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;

    try {
      const newOrg = await api.createOrganization(newOrgName);
      setOrgs([...orgs, newOrg]);
      setNewOrgName('');
      setCreateOrgDialogOpen(false);

      setSelectedOrg(newOrg);

      toast({
        title: 'Organization created',
        description: `${newOrgName} has been created.`,
      });

      await fetchOrgDetails(newOrg._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create organization',
        variant: 'destructive',
      });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;

    try {
      await api.inviteMember(selectedOrg._id, inviteEmail, inviteRole);

      const emailCopy = inviteEmail;
      setInviteEmail('');
      setInviteDialogOpen(false);

      toast({ title: 'Invitation sent', description: `Invited ${emailCopy}.` });

      fetchOrgs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !selectedOrg) return;

    try {
      const project = await api.createProject(selectedOrg._id, newProjectName);
      setNewProjectName('');
      setCreateProjectDialogOpen(false);
      setProjects([...projects, project]);

      toast({ title: 'Project created', description: `${project.name} created.` });
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
    if (!selectedOrg) return;

    try {
      await api.deleteProject(selectedOrg._id, projectId);
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

  const filteredOrgs = orgs.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = true;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-colors duration-300"
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
        {/* glowing blobs */}
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
              ? 'radial-gradient(circle, rgba(77,69,110,0.25), transparent 70%)'
              : 'radial-gradient(circle, rgba(107,95,197,0.25), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: isDark ? '#fff' : '#1f1b2e' }}
              >
                Organizations
              </h1>
            </div>
            <p
              className="text-sm mt-2 max-w-2xl"
              style={{
                color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
              }}
            >
              Manage teams, invite members and create projects for AI evaluation workflows.
            </p>
          </div>

          {/* Create org */}
          <Dialog open={createOrgDialogOpen} onOpenChange={setCreateOrgDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <Plus className="w-4 h-4" />
                New Organization
              </button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
                />
                <Button
                  onClick={handleCreateOrg}
                  className="w-full"
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                    color: 'white',
                  }}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ORG SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'pl-10 rounded-2xl',
              isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
            )}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filteredOrgs.map((org) => {
            const active = selectedOrg?._id === org._id;
            return (
              <button
                key={org._id}
                onClick={() => fetchOrgDetails(org._id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition',
                  active
                    ? 'text-white shadow-sm'
                    : isDark
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-[#1f1b2e] bg-white hover:bg-muted'
                )}
                style={{
                  borderColor: active
                    ? 'transparent'
                    : isDark
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(0,0,0,0.08)',
                  background: active
                    ? `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`
                    : undefined,
                }}
              >
                <Building2
                  className={cn('w-4 h-4', active ? 'text-white' : 'text-muted-foreground')}
                />
                {org.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT GRID */}
      {selectedOrg && selectedOrg.members && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MEMBERS */}
          <Card
            className={cn(
              'lg:col-span-1 rounded-3xl overflow-hidden transition-colors duration-300',
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-border shadow-[0px_18px_40px_rgba(0,0,0,0.06)]'
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className={cn(
                  'text-base font-semibold flex items-center gap-2',
                  isDark && 'text-white'
                )}
              >
                <Users className="w-4 h-4" style={{ color: PRIMARY }} />
                Members{' '}
                <span
                  className={cn(
                    'font-medium',
                    isDark ? 'text-white/60' : 'text-muted-foreground'
                  )}
                >
                  ({selectedOrg.members.length})
                </span>
              </CardTitle>

              {canManage && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        'h-10 w-10 rounded-2xl border flex items-center justify-center transition',
                        isDark
                          ? 'border-white/10 hover:bg-white/10'
                          : 'border-black/10 hover:bg-muted'
                      )}
                      title="Invite member"
                    >
                      <UserPlus className="w-4 h-4" style={{ color: PRIMARY }} />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Invite to {selectedOrg.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="colleague@example.com"
                            className="pl-10 rounded-2xl"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleInvite}
                        className="w-full rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                          color: 'white',
                        }}
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>

            <CardContent className="space-y-2">
              {selectedOrg.members.map((member) => {
                const RoleIcon = roleConfig[member.role]?.icon || User;

                return (
                  <div
                    key={member.userId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-2xl border transition',
                      isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:shadow-sm'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, rgba(77,69,110,0.14), rgba(107,95,197,0.10))`,
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.10)'
                          : '1px solid rgba(77,69,110,0.14)',
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: PRIMARY }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'text-sm font-semibold truncate',
                          isDark ? 'text-white' : 'text-foreground'
                        )}
                      >
                        {member.firstName} {member.lastName}
                      </span>
                      <p
                        className={cn(
                          'text-xs truncate',
                          isDark ? 'text-white/60' : 'text-muted-foreground'
                        )}
                      >
                        {member.email}
                      </p>
                    </div>

                    <Badge
                      className={cn(
                        'border text-xs rounded-full px-2.5 py-1 flex items-center gap-1',
                        roleConfig[member.role]?.badge ??
                          'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {member.role}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* PROJECTS */}
          <Card
            className={cn(
              'lg:col-span-2 rounded-3xl overflow-hidden transition-colors duration-300',
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-border shadow-[0px_18px_40px_rgba(0,0,0,0.06)]'
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className={cn(
                  'text-base font-semibold flex items-center gap-2',
                  isDark && 'text-white'
                )}
              >
                <FolderKanban className="w-4 h-4" style={{ color: PRIMARY }} />
                Projects
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </CardTitle>

              {canManage && (
                <Dialog open={createProjectDialogOpen} onOpenChange={setCreateProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        'h-10 w-10 rounded-2xl border flex items-center justify-center transition',
                        isDark
                          ? 'border-white/10 hover:bg-white/10'
                          : 'border-black/10 hover:bg-muted'
                      )}
                      title="Create project"
                    >
                      <Plus className="w-4 h-4" style={{ color: PRIMARY }} />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Create Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                      />
                      <Button
                        onClick={handleCreateProject}
                        className="w-full"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                          color: 'white',
                        }}
                      >
                        Create Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>

            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-14">
                  <p className={cn('text-sm mb-3', isDark ? 'text-white/60' : 'text-muted-foreground')}>
                    No projects found in this organization.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn('rounded-full', isDark && `border-white/15 bg-[${PRIMARY}] text-white hover:bg-white/10`)}
                    onClick={() => setCreateProjectDialogOpen(true)}
                  >
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className={cn(
                        'group cursor-pointer rounded-3xl border p-4 transition hover:shadow-lg',
                        isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10'
                      )}
                      style={{
                        background: isDark
                          ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)'
                          : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(246,244,255,1) 100%)',
                      }}
                      onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center"
                            style={{
                              background: isDark
                                ? `linear-gradient(135deg, rgba(77,69,110,0.25), rgba(107,95,197,0.18))`
                                : `linear-gradient(135deg, rgba(77,69,110,0.16), rgba(107,95,197,0.18))`,
                              border: isDark
                                ? '1px solid rgba(255,255,255,0.10)'
                                : '1px solid rgba(77,69,110,0.14)',
                            }}
                          >
                            <FolderKanban className="w-5 h-5" style={{ color: PRIMARY }} />
                          </div>

                          <div>
                            <h4
                              className={cn(
                                'text-sm font-bold group-hover:underline',
                                isDark ? 'text-white' : 'text-foreground'
                              )}
                            >
                              {project.name}
                            </h4>
                            <p className={cn('text-xs', isDark ? 'text-white/60' : 'text-muted-foreground')}>
                              Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>

                        <button
                          className="h-9 w-9 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                          onClick={(e) => handleDeleteProject(project._id, e)}
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className={cn('text-xs', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                          Open project
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
