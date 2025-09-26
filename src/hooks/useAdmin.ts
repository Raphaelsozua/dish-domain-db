import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '@/contexts/AdminContext';

const API_BASE = 'https://pxhabmwihhxwznmuvgrb.supabase.co/functions/v1';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  is_active: boolean;
  order_position?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  is_active: boolean;
  is_promotion: boolean;
  rating_average?: number;
  total_reviews?: number;
  category_id: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  background_image?: string;
  primary_color?: string;
  rating_average?: number;
  total_reviews?: number;
  social_instagram?: string;
  social_facebook?: string;
  social_whatsapp?: string;
}

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit, token: string) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Request failed:', response.status, response.statusText);
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response might not be JSON
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

// Restaurant Info
export const useRestaurantInfo = () => {
  const { token } = useAdmin();
  
  return useQuery({
    queryKey: ['admin-restaurant'],
    queryFn: () => makeAuthenticatedRequest(`${API_BASE}/admin-restaurant/info`, { method: 'GET' }, token!),
    enabled: !!token,
  });
};

export const useUpdateRestaurantInfo = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<RestaurantInfo>) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-restaurant/info`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant'] });
    },
  });
};

export const useUpdateRestaurantTheme = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (primary_color: string) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-restaurant/theme`, {
        method: 'PUT',
        body: JSON.stringify({ primary_color }),
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant'] });
      queryClient.invalidateQueries({ queryKey: ['public-restaurant'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

// Categories
export const useCategories = () => {
  const { token } = useAdmin();
  
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => makeAuthenticatedRequest(`${API_BASE}/admin-categories`, { method: 'GET' }, token!),
    enabled: !!token,
  });
};

export const useCreateCategory = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; icon?: string }) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-categories`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

export const useUpdateCategory = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

export const useDeleteCategory = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-categories/${id}`, {
        method: 'DELETE',
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

// Products
export const useProducts = () => {
  const { token } = useAdmin();
  
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: () => makeAuthenticatedRequest(`${API_BASE}/admin-products`, { method: 'GET' }, token!),
    enabled: !!token,
  });
};

export const useCreateProduct = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      price: number;
      original_price?: number;
      category_id: string;
      image_url?: string;
    }) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-products`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

export const useToggleProductPromotion = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-products/${id}/toggle-promotion`, {
        method: 'PUT',
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const { token } = useAdmin();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      makeAuthenticatedRequest(`${API_BASE}/admin-products/${id}`, {
        method: 'DELETE',
      }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
};