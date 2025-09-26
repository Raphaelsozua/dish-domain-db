import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Simple auth middleware
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
    const path = url.pathname.split('/').pop();

    // GET /admin/restaurant/info
    if (req.method === 'GET' && path === 'info') {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', admin.restaurant_id)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Restaurant not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(restaurant),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /admin/restaurant/info
    if (req.method === 'PUT' && path === 'info') {
      const updateData = await req.json();
      
      // Remove fields that shouldn't be updated directly
      const { id, created_at, updated_at, ...allowedFields } = updateData;

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update(allowedFields)
        .eq('id', admin.restaurant_id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to update restaurant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(restaurant),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /admin/restaurant/theme
    if (req.method === 'PUT' && path === 'theme') {
      const { primary_color } = await req.json();

      if (!primary_color) {
        return new Response(
          JSON.stringify({ error: 'Primary color is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update({ primary_color })
        .eq('id', admin.restaurant_id)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to update theme' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(restaurant),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Restaurant management error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});