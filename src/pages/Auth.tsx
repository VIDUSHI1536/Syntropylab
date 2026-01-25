import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Moon, Sun } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🌙 theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    checkbox: true,
  });

  const { login, googleLogin, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard/projects';

  // ✅ load theme
  useEffect(() => {
    const saved = localStorage.getItem('syntropy-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  // ✅ store theme
  useEffect(() => {
    localStorage.setItem('syntropy-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((p) => (p === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password, formData.checkbox);
      } else {
        await register(formData);
      }
      navigate(from, { replace: true });
      toast({
        title: isLogin ? 'Welcome back!' : 'Account created!',
        description: isLogin ? 'You have been logged in.' : 'Your account has been created.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate(from, { replace: true });
        toast({
          title: 'Signed in with Google',
          description: 'Welcome to Syntropylabs!',
        });
      }
    } catch (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: 'Could not authenticate with Google.',
        variant: 'destructive',
      });
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 transition-colors duration-500"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f0d18 0%, #141124 35%, #0b0a12 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f6f4ff 40%, #ffffff 100%)',
      }}
    >
      {/* LEFT PANEL */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(77,69,110,0.30) 0%, rgba(20,17,36,1) 55%, rgba(15,13,24,1) 100%)'
            : 'linear-gradient(135deg, #F6F4FF 0%, #EDE9FF 40%, #E7E3FF 100%)',
        }}
      >
        {/* glow */}
        <div
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 30% 30%, rgba(107,95,197,0.35), transparent 70%)'
              : 'radial-gradient(circle at 30% 30%, rgba(77,69,110,0.25), transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#4D456E' }}
          >
            Syntropylabs
          </h2>

          <p
            className="mt-6 text-4xl font-medium leading-tight"
            style={{ color: isDark ? '#ffffff' : '#4D456E' }}
          >
            Unlock your <br />
            Project <span className="font-extrabold">performance</span>
          </p>
        </div>

        {/* illustration */}
        <div className="flex items-center justify-center w-full relative z-10">
          <div className="relative w-[92%] max-w-xl">
            <img
              src="/images/authImage2.png"
              alt="Auth Illustration"
              className="relative w-full drop-shadow-2xl select-none"
              draggable={false}
            />
          </div>
        </div>

        <p
          className="relative z-10 text-sm"
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(77,69,110,0.7)' }}
        >
          Build better systems with Syntropylabs.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative flex items-center justify-center p-6">
        {/* theme toggle button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm transition hover:scale-[1.02]"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
            color: isDark ? '#fff' : '#111',
          }}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-xs font-medium">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* background blob */}
        <div
          className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 -z-0"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 30% 30%, rgba(107,95,197,0.25), transparent 65%)'
              : 'radial-gradient(circle at 30% 30%, rgba(77,69,110,0.18), transparent 65%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-semibold"
              style={{ color: isDark ? '#fff' : '#1f1b2e' }}
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)' }}
            >
              Sign in to your account to start using{' '}
              <span className="font-medium" style={{ color: '#4D456E' }}>
                Syntropylabs
              </span>
            </p>
          </div>

          {/* card */}
          <div
            className="rounded-2xl border shadow-[0px_12px_35px_rgba(0,0,0,0.06)] p-8 transition-colors duration-500"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Google login */}
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast({
                    title: 'Google Sign-In Failed',
                    description: 'Something went wrong.',
                    variant: 'destructive',
                  });
                }}
                theme="outline"
                size="large"
                width="100%"
              />
            </div>

            {/* divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }}
                />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="px-2"
                  style={{
                    background: isDark ? 'transparent' : '#fff',
                    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
                  }}
                >
                  or
                </span>
              </div>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required={!isLogin}
                  />
                  <Input
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#1f1b2e' }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#1f1b2e' }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              {/* remember */}
              {isLogin && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.checkbox}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, checkbox: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm"
                      style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#222' }}
                    >
                      Keep Me Signed In
                    </Label>
                  </div>

                  <button
                    type="button"
                    className="text-sm hover:underline"
                    style={{ color: '#4D456E' }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-lg py-2.5 font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #4D456E 0%, #6B5FC5 50%, #4D456E 100%)'
                    : 'linear-gradient(135deg, #4D456E 0%, #6B5FC5 100%)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Please wait...
                  </span>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Switch */}
              <p
                className="mt-6 text-center text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)' }}
              >
                {isLogin ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="hover:underline font-semibold"
                  style={{ color: '#4D456E' }}
                >
                  {isLogin ? 'SIGN UP' : 'SIGN IN'}
                </button>
              </p>
            </form>

            <p
              className="mt-6 text-xs text-center"
              style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
            >
              Copyright 2026, Syntropylabs All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
