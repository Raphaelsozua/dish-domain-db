import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const API_BASE = 'https://pxhabmwihhxwznmuvgrb.supabase.co/functions/v1';

// Real API hooks for public menu
export const useRestaurantInfo = () => {
  return useQuery({
    queryKey: ['public-restaurant', 'restaurante-teste'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('public-menu', {
        body: { 
          action: 'getRestaurant',
          slug: 'restaurante-teste' 
        }
      });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['public-categories', 'restaurante-teste'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('public-menu', {
        body: { 
          action: 'getCategories',
          slug: 'restaurante-teste' 
        }
      });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['public-products', 'restaurante-teste'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('public-menu', {
        body: { 
          action: 'getProducts',
          slug: 'restaurante-teste' 
        }
      });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useReviews = () => {
  return useQuery({
    queryKey: ['public-reviews', 'restaurante-teste'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('public-menu', {
        body: { 
          action: 'getReviews',
          slug: 'restaurante-teste' 
        }
      });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: any) => {
      const { data, error } = await supabase.functions.invoke('public-menu', {
        body: { 
          action: 'submitReview',
          slug: 'restaurante-teste',
          ...reviewData.review
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
    },
  });
};