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
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const ordersStorageBase = 'himgiri_orders'
  const ordersStorageKey = `${ordersStorageBase}_${user ? user.id : 'guest'}`

  useEffect(() => {
    // Handle Google finish redirect payload
    if (window.location.hash.startsWith('#login-success=')) {
      try {
        const payload = decodeURIComponent(window.location.hash.replace('#login-success=',''))
        const data = JSON.parse(payload)
        if (data?.email) {
          const mockUser: User = {
            id: 'google_' + Math.random().toString(36).substring(7),
            name: String(data.name || data.email.split('@')[0]),
            email: String(data.email),
            avatar: String(data.avatar || ''),
            provider: 'google'
          }
          setUser(mockUser)
          localStorage.setItem('himgiri_user', JSON.stringify(mockUser))
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('himgiri_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Load orders whenever the active user changes
  useEffect(() => {
    const storedOrders = localStorage.getItem(ordersStorageKey)
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders))
      } catch {
        setOrders([])
      }
    } else {
      setOrders([])
    }
  }, [ordersStorageKey])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!resp.ok) return false
      const data = await resp.json()
      const logged: User = { id: String(data.user.id), name: data.user.name || email.split('@')[0], email, provider: 'email' }
      setUser(logged)
      localStorage.setItem('himgiri_user', JSON.stringify(logged))
      return true
    } finally {
      setIsLoading(false)
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
      if (!resp.ok) return false
      return await login(email, password)
    } finally {
      setIsLoading(false)
    }
  };

  const startGoogleLogin = () => {
    const proto = window.location.protocol.replace(':','');
    const host = window.location.host;
    const origin = `${proto}://${host}`;
    window.location.href = `${origin}/api/auth/google/start`;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    startGoogleLogin();
    return true;
  };

  const sendOtp = async (email: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/auth/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      return resp.ok;
    } catch {
      return false;
    }
  };

  const loginWithOtp = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/otp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code })
      });
      if (!resp.ok) return false;
      const mockUser: User = { id: 'otp_' + Math.random().toString(36).substring(7), name: email.split('@')[0], email, provider: 'email' };
      setUser(mockUser);
      localStorage.setItem('himgiri_user', JSON.stringify(mockUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    fetch('/api/auth/logout').catch(() => {})
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
    localStorage.setItem(ordersStorageKey, JSON.stringify(updatedOrders));
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
      addOrder
    }}>
      {children}
    </AuthContext.Provider>
  );
}