import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Sparkles,
} from 'lucide-react';

const PRIMARY = '#4D456E';

const stats = [
  { label: 'Total Evaluations', value: '12,456', change: '+12%', positive: true, icon: BarChart3 },
  { label: 'Avg Pass Rate', value: '82.4%', change: '+3.2%', positive: true, icon: TrendingUp },
  { label: 'Avg Latency', value: '720ms', change: '-8%', positive: true, icon: Clock },
  { label: 'Fluency Score', value: '0.85', change: '+0.05', positive: true, icon: Target },
];

const projectStats = [
  { name: 'Chatbot Evaluation', evaluations: 4521, passRate: 80, trend: 'up' },
  { name: 'Content Generator', evaluations: 3256, passRate: 92, trend: 'up' },
  { name: 'Code Assistant', evaluations: 2890, passRate: 75, trend: 'down' },
  { name: 'Translation Model', evaluations: 1789, passRate: 88, trend: 'up' },
];

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        {/* glow blobs */}
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
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #6B5FC5 100%)`,
                }}
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: isDark ? '#fff' : '#1f1b2e' }}
              >
                Analytics
              </h1>
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>

            <p
              className="text-sm mt-2 max-w-2xl"
              style={{
                color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
              }}
            >
              Track evaluation performance, pass rates and latency trends for all your AI workflows.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Select defaultValue="7d">
              <SelectTrigger
                className={cn(
                  'w-full sm:w-[180px] rounded-2xl',
                  isDark && 'bg-white/5 border-white/10 text-white'
                )}
              >
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <button
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold border transition hover:scale-[1.01]',
                isDark
                  ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  : 'border-black/10 bg-white text-[#1f1b2e] hover:bg-muted'
              )}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={cn(
              'rounded-3xl border p-0 overflow-hidden transition hover:shadow-xl animate-slide-up',
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              background: isDark
                ? 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))'
                : 'linear-gradient(180deg, #ffffff, #f6f4ff)',
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(77,69,110,0.28), rgba(107,95,197,0.20))'
                      : 'linear-gradient(135deg, rgba(77,69,110,0.16), rgba(107,95,197,0.18))',
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.10)'
                      : '1px solid rgba(77,69,110,0.12)',
                  }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: PRIMARY }} />
                </div>

                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-semibold',
                    stat.positive ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {stat.positive ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>

              <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-foreground')}>
                {stat.value}
              </p>
              <p className={cn('text-sm', isDark ? 'text-white/60' : 'text-muted-foreground')}>
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHART PLACEHOLDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Rate */}
        <Card
          className={cn(
            'rounded-3xl border overflow-hidden',
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
          )}
        >
          <CardHeader>
            <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-foreground')}>
              Pass Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'h-64 flex items-center justify-center rounded-2xl border',
                isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30 border-black/5'
              )}
            >
              <div className="text-center">
                <TrendingUp className={cn('w-12 h-12 mx-auto mb-2', isDark ? 'text-white/50' : 'text-muted-foreground')} />
                <p className={cn('text-sm', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                  Chart visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latency */}
        <Card
          className={cn(
            'rounded-3xl border overflow-hidden',
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
          )}
        >
          <CardHeader>
            <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-foreground')}>
              Latency Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'h-64 flex items-center justify-center rounded-2xl border',
                isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30 border-black/5'
              )}
            >
              <div className="text-center">
                <BarChart3 className={cn('w-12 h-12 mx-auto mb-2', isDark ? 'text-white/50' : 'text-muted-foreground')} />
                <p className={cn('text-sm', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                  Chart visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROJECT BREAKDOWN */}
      <Card
        className={cn(
          'rounded-3xl border overflow-hidden',
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
        )}
      >
        <CardHeader>
          <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-foreground')}>
            Project Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {projectStats.map((project, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-4 rounded-2xl border transition hover:shadow-md animate-slide-up',
                  isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-muted/30 border-black/5 hover:bg-muted/50'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(77,69,110,0.28), rgba(107,95,197,0.20))'
                        : 'linear-gradient(135deg, rgba(77,69,110,0.16), rgba(107,95,197,0.18))',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.10)'
                        : '1px solid rgba(77,69,110,0.12)',
                    }}
                  >
                    <Target className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>

                  <div>
                    <h4 className={cn('font-semibold', isDark ? 'text-white' : 'text-foreground')}>
                      {project.name}
                    </h4>
                    <p className={cn('text-sm', isDark ? 'text-white/60' : 'text-muted-foreground')}>
                      {project.evaluations.toLocaleString()} evaluations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={cn('font-bold', isDark ? 'text-white' : 'text-foreground')}>
                      {project.passRate}%
                    </p>
                    <p className={cn('text-xs', isDark ? 'text-white/55' : 'text-muted-foreground')}>
                      Pass Rate
                    </p>
                  </div>

                  <div className={cn('flex items-center gap-1 font-semibold', project.trend === 'up' ? 'text-emerald-500' : 'text-red-500')}>
                    {project.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
