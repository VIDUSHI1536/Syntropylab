import { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation, useMatch } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';


import {
  Plus,
  FolderKanban,
  Building2,
  Database,
  FlaskConical,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  PanelLeft,
  Moon,
  Sun,
  X,
  ExternalLink,
  FileText,
  Mic,
  Image as ImageIcon,
  Video,

} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const navItems = [
  { to: '/dashboard/benchmark', icon: BarChart3, label: 'Benchmark' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Project' },
  { to: '/dashboard/datasets', icon: Database, label: 'Datasets' },
  { to: '/dashboard/evaluators', icon: FlaskConical, label: 'Evaluator Gallery' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
];

const PRIMARY = '#5f3b96';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Responsive mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);


  // THEME (GLOBAL)
  const { isDark, toggleTheme } = useTheme();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  const playgroundMatch = useMatch("/dashboard/projects/:projectId/playground");
  const projectMatch = useMatch("/dashboard/projects/:projectId");
  const audioMatch = useMatch("/dashboard/projectaudioplay");
  const benchmarkMatch = useMatch("/dashboard/benchmark");
  const videoMatch = useMatch("/dashboard/projectvideo");
  const imagePlaygroundMatch = useMatch("/dashboard/projectimageplayground");
  const noPadding =
    playgroundMatch ||
    projectMatch ||
    audioMatch ||
    benchmarkMatch ||
    videoMatch ||
    imagePlaygroundMatch;
  // Sidebar component reused in desktop & mobile
  const Sidebar = ({ variant }: { variant: 'desktop' | 'mobile' }) => (
    <aside
      className={cn(
        'h-screen flex flex-col border-r transition-all duration-300',
        variant === 'desktop' ? 'fixed left-0 top-0 z-40' : 'w-[280px]',
        sidebarCollapsed && variant === 'desktop' ? 'w-[76px]' : 'w-[280px]'
      )}
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
        background: isDark
          ? `linear-gradient(180deg, ${PRIMARY} 0%, #131123 60%, #0E0B18 100%)`
          : `linear-gradient(180deg, ${PRIMARY} 0%, #2D2A3D 100%)`,
      }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center justify-between px-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.10)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <PanelLeft className="w-5 h-5 text-white" />
          </div>

          {/* Logo Text */}
          {(!sidebarCollapsed || variant === 'mobile') && (
            <div className="leading-tight">
              <p className="text-white font-semibold text-base font-sans">
                Syntropylabs
              </p>

              <p className="text-[12px] text-white/60">Workspace</p>
            </div>
          )}
        </div>

        {/* Close button only in mobile */}
        {variant === 'mobile' ? (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-9 w-9 rounded-xl flex items-center justify-center transition hover:opacity-90"
            style={{
              background: !sidebarCollapsed && 'rgba(255,255,255,0.10)',
              border: !sidebarCollapsed && '1px solid rgba(255,255,255,0.16)',
            }}
          >
            <ChevronLeft
              className={cn(
                'w-4 h-4 text-white transition-transform',
                sidebarCollapsed && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {/* NAV */}
      <nav
        className={cn(
          'flex-1 mt-6 px-3 space-y-1',
          sidebarCollapsed && variant === 'desktop' && 'px-2'
        )}
      >
        {navItems.map((item) => {
          const isProjects = item.to === "/dashboard/projects";
          const isActive =
            item.to === "/dashboard/projects"
              ? location.pathname.startsWith("/dashboard/projects")
              : location.pathname.startsWith(item.to);


          if (isProjects) {
            return (
              <div key="projects" className="space-y-1">
                {/* PROJECTS BUTTON */}
                <button
                  onClick={() => setProjectsOpen((p) => !p)}
                  className={cn(
                    "relative w-full flex items-center justify-between  gap-3 px-4 py-3 rounded-2xl text-sm transition-all",
                    sidebarCollapsed && variant === "desktop" && "justify-center px-0",
                    isActive ? "text-white" : "text-white/75 hover:text-white"
                  )}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10))"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.16)"
                      : "1px solid transparent",
                  }}
                >
                  <div className='flex items-center gap-3'>
                    <FolderKanban className="w-5 h-5" />
                    {(!sidebarCollapsed || variant === "mobile") &&
                      <span className="flex-1 font-medium">Projects</span>}
                  </div>
                  {(!sidebarCollapsed || variant === "mobile") && (
                    <>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          projectsOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>

                {/* PROJECT CATEGORIES */}
                <div
                  className={cn(
                    "overflow-hidden  transition-all duration-300 ease-out",
                    projectsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="mt-1 ml-3 space-y-1 ">
                    <ProjectItem
                      to="/dashboard/projects"
                      icon={FileText}
                      label="Text"

                      sidebarCollapsed={sidebarCollapsed}
                      variant={variant}
                    />
                    <ProjectItem
                      to="/dashboard/projectaudioplay"
                      icon={Mic}
                      label="Audio"
                      sidebarCollapsed={sidebarCollapsed}
                      variant={variant}
                    />
                    <ProjectItem
                      to="/dashboard/projectimageplayground"
                      icon={ImageIcon}
                      label="Image"
                      sidebarCollapsed={sidebarCollapsed}
                      variant={variant}
                    />
                    <ProjectItem
                      to="/dashboard/projectvideo"
                      icon={Video}
                      label="Video"
                      sidebarCollapsed={sidebarCollapsed}
                      variant={variant}
                    />
                  </div>
                </div>
              </div>
            );
          }

          /* DEFAULT NAV ITEMS */
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all",
                sidebarCollapsed && variant === "desktop" && "justify-center px-0",
                isActive ? "text-white" : "text-white/75 hover:text-white"
              )}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.16)"
                  : "1px solid transparent",
              }}
            >
              <item.icon className="w-5 h-5" />
              {(!sidebarCollapsed || variant === "mobile") && (
                <span className="font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom */}
      <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
        <NavLink
          to="/dashboard/documentation"
          onClick={() => setMobileSidebarOpen(false)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all hover:bg-white/10',
            sidebarCollapsed && variant === 'desktop' && 'justify-center px-0'
          )}
        >
          <ExternalLink className="w-5 h-5 text-white/80" />
          {(!sidebarCollapsed || variant === 'mobile') && (
            <span className="text-white/80">Documentation</span>
          )}
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          onClick={() => setMobileSidebarOpen(false)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all hover:bg-white/10',
            sidebarCollapsed && variant === 'desktop' && 'justify-center px-0'
          )}
        >
          <Settings className="w-5 h-5 text-white/80" />
          {(!sidebarCollapsed || variant === 'mobile') && (
            <span className="text-white/80">Settings</span>
          )}
        </NavLink>

        {/* user dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:bg-white/10',
              sidebarCollapsed && variant === 'desktop' && 'justify-center px-0'
            )}
          >
            <div className="relative">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#6B5FC5] to-[#4D456E]"
              >
                <User className="w-5 h-5 text-white" />
              </div>
            </div>




            {(!sidebarCollapsed || variant === 'mobile') && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-semibold text-white truncate cursor-default">
                          {user?.email || 'user@example.com'}
                        </p>
                      </TooltipTrigger>

                      <TooltipContent
                        side="top"
                        className="bg-black/80 text-white text-xs px-3 py-1 rounded-md"
                      >
                        {user?.email || 'user@example.com'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <p className="text-xs text-white/60">Account</p>
                </div>


                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-white/70 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {userMenuOpen && (
            <div
              className={cn(
                'absolute bottom-full mb-2 overflow-hidden rounded-2xl shadow-xl',
                sidebarCollapsed && variant === 'desktop'
                  ? 'left-full ml-2 w-56'
                  : 'left-0 right-0'
              )}
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(16px)',
              }}
            >

              <button
                onClick={() => navigate("/dashboard/organizations")}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/85 hover:bg-white/10 transition"
              >
                <Building2 className="w-4 h-4" />
                Organizations
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/85 hover:bg-white/10 transition">
                <HelpCircle className="w-4 h-4" />
                Help
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-200 hover:bg-white/10 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (

    <div
      className="min-h-screen flex transition-colors duration-500"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #2a1b40 0%, #141124 35%, #0b0a12 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f6f4ff 40%, #ffffff 100%)',
      }}
    >
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar variant="desktop" />
      </div>

      {/* MOBILE SIDEBAR (Drawer) */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* drawer */}
          <div className="relative z-50">
            <Sidebar variant="mobile" />
          </div>
        </div>
      )}

      {/* MAIN */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          'lg:ml-[280px]',
          sidebarCollapsed && 'lg:ml-[76px]'
        )}
      >
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b backdrop-blur-xl"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
            background: isDark ? 'rgba(20,17,36,0.75)' : 'rgba(255,255,255,0.75)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <PanelLeft className={cn('w-5 h-5', isDark ? 'text-white' : 'text-black')} />
            </button>

            <p
              className={cn(
                'text-lg font-semibold font-sans',
                isDark ? 'text-white' : 'text-[#1f1b2e]'
              )}
            >
              Dashboard
            </p>

          </div>

          {/* ✅ Theme toggle (GLOBAL) */}
          <button
            onClick={toggleTheme}
            className="h-10 px-4 rounded-full flex items-center gap-2 border transition hover:scale-[1.02]"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              color: isDark ? '#fff' : '#111',
            }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-xs font-semibold">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* outlet content */}
        <div className={cn(!noPadding && "p-4 sm:p-6")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
function ProjectItem({
  to,
  icon: Icon,
  label,
  sidebarCollapsed,
  variant,
}: {
  to: string;
  icon: any;
  label: string;
  sidebarCollapsed: boolean;
  variant: "desktop" | "mobile";
}) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all",
        sidebarCollapsed && variant === "desktop" && "justify-center px-0",
        isActive
          ? "text-white"
          : "text-white/60 hover:text-white"
      )}
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))"
          : "transparent",
      }}
    >
      <Icon className="w-4 h-4" />

      {(!sidebarCollapsed || variant === "mobile") && (
        <span>{label}</span>
      )}
    </NavLink>
  );
}
