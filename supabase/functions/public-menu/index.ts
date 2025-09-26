import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getRestaurantBySlug(slug: string, supabase: any) {
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching restaurant:', error);
    throw new Error('Database error');
  }

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  return restaurant;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    
    // Extract restaurant slug from path: /public/:restaurant_slug/...
    if (pathParts.length < 2 || pathParts[0] !== 'public') {
      return new Response(
        JSON.stringify({ error: 'Invalid path format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const restaurantSlug = pathParts[1];
    const action = pathParts[2];
    const resourceId = pathParts[4]; // For category/:category_id

    const restaurant = await getRestaurantBySlug(restaurantSlug, supabase);

    // GET /public/:restaurant_slug/info
    if (req.method === 'GET' && action === 'info') {
      return new Response(
        JSON.stringify(restaurant),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /public/:restaurant_slug/categories
    if (req.method === 'GET' && action === 'categories') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('order_position');

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch categories' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(categories),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /public/:restaurant_slug/products
    if (req.method === 'GET' && action === 'products' && !pathParts[3]) {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch products' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(products),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /public/:restaurant_slug/products/category/:category_id
    if (req.method === 'GET' && action === 'products' && pathParts[3] === 'category' && resourceId) {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .eq('category_id', resourceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch products by category' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(products),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /public/:restaurant_slug/reviews
    if (req.method === 'POST' && action === 'reviews') {
      const reviewData = await req.json();

      if (!reviewData.customer_name || !reviewData.rating) {
        return new Response(
          JSON.stringify({ error: 'Customer name and rating are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return new Response(
          JSON.stringify({ error: 'Rating must be between 1 and 5' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate product_id if provided
      if (reviewData.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('id', reviewData.product_id)
          .eq('restaurant_id', restaurant.id)
          .single();

        if (!product) {
          return new Response(
            JSON.stringify({ error: 'Product not found for this restaurant' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          restaurant_id: restaurant.id,
          product_id: reviewData.product_id || null,
          customer_name: reviewData.customer_name,
          rating: reviewData.rating,
          comment: reviewData.comment || null
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create review' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(review),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /public/:restaurant_slug/reviews
    if (req.method === 'GET' && action === 'reviews') {
      const productId = url.searchParams.get('product_id');
      
      let query = supabase
        .from('reviews')
        .select(`
          *,
          products (
            name
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data: reviews, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch reviews' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(reviews),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Public menu error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage === 'Restaurant not found' ? 404 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});