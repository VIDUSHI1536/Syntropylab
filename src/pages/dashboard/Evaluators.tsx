import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

import {
  Search,
  FlaskConical,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

interface Evaluator {
  _id: string;
  name: string;
  description: string;
  category: 'quality' | 'safety' | 'performance' | 'custom';
  ruleType: 'model_graded' | 'custom_prompt' | 'statistical';
  predefinedMetric?: string;
  customPrompt?: string;
  icon?: any;
  featured?: boolean;
  isGlobal?: boolean;
}

const PRIMARY = '#5f3b96';

const categoryConfig = {
  quality: { label: 'Quality', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  safety: { label: 'Safety', badge: 'bg-red-100 text-red-700 border-red-200' },
  performance: { label: 'Performance', badge: 'bg-green-100 text-green-700 border-green-200' },
  custom: { label: 'Custom', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function Evaluators() {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'custom',
    ruleType: 'custom_prompt',
    predefinedMetric: '',
    customPrompt: '',
    judgeModel: '',
    defaultThreshold: 0.5,
  });

  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchData = async () => {
    try {
      setLoading(true);

      const globalRules = await api.getGlobalEvaluationRules();

      const orgs = await api.getOrganizations();
      let projectRules: any[] = [];

      for (const org of orgs) {
        const projects = await api.getProjects(org._id);
        for (const project of projects) {
          try {
            const rules = await api.getRulesByProject(project._id);
            projectRules = [...projectRules, ...rules];
          } catch (e) {
            console.error(`Failed to fetch rules for project ${project._id}:`, e);
          }
        }
      }

      // Merge rules
const allRules = [...(globalRules || []), ...projectRules];

// Deduplicate by _id
const uniqueRulesMap = new Map<string, any>();

allRules.forEach((rule) => {
  if (!uniqueRulesMap.has(rule._id)) {
    uniqueRulesMap.set(rule._id, rule);
  }
});

const uniqueRules = Array.from(uniqueRulesMap.values());

const mappedRules: Evaluator[] = uniqueRules.map((r: any) => ({
  _id: r._id,
  name: r.name,
  description: r.description || 'No description',
  category: (r.category as any) || 'custom',
  ruleType: r.ruleType,
  predefinedMetric: r.predefinedMetric,
  customPrompt: r.customPrompt,
  icon: FlaskConical,
  featured: r.isGlobal,
  isGlobal: r.isGlobal,
}));

      setEvaluators(mappedRules);
    } catch (error) {
      console.error('Failed to fetch evaluators:', error);
      toast({
        title: 'Error',
        description: 'Failed to load evaluators. Please try again.',
        variant: 'destructive',
      });
      setEvaluators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.description) {
      toast({
        title: 'Error',
        description: 'Name and description are required',
        variant: 'destructive',
      });
      return;
    }

    if (newRule.ruleType === 'custom_prompt' && !newRule.customPrompt) {
      toast({
        title: 'Error',
        description: 'Custom prompt is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);

      await api.createEvaluationRule({
        name: newRule.name,
        description: newRule.description,
        ruleType: newRule.ruleType,
        customPrompt: newRule.customPrompt,
        isGlobal: true,
        category: newRule.category,
        defaultThreshold: newRule.defaultThreshold,
      });

      toast({ title: 'Success', description: 'Evaluator created successfully' });

      setCreateDialogOpen(false);
      setNewRule({
        name: '',
        description: '',
        category: 'custom',
        ruleType: 'custom_prompt',
        predefinedMetric: '',
        customPrompt: '',
        judgeModel: '',
        defaultThreshold: 0.5,
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create evaluator',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await api.deleteEvaluationRule(ruleId);
      setEvaluators((prev) => prev.filter((e) => e._id !== ruleId));
      toast({ title: 'Success', description: 'Evaluator deleted successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete evaluator',
        variant: 'destructive',
      });
    }
  };

  const filteredEvaluators = useMemo(() => {
    return evaluators.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'all' || e.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [evaluators, searchQuery, activeCategory]);

  const featuredEvaluators = useMemo(() => {
    return evaluators.filter((e) => e.featured);
  }, [evaluators]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

        <div>
          <div className="flex items-center gap-3">
           <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <FlaskConical className="w-5 h-5 text-white" />
              </div>

              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: isDark ? '#fff' : '#1f1b2e' }}
              >
                Evaluator Gallery
              </h1>

              {/* <Sparkles className="w-5 h-5 text-muted-foreground" /> */}
            </div>

            <p
              className="text-sm mt-2 max-w-2xl"
              style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)' }}
            >
              Choose from pre-built evaluators or create your own custom evaluation metrics.
            </p>
          </div>

          {/* CREATE */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <Plus className="w-4 h-4" />
                Create Evaluator
              </button>
            </DialogTrigger>

           <DialogContent
  className={cn(
    "max-w-lg rounded-3xl backdrop-blur-xl shadow-2xl",
    isDark
      ? "bg-white/10 border border-white/20 text-white"
      : "bg-white/80 border border-black/10 text-black"
  )}
>
  <DialogHeader className="text-center space-y-2">
    <DialogTitle
      className={cn(
        "text-2xl font-bold",
        isDark ? "text-white" : "text-foreground"
      )}
    >
      Create New Evaluator
    </DialogTitle>

    <p
      className={cn(
        "text-sm",
        isDark ? "text-white/60" : "text-muted-foreground"
      )}
    >
      Define a custom evaluation rule and prompt
    </p>
  </DialogHeader>

  <div className="space-y-6 pt-6">

    {/* Name */}
    <div className="space-y-2">
      <Label className={cn(isDark ? "text-white" : "text-foreground")}>
        Name
      </Label>

      <Input
        value={newRule.name}
        onChange={(e) =>
          setNewRule({ ...newRule, name: e.target.value })
        }
        placeholder="e.g. Tone Consistency"
        className={cn(
          "h-11 rounded-xl",
          isDark
            ? "bg-white/5 border-white/20 text-white placeholder:text-white/40"
            : "bg-white border-black/10 text-black placeholder:text-muted-foreground"
        )}
      />
    </div>

    {/* Description */}
    <div className="space-y-2">
      <Label className={cn(isDark ? "text-white" : "text-foreground")}>
        Description
      </Label>

      <Input
        value={newRule.description}
        onChange={(e) =>
          setNewRule({ ...newRule, description: e.target.value })
        }
        placeholder="What does this metric evaluate?"
        className={cn(
          "h-11 rounded-xl",
          isDark
            ? "bg-white/5 border-white/20 text-white placeholder:text-white/40"
            : "bg-white border-black/10 text-black placeholder:text-muted-foreground"
        )}
      />
    </div>

    {/* Category + Type */}
    <div className="grid grid-cols-2 gap-4">

      <div className="space-y-2">
        <Label className={cn(isDark ? "text-white" : "text-foreground")}>
          Category
        </Label>

        <Select
          value={newRule.category}
          onValueChange={(v) =>
            setNewRule({ ...newRule, category: v })
          }
        >
          <SelectTrigger
            className={cn(
              "h-11 rounded-xl",
              isDark
                ? "bg-white/5 border-white/20 text-white"
                : "bg-white border-black/10 text-black"
            )}
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            className={cn(
              isDark
                ? "bg-[#151127] border-white/20 text-white"
                : "bg-white border-black/10 text-black"
            )}
          >
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className={cn(isDark ? "text-white" : "text-foreground")}>
          Type
        </Label>

        <Input
          value="Prompt Template"
          disabled
          className={cn(
            "h-11 rounded-xl",
            isDark
              ? "bg-white/10 border-white/20 text-white/70"
              : "bg-gray-100 border-black/10 text-black/70"
          )}
        />
      </div>

    </div>

    {/* Prompt */}
    <div className="space-y-2">
      <Label className={cn(isDark ? "text-white" : "text-foreground")}>
        Prompt Template
      </Label>

      <Textarea
        value={newRule.customPrompt}
        onChange={(e) =>
          setNewRule({ ...newRule, customPrompt: e.target.value })
        }
        placeholder="Enter your evaluation prompt..."
        className={cn(
          "min-h-[140px] font-mono rounded-xl",
          isDark
            ? "bg-white/5 border-white/20 text-white placeholder:text-white/40"
            : "bg-white border-black/10 text-black placeholder:text-muted-foreground"
        )}
      />
    </div>

    {/* Button */}
    <Button
      onClick={handleCreateRule}
      disabled={creating}
      className="
        w-full h-12 rounded-2xl
        text-white font-semibold
        transition-all hover:scale-[1.02]
      "
      style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
      }}
    >
      {creating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        "Create Evaluator"
      )}
    </Button>

  </div>
</DialogContent>

          </Dialog>
        </div>

      {/* FEATURED */}
      {featuredEvaluators.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-foreground')}>
              Featured Evaluators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredEvaluators.map((evaluator) => {
              const category = categoryConfig[evaluator.category] || categoryConfig.custom;
              const Icon = evaluator.icon || FlaskConical;

              return (
                <Card
                  key={evaluator._id}
                  className={cn(
                    'relative group cursor-pointer rounded-3xl p-5 transition-all duration-300 hover:shadow-xl overflow-hidden border hover:-translate-y-1 hover:scale-[1.02]',

                    isDark ? 'bg-white/5 border-white/10 hover:bg-white/7' : 'bg-white border-black/10'
                  )}
                  style={{
                    background: isDark
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))'
                      : 'linear-gradient(180deg, #ffffff, #f6f4ff)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-11 w-11 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, rgba(77,69,110,0.18), rgba(107,95,197,0.15))`,
                        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: PRIMARY }} />
                    </div>

                    <div className="flex-1">
                      <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                        {evaluator.name}
                      </h3>
                      <Badge className={cn('mt-2 border rounded-full', category.badge)}>
                        {category.label}
                      </Badge>
                    </div>

                    {/* delete */}
                    <button
                      className={cn(
                        'h-10 w-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition',
                        isDark ? 'hover:bg-white/10' : 'hover:bg-red-50'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRule(evaluator._id);
                      }}
                      title="Delete evaluator"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <p className={cn('text-sm mt-3', isDark ? 'text-white/60' : 'text-muted-foreground')}>
                    {evaluator.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search evaluators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'pl-10 rounded-2xl',
              isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
            )}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'quality', 'safety', 'performance', 'custom'].map((category) => {
            const active = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-semibold border transition',
                  active ? 'text-white shadow-sm' : isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-[#1f1b2e] bg-white hover:bg-muted'
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
                {category === 'all'
                  ? 'All'
                  : categoryConfig[category as keyof typeof categoryConfig]?.label || category}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      {filteredEvaluators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredEvaluators.map((evaluator) => {
            const Icon = evaluator.icon || FlaskConical;

            return (
              <Card
                key={evaluator._id}
                className={cn(
                  'group relative cursor-pointer rounded-3xl p-4 border transition hover:shadow-xl overflow-hidden',
                  isDark ? 'bg-white/5 border-white/10 hover:bg-white/7' : 'bg-white border-black/10'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(77,69,110,0.30), rgba(107,95,197,0.20))'
                        : 'linear-gradient(135deg, rgba(77,69,110,0.18), rgba(107,95,197,0.18))',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.10)'
                        : '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold text-sm truncate', isDark ? 'text-white' : 'text-foreground')}>
                      {evaluator.name}
                    </p>
                    <p className={cn('text-xs truncate', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                      {evaluator.description}
                    </p>
                  </div>

                  {/* delete */}
                  <button
                    className={cn(
                      'h-9 w-9 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition',
                      isDark ? 'hover:bg-white/10' : 'hover:bg-red-50'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRule(evaluator._id);
                    }}
                    title="Delete evaluator"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div
            className={cn(
              'w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
            )}
          >
            <FlaskConical className={cn('w-8 h-8', isDark ? 'text-white/60' : 'text-muted-foreground')} />
          </div>

          <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-foreground')}>
            No evaluators found
          </h3>

          <p className={cn('mt-2 mb-4', isDark ? 'text-white/60' : 'text-muted-foreground')}>
            Try adjusting your search or filters.
          </p>

          <button
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
            }}
          >
            <Plus className="w-4 h-4" />
            Create Evaluator
          </button>
        </div>
      )}
    </div>
  );
}
