import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validateAdminAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token.startsWith('admin_')) {
    throw new Error('Invalid token format');
  }

  const adminId = token.split('_')[1];
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('id, restaurant_id')
    .eq('id', adminId)
    .single();

  if (error || !admin) {
    throw new Error('Invalid token');
  }

  return admin;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const admin = await validateAdminAuth(req, supabase);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const productId = pathParts[pathParts.length - 1];
    const action = pathParts[pathParts.length - 1];

    // GET /admin/products
    if (req.method === 'GET') {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('restaurant_id', admin.restaurant_id)
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

    // POST /admin/products
    if (req.method === 'POST') {
      const productData = await req.json();
      
      if (!productData.name || !productData.price || !productData.category_id) {
        return new Response(
          JSON.stringify({ error: 'Name, price, and category_id are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate category belongs to restaurant
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', productData.category_id)
        .eq('restaurant_id', admin.restaurant_id)
        .single();

      if (!category) {
        return new Response(
          JSON.stringify({ error: 'Invalid category for this restaurant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          restaurant_id: admin.restaurant_id,
          category_id: productData.category_id,
          name: productData.name,
          description: productData.description || null,
          price: productData.price,
          original_price: productData.original_price || null,
          image_url: productData.image_url || null,
          is_promotion: productData.is_promotion || false,
          is_active: productData.is_active !== false
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create product' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(product),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /admin/products/:id
    if (req.method === 'PUT' && productId && action !== 'toggle-promotion') {
      const updateData = await req.json();
      const { id, restaurant_id, created_at, updated_at, rating_average, total_reviews, ...allowedFields } = updateData;

      // Validate category if being updated
      if (allowedFields.category_id) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('id', allowedFields.category_id)
          .eq('restaurant_id', admin.restaurant_id)
          .single();

        if (!category) {
          return new Response(
            JSON.stringify({ error: 'Invalid category for this restaurant' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const { data: product, error } = await supabase
        .from('products')
        .update(allowedFields)
        .eq('id', productId)
        .eq('restaurant_id', admin.restaurant_id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to update product' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(product),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /admin/products/:id/toggle-promotion
    if (req.method === 'PUT' && action === 'toggle-promotion') {
      const realProductId = pathParts[pathParts.length - 2];
      
      // Get current promotion status
      const { data: currentProduct } = await supabase
        .from('products')
        .select('is_promotion')
        .eq('id', realProductId)
        .eq('restaurant_id', admin.restaurant_id)
        .single();

      if (!currentProduct) {
        return new Response(
          JSON.stringify({ error: 'Product not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: product, error } = await supabase
        .from('products')
        .update({ is_promotion: !currentProduct.is_promotion })
        .eq('id', realProductId)
        .eq('restaurant_id', admin.restaurant_id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to toggle promotion' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(product),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /admin/products/:id
    if (req.method === 'DELETE' && productId) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('restaurant_id', admin.restaurant_id);

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete product' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Product deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Products management error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});