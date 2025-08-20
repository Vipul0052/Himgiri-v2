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

  // Check for stored auth data on mount
  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('himgiri_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Load orders from database for this user
        loadUserOrders(userData.id);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for Google OAuth success event
  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      console.log('Checking Google OAuth authentication...');
      await checkServerAuth();
    };
    
    window.addEventListener('checkGoogleAuth', handleGoogleAuthSuccess);
    
    return () => {
      window.removeEventListener('checkGoogleAuth', handleGoogleAuthSuccess);
    };
  }, []);

  // Function to check authentication status from server
  const checkServerAuth = async () => {
    try {
      const resp = await fetch('/api/auth?action=check-auth', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      
      if (resp.ok) {
        const data = await resp.json();
        if (data.user) {
          const loggedInUser: User = {
            id: String(data.user.id),
            name: data.user.name || data.user.email.split('@')[0],
            email: data.user.email,
            provider: 'google'
          };
          setUser(loggedInUser);
          localStorage.setItem('himgiri_user', JSON.stringify(loggedInUser));
          // Load orders for the authenticated user
          await loadUserOrders(loggedInUser.id);
          console.log('User authenticated from server:', loggedInUser);
        }
      } else {
        console.log('No active session found');
      }
    } catch (error) {
      console.error('Failed to check server auth:', error);
    }
  };

  // Function to load user orders from database
  const loadUserOrders = async (userId: string) => {
    try {
      const resp = await fetch(`/api/app?action=user.orders&user_id=${userId}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.orders) {
          // Transform database orders to match local Order interface
          const transformedOrders = data.orders.map((dbOrder: any) => ({
            id: String(dbOrder.id),
            date: dbOrder.created_at,
            total: dbOrder.amount,
            status: dbOrder.status || 'pending',
            items: Array.isArray(dbOrder.items) ? dbOrder.items : []
          }));
          setOrders(transformedOrders);
          // Store in localStorage for offline access
          localStorage.setItem(`himgiri_orders_${userId}`, JSON.stringify(transformedOrders));
        }
      }
    } catch (error) {
      console.error('Failed to load user orders:', error);
      // Fallback to localStorage if database fails
      const storedOrders = localStorage.getItem(`himgiri_orders_${userId}`);
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch (e) {
          console.error('Failed to parse stored orders:', e);
        }
      }
    }
  };

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
      // Load orders for the logged-in user
      await loadUserOrders(logged.id);
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

  const addOrder = async (orderData: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    
    // Store in localStorage
    if (user) {
      localStorage.setItem(`himgiri_orders_${user.id}`, JSON.stringify(updatedOrders));
    }
    
    // Also save to database if user is logged in
    if (user) {
      try {
        const orderPayload = {
          user_id: user.id,
          email: user.email,
          name: user.name,
          amount: orderData.total,
          currency: 'INR',
          items: orderData.items,
          status: 'pending',
          payment_method: 'online',
          created_at: new Date().toISOString()
        };
        
        const resp = await fetch('/api/app?action=orders.create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        
        if (resp.ok) {
          console.log('Order saved to database successfully');
        } else {
          console.error('Failed to save order to database');
        }
      } catch (error) {
        console.error('Error saving order to database:', error);
      }
    }
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