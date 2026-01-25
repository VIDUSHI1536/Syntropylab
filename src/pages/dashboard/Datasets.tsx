import { useEffect, useMemo, useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { api, Project } from '@/lib/api';
import {
  Plus,
  Database,
  Search,
  MoreVertical,
  FileText,
  Clock,
  Loader2,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface Dataset {
  _id: string;
  name: string;
  rowCount: number;
  columns: any;
  createdAt: string;
  projectId: string;
  projectName?: string;
}

const PRIMARY = '#4D456E';

export default function Datasets() {
  const { isDark } = useTheme();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newDatasetName, setNewDatasetName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputColumn, setInputColumn] = useState('input');
  const [targetColumn, setTargetColumn] = useState('target');
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const orgs = await api.getOrganizations();
        let allProjects: Project[] = [];
        let allDatasets: Dataset[] = [];

        // fetch projects
        for (const org of orgs) {
          try {
            const projs = await api.getProjects(org._id);
            allProjects = [...allProjects, ...projs];
          } catch (e) {
            console.error(`Failed to fetch projects for org ${org._id}`, e);
          }
        }
        setProjects(allProjects);

        // fetch datasets
        for (const proj of allProjects) {
          try {
            const dsets = await api.getDatasetsByProject(proj._id);

            const enrichedDatasets = dsets.map((d: any) => ({
              ...d,
              projectName: proj.name,
            }));

            allDatasets = [...allDatasets, ...enrichedDatasets];
          } catch (e) {
            console.error(`Failed to fetch datasets for project ${proj._id}`, e);
          }
        }

        setDatasets(allDatasets);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch datasets',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCreateDataset = async () => {
    if (
      !newDatasetName.trim() ||
      !selectedProjectId ||
      !selectedFile ||
      !inputColumn.trim() ||
      !targetColumn.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields and select a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      const newDataset = await api.uploadDataset(
        selectedFile,
        selectedProjectId,
        newDatasetName,
        inputColumn,
        targetColumn
      );

      const project = projects.find((p) => p._id === selectedProjectId);
      const enrichedDataset = { ...newDataset, projectName: project?.name };

      setDatasets([enrichedDataset, ...datasets]);

      setNewDatasetName('');
      setSelectedProjectId('');
      setSelectedFile(null);
      setDialogOpen(false);

      toast({
        title: 'Dataset created',
        description: `${newDatasetName} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    try {
      await api.deleteDataset(datasetId);
      setDatasets(datasets.filter((d) => d._id !== datasetId));
      toast({
        title: 'Dataset deleted',
        description: 'The dataset has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete dataset. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [datasets, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ✅ PREMIUM HEADER */}
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
          {/* title */}
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <Database className="w-5 h-5 text-white" />
              </div>

              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: isDark ? '#fff' : '#1f1b2e' }}
              >
                Datasets
              </h1>

              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>

            <p
              className="text-sm mt-2 max-w-2xl"
              style={{
                color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
              }}
            >
              Upload datasets, manage evaluation rows and organize projects in one place.
            </p>
          </div>

          {/* actions */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <Plus className="w-4 h-4" />
                New Dataset
              </button>
            </DialogTrigger>

            <DialogContent className={cn('bg-card border-border', isDark && 'bg-[#151127] border-white/10 text-white')}>
              <DialogHeader>
                <DialogTitle className={cn('text-foreground', isDark && 'text-white')}>
                  Upload New Dataset
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className={cn('text-sm font-medium', isDark && 'text-white')}>
                    Dataset Name
                  </label>
                  <Input
                    placeholder="Dataset name"
                    value={newDatasetName}
                    onChange={(e) => setNewDatasetName(e.target.value)}
                    className={cn(isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40')}
                  />
                </div>

                <div className="space-y-2">
                  <label className={cn('text-sm font-medium', isDark && 'text-white')}>
                    Project
                  </label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className={cn('rounded-2xl', isDark && 'bg-white/5 border-white/10 text-white')}>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className={cn(isDark && 'bg-[#151127] border-white/10 text-white')}>
                      {projects.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={cn('text-sm font-medium', isDark && 'text-white')}>
                    CSV File
                  </label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className={cn(
                      'cursor-pointer rounded-2xl',
                      isDark && 'bg-white/5 border-white/10 text-white file:text-white'
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className={cn('text-sm font-medium', isDark && 'text-white')}>
                      Input Column
                    </label>
                    <Input
                      value={inputColumn}
                      onChange={(e) => setInputColumn(e.target.value)}
                      className={cn('rounded-2xl', isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40')}
                      placeholder="input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={cn('text-sm font-medium', isDark && 'text-white')}>
                      Target Column
                    </label>
                    <Input
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      className={cn('rounded-2xl', isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40')}
                      placeholder="target"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateDataset}
                  className="w-full rounded-2xl"
                  disabled={uploading}
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                    color: 'white',
                  }}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload Dataset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ✅ SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'pl-10 rounded-2xl',
            isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
          )}
        />
      </div>

      {/* ✅ GRID */}
      {filteredDatasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDatasets.map((dataset) => (
            <Card
              key={dataset._id}
              className={cn(
                'group rounded-3xl border p-5 transition hover:shadow-xl overflow-hidden',
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/7' : 'bg-white border-black/10'
              )}
              style={{
                background: isDark
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))'
                  : 'linear-gradient(180deg, #ffffff, #f6f4ff)',
              }}
            >
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
                    <Database className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>

                  <div className="min-w-0">
                    <h3 className={cn('font-semibold text-base truncate', isDark ? 'text-white' : 'text-[#1f1b2e]')}>
                      {dataset.name}
                    </h3>

                    <p className={cn('text-xs mt-1 truncate', isDark ? 'text-white/60' : 'text-muted-foreground')}>
                      {dataset.projectName || 'Unknown project'}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-10 w-10 rounded-2xl opacity-0 group-hover:opacity-100 transition',
                        isDark ? 'hover:bg-white/10' : 'hover:bg-muted'
                      )}
                    >
                      <MoreVertical className={cn('w-4 h-4', isDark ? 'text-white' : 'text-foreground')} />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className={cn(isDark && 'bg-[#151127] border-white/10 text-white')}>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDataset(dataset._id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className={cn('rounded-2xl border p-3', isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white')}>
                  <div className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                    {dataset.rowCount?.toLocaleString() || 0}
                  </div>
                  <p className={cn('text-[11px] mt-1', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                    Rows
                  </p>
                </div>

                <div className={cn('rounded-2xl border p-3', isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white')}>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className={cn('font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                      {dataset.createdAt ? format(new Date(dataset.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <p className={cn('text-[11px] mt-1', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                    Created
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div
            className={cn(
              'w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
            )}
          >
            <Database className={cn('w-8 h-8', isDark ? 'text-white/60' : 'text-muted-foreground')} />
          </div>

          <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-foreground')}>
            No datasets found
          </h3>

          <p className={cn('mt-2 mb-4', isDark ? 'text-white/60' : 'text-muted-foreground')}>
            {projects.length === 0
              ? 'Create a project first to upload datasets.'
              : 'Upload your first dataset to get started.'}
          </p>

          <button
            onClick={() => setDialogOpen(true)}
            disabled={projects.length === 0}
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60',
              projects.length === 0 && 'cursor-not-allowed'
            )}
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
            }}
          >
            <Plus className="w-4 h-4" />
            New Dataset
          </button>
        </div>
      )}
    </div>
  );
}
