
const API_BASE_URL = 'http://localhost:5000';


export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Organization {
  _id: string;
  name: string;
  ownerId: string;
  members: OrgMember[];
  createdAt: string;
}

export interface OrgMember {
  userId: string;
  role: 'Owner' | 'Admin' | 'Member';
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface Project {
  _id: string;
  name: string;
  orgId: string;
  createdAt: string;
}

export interface ApiKeyStatus {
  openai: boolean;
  anthropic: boolean;
  google: boolean;
  mistral: boolean;
  azure: boolean;
  cohere: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  projectId: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}


class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string, checkbox: boolean) {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, checkbox }),
    });
  }

  async logout() {
    return this.request<void>('/auth/sign-out', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  async googleAuth(token: string) {
    return this.request<User>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  
  async getOrganizations() {
    return this.request<Organization[]>('/orgs');
  }

  async getOrganization(orgId: string) {
    return this.request<Organization>(`/orgs/${orgId}`);
  }

  async createOrganization(name: string) {
    return this.request<Organization>('/orgs', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async inviteMember(orgId: string, email: string, role: string) {
    return this.request<void>(`/orgs/${orgId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async acceptInvite(token: string) {
    return this.request<void>('/orgs/accept-invite', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  
  async getProjects(orgId: string) {
    return this.request<Project[]>(`/orgs/${orgId}/projects`);
  }

  async getProject(orgId: string, projectId: string) {
    return this.request<Project>(`/orgs/${orgId}/projects/${projectId}`);
  }

  async createProject(orgId: string, name: string) {
    return this.request<Project>(`/orgs/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteProject(orgId: string, projectId: string) {
    return this.request<void>(`/orgs/${orgId}/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  
  async getApiKeysStatus(projectId: string) {
    return this.request<ApiKeyStatus>(`/llm/projects/${projectId}/api-keys`);
  }

  async updateApiKeys(projectId: string, keys: { openai?: string; anthropic?: string; google?: string }) {
    return this.request<void>(`/llm/projects/${projectId}/api-keys`, {
      method: 'PUT',
      body: JSON.stringify(keys),
    });
  }

  async deleteApiKey(projectId: string, provider: string) {
    return this.request<void>(`/llm/projects/${projectId}/api-keys/${provider}`, {
      method: 'DELETE',
    });
  }

  
  async getModels() {
    return this.request<string[]>('/llm/models');
  }

  async chatCompletion(request: ChatRequest) {
    return this.request<{ message: ChatMessage }>('/llm/chat/completions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async streamChatCompletion(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void
  ) {
    const response = await fetch(`${API_BASE_URL}/llm/chat/completions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new Error('Stream failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
    onDone();
  }

  
  async uploadDataset(
    file: File, 
    projectId: string, 
    name: string, 
    inputColumn: string,
    targetColumn: string,
    description?: string
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('name', name);
    formData.append('inputColumn', inputColumn);
    formData.append('targetColumn', targetColumn);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getDatasetsByProject(projectId: string) {
    return this.request<any[]>(`/datasets/project/${projectId}`);
  }

  async getDatasetRows(datasetId: string) {
    return this.request<any[]>(`/datasets/${datasetId}/rows`);
  }

  async updateDatasetRows(datasetId: string, rows: any[]) {
    return this.request<void>(`/datasets/${datasetId}/rows`, {
      method: 'POST',
      body: JSON.stringify(rows),
    });
  }

  async generateDatasetOutputs(datasetId: string, modelName: string, systemPrompt?: string, modelConfig?: any) {
    return this.request<void>(`/datasets/${datasetId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ modelName, systemPrompt, modelConfig }),
    });
  }

  async generateSingleRowOutput(datasetId: string, rowIndex: number, modelName: string, systemPrompt?: string, modelConfig?: any) {
    return this.request<void>(`/datasets/${datasetId}/generate-row/${rowIndex}`, {
      method: 'POST',
      body: JSON.stringify({ modelName, systemPrompt, modelConfig }),
    });
  }

  async evaluateSingleRow(datasetId: string, rowIndex: number, judgeModel: string, ruleIds: string[]) {
    return this.request<void>(`/datasets/${datasetId}/evaluate-row/${rowIndex}`, {
      method: 'POST',
      body: JSON.stringify({ judgeModel, ruleIds }),
    });
  }

  async deleteDataset(datasetId: string) {
    return this.request<void>(`/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }

  
  async getEvaluationJobsByProject(projectId: string) {
    return this.request<any[]>(`/evaluation-jobs/project/${projectId}`);
  }

  async createEvaluationJob(data: {
    name: string;
    projectId: string;
    datasetId: string;
    modelName: string;
    metrics: Array<{ ruleId: string; weight: number }>;
    description?: string;
    systemPrompt?: string;
  }) {
    return this.request<any>('/evaluation-jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvaluationJobResults(jobId: string) {
    return this.request<any[]>(`/evaluation-jobs/${jobId}/results`);
  }

  
  async getGlobalEvaluationRules() {
    return this.request<any[]>('/evaluation-rules/global');
  }

  async getRulesByProject(projectId: string) {
    return this.request<any[]>(`/evaluation-rules/project/${projectId}`);
  }

  async createEvaluationRule(data: any) {
    return this.request<any>('/evaluation-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteEvaluationRule(ruleId: string) {
    return this.request<void>(`/evaluation-rules/${ruleId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
