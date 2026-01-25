import { useState, useEffect, useRef, useCallback } from 'react';
// import { Play } from "lucide-react";
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { api, Project } from '@/lib/api';
import {
  ChevronRight,
  Plus,
  Loader2,
  Play,
  Settings,
  Trash2,
  Cpu,
  Scale,
  Save,
  ThumbsUp,
  ThumbsDown,
  Upload,
  Columns3,
  MoreHorizontal,
  Pencil,
  X,
  ChevronDown,
  Sparkles,
  BarChart3,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface DataRow {
  id: string;
  input: string;
  systemInstructions?: string;
  target?: string;
  output?: string;
  modelNickname?: string;
  humanEvaluation?: 'up' | 'down' | null;
  humanEvalNotes?: string;
  latency?: number;
  outputTokens?: number;
  totalTokens?: number;
  dateAdded?: string;
  [key: string]: any;
}

interface Evaluator {
  _id: string;
  name: string;
  customPrompt?: string;
  ruleType: string;
  judgeModel?: string;
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const orgIdParam = searchParams.get('orgId');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);


  const [rows, setRows] = useState<DataRow[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);


  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inputColumn, setInputColumn] = useState('input');
  const [targetColumn, setTargetColumn] = useState('target');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newEvaluatorOpen, setNewEvaluatorOpen] = useState(false);
  const [newEvaluatorName, setNewEvaluatorName] = useState('');
  const [newEvaluatorPrompt, setNewEvaluatorPrompt] = useState('');
  const [newEvaluatorJudgeModel, setNewEvaluatorJudgeModel] = useState('');
  const [newEvaluatorType, setNewEvaluatorType] = useState<'gallery' | 'custom'>('gallery');
  const [selectedGalleryEvaluator, setSelectedGalleryEvaluator] = useState<string>('');
  const [creatingEvaluator, setCreatingEvaluator] = useState(false);


  const [evaluatorGallery, setEvaluatorGallery] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [models, setModels] = useState<any[]>([]);

  const [selectedModel, setSelectedModel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'input', 'systemInstructions', 'output', 'modelNickname',
    'humanEvaluation', 'humanEvalNotes'
  ]);

  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);


  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<{ [key: string]: boolean }>({});
  const [apiKeyInputs, setApiKeyInputs] = useState<{ [key: string]: string }>({});
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  
  const [generatingSingleRow, setGeneratingSingleRow] = useState<number | null>(null);
  const [evaluatingSingleRow, setEvaluatingSingleRow] = useState<number | null>(null);

  
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());


  const metrics = {
    humanPassRate: rows.length > 0
      ? Math.round((rows.filter(r => r.humanEvaluation === 'up').length / rows.filter(r => r.humanEvaluation).length) * 100) || 0
      : 0,
    avgLatency: rows.length > 0
      ? (rows.reduce((acc, r) => acc + (r.latency || 0), 0) / rows.filter(r => r.latency).length).toFixed(2)
      : '0',
    totalInputTokens: rows.reduce((acc, r) => acc + ((r.totalTokens || 0) - (r.outputTokens || 0)), 0),
    totalOutputTokens: rows.reduce((acc, r) => acc + (r.outputTokens || 0), 0),
    avgTextQuality: rows.length > 0 && evaluators.length > 0
      ? (rows.reduce((acc, r) => {
        const scores = evaluators.map(e => r[`eval_${e._id}`]).filter(s => typeof s === 'number');
        return acc + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
      }, 0) / rows.filter(r => evaluators.some(e => typeof r[`eval_${e._id}`] === 'number')).length).toFixed(2)
      : '0',
  };


  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);


      let currentProject: Project | null = null;
      if (orgIdParam) {
        try {
          currentProject = await api.getProject(orgIdParam, projectId);
        } catch (e) { console.error(e); }
      }
      if (!currentProject) {
        const orgs = await api.getOrganizations();
        for (const org of orgs) {
          try {
            const p = await api.getProject(org._id, projectId);
            if (p) { currentProject = p; break; }
          } catch (e) { }
        }
      }
      if (!currentProject) throw new Error('Project not found');
      setProject(currentProject);


      const ds = await api.getDatasetsByProject(projectId);
      setDatasets(ds);

      
      if (ds.length === 1 && !selectedDatasetId) {
        setSelectedDatasetId(ds[0]._id);
      }


      try {
        const modelsResponse = await api.getModels();

        let modelList: string[] = [];
        if (Array.isArray(modelsResponse)) {
          modelList = modelsResponse;
        } else if (modelsResponse?.data) {
          modelList = modelsResponse.data.flatMap((p: any) => p.models || []);
        }
        setAvailableModels(modelList);
        if (modelList.length > 0 && !selectedModel) setSelectedModel(modelList[0]);
      } catch (e) {
        console.error('Failed to fetch models:', e);
        setAvailableModels(['gpt-4', 'gpt-4o', 'gpt-3.5-turbo', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229']);
      }


      try {
        const status = await api.getApiKeysStatus(projectId);
        setApiKeysStatus(status as any);
      } catch (e) {
        console.error('Failed to fetch API keys status:', e);
      }


      const rules = await api.getRulesByProject(projectId);
      setEvaluators(rules);


      const js = await api.getEvaluationJobsByProject(projectId);
      setJobs(js);


      try {
        setLoadingGallery(true);
        const gallery = await api.getRulesByProject(projectId);
        setEvaluatorGallery(gallery || []);
      } catch (e) {
        console.error('Failed to fetch evaluation gallery:', e);
        setEvaluatorGallery([]);
      } finally {
        setLoadingGallery(false);
      }



    } catch (error) {
      console.error('Failed to load project:', error);
      toast({ title: 'Error', description: 'Failed to load project data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [projectId, orgIdParam, toast, selectedModel]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);


  useEffect(() => {
    const loadDatasetRows = async () => {
      if (selectedDatasetId) {
        try {
          const datasetRows = await api.getDatasetRows(selectedDatasetId);
          const dataset = datasets.find(d => d._id === selectedDatasetId);


          const transformed: DataRow[] = datasetRows.map((row, idx) => ({
            id: `row-${idx}`,
            input: row[dataset?.columns?.inputColumn || 'input'] || row.input || '',
            systemInstructions: row.systemInstructions || row.system_instructions || '',
            target: row[dataset?.columns?.targetColumn || 'target'] || row.target || '',
            output: row.output || '',
            modelNickname: row.modelNickname || row.model || '',
            humanEvaluation: row.humanEvaluation || null,
            humanEvalNotes: row.humanEvalNotes || '',
            latency: row.latency,
            outputTokens: row.outputTokens || row.output_tokens,
            totalTokens: row.totalTokens || row.total_tokens,
            dateAdded: row.dateAdded || new Date().toISOString(),
            ...row,
          }));

          setRows(transformed);

          
          const columnsToShow = new Set(visibleColumns);

          
          const hasTokenData = transformed.some(r => r.outputTokens || r.totalTokens);
          const hasLatencyData = transformed.some(r => r.latency);

          if (hasTokenData) {
            columnsToShow.add('outputTokens');
            columnsToShow.add('totalTokens');
          }
          if (hasLatencyData) {
            columnsToShow.add('latency');
          }

          
          Object.keys(transformed[0] || {}).forEach(key => {
            if (key.startsWith('eval_')) {
              const hasData = transformed.some(r => r[key] !== undefined && r[key] !== null);
              if (hasData) {
                columnsToShow.add(key);
              }
            }
          });

          setVisibleColumns(Array.from(columnsToShow));
        } catch (e) {
          console.error('Failed to load dataset rows:', e);
        }
      }
    };
    loadDatasetRows();
  }, [selectedDatasetId, datasets]);


  useEffect(() => {
    const loadJobResults = async () => {
      if (selectedJobId) {
        try {
          const results = await api.getEvaluationJobResults(selectedJobId);
          if (results?.results) {

            setRows(prev => prev.map((row, idx) => {
              const result = results.results[idx];
              if (!result) return row;

              const evalScores: Record<string, number> = {};
              result.metrics?.forEach((m: any) => {
                const evaluator = evaluators.find(e => e.name === m.metricName);
                if (evaluator) {
                  evalScores[`eval_${evaluator._id}`] = m.score;
                }
              });

              return {
                ...row,
                output: result.output || row.output,
                ...evalScores,
              };
            }));
          }
        } catch (e) {
          console.error('Failed to load job results:', e);
        }
      }
    };
    loadJobResults();
  }, [selectedJobId, evaluators]);


  const handleAddRow = async () => {
    const newRow: DataRow = {
      id: `row-${Date.now()}`,
      input: '',
      systemInstructions: '',
      target: '',
      output: '',
      humanEvaluation: null,
      dateAdded: new Date().toISOString(),
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);

    
    if (selectedDatasetId) {
      try {
        const dataset = datasets.find(d => d._id === selectedDatasetId);
        const rowsToSave = updatedRows.map(row => {
          
          const rowData: any = {
            [dataset?.columns?.inputColumn || 'input']: row.input,
            [dataset?.columns?.targetColumn || 'target']: row.target,
            systemInstructions: row.systemInstructions,
            output: row.output,
            modelNickname: row.modelNickname,
            humanEvaluation: row.humanEvaluation,
            humanEvalNotes: row.humanEvalNotes,
            latency: row.latency,
            outputTokens: row.outputTokens,
            totalTokens: row.totalTokens,
            dateAdded: row.dateAdded,
          };

          
          Object.keys(row).forEach(key => {
            if (key.startsWith('eval_') || key === 'overallScore') {
              rowData[key] = row[key];
            }
          });

          return rowData;
        });
        await api.updateDatasetRows(selectedDatasetId, rowsToSave);
      } catch (error) {
        console.error('Failed to save new row:', error);
        toast({ title: 'Warning', description: 'Row added locally but not saved', variant: 'default' });
      }
    }
  };


  const handleCellChange = (rowId: string, column: string, value: any) => {
    const updatedRows = rows.map(row =>
      row.id === rowId ? { ...row, [column]: value } : row
    );
    setRows(updatedRows);

    
    
  };


  const handleHumanEval = (rowId: string, value: 'up' | 'down') => {
    setRows(prev => prev.map(row =>
      row.id === rowId
        ? { ...row, humanEvaluation: row.humanEvaluation === value ? null : value }
        : row
    ));
  };


  const handleDeleteRow = async (rowId: string) => {
    const updatedRows = rows.filter(row => row.id !== rowId);
    setRows(updatedRows);

    
    if (selectedDatasetId) {
      try {
        const dataset = datasets.find(d => d._id === selectedDatasetId);
        const rowsToSave = updatedRows.map(row => {
          const rowData: any = {
            [dataset?.columns?.inputColumn || 'input']: row.input,
            [dataset?.columns?.targetColumn || 'target']: row.target,
            systemInstructions: row.systemInstructions,
            output: row.output,
            modelNickname: row.modelNickname,
            humanEvaluation: row.humanEvaluation,
            humanEvalNotes: row.humanEvalNotes,
            latency: row.latency,
            outputTokens: row.outputTokens,
            totalTokens: row.totalTokens,
            dateAdded: row.dateAdded,
          };

          
          Object.keys(row).forEach(key => {
            if (key.startsWith('eval_') || key === 'overallScore') {
              rowData[key] = row[key];
            }
          });

          return rowData;
        });
        await api.updateDatasetRows(selectedDatasetId, rowsToSave);
        toast({ title: 'Success', description: 'Row deleted' });
      } catch (error) {
        console.error('Failed to delete row:', error);
        toast({ title: 'Error', description: 'Failed to delete row', variant: 'destructive' });
      }
    }
  };

  const handleGenerateSingleRow = async (rowIndex: number) => {
    if (!selectedDatasetId || !selectedModel) return;

    try {
      setGeneratingSingleRow(rowIndex);
      await api.generateSingleRowOutput(
        selectedDatasetId,
        rowIndex,
        selectedModel
      );

      
      const datasetRows = await api.getDatasetRows(selectedDatasetId);
      const dataset = datasets.find(d => d._id === selectedDatasetId);

      const transformed: DataRow[] = datasetRows.map((row, idx) => ({
        id: `row-${idx}`,
        input: row[dataset?.columns?.inputColumn || 'input'] || row.input || '',
        systemInstructions: row.systemInstructions || row.system_instructions || '',
        target: row[dataset?.columns?.targetColumn || 'target'] || row.target || '',
        output: row.output || '',
        modelNickname: row.modelNickname || row.model || '',
        humanEvaluation: row.humanEvaluation || null,
        humanEvalNotes: row.humanEvalNotes || '',
        latency: row.latency,
        outputTokens: row.outputTokens || row.output_tokens,
        totalTokens: row.totalTokens || row.total_tokens,
        dateAdded: row.dateAdded || new Date().toISOString(),
        ...row,
      }));

      setRows(transformed);
      toast({ title: 'Success', description: 'Output generated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to generate output', variant: 'destructive' });
    } finally {
      setGeneratingSingleRow(null);
    }
  };

  const handleEvaluateSingleRow = async (rowIndex: number) => {
    if (!selectedDatasetId || !selectedModel || evaluators.length === 0) return;

    try {
      setEvaluatingSingleRow(rowIndex);
      const ruleIds = evaluators.map(e => e._id);

      await api.evaluateSingleRow(
        selectedDatasetId,
        rowIndex,
        selectedModel,
        ruleIds
      );

      
      const datasetRows = await api.getDatasetRows(selectedDatasetId);
      const dataset = datasets.find(d => d._id === selectedDatasetId);

      const transformed: DataRow[] = datasetRows.map((row, idx) => ({
        id: `row-${idx}`,
        input: row[dataset?.columns?.inputColumn || 'input'] || row.input || '',
        systemInstructions: row.systemInstructions || row.system_instructions || '',
        target: row[dataset?.columns?.targetColumn || 'target'] || row.target || '',
        output: row.output || '',
        modelNickname: row.modelNickname || row.model || '',
        humanEvaluation: row.humanEvaluation || null,
        humanEvalNotes: row.humanEvalNotes || '',
        latency: row.latency,
        outputTokens: row.outputTokens || row.output_tokens,
        totalTokens: row.totalTokens || row.total_tokens,
        dateAdded: row.dateAdded || new Date().toISOString(),
        ...row,
      }));

      setRows(transformed);
      toast({ title: 'Success', description: 'Row evaluated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to evaluate row', variant: 'destructive' });
    } finally {
      setEvaluatingSingleRow(null);
    }
  };


  const handleFileUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !projectId) return;
    if (!inputColumn.trim() || !targetColumn.trim()) {
      toast({ title: 'Error', description: 'Please specify input and target columns', variant: 'destructive' });
      return;
    }
    try {
      setUploading(true);
      await api.uploadDataset(file, projectId, file.name, inputColumn, targetColumn);
      toast({ title: 'Success', description: 'Dataset uploaded' });
      setUploadDialogOpen(false);
      await fetchProjectData();
    } catch (error) {
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };


  const handleSelectGalleryEvaluator = (evalId: string) => {
    const evaluator = evaluatorGallery.find(e => e._id === evalId);
    if (evaluator) {
      setSelectedGalleryEvaluator(evalId);
      setNewEvaluatorName(evaluator.name);
      setNewEvaluatorPrompt(evaluator.customPrompt || '');
    }
  };


  const handleCreateEvaluator = async () => {
    if (!projectId || !newEvaluatorName || !newEvaluatorPrompt) {
      toast({ title: 'Error', description: 'Name and prompt are required', variant: 'destructive' });
      return;
    }
    try {
      setCreatingEvaluator(true);
      await api.createEvaluationRule({
        name: newEvaluatorName,
        projectId,
        ruleType: 'custom_prompt',
        customPrompt: newEvaluatorPrompt,
        description: newEvaluatorType === 'gallery' ? 'Pre-configured evaluator' : 'Custom prompt evaluator'
      });
      toast({ title: 'Success', description: `Evaluator "${newEvaluatorName}" created` });
      setNewEvaluatorOpen(false);
      setNewEvaluatorName('');
      setNewEvaluatorPrompt('');
      setNewEvaluatorJudgeModel('');
      setNewEvaluatorType('gallery');
      setSelectedGalleryEvaluator('');
      await fetchProjectData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create evaluator', variant: 'destructive' });
    } finally {
      setCreatingEvaluator(false);
    }
  };


  const handleGenerateAll = async () => {
    if (!selectedDatasetId || !selectedModel) {

      if (rows.length === 0) {
        toast({ title: 'Error', description: 'Add some rows first', variant: 'destructive' });
        return;
      }
      if (!selectedModel) {
        toast({ title: 'Error', description: 'Select a model first', variant: 'destructive' });
        return;
      }
    }

    try {
      setGenerating(true);

      if (selectedDatasetId) {
        
        if (selectedRowIds.size > 0) {
          const selectedIndices = rows
            .map((row, idx) => selectedRowIds.has(row.id) ? idx : -1)
            .filter(idx => idx !== -1);

          for (const idx of selectedIndices) {
            await api.generateSingleRowOutput(selectedDatasetId, idx, selectedModel);
          }

          toast({ title: 'Success', description: `Generated ${selectedIndices.length} outputs` });
        } else {
          
          await api.generateDatasetOutputs(selectedDatasetId, selectedModel);
          toast({ title: 'Success', description: 'Outputs generated!' });
        }

        const datasetRows = await api.getDatasetRows(selectedDatasetId);
        const dataset = datasets.find(d => d._id === selectedDatasetId);
        const transformed: DataRow[] = datasetRows.map((row, idx) => ({
          id: `row-${idx}`,
          input: row[dataset?.columns?.inputColumn || 'input'] || row.input || '',
          systemInstructions: row.systemInstructions || row.system_instructions || '',
          target: row[dataset?.columns?.targetColumn || 'target'] || row.target || '',
          output: row.output || '',
          modelNickname: row.modelNickname || row.model || selectedModel,
          humanEvaluation: row.humanEvaluation || null,
          humanEvalNotes: row.humanEvalNotes || '',
          latency: row.latency,
          outputTokens: row.outputTokens || row.output_tokens,
          totalTokens: row.totalTokens || row.total_tokens,
          dateAdded: row.dateAdded || new Date().toISOString(),
          ...row,
        }));
        setRows(transformed);
        setSelectedRowIds(new Set()); 
      } else {

        toast({ title: 'Info', description: 'Please upload or select a dataset first to generate outputs', variant: 'default' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to generate outputs', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };


  const handleEvaluateAll = async () => {
    if (!projectId || !selectedDatasetId) {
      toast({ title: 'Error', description: 'Please select a dataset first', variant: 'destructive' });
      return;
    }
    if (evaluators.length === 0) {
      toast({ title: 'Error', description: 'Add at least one evaluator first', variant: 'destructive' });
      return;
    }
    if (!selectedModel) {
      toast({ title: 'Error', description: 'Select a model for evaluation', variant: 'destructive' });
      return;
    }

    try {
      setEvaluating(true);

      
      if (selectedRowIds.size > 0) {
        const selectedIndices = rows
          .map((row, idx) => selectedRowIds.has(row.id) ? idx : -1)
          .filter(idx => idx !== -1);

        const rowsToEvaluate = selectedIndices.filter(idx => rows[idx].output);

        if (rowsToEvaluate.length === 0) {
          toast({ title: 'Error', description: 'Selected rows have no outputs to evaluate', variant: 'destructive' });
          setEvaluating(false);
          return;
        }

        const ruleIds = evaluators.map(e => e._id);
        for (const idx of rowsToEvaluate) {
          await api.evaluateSingleRow(selectedDatasetId, idx, selectedModel, ruleIds);
        }

        
        const datasetRows = await api.getDatasetRows(selectedDatasetId);
        const dataset = datasets.find(d => d._id === selectedDatasetId);
        const transformed: DataRow[] = datasetRows.map((row, idx) => ({
          id: `row-${idx}`,
          input: row[dataset?.columns?.inputColumn || 'input'] || row.input || '',
          systemInstructions: row.systemInstructions || row.system_instructions || '',
          target: row[dataset?.columns?.targetColumn || 'target'] || row.target || '',
          output: row.output || '',
          modelNickname: row.modelNickname || row.model || '',
          humanEvaluation: row.humanEvaluation || null,
          humanEvalNotes: row.humanEvalNotes || '',
          latency: row.latency,
          outputTokens: row.outputTokens || row.output_tokens,
          totalTokens: row.totalTokens || row.total_tokens,
          dateAdded: row.dateAdded || new Date().toISOString(),
          ...row,
        }));
        setRows(transformed);
        setSelectedRowIds(new Set());
        setEvaluating(false);
        toast({ title: 'Success', description: `Evaluated ${rowsToEvaluate.length} rows` });
        return;
      }

      
      if (!rows.some(r => r.output)) {
        toast({ title: 'Error', description: 'Generate outputs first before evaluating', variant: 'destructive' });
        setEvaluating(false);
        return;
      }

      const job = await api.createEvaluationJob({
        name: `Evaluation ${new Date().toLocaleString()}`,
        projectId,
        datasetId: selectedDatasetId,
        modelName: selectedModel || 'gpt-4',
        metrics: evaluators.map(e => ({
          ruleId: e._id,
          weight: 1.0,
          judgeModel: selectedModel
        })),
      });

      toast({ title: 'Evaluation Started', description: 'Results will appear shortly...' });


      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const results = await api.getEvaluationJobResults(job._id);

          
          if (selectedDatasetId) {
            const datasetRows = await api.getDatasetRows(selectedDatasetId);
            const dataset = datasets.find(d => d._id === selectedDatasetId);

            const transformed: DataRow[] = datasetRows.map((row, idx) => ({
              id: `row-${idx}`,
              input: row[dataset?.columns?.inputColumn || 'input'] || row.input || '',
              systemInstructions: row.systemInstructions || row.system_instructions || '',
              target: row[dataset?.columns?.targetColumn || 'target'] || row.target || '',
              output: row.output || '',
              modelNickname: row.modelNickname || row.model || '',
              humanEvaluation: row.humanEvaluation || null,
              humanEvalNotes: row.humanEvalNotes || '',
              latency: row.latency,
              outputTokens: row.outputTokens || row.output_tokens,
              totalTokens: row.totalTokens || row.total_tokens,
              dateAdded: row.dateAdded || new Date().toISOString(),
              ...row,
            }));

            setRows(transformed);
          }


          if (results?.status === 'completed' || results?.status === 'failed') {
            clearInterval(pollInterval);
            if (results.status === 'completed') {
              toast({ title: 'Success', description: 'Evaluation complete!' });
            } else {
              toast({ title: 'Error', description: 'Evaluation failed', variant: 'destructive' });
            }
            setEvaluating(false);
          }
        } catch (e) {
          if (attempts > 120) {
            clearInterval(pollInterval);
            setEvaluating(false);
            toast({ title: 'Timeout', description: 'Evaluation is taking longer than expected. Check jobs tab.', variant: 'destructive' });
          }
        }
      }, 2000);

    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to start evaluation', variant: 'destructive' });
      setEvaluating(false);
    }
  };


  const handleUpdateApiKey = async (provider: string) => {
    if (!projectId || !apiKeyInputs[provider]) return;
    try {
      setUpdatingKey(provider);
      await api.updateApiKeys(projectId, { [provider]: apiKeyInputs[provider] });
      toast({ title: 'Success', description: `${provider} key saved` });
      setApiKeyInputs(prev => ({ ...prev, [provider]: '' }));
      const status = await api.getApiKeysStatus(projectId);
      setApiKeysStatus(status as any);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save key', variant: 'destructive' });
    } finally {
      setUpdatingKey(null);
    }
  };


  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api.deleteProject(project.orgId, project._id);
      navigate('/dashboard/projects');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };


  const getScoreBadge = (score: number | string | undefined) => {
    if (score === undefined || score === null) return null;
    const numScore = Number(score);
    if (isNaN(numScore)) return null;

    const color = numScore >= 0.8 ? 'bg-green-500' : numScore >= 0.5 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <Badge className={`${color} text-white text-xs`}>
        {numScore.toFixed(2)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center">Project not found</div>;
  }

  
  const renderMobileCard = (row: DataRow, index: number) => {
    return (
      <Card key={row.id} className="mb-4">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedRowIds.has(row.id)}
                onCheckedChange={(checked) => {
                  setSelectedRowIds(prev => {
                    const newSet = new Set(prev);
                    if (checked) {
                      newSet.add(row.id);
                    } else {
                      newSet.delete(row.id);
                    }
                    return newSet;
                  });
                }}
              />
              <span className="font-mono text-xs text-muted-foreground">Row {index + 1}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDeleteRow(row.id)} className="text-destructive">
                  <Trash2 className="h-3 w-3 mr-2" /> Delete row
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          {}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase">Input</Label>
            <div
              className="text-sm bg-muted/30 p-2 rounded-md max-h-[100px] overflow-y-auto"
              onClick={() => setEditingCell({ rowId: row.id, column: 'input' })}
            >
              {editingCell?.rowId === row.id && editingCell?.column === 'input' ? (
                <Textarea
                  value={row.input}
                  onChange={e => handleCellChange(row.id, 'input', e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  autoFocus
                  className="min-h-[60px]"
                />
              ) : (
                row.input || <span className="text-muted-foreground italic">Click to edit...</span>
              )}
            </div>
          </div>

          {}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase">Target</Label>
            <div
              className="text-sm bg-muted/30 p-2 rounded-md max-h-[80px] overflow-y-auto"
              onClick={() => setEditingCell({ rowId: row.id, column: 'target' })}
            >
              {editingCell?.rowId === row.id && editingCell?.column === 'target' ? (
                <Textarea
                  value={row.target || ''}
                  onChange={e => handleCellChange(row.id, 'target', e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  autoFocus
                  className="min-h-[60px]"
                />
              ) : (
                row.target || <span className="text-muted-foreground italic">Expected output...</span>
              )}
            </div>
          </div>

          {}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase">Output</Label>
            <div className="text-sm bg-blue-50/50 p-2 rounded-md max-h-[150px] overflow-y-auto border border-blue-100">
              {row.output || <span className="text-muted-foreground italic">Not generated</span>}
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {evaluators.map(e => (
              <div key={e._id} className="flex flex-col bg-purple-50/50 p-2 rounded border border-purple-100">
                <span className="text-[10px] text-muted-foreground uppercase truncate">{e.name}</span>
                <div className="mt-1">{getScoreBadge(row[`eval_${e._id}`]) || <span className="text-xs text-muted-foreground">-</span>}</div>
              </div>
            ))}

            <div className="flex flex-col bg-muted/30 p-2 rounded">
              <span className="text-[10px] text-muted-foreground uppercase">Latency</span>
              <span className="text-xs font-mono">{row.latency ? `${row.latency.toFixed(2)}s` : '-'}</span>
            </div>
            <div className="flex flex-col bg-muted/30 p-2 rounded">
              <span className="text-[10px] text-muted-foreground uppercase">Tokens</span>
              <span className="text-xs font-mono">{row.totalTokens || '-'}</span>
            </div>
          </div>

          {}
          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Human Eval</span>
            <div className="flex items-center gap-1">
              <Button
                variant={row.humanEvaluation === 'up' ? 'default' : 'outline'}
                size="icon"
                className={`h-7 w-7 ${row.humanEvaluation === 'up' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                onClick={() => handleHumanEval(row.id, 'up')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant={row.humanEvaluation === 'down' ? 'default' : 'outline'}
                size="icon"
                className={`h-7 w-7 ${row.humanEvaluation === 'down' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={() => handleHumanEval(row.id, 'down')}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        { }
        <div className="flex items-center justify-between py-4 px-6 border-b shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/dashboard/projects" className="text-muted-foreground hover:text-foreground">
              Evaluation Projects
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">{project.name}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> Settings & API Keys
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteProject} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:px-6 md:py-6 bg-muted/10 shrink-0">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Human Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{metrics.humanPassRate}%</div>
              <p className="text-xs text-muted-foreground">Based on manual reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{metrics.avgLatency}s</div>
              <p className="text-xs text-muted-foreground">Per generation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Dataset Size
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{rows.length}</div>
              <p className="text-xs text-muted-foreground">Total rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" /> Evaluators
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{evaluators.length}</div>
              <p className="text-xs text-muted-foreground">Active rules</p>
            </CardContent>
          </Card>
        </div>
        <div className="px-4 md:px-6 py-3 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-background">
          <div className="flex flex-wrap items-center gap-3">
            { }
            <Select value={selectedDatasetId || 'none'} onValueChange={(v) => setSelectedDatasetId(v === 'none' ? null : v)}>
              <SelectTrigger className="w-full md:w-[180px] h-8">
                <SelectValue placeholder="No dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No dataset (manual)</SelectItem>
                {datasets.map(d => (
                  <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            { }
                      <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/projects/${projectId}/playground`)}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Open Playground
          </Button>
            { }
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" /> Upload Dataset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Dataset</DialogTitle>
                  <DialogDescription>Upload a CSV file with your evaluation data.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>CSV File</Label>
                    <Input type="file" accept=".csv" ref={fileInputRef} disabled={uploading} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Input Column</Label>
                      <Input value={inputColumn} onChange={e => setInputColumn(e.target.value)} placeholder="input" />
                    </div>
                    <div>
                      <Label>Target Column</Label>
                      <Input value={targetColumn} onChange={e => setTargetColumn(e.target.value)} placeholder="target" />
                    </div>
                  </div>
                  <Button onClick={handleFileUpload} disabled={uploading} className="w-full">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            { }
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="w-4 h-4 mr-2" /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {['input', 'systemInstructions', 'target', 'output', 'modelNickname', 'humanEvaluation', 'humanEvalNotes', 'latency', 'outputTokens', 'totalTokens',].map(col => (
                  <DropdownMenuItem key={col} onClick={() => {
                    setVisibleColumns(prev =>
                      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                    );
                  }}>
                    <Checkbox checked={visibleColumns.includes(col)} className="mr-2" />
                    {col}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {evaluators.map(e => (
                  <DropdownMenuItem key={e._id} onClick={() => {
                    const col = `eval_${e._id}`;
                    setVisibleColumns(prev =>
                      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                    );
                  }}>
                    <Checkbox checked={visibleColumns.includes(`eval_${e._id}`)} className="mr-2" />
                    {e.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            { }
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full md:w-[200px] h-8">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            { }
            <Dialog open={newEvaluatorOpen} onOpenChange={(open) => {
              setNewEvaluatorOpen(open);
              if (!open) {
                setNewEvaluatorType('gallery');
                setSelectedGalleryEvaluator('');
                setNewEvaluatorName('');
                setNewEvaluatorPrompt('');
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Scale className="w-4 h-4 mr-2" /> Add Evaluator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Evaluator</DialogTitle>
                  <DialogDescription>Choose from evaluation gallery or create your own custom evaluator.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  { }
                  <Tabs value={newEvaluatorType} onValueChange={(v) => setNewEvaluatorType(v as 'gallery' | 'custom')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="gallery">Evaluation Gallery</TabsTrigger>
                      <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
                    </TabsList>

                    <TabsContent value="gallery" className="space-y-4">
                      {loadingGallery ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Loading evaluation gallery...</p>
                        </div>
                      ) : evaluatorGallery.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No pre-configured evaluators available. Try creating a custom evaluator instead.</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            {evaluatorGallery.map(evaluator => (
                              <Card
                                key={evaluator._id}
                                className={`cursor-pointer transition-all hover:border-primary ${selectedGalleryEvaluator === evaluator._id ? 'border-primary ring-2 ring-primary' : ''
                                  }`}
                                onClick={() => handleSelectGalleryEvaluator(evaluator._id)}
                              >
                                <CardHeader className="p-4">
                                  <CardTitle className="text-sm flex items-center justify-between">
                                    {evaluator.name}
                                    {selectedGalleryEvaluator === evaluator._id && (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    )}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {evaluator.description || 'Custom evaluation prompt'}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                            ))}
                          </div>

                          {selectedGalleryEvaluator && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                              <Label className="text-sm font-semibold mb-2 block">Evaluation Prompt Preview</Label>
                              <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                                {evaluatorGallery.find(e => e._id === selectedGalleryEvaluator)?.customPrompt}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <Input
                                  placeholder="Evaluator name (optional, will use default)"
                                  value={newEvaluatorName}
                                  onChange={e => setNewEvaluatorName(e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4">
                      <div>
                        <Label>Evaluator Name</Label>
                        <Input
                          placeholder="e.g. Empathy, Brand Voice, Technical Depth"
                          value={newEvaluatorName}
                          onChange={e => setNewEvaluatorName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Custom Evaluation Prompt</Label>
                        <Textarea
                          placeholder="Describe what you want to evaluate. For example: 'Rate how empathetic this response is. Consider emotional awareness, understanding, and supportiveness. Score from 0 to 1.'"
                          value={newEvaluatorPrompt}
                          onChange={e => setNewEvaluatorPrompt(e.target.value)}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Tip: Be specific about what to evaluate and always ask for a score from 0 to 1.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    onClick={handleCreateEvaluator}
                    disabled={creatingEvaluator || !newEvaluatorName || !newEvaluatorPrompt}
                    className="w-full"
                  >
                    {creatingEvaluator ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Evaluator
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            { }
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAll}
              disabled={generating || (selectedRowIds.size > 0 && selectedRowIds.size === 0)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Cpu className="w-4 h-4 mr-2" />}
              {selectedRowIds.size > 0 ? `Generate ${selectedRowIds.size}` : 'Generate all outputs'}
            </Button>

            { }
            <Button
              size="sm"
              onClick={handleEvaluateAll}
              disabled={evaluating || (selectedRowIds.size > 0 && selectedRowIds.size === 0)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {evaluating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {selectedRowIds.size > 0 ? `Evaluate ${selectedRowIds.size}` : 'Evaluate all'}
            </Button>
          </div>
        </div>

        { }
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse min-w-max">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left font-medium border-b w-8"></th>
                {visibleColumns.includes('input') && (
                  <th className="p-2 text-left font-medium border-b min-w-[200px]">INPUT</th>
                )}
                {visibleColumns.includes('systemInstructions') && (
                  <th className="p-2 text-left font-medium border-b min-w-[200px]">SYSTEM INSTRUCTIONS</th>
                )}
                {visibleColumns.includes('target') && (
                  <th className="p-2 text-left font-medium border-b min-w-[200px]">TARGET</th>
                )}
                {visibleColumns.includes('output') && (
                  <th className="p-2 text-left font-medium border-b min-w-[250px] bg-blue-50">OUTPUT</th>
                )}
                {visibleColumns.includes('modelNickname') && (
                  <th className="p-2 text-left font-medium border-b min-w-[150px]">MODEL</th>
                )}
                {visibleColumns.includes('humanEvaluation') && (
                  <th className="p-2 text-center font-medium border-b min-w-[120px]">HUMAN EVAL</th>
                )}
                {visibleColumns.includes('humanEvalNotes') && (
                  <th className="p-2 text-left font-medium border-b min-w-[150px]">EVAL NOTES</th>
                )}
                { }
                {evaluators.map(e => visibleColumns.includes(`eval_${e._id}`) && (
                  <th key={e._id} className="p-2 text-center font-medium border-b min-w-[100px] bg-purple-50">
                    {e.name.toUpperCase()}
                  </th>
                ))}
                {visibleColumns.includes('outputTokens') && (
                  <th className="p-2 text-right font-medium border-b min-w-[80px]">OUT TOKENS</th>
                )}
                {visibleColumns.includes('totalTokens') && (
                  <th className="p-2 text-right font-medium border-b min-w-[80px]">TOTAL TOKENS</th>
                )}
                {visibleColumns.includes('latency') && (
                  <th className="p-2 text-right font-medium border-b min-w-[80px]">LATENCY</th>
                )}
                <th className="p-2 text-center font-medium border-b w-10">
                  <MoreHorizontal className="w-4 h-4 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-muted/30 border-b">
                  <td className="p-2 text-center">
                    <Checkbox
                      checked={selectedRowIds.has(row.id)}
                      onCheckedChange={(checked) => {
                        setSelectedRowIds(prev => {
                          const newSet = new Set(prev);
                          if (checked) {
                            newSet.add(row.id);
                          } else {
                            newSet.delete(row.id);
                          }
                          return newSet;
                        });
                      }}
                    />
                  </td>
                  {visibleColumns.includes('input') && (
                    <td className="p-2">
                      {editingCell?.rowId === row.id && editingCell?.column === 'input' ? (
                        <Textarea
                          value={row.input}
                          onChange={e => handleCellChange(row.id, 'input', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="min-h-[60px]"
                        />
                      ) : (
                        <div
                          className="cursor-text hover:bg-muted/50 p-1 rounded max-w-[300px] truncate"
                          onClick={() => setEditingCell({ rowId: row.id, column: 'input' })}
                        >
                          {row.input || <span className="text-muted-foreground italic">Click to edit...</span>}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('systemInstructions') && (
                    <td className="p-2">
                      {editingCell?.rowId === row.id && editingCell?.column === 'systemInstructions' ? (
                        <Textarea
                          value={row.systemInstructions || ''}
                          onChange={e => handleCellChange(row.id, 'systemInstructions', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="min-h-[60px]"
                        />
                      ) : (
                        <div
                          className="cursor-text hover:bg-muted/50 p-1 rounded max-w-[250px] truncate text-muted-foreground"
                          onClick={() => setEditingCell({ rowId: row.id, column: 'systemInstructions' })}
                        >
                          {row.systemInstructions || <span className="italic">Add system prompt...</span>}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('target') && (
                    <td className="p-2">
                      {editingCell?.rowId === row.id && editingCell?.column === 'target' ? (
                        <Textarea
                          value={row.target || ''}
                          onChange={e => handleCellChange(row.id, 'target', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          className="min-h-[60px]"
                        />
                      ) : (
                        <div
                          className="cursor-text hover:bg-muted/50 p-1 rounded max-w-[250px] truncate"
                          onClick={() => setEditingCell({ rowId: row.id, column: 'target' })}
                        >
                          {row.target || <span className="text-muted-foreground italic">Expected output...</span>}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('output') && (
                    <td className="p-2 bg-blue-50/50">
                      <div className="max-w-[300px] truncate font-medium">
                        {row.output || <span className="text-muted-foreground italic">Not generated</span>}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('modelNickname') && (
                    <td className="p-2">
                      <Badge variant="secondary" className="text-xs">
                        {row.modelNickname || selectedModel || '-'}
                      </Badge>
                    </td>
                  )}
                  {visibleColumns.includes('humanEvaluation') && (
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant={row.humanEvaluation === 'up' ? 'default' : 'outline'}
                          size="icon"
                          className={`h-7 w-7 ${row.humanEvaluation === 'up' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                          onClick={() => handleHumanEval(row.id, 'up')}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={row.humanEvaluation === 'down' ? 'default' : 'outline'}
                          size="icon"
                          className={`h-7 w-7 ${row.humanEvaluation === 'down' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                          onClick={() => handleHumanEval(row.id, 'down')}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('humanEvalNotes') && (
                    <td className="p-2">
                      <Input
                        value={row.humanEvalNotes || ''}
                        onChange={e => handleCellChange(row.id, 'humanEvalNotes', e.target.value)}
                        placeholder="Type notes..."
                        className="h-7 text-xs"
                      />
                    </td>
                  )}
                  { }
                  {evaluators.map(e => visibleColumns.includes(`eval_${e._id}`) && (
                    <td key={e._id} className="p-2 text-center bg-purple-50/50">
                      {getScoreBadge(row[`eval_${e._id}`])}
                    </td>
                  ))}
                  {visibleColumns.includes('outputTokens') && (
                    <td className="p-2 text-right text-muted-foreground">
                      {row.outputTokens || '-'}
                    </td>
                  )}
                  {visibleColumns.includes('totalTokens') && (
                    <td className="p-2 text-right text-muted-foreground">
                      {row.totalTokens || '-'}
                    </td>
                  )}
                  {visibleColumns.includes('latency') && (
                    <td className="p-2 text-right text-muted-foreground">
                      {row.latency ? `${row.latency.toFixed(2)}s` : '-'}
                    </td>
                  )}
                  <td className="p-2 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteRow(row.id)} className="text-destructive">
                          <Trash2 className="h-3 w-3 mr-2" /> Delete row
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              { }
              <tr>
                <td colSpan={20} className="p-2">
                  <Button variant="ghost" size="sm" onClick={handleAddRow} className="text-muted-foreground">
                    <Plus className="w-4 h-4 mr-2" /> Add row
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        { }
        <div className="px-6 py-2 border-t flex items-center justify-between text-sm text-muted-foreground shrink-0">
          <div>Show {rows.length} rows</div>
          <div className="flex items-center gap-2">
            <span>1 of 1</span>
            <Button variant="ghost" size="icon" disabled className="h-6 w-6">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="ghost" size="icon" disabled className="h-6 w-6">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        { }
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Settings & API Keys</DialogTitle>
              <DialogDescription>Configure API keys for different LLM providers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {['openai', 'anthropic', 'google', 'mistral', 'cohere'].map(provider => (
                <div key={provider} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="capitalize flex items-center justify-between">
                      {provider}
                      {apiKeysStatus[provider] && <Badge variant="outline" className="text-green-600 border-green-600">Configured</Badge>}
                    </Label>
                    <Input
                      type="password"
                      placeholder={apiKeysStatus[provider] ? "••••••••" : `Enter ${provider} key`}
                      value={apiKeyInputs[provider] || ''}
                      onChange={e => setApiKeyInputs(prev => ({ ...prev, [provider]: e.target.value }))}
                    />
                  </div>
                  <Button onClick={() => handleUpdateApiKey(provider)} disabled={!apiKeyInputs[provider] || updatingKey === provider}>
                    {updatingKey === provider ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
