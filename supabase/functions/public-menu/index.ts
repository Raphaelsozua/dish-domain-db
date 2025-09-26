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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pxhabmwihhxwznmuvgrb.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4aGFibXdpaGh4d3pubXV2Z3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTc3OTgsImV4cCI6MjA3NDM5Mzc5OH0.Vx5TS8IiPEOdW6VY19-ItsiuI9MmwkRjR5UgmdpxlBA';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle POST requests with body
    if (req.method === 'POST') {
      const body = await req.json();
      const { action, slug } = body;

      const restaurant = await getRestaurantBySlug(slug, supabase);

      // Get restaurant info
      if (action === 'getRestaurant') {
        return new Response(
          JSON.stringify(restaurant),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get categories
      if (action === 'getCategories') {
        const { data: categories, error } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .eq('is_active', true)
          .order('order_position');

        if (error) {
          console.error('Categories error:', error);
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

      // Get products
      if (action === 'getProducts') {
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
          console.error('Products error:', error);
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

      // Get reviews
      if (action === 'getReviews') {
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select(`
            *,
            products (
              name
            )
          `)
          .eq('restaurant_id', restaurant.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Reviews error:', error);
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

      // Submit review
      if (action === 'submitReview') {
        const { customer_name, rating, comment, product_id } = body;

        if (!customer_name || !rating) {
          return new Response(
            JSON.stringify({ error: 'Customer name and rating are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (rating < 1 || rating > 5) {
          return new Response(
            JSON.stringify({ error: 'Rating must be between 1 and 5' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate product_id if provided
        if (product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', product_id)
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
            product_id: product_id || null,
            customer_name,
            rating,
            comment: comment || null
          })
          .select()
          .single();

        if (error) {
          console.error('Review creation error:', error);
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
    }

    return new Response(
      JSON.stringify({ error: 'Action not found' }),
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