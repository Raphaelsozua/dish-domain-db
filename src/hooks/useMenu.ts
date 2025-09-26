import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Restaurant {
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

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
  product_id?: string;
}

const API_BASE = 'https://pxhabmwihhxwznmuvgrb.supabase.co/functions/v1';

export const useRestaurantInfo = (slug: string) => {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/public-menu/public/${slug}/info`);
      if (!response.ok) throw new Error('Failed to fetch restaurant info');
      return response.json() as Promise<Restaurant>;
    },
    enabled: !!slug,
  });
};

export const useCategories = (slug: string) => {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/public-menu/public/${slug}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json() as Promise<Category[]>;
    },
    enabled: !!slug,
  });
};

export const useProducts = (slug: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['products', slug, categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `${API_BASE}/public-menu/public/${slug}/products/category/${categoryId}`
        : `${API_BASE}/public-menu/public/${slug}/products`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Product[]>;
    },
    enabled: !!slug,
  });
};

export const useReviews = (slug: string, productId?: string) => {
  return useQuery({
    queryKey: ['reviews', slug, productId],
    queryFn: async () => {
      const url = productId 
        ? `${API_BASE}/public-menu/public/${slug}/reviews?product_id=${productId}`
        : `${API_BASE}/public-menu/public/${slug}/reviews`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json() as Promise<Review[]>;
    },
    enabled: !!slug,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ slug, review }: {
      slug: string;
      review: {
        customer_name: string;
        rating: number;
        comment?: string;
        product_id?: string;
      }
    }) => {
      const response = await fetch(`${API_BASE}/public-menu/public/${slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });
      
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: (_, { slug }) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', slug] });
    },
  });
};