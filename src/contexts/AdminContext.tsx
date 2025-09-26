import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  restaurant_id: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  restaurant: Restaurant | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('admin-auth');
    if (storedAuth) {
      try {
        const { admin, restaurant, token } = JSON.parse(storedAuth);
        setAdmin(admin);
        setRestaurant(restaurant);
        setToken(token);
      } catch (error) {
        localStorage.removeItem('admin-auth');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://pxhabmwihhxwznmuvgrb.supabase.co/functions/v1/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no login');
      }

      const data = await response.json();
      
      setAdmin(data.admin);
      setRestaurant(data.restaurant);
      setToken(data.token);

      // Store auth data
      localStorage.setItem('admin-auth', JSON.stringify({
        admin: data.admin,
        restaurant: data.restaurant,
        token: data.token
      }));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setRestaurant(null);
    setToken(null);
    localStorage.removeItem('admin-auth');
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        restaurant,
        token,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}