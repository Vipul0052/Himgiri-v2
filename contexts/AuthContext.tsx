import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  startGoogleLogin: () => void;
  loginWithOtp: (email: string, code: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<boolean>;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  setReturnUrl: (url: string) => void;
  getReturnUrl: () => string | null;
  clearReturnUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('himgiri_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/auth?action=login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password }) 
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      const logged: User = { 
        id: String(data.user.id), 
        name: data.user.name || email.split('@')[0], 
        email, 
        provider: 'email' 
      };
      setUser(logged);
      localStorage.setItem('himgiri_user', JSON.stringify(logged));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/auth?action=signup', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name, email, password }) 
      });
      
      if (!resp.ok) {
        const errorData = await resp.json();
        console.error('Signup error:', errorData);
        return false;
      }
      
      const data = await resp.json();
      console.log('Signup response:', data);
      
      // If verification is required, return true to show verification form
      if (data.requiresVerification) {
        return true;
      }
      
      // If no verification needed, proceed to login
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const startGoogleLogin = () => {
    const proto = window.location.protocol.replace(':','');
    const host = window.location.host;
    const origin = `${proto}://${host}`;
    window.location.href = `${origin}/api/auth?action=google.start`;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    startGoogleLogin();
    return true;
  };

  const sendOtp = async (email: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/auth?action=otp.send', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email })
      });
      return resp.ok;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  };

  const loginWithOtp = async (email: string, code: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/auth?action=otp.verify', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, code })
      });
      if (!resp.ok) return false;
      const mockUser: User = { 
        id: 'otp_' + Math.random().toString(36).substring(7), 
        name: email.split('@')[0], 
        email, 
        provider: 'email' 
      };
      setUser(mockUser);
      localStorage.setItem('himgiri_user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('himgiri_user');
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('himgiri_orders', JSON.stringify(updatedOrders));
  };

  // Return URL management
  const setReturnUrl = (url: string) => {
    localStorage.setItem('himgiri_return_url', url);
  };

  const getReturnUrl = (): string | null => {
    return localStorage.getItem('himgiri_return_url');
  };

  const clearReturnUrl = () => {
    localStorage.removeItem('himgiri_return_url');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      loginWithGoogle,
      startGoogleLogin,
      loginWithOtp,
      sendOtp,
      logout,
      orders,
      addOrder,
      setReturnUrl,
      getReturnUrl,
      clearReturnUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
}