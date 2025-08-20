import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, signup, loginWithGoogle, isLoading, getReturnUrl, clearReturnUrl } = useAuth();
  const { showToast } = useToast();
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Email verification state
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationData, setVerificationData] = useState({ userId: '', code: '' });
  const [verificationCode, setVerificationCode] = useState('');
  
  // Check if we should open signup tab (from checkout page)
  const [defaultTab, setDefaultTab] = useState<'login' | 'signup'>('login');
  
  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'signup') {
      setDefaultTab('signup');
    }
  }, []);
  
  // Listen for custom event to open signup tab (from checkout page)
  useEffect(() => {
    const handleOpenSignupTab = () => {
      setDefaultTab('signup');
    };
    
    window.addEventListener('openSignupTab', handleOpenSignupTab);
    
    return () => {
      window.removeEventListener('openSignupTab', handleOpenSignupTab);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        showToast('Welcome back!', 'success');
        
        // Check if there's a return URL
        const returnUrl = getReturnUrl();
        if (returnUrl) {
          clearReturnUrl();
          onNavigate(returnUrl);
        } else {
          onNavigate('home');
        }
      } else {
        showToast('Invalid email or password', 'error');
      }
    } catch (error) {
      showToast('Login failed. Please try again.', 'error');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (signupForm.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.requiresVerification) {
          showToast('Account created! Please check your email for verification code.', 'success');
          // Store verification data and switch to verification mode
          setVerificationData({ userId: data.userId, code: '' });
          setVerificationMode(true);
        } else {
          showToast('Account created successfully! Welcome aboard!', 'success');
          // Check if there's a return URL
          const returnUrl = getReturnUrl();
          if (returnUrl) {
            clearReturnUrl();
            onNavigate(returnUrl);
          } else {
            onNavigate('home');
          }
        }
      } else {
        showToast(data.message || 'Signup failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Signup failed. Please try again.', 'error');
    }
  };

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      showToast('Please enter the verification code', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth?action=verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: verificationData.userId,
          code: verificationCode
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast('Email verified successfully! You can now login.', 'success');
        setVerificationMode(false);
        setVerificationCode('');
        // Switch to login tab
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        if (loginTab) loginTab.click();
      } else {
        showToast(data.message || 'Verification failed', 'error');
      }
    } catch (error) {
      showToast('Verification failed. Please try again.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Get return URL before redirecting
      const returnUrl = getReturnUrl();
      
      // Redirect to Google OAuth with return URL in state
      const proto = window.location.protocol.replace(':','');
      const host = window.location.host;
      const origin = `${proto}://${host}`;
      
      if (returnUrl) {
        window.location.href = `${origin}/api/auth?action=google.start&returnUrl=${encodeURIComponent(returnUrl)}`;
      } else {
        window.location.href = `${origin}/api/auth?action=google.start`;
      }
    } catch (error) {
      showToast('Google login failed. Please try again.', 'error');
    }
  };

  // If in verification mode, show verification form
  if (verificationMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setVerificationMode(false)}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign Up
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Verify Your Email</CardTitle>
              <p className="text-muted-foreground">Enter the 6-digit code sent to your email</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Didn't receive the code? Check your spam folder.</p>
                  <p>The code expires in 10 minutes.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to Himgiri Naturals</CardTitle>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupName"
                        type="text"
                        placeholder="Enter your name"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}