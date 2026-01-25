import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api, ChatMessage } from '@/lib/api';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Settings2, 
  ChevronLeft,
  Loader2,
  StopCircle
} from 'lucide-react';

export default function Playground() {
  const { projectId } = useParams();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  
  
  const [model, setModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [stream, setStream] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await api.getModels();
        setAvailableModels(models);
        if (models.length > 0) setModel(models[0]);
      } catch (error) {
        console.error('Failed to fetch models', error);
        setAvailableModels(['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus']);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !model || !projectId) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    
    let requestMessages = [...newMessages];
    if (systemPrompt && !requestMessages.some(m => m.role === 'system')) {
      requestMessages = [{ role: 'system', content: systemPrompt }, ...requestMessages];
    } else if (systemPrompt) {
        
        requestMessages = requestMessages.map(m => m.role === 'system' ? { ...m, content: systemPrompt } : m);
    }

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (stream) {
        setStreaming(true);
        const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMessage]);
        
        await api.streamChatCompletion(
          {
            projectId,
            model,
            messages: requestMessages,
            temperature,
            maxTokens,
          },
          (chunk) => {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last.role === 'assistant') {
                return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
              }
              return prev;
            });
          },
          () => {
            setLoading(false);
            setStreaming(false);
          }
        );
      } else {
        const response = await api.chatCompletion({
          projectId,
          model,
          messages: requestMessages,
          temperature,
          maxTokens,
        });
        
        setMessages(prev => [...prev, response.message]);
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response',
        variant: 'destructive',
      });
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/dashboard/projects/${projectId}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Playground</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {}
        <div className="w-80 border-r bg-muted/10 p-4 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-medium">
              <Settings2 className="w-4 h-4" />
              Model Settings
            </div>
            
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[100px] text-sm"
                placeholder="You are a helpful assistant..."
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-xs text-muted-foreground">{temperature}</span>
                </div>
                <Slider 
                  value={[temperature]} 
                  min={0} 
                  max={2} 
                  step={0.1} 
                  onValueChange={([v]) => setTemperature(v)} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Max Tokens</Label>
                  <span className="text-xs text-muted-foreground">{maxTokens}</span>
                </div>
                <Slider 
                  value={[maxTokens]} 
                  min={100} 
                  max={4000} 
                  step={100} 
                  onValueChange={([v]) => setMaxTokens(v)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Stream Response</Label>
                <Switch checked={stream} onCheckedChange={setStream} />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 flex flex-col bg-background">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-20">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Start a conversation with the model.</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div 
                    className={`rounded-lg p-4 max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && !streaming && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {}
          <div className="p-4 border-t bg-background">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[50px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                className="h-[50px] w-[50px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
