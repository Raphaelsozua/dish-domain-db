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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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
    const categoryId = pathParts[pathParts.length - 1];

    // GET /admin/categories
    if (req.method === 'GET') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', admin.restaurant_id)
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

    // POST /admin/categories
    if (req.method === 'POST') {
      const categoryData = await req.json();
      
      if (!categoryData.name) {
        return new Response(
          JSON.stringify({ error: 'Category name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const slug = generateSlug(categoryData.name);
      
      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          restaurant_id: admin.restaurant_id,
          name: categoryData.name,
          slug: slug,
          icon: categoryData.icon || null,
          order_position: categoryData.order_position || 0,
          is_active: categoryData.is_active !== false
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to create category' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(category),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /admin/categories/:id
    if (req.method === 'PUT' && categoryId) {
      const updateData = await req.json();
      const { id, restaurant_id, created_at, updated_at, ...allowedFields } = updateData;

      if (allowedFields.name) {
        allowedFields.slug = generateSlug(allowedFields.name);
      }

      const { data: category, error } = await supabase
        .from('categories')
        .update(allowedFields)
        .eq('id', categoryId)
        .eq('restaurant_id', admin.restaurant_id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to update category' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(category),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /admin/categories/:id
    if (req.method === 'DELETE' && categoryId) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('restaurant_id', admin.restaurant_id);

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete category' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Category deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Categories management error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});